"use client";

import { AnimatePresence, motion } from "framer-motion";

type PreviewInstallModalProps = {
  open: boolean;
  onClose: () => void;
  onInstall: () => void;
};

export function PreviewInstallModal({
  open,
  onClose,
  onInstall,
}: PreviewInstallModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6 text-left"
          >
            <p className="text-lg font-semibold text-[#FAFAFA]">
              Install Bonix to reserve this promo and start saving.
            </p>
            <div className="mt-6 space-y-3">
              <button
                type="button"
                className="w-full rounded-2xl bg-[#FF7A00] py-3 text-base font-semibold text-[#121212]"
                onClick={onInstall}
              >
                Install Bonix
              </button>
              <button
                type="button"
                className="w-full rounded-2xl border border-[#2A2A2A] py-3 text-sm text-[#FAFAFA]"
                onClick={onClose}
              >
                Continue browsing
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
