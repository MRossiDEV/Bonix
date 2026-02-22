import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "merchant-logos";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "image/avif") return "avif";
  return "jpg";
}

function isAllowedImageType(mime: string): boolean {
  return mime.startsWith("image/");
}

function isMissingLogoColumn(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("logo_url") && normalized.includes("does not exist");
}

async function ensureBucketExists() {
  const admin = createAdminClient();
  const { error } = await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_UPLOAD_BYTES,
    allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/avif"],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    return { ok: false, error };
  }

  return { ok: true as const };
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const merchantIdInput = formData.get("merchantId");
  const file = formData.get("file");

  const merchantId = typeof merchantIdInput === "string" ? merchantIdInput.trim() : "";
  if (!merchantId) {
    return NextResponse.json({ error: "merchantId is required" }, { status: 400 });
  }

  const { data: merchant, error: merchantError } = await supabase
    .from("merchants")
    .select("id")
    .eq("id", merchantId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (merchantError || !merchant) {
    return NextResponse.json({ error: "Merchant profile not found" }, { status: 403 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Logo file is required" }, { status: 400 });
  }

  if (!isAllowedImageType(file.type)) {
    return NextResponse.json({ error: "Only image files are supported" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Logo size must be 5MB or less" }, { status: 400 });
  }

  const admin = createAdminClient();
  const path = `${merchant.id}/${Date.now()}-${crypto.randomUUID()}.${extensionForMime(file.type)}`;

  let { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError && uploadError.message.toLowerCase().includes("bucket")) {
    const bucketResult = await ensureBucketExists();
    if (!bucketResult.ok) {
      return NextResponse.json({ error: bucketResult.error.message }, { status: 400 });
    }

    const retry = await admin.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
        cacheControl: "3600",
      });
    uploadError = retry.error;
  }

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  const logoUrl = data.publicUrl;

  const { error: updateError } = await supabase
    .from("merchants")
    .update({ logo_url: logoUrl })
    .eq("id", merchant.id);

  if (updateError) {
    if (isMissingLogoColumn(updateError.message)) {
      return NextResponse.json({
        logoUrl,
        warning:
          "Logo uploaded, but merchants.logo_url is not available in this database schema yet.",
      });
    }

    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ logoUrl });
}
