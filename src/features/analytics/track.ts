"use client";

import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { AnalyticsEvent } from "./events";
import { getVisitorId } from "./visitor";

/** 같은 이벤트가 이 시간 안에 다시 오면 중복으로 보고 버린다. */
const DEDUPE_WINDOW_MS = 1_000;
const recentlySent = new Map<string, number>();

/** 한 화면이 두 번 마운트되는 경우(재렌더·StrictMode 등)에도 지표가 부풀지 않게 한다. */
export function isDuplicateEvent(key: string, now: number): boolean {
  const last = recentlySent.get(key);
  recentlySent.set(key, now);
  if (recentlySent.size > 200) {
    for (const [k, t] of recentlySent) if (now - t > DEDUPE_WINDOW_MS) recentlySent.delete(k);
  }
  return last !== undefined && now - last < DEDUPE_WINDOW_MS;
}

/**
 * 모든 측정 이벤트는 이 함수로만 보낸다.
 * 실패해도 사용자 흐름을 막지 않도록 기다리지 않고 오류를 삼킨다.
 */
export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  const benefitKey = "benefitId" in event ? event.benefitId : "";
  const key = `${event.name}|${benefitKey}|${window.location.pathname}|${JSON.stringify("props" in event ? event.props : null)}`;
  if (isDuplicateEvent(key, Date.now())) return;

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
