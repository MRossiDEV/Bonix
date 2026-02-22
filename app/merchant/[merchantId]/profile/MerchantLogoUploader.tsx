"use client";

import { useEffect, useMemo, useState } from "react";

type MerchantLogoUploaderProps = {
  initialLogoUrl: string | null;
  merchantId: string;
};

export function MerchantLogoUploader({
  initialLogoUrl,
  merchantId,
}: MerchantLogoUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [message, setMessage] = useState<string>("");

  const previewUrl = useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleUpload() {
    if (!selectedFile) {
      setMessage("Select an image first.");
      return;
    }

    setIsUploading(true);
    setMessage("");

    const body = new FormData();
    body.append("file", selectedFile);
    body.append("merchantId", merchantId);

    try {
      const response = await fetch("/api/merchant/logo", {
        method: "POST",
        body,
      });

      const result = (await response.json()) as { error?: string; logoUrl?: string; warning?: string };

      if (!response.ok) {
        setMessage(result.error ?? "Upload failed");
        return;
      }

      setLogoUrl(result.logoUrl ?? null);
      setSelectedFile(null);
      setMessage(result.warning ?? "Logo updated.");
    } catch {
      setMessage("Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold">Business logo</p>
          <p className="text-sm text-[#A1A1AA]">Shown as your merchant brand image.</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-[#262626] bg-[#111111]">
          {previewUrl || logoUrl ? (
            <img src={previewUrl ?? logoUrl ?? ""} alt="Business logo preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[#A1A1AA]">No logo</div>
          )}
        </div>

        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            className="w-full rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
          />
          <p className="mt-2 text-xs text-[#A1A1AA]">PNG, JPG, WEBP, GIF or AVIF up to 5MB.</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="rounded-xl bg-[#FFB547] px-4 py-2 text-sm font-semibold text-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? "Uploading..." : "Update logo"}
        </button>
        {message ? <p className="text-xs text-[#A1A1AA]">{message}</p> : null}
      </div>
    </section>
  );
}
