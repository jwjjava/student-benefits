import type { SourceSurface } from "@/features/analytics/events";
import type { RankedBenefit } from "../search";
import type { BenefitView } from "../types";
import { BenefitCard } from "./BenefitCard";

type BenefitGridProps = {
  benefits: (BenefitView | RankedBenefit)[];
  from: SourceSurface;
  showDistance?: boolean;
};

export function BenefitGrid({ benefits, from, showDistance = false }: BenefitGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-3.5 gap-y-8 px-5 pb-12">
      {benefits.map((b, i) => (
        <li key={b.id}>
          <BenefitCard
            benefit={b}
            from={from}
            priority={i < 4}
            distance={showDistance && "distance" in b ? b.distance : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
