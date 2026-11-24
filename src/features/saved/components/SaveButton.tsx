"use client";

import { HeartIcon } from "@/components/ui/icons";
import type { SourceSurface } from "@/features/analytics/events";
import { cn } from "@/lib/utils";
import { useSavedBenefits } from "../useSavedBenefits";

type SaveButtonProps = {
  benefitId: string;
  benefitTitle: string;
  from: SourceSurface;
  variant?: "card" | "detail";
  className?: string;
};

export function SaveButton({
  benefitId,
  benefitTitle,
  from,
  variant = "card",
  className,
}: SaveButtonProps) {
  const { isSaved, toggle } = useSavedBenefits();
  const saved = isSaved(benefitId);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `${benefitTitle} 찜 해제` : `${benefitTitle} 찜하기`}
      onClick={(e) => {
        // 카드 링크 안에 있으므로 상세 이동을 막는다.
        e.preventDefault();
        e.stopPropagation();
        toggle(benefitId, from);
      }}
      className={cn(
        "flex items-center justify-center transition-transform active:scale-90",
        variant === "card" && "size-6 rounded-full bg-white/95 shadow-sm",
        variant === "detail" && "size-10 -mr-2 rounded-full",
        saved ? "text-like" : variant === "detail" ? "text-brand" : "text-ink",
        className,
      )}
    >
      <HeartIcon filled={saved} size={variant === "card" ? 15 : 24} strokeWidth={variant === "card" ? 2 : 1.8} />
    </button>
  );
}
