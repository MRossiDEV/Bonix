type CategoryOption = {
  id: string;
  label: string;
};

type CategoryChipsProps = {
  options: CategoryOption[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
};

export function CategoryChips({ options, activeCategoryId, onSelectCategory }: CategoryChipsProps) {
  if (options.length <= 1) return null;

  return (
    <div className="px-4">
      <div className="flex gap-2 overflow-x-auto pb-1" role="radiogroup" aria-label="Promo categories">
        {options.map((option) => {
          const isActive = option.id === activeCategoryId;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onSelectCategory(option.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold ${
                isActive
                  ? "border-[#00E5A8] bg-[#00E5A8]/15 text-[#00E5A8]"
                  : "border-[#2A2A2A] bg-[#1E1E1E] text-[#9CA3AF]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
