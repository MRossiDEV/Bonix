"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PaymentType } from "@/lib/types";

type ValidateResponse = {
  valid?: boolean;
  expiresAt?: number;
  summary?: {
    reservationId: string;
    promoId: string;
    promoTitle: string;
    discountedPrice: number;
    cashbackPercent: number;
    paymentType: PaymentType;
    user: { id: string; name: string | null; email: string | null } | null;
  };
  error?: string;
};

type ConfirmResponse = {
  status?: string;
  redemptionId?: string;
  alreadyConfirmed?: boolean;
  error?: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const paymentLabels: Record<PaymentType, string> = {
  [PaymentType.IN_STORE]: "Cash",
  [PaymentType.FULL_WALLET]: "Credits",
  [PaymentType.PARTIAL_WALLET]: "Split credits + cash",
};

const normalizeToken = (rawValue: string) => {
  const trimmed = rawValue.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    const tokenParam = parsed.searchParams.get("token");
    return tokenParam ? tokenParam.trim() : trimmed;
  } catch {
    return trimmed;
  }
};

export default function MerchantQrPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const scanLoopRef = useRef<number | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState("Idle");
  const [tokenInput, setTokenInput] = useState("");
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidateResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmResponse | null>(null);
  const [walletUsed, setWalletUsed] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const stopCamera = useCallback(() => {
    if (scanLoopRef.current) {
      window.clearInterval(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleValidate = useCallback(
    async (tokenOverride?: string) => {
      const token = normalizeToken(tokenOverride ?? tokenInput);
      if (!token || isValidating) return;

      setIsValidating(true);
      setValidation(null);
      setConfirmState(null);
      setWalletUsed("");
      setCurrentToken(token);

      try {
        const response = await fetch("/api/qr/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const payload = (await response.json()) as ValidateResponse;
        if (!response.ok) {
          setValidation({ error: payload.error ?? "Invalid QR code." });
          setScanStatus("Invalid QR");
          return;
        }

        setValidation(payload);
        setScanStatus("Validated");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to validate QR.";
        setValidation({ error: message });
        setScanStatus("Error");
      } finally {
        setIsValidating(false);
      }
    },
    [isValidating, tokenInput],
  );

  const startCamera = async () => {
    if (cameraActive) return;
    setCameraError(null);
    setScanStatus("Starting camera...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
      setScanStatus("Scanning...");

      const BarcodeDetectorImpl = (
        window as Window & { BarcodeDetector?: new (options: { formats: string[] }) => {
          detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
        } }
      ).BarcodeDetector;

      if (!BarcodeDetectorImpl) {
        setScanStatus("QR scanning not supported on this device.");
        return;
      }

      const detector = new BarcodeDetectorImpl({ formats: ["qr_code"] });

      scanLoopRef.current = window.setInterval(async () => {
        if (!videoRef.current || isValidating) return;
        if (videoRef.current.readyState < 2) return;

        try {
          const codes = await detector.detect(videoRef.current);
          const rawValue = codes?.[0]?.rawValue;
          const value = rawValue ? normalizeToken(rawValue) : "";
          if (value && value !== lastScannedRef.current) {
            lastScannedRef.current = value;
            setTokenInput(value);
            handleValidate(value);
          }
        } catch {
          setScanStatus("Unable to read QR.");
        }
      }, 600);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Camera permission denied.";
      setCameraError(message);
      setScanStatus("Camera unavailable");
      stopCamera();
    }
  };

  const handleConfirm = async () => {
    if (!currentToken || !validation?.summary || isConfirming) return;

    const needsWallet =
      validation.summary.paymentType === PaymentType.PARTIAL_WALLET;
    const walletAmount = parseFloat(walletUsed || "0");

    if (needsWallet && (!walletUsed || Number.isNaN(walletAmount))) {
      setConfirmState({ error: "Enter wallet amount for split payments." });
      return;
    }

    setIsConfirming(true);
    setConfirmState(null);

    try {
      const response = await fetch("/api/qr/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: currentToken,
          walletUsed: needsWallet ? walletAmount : undefined,
        }),
      });

      const payload = (await response.json()) as ConfirmResponse;
      if (!response.ok) {
        setConfirmState({ error: payload.error ?? "Unable to confirm." });
        return;
      }

      setConfirmState(payload);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to confirm.";
      setConfirmState({ error: message });
    } finally {
      setIsConfirming(false);
    }
  };

  const summary = validation?.summary;
  const isValid = Boolean(summary && validation?.valid !== false && !validation?.error);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-[#A1A1AA]">
          QR verification
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Scan to confirm</h1>
        <p className="mt-2 text-sm text-[#A1A1AA]">
          Use QR to approve redemptions instantly at checkout.
        </p>
      </section>

      <section className="grid gap-4">
        <div className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-5">
          <p className="text-sm font-semibold">Open scanner</p>
          <p className="mt-2 text-xs text-[#A1A1AA]">
            Point the camera at the guests QR to validate the promo.
          </p>

          <div className="mt-4 overflow-hidden rounded-2xl border border-[#262626] bg-[#111111]">
            <video ref={videoRef} className="h-56 w-full object-cover" />
          </div>

          {cameraError && (
            <p className="mt-3 text-xs text-[#FFB547]">{cameraError}</p>
          )}

          <div className="mt-4 flex items-center justify-between text-xs text-[#A1A1AA]">
            <span>{scanStatus}</span>
            {cameraActive && (
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-full border border-[#262626] px-3 py-1 text-[11px] text-[#FFB547]"
              >
                Stop
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={startCamera}
            className="mt-4 w-full rounded-2xl bg-[#FFB547] py-3 text-sm font-semibold text-[#111111]"
          >
            {cameraActive ? "Scanning" : "Start scanning"}
          </button>
        </div>

        <div className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-5">
          <p className="text-sm font-semibold">Enter code manually</p>
          <p className="mt-2 text-xs text-[#A1A1AA]">
            Use a redemption code if the scanner is unavailable.
          </p>
          <input
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            placeholder="Paste QR token"
            className="mt-4 w-full rounded-2xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm text-[#FAFAFA]"
          />
          <button
            type="button"
            onClick={() => handleValidate()}
            disabled={!tokenInput.trim() || isValidating}
            className={`mt-4 w-full rounded-2xl py-3 text-sm font-semibold transition ${
              !tokenInput.trim() || isValidating
                ? "border border-[#262626] bg-[#111111] text-[#6B7280]"
                : "border border-[#262626] bg-[#111111] text-[#FFB547]"
            }`}
          >
            {isValidating ? "Validating..." : "Validate code"}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-5">
        <p className="text-sm font-semibold">Redemption summary</p>
        <p className="mt-2 text-xs text-[#A1A1AA]">
          Validate a QR code to review and confirm the promo.
        </p>

        {validation?.error && (
          <p className="mt-4 text-sm text-[#FFB547]">{validation.error}</p>
        )}

        {isValid && summary && (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-[#262626] bg-[#111111] px-4 py-3">
              <p className="text-sm font-semibold">{summary.promoTitle}</p>
              <p className="mt-1 text-xs text-[#A1A1AA]">
                Guest: {summary.user?.name ?? summary.user?.email ?? "Guest"}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-[#A1A1AA]">
                <span>Price</span>
                <span className="text-sm font-semibold text-[#FAFAFA]">
                  {formatCurrency(summary.discountedPrice)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-[#A1A1AA]">
                <span>Payment</span>
                <span>{paymentLabels[summary.paymentType]}</span>
              </div>
            </div>

            {summary.paymentType === PaymentType.PARTIAL_WALLET && (
              <div>
                <label className="text-xs text-[#A1A1AA]">Wallet amount</label>
                <input
                  value={walletUsed}
                  onChange={(event) => setWalletUsed(event.target.value)}
                  placeholder="0.00"
                  className="mt-2 w-full rounded-2xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm text-[#FAFAFA]"
                />
              </div>
            )}

            {confirmState?.error && (
              <p className="text-sm text-[#FFB547]">{confirmState.error}</p>
            )}

            {confirmState?.status === "CONFIRMED" && (
              <p className="text-sm text-[#4FD1C5]">
                Redemption confirmed{confirmState.alreadyConfirmed ? " already" : ""}.
              </p>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming}
              className={`w-full rounded-2xl py-3 text-sm font-semibold transition ${
                isConfirming
                  ? "bg-[#262626] text-[#6B7280]"
                  : "bg-[#4FD1C5] text-[#111111]"
              }`}
            >
              {isConfirming ? "Confirming..." : "Confirm redemption"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
