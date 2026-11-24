"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  /** 제목 요소의 id (aria-labelledby) */
  labelledBy: string;
  children: ReactNode;
  className?: string;
};

/** 화면 가운데 흰 카드 모달. 네이티브 <dialog>로 포커스 가두기와 Esc 닫기를 처리한다. */
export function Dialog({ open, onClose, labelledBy, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-32px)] max-w-[354px] rounded-3xl bg-surface p-0 text-ink",
        "backdrop:bg-[#232632]/45",
        className,
      )}
    >
      {open ? <div className="p-6">{children}</div> : null}
    </dialog>
  );
}
