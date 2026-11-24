"use client";

import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { AnalyticsEvent } from "./events";
import { getVisitorId } from "./visitor";

/**
 * 모든 측정 이벤트는 이 함수로만 보낸다.
 * 실패해도 사용자 흐름을 막지 않도록 기다리지 않고 오류를 삼킨다.
 */
export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  const row = {
    visitor_id: getVisitorId(),
    name: event.name,
    benefit_id: "benefitId" in event ? event.benefitId : null,
    path: window.location.pathname.slice(0, 300),
    props: "props" in event && event.props ? event.props : {},
  };

  const supabase = getBrowserSupabase();
  if (!supabase) {
    if (process.env.NODE_ENV === "development") console.debug("[track]", row);
    return;
  }

  void supabase
    .from("events")
    .insert(row)
    .then(({ error }) => {
      if (error && process.env.NODE_ENV === "development") {
        console.warn("[track] 기록 실패", error.message);
      }
    });
}
