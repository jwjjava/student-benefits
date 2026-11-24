"use client";

import { use } from "react";
import { browser } from "react-dom";
import { HeartIcon } from "@/components/ui/icons";
import { StoredBenefitList } from "@/features/benefits/components/StoredBenefitList";
import type { BenefitView } from "@/features/benefits/types";
import { savedStore } from "../storage";

export function SavedList({ benefits }: { benefits: BenefitView[] }) {
  // 찜 목록은 이 브라우저의 localStorage에만 있으므로 브라우저에서만 그린다.
  use(browser("찜 목록은 이 브라우저에 저장돼요."));
  const ids = savedStore.useValue();

  return (
    <StoredBenefitList
      ids={ids}
      benefits={benefits}
      from="saved"
      empty={{
        icon: <HeartIcon size={52} strokeWidth={2.2} />,
        title: "아직 저장한 혜택이 없어요",
        description: "마음에 드는 혜택에 하트를 눌러보세요.",
      }}
    />
  );
}
