import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCatalog } from "@/features/benefits/data";
import { RecentList } from "@/features/recent/components/RecentList";

export const metadata: Metadata = { title: "최근 본 항목" };

export default async function RecentPage() {
  const { benefits } = await getCatalog();

  return (
    <>
      <PageHeader title="최근 본 항목" showMenu={false} divider />
      <main className="flex flex-1 flex-col">
        <Suspense fallback={<p className="px-5 pt-6 text-sm text-sub">최근 본 혜택을 불러오고 있어요…</p>}>
          <RecentList benefits={benefits} />
        </Suspense>
      </main>
    </>
  );
}
