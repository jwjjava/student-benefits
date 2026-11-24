"use client";

import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { SourceSurface } from "@/features/analytics/events";
import type { BenefitView } from "../types";
import { BenefitGrid } from "./BenefitGrid";

type StoredBenefitListProps = {
  ids: string[];
  benefits: BenefitView[];
  from: SourceSurface;
  empty: { icon: ReactNode; title: string; description: string };
};

/** 브라우저에 저장된 id 목록(찜·최근 본 항목)을 혜택 카드로 보여 준다. */
export function StoredBenefitList({ ids, benefits, from, empty }: StoredBenefitListProps) {
  const byId = new Map(benefits.map((b) => [b.id, b]));
  const found = ids.flatMap((id) => {
    const b = byId.get(id);
    return b ? [b] : [];
  });
  const missingCount = ids.length - found.length;

  if (ids.length === 0) {
    return <EmptyState {...empty} action={{ href: "/", label: "혜택 둘러보기" }} />;
  }

  return (
    <>
      <h2 className="px-5 pb-4 pt-5 text-base font-bold text-ink">혜택 {found.length}개</h2>
      {missingCount > 0 ? (
        <p className="mx-5 mb-4 rounded-xl bg-field px-4 py-3 text-[13px] text-sub">
          더 이상 제공되지 않는 혜택 {missingCount}개는 목록에서 보이지 않아요.
        </p>
      ) : null}
      <BenefitGrid benefits={found} from={from} />
    </>
  );
}
