import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SampleDataBanner } from "@/features/benefits/components/SampleDataBanner";
import { SearchView, SearchViewFromUrl } from "@/features/benefits/components/SearchView";
import { getDiscoveryCatalog } from "@/features/benefits/data";

export const metadata: Metadata = { title: "혜택 검색" };

export default async function SearchPage() {
  const catalog = await getDiscoveryCatalog();

  return (
    <>
      <SampleDataBanner show={catalog.isSample} />
      <PageHeader title="혜택 검색" />
      <main className="flex-1 pt-1">
        <Suspense fallback={<SearchView catalog={catalog} initialQuery="" />}>
          <SearchViewFromUrl catalog={catalog} />
        </Suspense>
      </main>
    </>
  );
}
