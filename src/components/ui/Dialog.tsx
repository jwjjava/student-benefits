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
  /** 배경을 눌러 닫을 수 있는지. 답을 꼭 골라야 하는 팝업은 false. */
  dismissOnBackdrop?: boolean;
};

/** 열린 직후의 클릭(팝업을 띄운 바로 그 클릭)이 배경 클릭으로 처리되지 않게 하는 시간 */
const OPEN_GUARD_MS = 400;

/** 화면 가운데 흰 카드 모달. 네이티브 <dialog>로 포커스 가두기와 Esc 닫기를 처리한다. */
export function Dialog({
  open,
  onClose,
  labelledBy,
  children,
  className,
  dismissOnBackdrop = true,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const openedAt = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      openedAt.current = performance.now();
    }
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
        if (!dismissOnBackdrop || e.target !== e.currentTarget) return;
        if (performance.now() - openedAt.current < OPEN_GUARD_MS) return;
        onClose();
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
