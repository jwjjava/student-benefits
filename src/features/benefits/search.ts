import { ALL_CATEGORY, type BenefitView, type SortKey } from "./types";

/** 공백을 없애고 소문자로 바꿔 '카페 라테'와 '카페라테'를 같게 본다. */
export function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

export function matchesQuery(benefit: BenefitView, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const haystack = [
    benefit.title,
    benefit.provider,
    benefit.categoryName,
    benefit.cardNote,
    ...benefit.tags,
  ]
    .map(normalize)
    .join("|");
  return haystack.includes(q);
}

export function filterByCategory(benefits: BenefitView[], categoryId: string) {
  if (categoryId === ALL_CATEGORY) return benefits;
  return benefits.filter((b) => b.categoryId === categoryId);
}

/** 목록·검색에는 종료된 혜택을 보여 주지 않는다. (찜·최근 본 항목에서는 보여 준다) */
export function excludeClosed(benefits: BenefitView[]) {
  return benefits.filter((b) => b.status !== "closed");
}

export function searchBenefits(benefits: BenefitView[], query: string) {
  if (!normalize(query)) return [];
  return excludeClosed(benefits).filter((b) => matchesQuery(b, query));
}

export type GeoPoint = { latitude: number; longitude: number };

/** 두 좌표 사이 거리(m), 하버사인 공식 */
export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** 180 → '180m', 1234 → '1.2km' */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export type RankedBenefit = BenefitView & { distance: number | null };

export function sortBenefits(
  benefits: BenefitView[],
  sort: SortKey,
  origin: GeoPoint | null,
): RankedBenefit[] {
  const withDistance: RankedBenefit[] = benefits.map((b) => ({
    ...b,
    distance: origin && b.place ? distanceMeters(origin, b.place) : null,
  }));

  if (sort === "nearby") {
    // 매장 위치가 있는 혜택만 가까운 순으로
    return withDistance
      .filter((b) => b.distance !== null)
      .sort((a, b) => a.distance! - b.distance!);
  }
  if (sort === "popular") {
    return withDistance.sort(
      (a, b) => b.popularity - a.popularity || a.recommendRank - b.recommendRank,
    );
  }
  return withDistance.sort((a, b) => a.recommendRank - b.recommendRank);
}
