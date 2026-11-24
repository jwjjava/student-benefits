"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { createLocalStore } from "@/lib/local-store";
import type { GeoPoint } from "@/features/benefits/search";

/** 한양대학교 ERICA 캠퍼스 (위치 권한이 없을 때 기준점) */
export const ERICA_CAMPUS: GeoPoint = { latitude: 37.2967, longitude: 126.8355 };

const consentStore = createLocalStore<"granted" | "denied" | null>({
  key: "benefits:location-consent:v1",
  schema: z.enum(["granted", "denied"]).nullable(),
  fallback: null,
});

export type OriginState =
  | { kind: "idle" }
  | { kind: "asking" } // 우리 안내 팝업을 보여 주는 중
  | { kind: "locating" }
  | { kind: "denied-notice" } // '에리카 기준으로 보여드릴게요' 안내
  | { kind: "me"; point: GeoPoint }
  | { kind: "campus"; point: GeoPoint };

/**
 * 가까운 순 정렬에 쓸 기준 위치.
 * 처음에는 안내 팝업 → 허용하면 브라우저 위치 권한 요청 → 실패·거부 시 에리카 캠퍼스 기준.
 */
export function useNearbyOrigin(active: boolean) {
  const consent = consentStore.useValue();
  const [myPoint, setMyPoint] = useState<GeoPoint | null>(null);
  // 이번 방문에서 거부했고 아직 안내를 확인하지 않았는지
  const [showDeniedNotice, setShowDeniedNotice] = useState(false);

  // 허용된 상태로 '가까운 순'에 들어오면 브라우저 위치를 읽는다. 상태는 콜백에서만 바꾼다.
  useEffect(() => {
    if (!active || consent !== "granted" || myPoint) return;
    if (!("geolocation" in navigator)) {
      consentStore.set("denied");
      return;
    }
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!cancelled) setMyPoint({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      () => {
        if (cancelled) return;
        consentStore.set("denied");
        setShowDeniedNotice(true);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
    return () => {
      cancelled = true;
    };
  }, [active, consent, myPoint]);

  const allow = useCallback(() => consentStore.set("granted"), []);

  const refuse = useCallback(() => {
    consentStore.set("denied");
    setShowDeniedNotice(true);
  }, []);

  const acknowledgeDenied = useCallback(() => setShowDeniedNotice(false), []);

  const state: OriginState = !active
    ? { kind: "idle" }
    : showDeniedNotice
      ? { kind: "denied-notice" }
      : consent === null
        ? { kind: "asking" }
        : consent === "denied"
          ? { kind: "campus", point: ERICA_CAMPUS }
          : myPoint
            ? { kind: "me", point: myPoint }
            : { kind: "locating" };

  const origin = state.kind === "me" || state.kind === "campus" ? state.point : null;
  return { state, origin, allow, refuse, acknowledgeDenied };
}
