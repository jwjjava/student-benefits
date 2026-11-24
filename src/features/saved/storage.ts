"use client";

import { z } from "zod";
import { createLocalStore } from "@/lib/local-store";

/** 찜한 혜택 id 목록. 최근에 찜한 것이 앞에 온다. 혜택 내용은 복사해 두지 않는다. */
export const SAVED_STORAGE_KEY = "benefits:saved:v1";

export const savedStore = createLocalStore<string[]>({
  key: SAVED_STORAGE_KEY,
  schema: z.array(z.string()),
  fallback: [],
});

export function toggleSavedId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids];
}
