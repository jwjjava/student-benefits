"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { track } from "./track";

export function PageViewTracker() {
  const pathname = usePathname();
  // 개발 모드(StrictMode)에서 effect가 두 번 실행돼도 같은 경로는 한 번만 기록한다.
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;
    track({ name: "page_view" });
  }, [pathname]);

  return null;
}
