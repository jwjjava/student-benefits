"use client";

import { z } from "zod";
import { createLocalStore } from "@/lib/local-store";

export const RECENT_VIEW_LIMIT = 30;
export const RECENT_SEARCH_LIMIT = 10;

/** 최근 본 혜택 id. 최근에 본 것이 앞에 온다. */
export const recentViewStore = createLocalStore<string[]>({
  key: "benefits:recent-views:v1",
  schema: z.array(z.string()),
  fallback: [],
});

/** 최근 검색어. 최근 것이 앞에 온다. */
export const recentSearchStore = createLocalStore<string[]>({
  key: "benefits:recent-searches:v1",
  schema: z.array(z.string()),
  fallback: [],
});

/** 맨 앞에 넣고 중복을 지운 뒤 limit개만 남긴다. */
export function pushRecent(list: string[], item: string, limit: number): string[] {
  return [item, ...list.filter((x) => x !== item)].slice(0, limit);
}
