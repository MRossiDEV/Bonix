// Placeholder client component. The original ClaimClient.tsx was
// removed in a prior commit; this stub restores compilation for the
// /user/[userId]/promo/[promoId]/claim route so the build can verify
// unrelated 3D work. A proper implementation will replace this.

type ClaimClientProps = {
  reservation: {
    id: string;
    status: string;
    expiresAt: string;
    promoTitle: string;
    merchantName: string | null;
    discountedPrice: number;
    cashbackPercent: number;
  };
};

export default function ClaimClient({ reservation }: ClaimClientProps) {
  return (
    <section className="space-y-3 p-4 text-sm text-[#F8FAFC]">
      <h1 className="text-lg font-bold">Reservation claim</h1>
      <p className="text-xs text-[#94A3B8]">
        {reservation.promoTitle} · {reservation.merchantName ?? "Merchant"}
     </p>
      <p className="text-xs text-[#64748B]">
        Status: {reservation.status}
     </p>
   </section>
  );
}
