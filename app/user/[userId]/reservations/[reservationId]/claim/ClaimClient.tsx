"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

import { PaymentType } from "@/lib/types";

type ClaimReservation = {
  id: string;
  status: string;
  expiresAt: string;
  promoTitle: string;
  merchantName: string | null;
  discountedPrice: number;
  cashbackPercent: number;
};

type ClaimClientProps = {
  reservation: ClaimReservation;
};

type GenerateQrResponse = {
  token?: string;
  expiresAt?: number;
  error?: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const formatExpiry = (value: number) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const paymentOptions = [
  {
    id: PaymentType.IN_STORE,
    title: "Cash",
    detail: "Pay at the counter.",
  },
  {
    id: PaymentType.FULL_WALLET,
    title: "Credits",
    detail: "Use your wallet balance.",
  },
  {
    id: PaymentType.PARTIAL_WALLET,
    title: "Split credits + cash",
    detail: "Tell the merchant how much credit to apply.",
  },
];

export default function ClaimClient({ reservation }: ClaimClientProps) {
  const router = useRouter();
  const [paymentType, setPaymentType] = useState<PaymentType>(
    PaymentType.IN_STORE,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrExpiresAt, setQrExpiresAt] = useState<number | null>(null);

  const isExpired = useMemo(() => {
    return new Date(reservation.expiresAt) <= new Date();
  }, [reservation.expiresAt]);

  const isDisabled = reservation.status !== "ACTIVE" || isExpired;

  useEffect(() => {
    setQrToken(null);
    setQrDataUrl(null);
    setQrExpiresAt(null);
    setErrorMessage(null);
  }, [paymentType]);

  useEffect(() => {
    let isActive = true;

    if (!qrToken) {
      return undefined;
    }

    QRCode.toDataURL(qrToken, {
      margin: 1,
      width: 280,
      color: { dark: "#121212", light: "#FAFAFA" },
    })
      .then((url) => {
        if (isActive) setQrDataUrl(url);
      })
      .catch((error) => {
        if (isActive) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to render QR code.";
          setErrorMessage(message);
        }
      });

    return () => {
      isActive = false;
    };
  }, [qrToken]);

  const handleGenerate = async () => {
    if (isGenerating || isDisabled) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: reservation.id,
          paymentType,
        }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const payload = (await response.json()) as GenerateQrResponse;

      if (!response.ok) {
        setErrorMessage(payload.error ?? "Unable to generate QR code.");
        return;
      }

      if (!payload.token || !payload.expiresAt) {
        setErrorMessage("QR generation failed.");
        return;
      }

      setQrToken(payload.token);
      setQrExpiresAt(payload.expiresAt);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to generate QR code.";
      setErrorMessage(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-[#9CA3AF]">
          Claim promo
        </p>
        <h1 className="mt-3 text-2xl font-semibold">
          {reservation.promoTitle}
        </h1>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          {reservation.merchantName ?? "Bonix partner"}
        </p>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3">
          <div>
            <p className="text-xs text-[#9CA3AF]">Your price</p>
            <p className="text-lg font-semibold">
              {formatCurrency(reservation.discountedPrice)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#9CA3AF]">Cashback</p>
            <p className="text-sm font-semibold text-[#00E5A8]">
              {reservation.cashbackPercent}% back
            </p>
          </div>
        </div>
        {isDisabled && (
          <p className="mt-4 text-sm text-[#FF7A00]">
            This reservation is no longer active.
          </p>
        )}
      </section>

      <section className="space-y-3 rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5">
        <h2 className="text-lg font-semibold">Choose payment</h2>
        <div className="space-y-3">
          {paymentOptions.map((option) => {
            const isSelected = paymentType === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setPaymentType(option.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  isSelected
                    ? "border-[#FF7A00] bg-[#121212]"
                    : "border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#3A3A3A]"
                }`}
                aria-pressed={isSelected}
              >
                <p className="text-sm font-semibold">{option.title}</p>
                <p className="mt-1 text-xs text-[#9CA3AF]">{option.detail}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Redemption QR</h2>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Show this at checkout so the merchant can redeem your promo.
            </p>
          </div>
          {qrExpiresAt && (
            <span className="rounded-full border border-[#2A2A2A] bg-[#121212] px-3 py-1 text-[11px] text-[#9CA3AF]">
              Expires {formatExpiry(qrExpiresAt)}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center rounded-3xl border border-dashed border-[#2A2A2A] bg-[#121212] p-6">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="Redemption QR code"
              className="h-56 w-56 rounded-2xl bg-[#FAFAFA] p-3"
            />
          ) : (
            <div className="text-center">
              <p className="text-sm font-semibold">QR not generated yet</p>
              <p className="mt-2 text-xs text-[#9CA3AF]">
                Select a payment option, then create a QR code.
              </p>
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="mt-4 text-sm text-[#FF7A00]">{errorMessage}</p>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || isDisabled}
          className={`mt-4 w-full rounded-2xl py-4 text-base font-semibold transition ${
            isGenerating || isDisabled
              ? "bg-[#2A2A2A] text-[#6B7280]"
              : "bg-[#FF7A00] text-[#121212]"
          }`}
        >
          {isGenerating ? "Generating..." : "Generate QR"}
        </button>
      </section>
    </div>
  );
}
