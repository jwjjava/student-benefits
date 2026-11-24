import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCatalog } from "@/features/benefits/data";
import { SavedList } from "@/features/saved/components/SavedList";

export const metadata: Metadata = { title: "찜" };

export default async function SavedPage() {
  const { benefits } = await getCatalog();

  return (
    <>
      <PageHeader title="찜" showMenu={false} divider />
      <main className="flex flex-1 flex-col">
        <Suspense fallback={<p className="px-5 pt-6 text-sm text-sub">찜한 혜택을 불러오고 있어요…</p>}>
          <SavedList benefits={benefits} />
        </Suspense>
      </main>
    </>
  );
}
