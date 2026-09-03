from pathlib import Path
p = Path(r'D:\DEV\bonix\app\user\[userId]\city\page.tsx')
s = p.read_text(encoding='utf-8')

# Insert placement mode banners right before the CITY WORLD section.
anchor = (
    '      {/* ============================================================\n'
    '          CITY WORLD — real <Canvas> (Phase 1)\n'
    '      ============================================================ */}'
)
assert anchor in s, 'CITY WORLD anchor not found'

placement_block = '''      {/* ============================================================
          PLACEMENT MODE BANNER (Phase 8)
      ============================================================ */}

      {placementStatus.kind === "placing" ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 flex items-center gap-3 rounded-2xl border border-[#22C55E]/30 bg-[#0F172A] px-4 py-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#22C55E]/15 text-xl">
            📍
        </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-[#F8FAFC]">
              Place this merchant in your city
        </p>
            <p className="mt-0.5 truncate text-[10px] text-[#64748B]">
              Tap an empty slot to drop{" "}
              <code className="rounded bg-[#1F2937] px-1 text-[10px] text-[#94A3B8]">
                {placementStatus.merchantId}
        </code>
        </p>
      </div>
          <button
            type="button"
            onClick={handleDismissPlacement}
            className="rounded-xl border border-[#1F2937] bg-[#080C11] px-3 py-1.5 text-[10px] font-bold text-[#94A3B8]"
          >
            Cancel
      </button>
    </motion.div>
      ) : null}

      {placementStatus.kind === "placed" ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 flex items-center gap-3 rounded-2xl border border-[#22C55E]/40 bg-[#0F172A] px-4 py-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#22C55E]/15 text-xl">
            ✓
        </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-[#F8FAFC]">
              Placed into slot {placementStatus.slotId}
        </p>
            <p className="mt-0.5 truncate text-[10px] text-[#64748B]">
              Your new building is live.
        </p>
      </div>
          <button
            type="button"
            onClick={handleDismissPlacement}
            className="rounded-xl bg-[#22C55E] px-3 py-1.5 text-[10px] font-black text-[#041007]"
          >
            Done
      </button>
    </motion.div>
      ) : null}

      {placementStatus.kind === "error" ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 flex items-center gap-3 rounded-2xl border border-[#EF4444]/30 bg-[#0F172A] px-4 py-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EF4444]/15 text-xl">
            !
        </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-[#F8FAFC]">
              Placement failed
        </p>
            <p className="mt-0.5 truncate text-[10px] text-[#64748B]">
              {placementStatus.message}
        </p>
      </div>
          <button
            type="button"
            onClick={handleDismissPlacement}
            className="rounded-xl border border-[#1F2937] bg-[#080C11] px-3 py-1.5 text-[10px] font-bold text-[#94A3B8]"
          >
            Dismiss
      </button>
    </motion.div>
      ) : null}

'''
s = s.replace(anchor, placement_block + anchor, 1)

p.write_text(s, encoding='utf-8')
print('OK')
