"use client";

import { cn } from "@/lib/utils";
import type { Category } from "../schema";
import { ALL_CATEGORY } from "../types";

type CategoryChipsProps = {
  categories: Category[];
  selected: string;
  onSelect: (categoryId: string) => void;
};

export function CategoryChips({ categories, selected, onSelect }: CategoryChipsProps) {
  const items = [{ id: ALL_CATEGORY, name: "전체" }, ...categories];

  return (
    <div role="group" aria-label="분야" className="flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
      {items.map((c) => {
        const active = c.id === selected;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(c.id)}
            className={cn(
              "h-[30px] shrink-0 rounded-full px-4 text-[13px] transition-colors",
              active
                ? "bg-brand font-bold text-white"
                : "border border-[#C9CDD8] bg-surface font-medium text-ink-list hover:bg-canvas",
            )}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
