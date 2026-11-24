"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BackIcon, BookmarkIcon, ChevronRightIcon, ClockIcon, MenuIcon } from "@/components/ui/icons";

const MENU_ITEMS = [
  { href: "/saved", label: "찜", icon: BookmarkIcon },
  { href: "/recent", label: "최근 본 항목", icon: ClockIcon },
] as const;

/** 헤더의 ≡ 버튼과 오른쪽에서 열리는 메뉴 패널 */
export function MenuButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="메뉴 열기"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="-mr-1 flex size-9 items-center justify-center rounded-full text-ink hover:bg-field/60"
      >
        <MenuIcon />
      </button>

      <dialog
        ref={ref}
        aria-label="메뉴"
        onCancel={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
        className="m-0 ml-auto h-dvh max-h-dvh w-[78%] max-w-[316px] rounded-l-3xl bg-surface p-0 text-ink backdrop:bg-[#232632]/45"
      >
        <div className="flex h-full flex-col px-5 pt-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="메뉴 닫기"
              onClick={() => setOpen(false)}
              className="-ml-1 flex size-8 items-center justify-center"
            >
              <BackIcon size={20} />
            </button>
            <h2 className="text-[17px] font-bold">메뉴</h2>
          </div>
          <nav className="mt-8">
            <ul>
              {MENU_ITEMS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 py-4 text-[15px] text-ink"
                  >
                    <Icon size={22} className="text-brand" />
                    <span className="flex-1">{label}</span>
                    <ChevronRightIcon size={18} className="text-sub" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </dialog>
    </>
  );
}
