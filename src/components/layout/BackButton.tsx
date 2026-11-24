"use client";

import { useRouter } from "next/navigation";
import { BackIcon } from "@/components/ui/icons";

/** 이전 화면으로. 공유 링크로 바로 들어와 이전 기록이 없으면 홈으로 간다. */
export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="뒤로 가기"
      onClick={() => {
        if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) {
          router.back();
        } else {
          router.push("/");
        }
      }}
      className="-ml-2 flex size-9 items-center justify-center rounded-full text-ink hover:bg-field/60"
    >
      <BackIcon size={22} />
    </button>
  );
}
