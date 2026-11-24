import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { BenefitDetail } from "@/features/benefits/components/BenefitDetail";
import { SampleDataBanner } from "@/features/benefits/components/SampleDataBanner";
import { getBenefitBySlug, getCatalog } from "@/features/benefits/data";

/** 공개 혜택은 모두 미리 만든다. 새로 공개된 혜택은 첫 방문 때 만들어 캐시에 넣는다. */
export async function generateStaticParams() {
  const { benefits } = await getCatalog();
  // Cache Components에서는 최소 1개가 필요하다. 혜택이 없으면 자리표시 값으로 검증만 통과시킨다.
  if (benefits.length === 0) return [{ slug: "__none__" }];
  return benefits.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata(props: PageProps<"/benefits/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const benefit = await getBenefitBySlug(slug);
  if (!benefit) return { title: "혜택을 찾을 수 없어요" };
  return {
    title: benefit.title,
    description: `${benefit.provider} · ${benefit.cardNote || benefit.categoryName}`,
  };
}

async function DetailContent({ params }: Pick<PageProps<"/benefits/[slug]">, "params">) {
  const { slug } = await params;
  const benefit = await getBenefitBySlug(slug);
  if (!benefit) notFound();

  const { isSample } = await getCatalog();
  return (
    <>
      <SampleDataBanner show={isSample} />
      <BenefitDetail benefit={benefit} />
    </>
  );
}

export default function BenefitDetailPage(props: PageProps<"/benefits/[slug]">) {
  return (
    <>
      <PageHeader title="혜택 상세" />
      <main className="flex-1">
        <Suspense fallback={<DetailSkeleton />}>
          <DetailContent params={props.params} />
        </Suspense>
      </main>
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse px-6 pt-4" aria-busy="true" aria-label="혜택을 불러오는 중">
      <div className="h-7 w-40 rounded-full bg-field" />
      <div className="mt-4 h-7 w-56 rounded-lg bg-field" />
      <div className="mt-3 aspect-[354/217] rounded-2xl bg-field" />
      <div className="mt-7 h-5 w-24 rounded bg-field" />
      <div className="mt-3 h-4 w-64 rounded bg-field" />
    </div>
  );
}
