"use client";

import { buttonStyles } from "@/components/ui/Button";
import { track } from "@/features/analytics/track";
import { pendingUsageStore } from "@/features/feedback/pending";

type ApplyBarProps = { benefitId: string; applyUrl: string; closed: boolean };

/** 하단 고정 '혜택 신청 페이지 열기' (E-01). 종료된 혜택이면 비활성. (D-02) */
export function ApplyBar({ benefitId, applyUrl, closed }: ApplyBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-[430px] border-t border-field bg-canvas/95 px-6 pb-[max(env(safe-area-inset-bottom),20px)] pt-4 backdrop-blur">
      {closed ? (
        <button type="button" disabled className={buttonStyles({ variant: "muted", size: "lg" })}>
          종료된 혜택이에요
        </button>
      ) : (
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            track({ name: "outbound_click", benefitId, props: { from: "detail" } });
            pendingUsageStore.set({ benefitId, at: Date.now() });
          }}
          className={buttonStyles({ size: "lg" })}
        >
          혜택 신청 페이지 열기
          <span className="sr-only"> (새 창)</span>
        </a>
      )}
    </div>
  );
}
