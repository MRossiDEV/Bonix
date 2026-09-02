import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import { StoryHighlight } from "../types";

type StoryViewerModalProps = {
  story: StoryHighlight | null;
  onClose: () => void;
};

export function StoryViewerModal({ story, onClose }: StoryViewerModalProps) {
  return (
    <AnimatePresence>
      {story ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 rounded-full border border-white/20 bg-black/50 px-3 py-2 text-sm font-semibold text-white"
          >
            Close
          </button>

          <div className="relative h-full w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/30 via-[#7B61FF]/25 to-[#00E5A8]/25" />
            {story.imageUrl ? (
              <Image
                src={story.imageUrl}
                alt={story.title}
                fill
                sizes="100vw"
                className="object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />

            <div className="absolute inset-x-0 bottom-0 z-10 space-y-3 px-6 pb-8">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-300">{story.merchantName}</p>
              <h3 className="text-3xl font-semibold text-white">{story.title}</h3>
              <p className="text-sm text-gray-300">
                {story.expiringUnder2h ? "⏳ Expiring in under 2h" : "Live now"}
              </p>
              <Link
                href={`/promo/${story.promoId}`}
                onClick={onClose}
                className="block w-full rounded-2xl bg-[#FF7A00] py-4 text-center text-sm font-bold text-black"
              >
                View promo
              </Link>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
