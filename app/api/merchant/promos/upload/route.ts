import { NextRequest, NextResponse } from "next/server";

import { getMerchantContextById } from "@/lib/merchant-promos";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "promo-images";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function extensionForMime(mime: string): string {
  if (mime === "image/avif") return "avif";
  if (mime === "image/gif") return "gif";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/jpg") return "jpg";
  return "jpg";
}

function isAllowedImageType(mime: string): boolean {
  return mime.startsWith("image/");
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
  const merchantId = new URL(request.url).searchParams.get("merchantId");
  const merchantResult = await getMerchantContextById(merchantId);
  if (!merchantResult.context) {
    return NextResponse.json(
      { error: merchantResult.error?.message ?? "Unauthorized" },
      { status: merchantResult.error?.status ?? 401 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required" }, { status: 400 });
  }

  if (!isAllowedImageType(file.type)) {
    return NextResponse.json(
      { error: "Only image files are supported" },
      { status: 400 },
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Image size must be 5MB or less" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const path = `${merchantResult.context.merchantId}/${Date.now()}-${crypto.randomUUID()}.${extensionForMime(file.type)}`;

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
  return NextResponse.json({ url: data.publicUrl, path });
}
