import { describe, expect, it } from "vitest";
import { distanceMeters, formatDistance, searchBenefits, sortBenefits } from "./search";
import type { BenefitView } from "./types";

function make(overrides: Partial<BenefitView>): BenefitView {
  return {
    id: "id",
    slug: "slug",
    title: "혜택",
    provider: "제공처",
    categoryId: "food",
    categoryName: "음식점",
    cardNote: "",
    eligibility: [],
    usageMethod: "",
    period: { startDate: null, endDate: null, isAlwaysOpen: true },
    applyUrl: "https://example.com",
    source: { name: "출처", url: "https://example.com" },
    logoUrl: null,
    imageUrl: null,
    place: null,
    tags: [],
    recommendRank: 100,
    verifiedAt: null,
    status: "always",
    daysLeft: null,
    popularity: 0,
    ...overrides,
  };
}

const latte = make({ id: "a", title: "카페라테 1,000원 할인", provider: "이디야커피", tags: ["커피"], recommendRank: 2, popularity: 1 });
const notion = make({ id: "b", title: "개인 플러스 플랜 무료", provider: "Notion", categoryId: "subscription", categoryName: "구독", recommendRank: 1, popularity: 5 });
const closed = make({ id: "c", title: "아메리카노 할인", tags: ["커피"], status: "closed" });

describe("searchBenefits", () => {
  it("띄어쓰기·대소문자와 상관없이 제목·제공처·태그를 찾는다", () => {
    expect(searchBenefits([latte, notion], "카페 라테").map((b) => b.id)).toEqual(["a"]);
    expect(searchBenefits([latte, notion], "notion").map((b) => b.id)).toEqual(["b"]);
    expect(searchBenefits([latte, notion], "구독").map((b) => b.id)).toEqual(["b"]);
  });

  it("종료된 혜택은 검색 결과에서 뺀다", () => {
    expect(searchBenefits([latte, closed], "커피").map((b) => b.id)).toEqual(["a"]);
  });

  it("빈 검색어는 결과가 없다", () => {
    expect(searchBenefits([latte], "  ")).toEqual([]);
  });
});

describe("sortBenefits", () => {
  it("추천순은 recommendRank 오름차순", () => {
    expect(sortBenefits([latte, notion], "recommended", null).map((b) => b.id)).toEqual(["b", "a"]);
  });

  it("인기순은 popularity 내림차순", () => {
    expect(sortBenefits([latte, notion], "popular", null).map((b) => b.id)).toEqual(["b", "a"]);
  });

  it("가까운 순은 위치가 있는 혜택만 거리순", () => {
    const near = make({ id: "near", place: { name: "가까운", latitude: 37.2968, longitude: 126.8356 } });
    const far = make({ id: "far", place: { name: "먼", latitude: 37.31, longitude: 126.85 } });
    const origin = { latitude: 37.2967, longitude: 126.8355 };
    const sorted = sortBenefits([far, notion, near], "nearby", origin);
    expect(sorted.map((b) => b.id)).toEqual(["near", "far"]);
    expect(sorted[0].distance).toBeLessThan(50);
  });
});

describe("distance", () => {
  it("위도 0.001도는 약 111m", () => {
    const d = distanceMeters({ latitude: 37, longitude: 127 }, { latitude: 37.001, longitude: 127 });
    expect(Math.round(d)).toBe(111);
  });

  it("거리 표시", () => {
    expect(formatDistance(183)).toBe("180m");
    expect(formatDistance(1234)).toBe("1.2km");
  });
});
