"use client";

import { z } from "zod";
import { createLocalStore } from "@/lib/local-store";

const visitorStore = createLocalStore<string | null>({
  key: "benefits:visitor:v1",
  schema: z.uuid().nullable(),
  fallback: null,
});

/** 로그인 없이 브라우저 단위로 방문자를 구분하는 익명 ID. 처음 호출할 때 만든다. */
export function getVisitorId(): string {
  const existing = visitorStore.get();
  if (existing) return existing;
  const id = crypto.randomUUID();
  visitorStore.set(id);
  return id;
}
