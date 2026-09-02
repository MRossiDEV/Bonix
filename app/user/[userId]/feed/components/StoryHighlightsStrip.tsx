import Image from "next/image";
import { motion } from "framer-motion";

import { StoryHighlight } from "../types";

type StoryHighlightsStripProps = {
  storyHighlights: StoryHighlight[];
  onOpenStory: (promoId: string) => void;
};

export function StoryHighlightsStrip({ storyHighlights, onOpenStory }: StoryHighlightsStripProps) {
  if (storyHighlights.length === 0) return null;

  return (
    <div className="px-4">
      <div className="flex gap-4 overflow-x-auto pb-1">
        {storyHighlights.map((story) => {
          const initials = story.merchantName.slice(0, 2).toUpperCase();

          return (
            <button
              key={story.id}
              type="button"
              onClick={() => onOpenStory(story.promoId)}
              className="shrink-0"
            >
              <div className="flex w-20 flex-col items-center gap-2">
                <motion.div
                  animate={story.expiringUnder2h ? { scale: [1, 1.06, 1] } : undefined}
                  transition={
                    story.expiringUnder2h
                      ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
                      : undefined
                  }
                  className={`h-18 w-18 rounded-full p-[3px] ${
                    story.hot
                      ? "bg-gradient-to-br from-[#FF7A00] via-[#7B61FF] to-[#00E5A8]"
                      : "bg-[#2A2A2A]"
                  }`}
                >
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-[#121212]">
                    {story.imageUrl ? (
                      <Image
                        src={story.imageUrl}
                        alt={`${story.merchantName} logo`}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#1E1E1E] text-xs font-semibold text-[#FAFAFA]">
                        {initials}
                      </div>
                    )}
                  </div>
                </motion.div>
                <p className="line-clamp-1 w-full text-center text-[11px] text-gray-300">
                  {story.merchantName}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
