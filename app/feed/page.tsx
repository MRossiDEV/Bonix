import { PromoFeed } from "@/app/components/PromoFeed";

export default function FeedPage() {
  return (
    <main className="min-h-screen bg-[#121212] text-[#FAFAFA]">
      <div className="px-6 pt-10">
        <h1 className="text-2xl font-semibold">Bonix promo feed</h1>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Preview live deals in your area. Install to reserve and save.
        </p>
      </div>
      <PromoFeed
        title="Trending now"
        subtitle="Real promos, read-only preview"
      />
    </main>
  );
}
