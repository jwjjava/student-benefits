import Link from "next/link";
import type { SourceSurface } from "@/features/analytics/events";
import { SaveButton } from "@/features/saved/components/SaveButton";
import { formatDistance } from "../search";
import type { BenefitView } from "../types";
import { BenefitThumbnail } from "./BenefitThumbnail";

type BenefitCardProps = {
  benefit: BenefitView;
  from: SourceSurface;
  distance?: number | null;
  priority?: boolean;
};

export function BenefitCard({ benefit, from, distance, priority }: BenefitCardProps) {
  const closed = benefit.status === "closed";
  const note =
    distance !== undefined && distance !== null ? `거리 ${formatDistance(distance)}` : benefit.cardNote;

  return (
    <article className="relative">
      <Link href={`/benefits/${benefit.slug}`} className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
        <BenefitThumbnail
          imageUrl={benefit.imageUrl}
          provider={benefit.provider}
          categoryId={benefit.categoryId}
          closed={closed}
          sizes="(max-width: 430px) 50vw, 200px"
          priority={priority}
          className="aspect-[174/113] rounded-2xl"
        />
        <p className="mt-3 truncate text-xs font-medium text-accent">
          {benefit.categoryName} · {benefit.provider}
        </p>
        <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug tracking-title text-ink group-hover:underline">
          {benefit.title}
        </h3>
        {note ? <p className="mt-1 truncate text-xs text-sub">{note}</p> : null}
        {benefit.status === "closingSoon" && benefit.daysLeft !== null ? (
          <p className="mt-1 text-xs font-bold text-like">
            {benefit.daysLeft === 0 ? "오늘 마감" : `D-${benefit.daysLeft}`}
          </p>
        ) : null}
      </Link>
      <SaveButton
        benefitId={benefit.id}
        benefitTitle={benefit.title}
        from={from}
        className="absolute right-2 top-2"
      />
    </article>
  );
}
