import { FeedSection } from "../types";

type FeedTabsProps = {
  sections: FeedSection[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  panelIdPrefix?: string;
};

export function FeedTabs({ sections, activeTabId, onSelectTab, panelIdPrefix = "feed-panel" }: FeedTabsProps) {
  if (sections.length === 0) return null;

  return (
    <div className="px-4">
      <div
        role="tablist"
        aria-label="Feed sections"
        className="mx-auto grid w-[360px] max-w-full grid-cols-4 gap-2 rounded-2xl border border-[#2A2A2A] bg-[#1E1E1E] p-1"
      >
        {sections.map((section) => {
          const isActive = section.id === activeTabId;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelectTab(section.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${panelIdPrefix}-${section.id}`}
              id={`tab-${section.id}`}
              className={`w-full rounded-xl border px-2 py-2 text-center text-xs font-semibold ${
                isActive
                  ? "border-[#FF7A00] bg-[#FF7A00]/15 text-[#FF7A00]"
                  : "border-[#2A2A2A] bg-[#1E1E1E] text-[#9CA3AF]"
              }`}
            >
              <span className="block line-clamp-1">{section.title}</span>
              <span className="block text-[10px] opacity-80">{section.promos.length}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
