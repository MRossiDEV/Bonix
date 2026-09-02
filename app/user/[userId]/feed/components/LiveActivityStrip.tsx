import { motion } from "framer-motion";

import { LiveActivity } from "../types";

type LiveActivityStripProps = {
  items: LiveActivity[];
};

export function LiveActivityStrip({ items }: LiveActivityStripProps) {
  if (items.length === 0) return null;

  return (
    <div className="px-4">
      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0.9, 1, 0.9], y: [0, -2, 0] }}
            transition={{
              duration: 2.3,
              delay: index * 0.08,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
            className="shrink-0 rounded-full border border-[#2A2A2A] bg-[#1E1E1E] px-4 py-2 text-xs font-medium text-[#FAFAFA]"
          >
            {item.text}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
