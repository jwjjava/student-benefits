import type { PeriodStatus } from "./period";
import type { Benefit, Category } from "./schema";

/** 화면에 내려보내는 혜택: 원본 + 오늘 기준 기간 상태 + 인기 점수 */
export type BenefitView = Benefit & {
  categoryName: string;
  status: PeriodStatus;
  daysLeft: number | null;
  popularity: number;
};

export type Catalog = {
  categories: Category[];
  benefits: BenefitView[];
  /** Supabase가 연결되지 않아 샘플 데이터로 표시 중인지 */
  isSample: boolean;
};

export type SortKey = "recommended" | "popular" | "nearby";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "추천순" },
  { key: "popular", label: "인기순" },
  { key: "nearby", label: "가까운 순" },
];

export const ALL_CATEGORY = "all";
