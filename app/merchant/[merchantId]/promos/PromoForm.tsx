"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { getPromoImageUrl } from "@/lib/promo-image";

type PromoFormMode = "create" | "edit";

type PromoFormData = {
  id?: string;
  title: string;
  description: string;
  category: string | null;
  image: string | null;
  original_price: number;
  discounted_price: number;
  cashback_percent: number;
  total_slots: number;
  available_slots: number;
  starts_at: string | null;
  expires_at: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "SOLD_OUT" | "EXPIRED" | "DISABLED";
};

type PromoFormProps = {
  merchantId: string;
  mode: PromoFormMode;
  initialPromo?: PromoFormData;
};

const categories = ["Food", "Drinks", "Wellness", "Beauty", "Retail", "Other"];

function toDatetimeLocal(iso: string | null): string {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const offsetMinutes = date.getTimezoneOffset();
  const normalized = new Date(date.getTime() - offsetMinutes * 60_000);
  return normalized.toISOString().slice(0, 16);
}

export default function PromoForm({ merchantId, mode, initialPromo }: PromoFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialPromo?.title ?? "");
  const [description, setDescription] = useState(initialPromo?.description ?? "");
  const [category, setCategory] = useState(initialPromo?.category ?? "");
  const [imageUrl, setImageUrl] = useState(initialPromo?.image ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalPrice, setOriginalPrice] = useState(
    initialPromo ? String(initialPromo.original_price) : "",
  );
  const [discountedPrice, setDiscountedPrice] = useState(
    initialPromo ? String(initialPromo.discounted_price) : "",
  );
  const [cashbackPercent] = useState(
    initialPromo ? String(initialPromo.cashback_percent) : "0",
  );
  const [totalSlots, setTotalSlots] = useState(
    initialPromo ? String(initialPromo.total_slots) : "",
  );
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(initialPromo?.starts_at ?? null));
  const [expiresAt, setExpiresAt] = useState(toDatetimeLocal(initialPromo?.expires_at ?? null));
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const claimedSlots = useMemo(() => {
    if (!initialPromo) {
      return 0;
    }
    return Math.max(initialPromo.total_slots - initialPromo.available_slots, 0);
  }, [initialPromo]);

  const canToggleStatus = mode === "edit" && initialPromo;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    let uploadedImageUrl = imageUrl;

    try {
      if (imageFile) {
        const imageForm = new FormData();
        imageForm.append("file", imageFile);

        const uploadResponse = await fetch(`/api/merchant/promos/upload?merchantId=${merchantId}`, {
          method: "POST",
          body: imageForm,
        });
        const uploadJson = (await uploadResponse.json()) as {
          error?: string;
          url?: string;
        };

        if (!uploadResponse.ok || !uploadJson.url) {
          throw new Error(uploadJson.error ?? "Failed to upload image");
        }

        uploadedImageUrl = uploadJson.url;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload image";
      setErrorMessage(message);
      setSubmitting(false);
      return;
    }

    const payload = {
      title,
      description,
      category,
      image: uploadedImageUrl || null,
      original_price: originalPrice,
      discounted_price: discountedPrice,
      cashback_percent: cashbackPercent,
      total_slots: totalSlots,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    const endpoint =
      mode === "create"
        ? `/api/merchant/promos?merchantId=${merchantId}`
        : `/api/merchant/promos/${initialPromo?.id}/requests?merchantId=${merchantId}`;

    const method = "POST";

    const requestBody =
      mode === "create"
        ? payload
        : {
            action: "EDIT",
            requestedChanges: payload,
          };

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const json = (await response.json()) as {
        error?: string;
        errors?: string[];
      };

      if (!response.ok) {
        const firstError = json.errors?.[0];
        throw new Error(firstError ?? json.error ?? "Failed to save promo");
      }

      if (mode === "create") {
        router.push(`/merchant/${merchantId}/promos`);
        router.refresh();
        return;
      }

      setSuccessMessage("Edit request submitted to admin");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save promo";
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (nextStatus: "ACTIVE" | "PAUSED") => {
    if (!initialPromo) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`/api/merchant/promos/${initialPromo.id}/requests?merchantId=${merchantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextStatus === "ACTIVE" ? "ACTIVATE" : "PAUSE" }),
      });
      const json = (await response.json()) as { error?: string; errors?: string[] };

      if (!response.ok) {
        throw new Error(json.errors?.[0] ?? json.error ?? "Failed to update status");
      }

      setSuccessMessage(
        `Request submitted: ${nextStatus === "ACTIVE" ? "activate" : "pause"}`,
      );
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-5">
        <p className="text-xs uppercase tracking-[0.35em] text-[#A1A1AA]">
          {mode === "create" ? "Create promo" : "Edit promo"}
        </p>
        <h1 className="mt-3 text-xl font-semibold">
          {mode === "create" ? "New promo draft" : "Request promo edit"}
        </h1>
      </section>

      <form onSubmit={submit} className="space-y-4">
        <section className="space-y-3 rounded-3xl border border-[#262626] bg-[#1A1A1A] p-5">
          <p className="text-sm font-semibold">Basic info</p>
          <label className="block space-y-1 text-sm">
            <span className="text-[#A1A1AA]">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className="w-full rounded-xl border border-[#262626] bg-[#111111] px-3 py-2"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="text-[#A1A1AA]">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              rows={4}
              className="w-full rounded-xl border border-[#262626] bg-[#111111] px-3 py-2"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="text-[#A1A1AA]">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-[#262626] bg-[#111111] px-3 py-2"
            >
              <option value="">Select category</option>
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="text-[#A1A1AA]">Promo image</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setImageFile(file);
                if (file) {
                  setImageUrl(URL.createObjectURL(file));
                }
              }}
              className="w-full rounded-xl border border-[#262626] bg-[#111111] px-3 py-2"
            />
            <p className="text-xs text-[#A1A1AA]">
              JPG, PNG, or WEBP up to 5MB.{" "}
              {mode === "edit" ? "Image changes are submitted for admin approval." : ""}
            </p>
          </label>

          <Image
            src={getPromoImageUrl(imageUrl)}
            alt="Promo preview"
            width={1200}
            height={675}
            className="h-36 w-full rounded-xl object-cover"
          />
        </section>

        <section className="space-y-3 rounded-3xl border border-[#262626] bg-[#1A1A1A] p-5">
          <p className="text-sm font-semibold">Pricing</p>
          <label className="block space-y-1 text-sm">
            <span className="text-[#A1A1AA]">Original price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={originalPrice}
              onChange={(event) => setOriginalPrice(event.target.value)}
              required
              className="w-full rounded-xl border border-[#262626] bg-[#111111] px-3 py-2"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="text-[#A1A1AA]">Discounted price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={discountedPrice}
              onChange={(event) => setDiscountedPrice(event.target.value)}
              required
              className="w-full rounded-xl border border-[#262626] bg-[#111111] px-3 py-2"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="text-[#A1A1AA]">Cashback percent</span>
            <input
              type="text"
              value={
                mode === "edit"
                  ? `${cashbackPercent}% (admin controlled)`
                  : "Admin controlled"
              }
              disabled
              className="w-full rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-[#A1A1AA]"
            />
          </label>
        </section>

        <section className="space-y-3 rounded-3xl border border-[#262626] bg-[#1A1A1A] p-5">
          <p className="text-sm font-semibold">Slots & timing</p>
          <label className="block space-y-1 text-sm">
            <span className="text-[#A1A1AA]">Total slots</span>
            <input
              type="number"
              min={mode === "edit" ? claimedSlots : 1}
              step="1"
              value={totalSlots}
              onChange={(event) => setTotalSlots(event.target.value)}
              required
              className="w-full rounded-xl border border-[#262626] bg-[#111111] px-3 py-2"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="text-[#A1A1AA]">Starts at (optional)</span>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              className="w-full rounded-xl border border-[#262626] bg-[#111111] px-3 py-2"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="text-[#A1A1AA]">Expires at</span>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              required
              className="w-full rounded-xl border border-[#262626] bg-[#111111] px-3 py-2"
            />
          </label>
        </section>

        {errorMessage ? (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-xl border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-300">
            {successMessage}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/merchant/${merchantId}/promos`}
            className="rounded-2xl border border-[#262626] bg-[#111111] px-4 py-3 text-center text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-[#FFB547] px-4 py-3 text-sm font-semibold text-[#111111] disabled:opacity-60"
          >
            {mode === "create" ? "Create draft" : "Submit edit request"}
          </button>
        </div>
      </form>

      {canToggleStatus ? (
        <section className="space-y-3 rounded-3xl border border-[#262626] bg-[#1A1A1A] p-5">
          <p className="text-sm font-semibold">Activation</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => updateStatus("ACTIVE")}
              className="rounded-2xl border border-[#262626] bg-[#111111] px-4 py-3 text-sm"
            >
              Activate
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => updateStatus("PAUSED")}
              className="rounded-2xl border border-[#262626] bg-[#111111] px-4 py-3 text-sm"
            >
              Pause
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
