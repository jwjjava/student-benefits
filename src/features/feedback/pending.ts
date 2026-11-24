"use client";

import { z } from "zod";
import { createLocalStore } from "@/lib/local-store";

/** 외부 신청 페이지로 나간 혜택. 돌아오면 이용 여부를 묻는다. 탭을 닫으면 사라진다. */
export const pendingUsageStore = createLocalStore<{ benefitId: string; at: number } | null>({
  key: "benefits:pending-usage:v1",
  schema: z.object({ benefitId: z.string(), at: z.number() }).nullable(),
  fallback: null,
  area: "session",
});

/** 너무 빨리 돌아온 경우(실수로 누름)는 묻지 않는다. */
export const MIN_AWAY_MS = 3_000;
