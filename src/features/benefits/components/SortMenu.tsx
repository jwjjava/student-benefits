"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, SortIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS, type SortKey } from "../types";

type SortMenuProps = { value: SortKey; onChange: (sort: SortKey) => void };

export function SortMenu({ value, onChange }: SortMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const current = SORT_OPTIONS.find((o) => o.key === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[13px] font-medium text-ink-list"
      >
        <SortIcon size={16} className="text-sub" />
        {current.label}
      </button>
      {open ? (
        <ul
          id={menuId}
          role="menu"
          className="absolute right-0 top-8 z-20 w-[130px] overflow-hidden rounded-2xl bg-surface py-1.5 shadow-[0_8px_24px_rgba(35,38,50,0.14)]"
        >
          {SORT_OPTIONS.map((o) => {
            const active = o.key === value;
            return (
              <li key={o.key} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    setOpen(false);
                    if (!active) onChange(o.key);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-3 text-left text-sm",
                    active ? "font-bold text-brand" : "font-medium text-ink",
                  )}
                >
                  {o.label}
                  {active ? <CheckIcon size={16} /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
