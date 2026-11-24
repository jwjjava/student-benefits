"use client";

import { useCallback } from "react";
import { track } from "@/features/analytics/track";
import type { SourceSurface } from "@/features/analytics/events";
import { savedStore, toggleSavedId } from "./storage";

export function useSavedBenefits() {
  const savedIds = savedStore.useValue();

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const toggle = useCallback((id: string, from: SourceSurface) => {
    const wasSaved = savedStore.get().includes(id);
    savedStore.set((prev) => toggleSavedId(prev, id));
    track({
      name: wasSaved ? "benefit_unsave" : "benefit_save",
      benefitId: id,
      props: { from },
    });
  }, []);

  return { savedIds, isSaved, toggle };
}
