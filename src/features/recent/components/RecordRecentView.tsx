"use client";

import { useEffect } from "react";
import { track } from "@/features/analytics/track";
import { pushRecent, recentViewStore, RECENT_VIEW_LIMIT } from "../storage";

/** 상세 화면에 들어오면 최근 본 항목에 넣고 benefit_view를 기록한다. */
export function RecordRecentView({ benefitId }: { benefitId: string }) {
  useEffect(() => {
    recentViewStore.set((prev) => pushRecent(prev, benefitId, RECENT_VIEW_LIMIT));
    track({ name: "benefit_view", benefitId });
  }, [benefitId]);

  return null;
}
