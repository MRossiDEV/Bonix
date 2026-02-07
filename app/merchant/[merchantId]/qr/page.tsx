export default function MerchantQrPage() {
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
          <button
            type="button"
            className="mt-4 w-full rounded-2xl bg-[#FFB547] py-3 text-sm font-semibold text-[#111111]"
          >
            Start scanning
          </button>
        </div>

        <div className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-5">
          <p className="text-sm font-semibold">Enter code manually</p>
          <p className="mt-2 text-xs text-[#A1A1AA]">
            Use a redemption code if the scanner is unavailable.
          </p>
          <button
            type="button"
            className="mt-4 w-full rounded-2xl border border-[#262626] bg-[#111111] py-3 text-sm font-semibold text-[#FFB547]"
          >
            Enter code
          </button>
        </div>
      </section>
    </div>
  );
}
