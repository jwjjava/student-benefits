"use client";

import { useSyncExternalStore } from "react";
import type { z } from "zod";

type StoreOptions<T> = {
  key: string;
  schema: z.ZodType<T>;
  fallback: T;
  area?: "local" | "session";
};

export type LocalStore<T> = {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
  /** 서버 렌더와 첫 하이드레이션에서는 fallback, 이후 실제 값으로 바뀐다. */
  useValue: () => T;
};

/**
 * localStorage/sessionStorage 값을 zod로 검증해 읽고, 같은 탭·다른 탭의 변경을 구독한다.
 * 저장소 접근이 막힌 환경(사생활 보호 모드 등)에서는 fallback으로 동작한다.
 */
export function createLocalStore<T>({
  key,
  schema,
  fallback,
  area = "local",
}: StoreOptions<T>): LocalStore<T> {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cachedValue: T = fallback;

  const storage = (): Storage | null => {
    try {
      return area === "local" ? window.localStorage : window.sessionStorage;
    } catch {
      return null;
    }
  };

  const get = (): T => {
    if (typeof window === "undefined") return fallback;
    let raw: string | null = null;
    try {
      raw = storage()?.getItem(key) ?? null;
    } catch {
      raw = null;
    }
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    if (raw === null) {
      cachedValue = fallback;
    } else {
      try {
        const parsed = schema.safeParse(JSON.parse(raw));
        cachedValue = parsed.success ? parsed.data : fallback;
      } catch {
        cachedValue = fallback;
      }
    }
    return cachedValue;
  };

  const emit = () => listeners.forEach((l) => l());

  const set: LocalStore<T>["set"] = (next) => {
    const value = typeof next === "function" ? (next as (prev: T) => T)(get()) : next;
    try {
      storage()?.setItem(key, JSON.stringify(value));
    } catch {
      // 저장 실패는 조용히 넘긴다(용량 초과·차단).
    }
    emit();
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  const getServerSnapshot = () => fallback;

  return {
    get,
    set,
    subscribe,
    useValue: () => useSyncExternalStore(subscribe, get, getServerSnapshot),
  };
}
