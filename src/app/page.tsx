import Link from "next/link";
import { Suspense } from "react";
import { MenuButton } from "@/components/layout/MenuDrawer";
import { SearchIcon } from "@/components/ui/icons";
import {
  BenefitExplorer,
  BenefitExplorerFromUrl,
  DEFAULT_EXPLORER_PARAMS,
} from "@/features/benefits/components/BenefitExplorer";
import { SampleDataBanner } from "@/features/benefits/components/SampleDataBanner";
import { getCatalog } from "@/features/benefits/data";
import { SITE_NAME } from "@/lib/site";

export default async function HomePage() {
  const catalog = await getCatalog();

  return (
    <>
      <SampleDataBanner show={catalog.isSample} />
      <header className="flex h-[72px] items-center justify-between px-6 pt-2">
        <h1 className="text-2xl font-bold tracking-title text-brand">{SITE_NAME}</h1>
        <MenuButton />
      </header>

      <main className="flex-1">
        <div className="px-5">
          <Link
            href="/search"
            className="flex h-[42px] items-center gap-2.5 rounded-xl bg-field px-3.5 text-sm text-sub"
          >
            <SearchIcon size={20} />
            혜택 검색
          </Link>
        </div>

        <div className="mt-4">
          {/* 쿼리(분야·정렬)를 읽기 전에는 기본값(전체·추천순) 목록을 미리 그려 둔다. */}
          <Suspense fallback={<BenefitExplorer catalog={catalog} params={DEFAULT_EXPLORER_PARAMS} />}>
            <BenefitExplorerFromUrl catalog={catalog} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
