import Image from "next/image";
import Link from "next/link";
import { ErrorReportButton } from "@/features/feedback/components/ErrorReportButton";
import { UsageSurveyDialog } from "@/features/feedback/components/UsageSurveyDialog";
import { RecordRecentView } from "@/features/recent/components/RecordRecentView";
import { SaveButton } from "@/features/saved/components/SaveButton";
import { formatDate, formatPeriod } from "../period";
import type { BenefitView } from "../types";
import { ApplyBar } from "./ApplyBar";
import { BenefitThumbnail } from "./BenefitThumbnail";

/** SCR-DETAIL-01 (일반) / SCR-DETAIL-02 (종료 표시) */
export function BenefitDetail({ benefit }: { benefit: BenefitView }) {
  const closed = benefit.status === "closed";

  return (
    <>
      <article className="px-6 pb-40 pt-4">
        {/* 1. 상단 요약: 로고 · 분야 / 제공처 */}
        <div className="flex items-center gap-2.5 text-sm">
          <span className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-field text-[10px] font-bold text-sub">
            {benefit.logoUrl ? (
              <Image src={benefit.logoUrl} alt="" fill sizes="28px" className="object-cover" />
            ) : (
              benefit.provider.slice(0, 1)
            )}
          </span>
          <Link href={`/?category=${benefit.categoryId}`} className="font-medium text-brand hover:underline">
            {benefit.categoryName}
          </Link>
          <span aria-hidden className="text-sub">
            /
          </span>
          <span className="truncate font-medium text-ink">{benefit.provider}</span>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <h2 className="text-xl font-extrabold leading-snug tracking-title text-ink">{benefit.title}</h2>
          <SaveButton benefitId={benefit.id} benefitTitle={benefit.title} from="detail" variant="detail" />
        </div>

        {/* 2. 대표 이미지 (+ 종료 표시) */}
        <BenefitThumbnail
          imageUrl={benefit.imageUrl}
          provider={benefit.provider}
          categoryId={benefit.categoryId}
          closed={closed}
          closedLabel="종료된 혜택"
          sizes="(max-width: 430px) 100vw, 400px"
          priority
          className="mt-3 aspect-[354/217] rounded-2xl"
        />

        {/* 3. 이용 대상 */}
        <section aria-labelledby="eligibility" className="mt-7 border-b border-field pb-5">
          <h3 id="eligibility" className="text-base font-bold text-ink">
            이용 대상
          </h3>
          <p className="mt-3 text-sm text-ink-list">
            {benefit.eligibility.length > 0 ? benefit.eligibility.join(" · ") : "대학생 누구나"}
          </p>
        </section>

        {/* 4. 기간 및 이용 방법 */}
        <section aria-labelledby="period" className="mt-6">
          <h3 id="period" className="text-base font-bold text-ink">
            기간 및 이용 방법
          </h3>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 text-sm">
            <dt className="font-semibold text-ink">기간</dt>
            <dd className="text-ink-list">
              {formatPeriod(benefit.period)}
              {benefit.status === "closingSoon" && benefit.daysLeft !== null ? (
                <span className="ml-2 rounded-md bg-like/10 px-1.5 py-0.5 text-xs font-bold text-like">
                  {benefit.daysLeft === 0 ? "오늘 마감" : `D-${benefit.daysLeft}`}
                </span>
              ) : null}
              {benefit.status === "upcoming" ? (
                <span className="ml-2 rounded-md bg-accent/10 px-1.5 py-0.5 text-xs font-bold text-accent">
                  시작 전
                </span>
              ) : null}
            </dd>
            {benefit.usageMethod ? (
              <>
                <dt className="font-semibold text-ink">이용</dt>
                <dd className="text-ink-list">{benefit.usageMethod}</dd>
              </>
            ) : null}
          </dl>
        </section>

        {/* 출처·검수일·오류 제보 (PRD: 출처 표시, 정보 오류 제보) */}
        <footer className="mt-8 space-y-1.5 rounded-xl bg-field/60 px-4 py-3.5 text-xs text-sub">
          <p>
            출처{" "}
            <a href={benefit.source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              {benefit.source.name}
            </a>
            {benefit.verifiedAt ? ` · ${formatDate(benefit.verifiedAt)} 확인` : null}
          </p>
          <ErrorReportButton benefitId={benefit.id} />
        </footer>
      </article>

      <ApplyBar benefitId={benefit.id} applyUrl={benefit.applyUrl} closed={closed} />
      <RecordRecentView benefitId={benefit.id} />
      {closed ? null : <UsageSurveyDialog benefitId={benefit.id} benefitTitle={benefit.title} />}
    </>
  );
}
