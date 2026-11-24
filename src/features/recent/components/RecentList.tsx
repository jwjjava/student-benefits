"use client";

import { use } from "react";
import { browser } from "react-dom";
import { ClockIcon } from "@/components/ui/icons";
import { StoredBenefitList } from "@/features/benefits/components/StoredBenefitList";
import type { BenefitView } from "@/features/benefits/types";
import { recentViewStore } from "../storage";

export function RecentList({ benefits }: { benefits: BenefitView[] }) {
  // 최근 본 항목은 이 브라우저의 localStorage에만 있으므로 브라우저에서만 그린다.
  use(browser("최근 본 항목은 이 브라우저에 저장돼요."));
  const ids = recentViewStore.useValue();

  return (
    <StoredBenefitList
      ids={ids}
      benefits={benefits}
      from="recent"
      empty={{
        icon: <ClockIcon size={52} strokeWidth={2.2} />,
        title: "아직 본 혜택이 없어요",
        description: "혜택을 열어보면 여기에 모아볼 수 있어요.",
      }}
    />
  );
}
