import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBenefitBySlug, getDiscoveryCatalog } from "./data";

const { createServerSupabase } = vi.hoisted(() => ({ createServerSupabase: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabase }));

const publicRow = {
  id: "a059a3d1-4422-4357-9276-b5ee0d271753",
  slug: "open-benefit",
  title: "공개 혜택",
  provider: "테스트",
  category_id: "food",
  card_note: "",
  eligibility: [],
  usage_method: "",
  start_date: null,
  end_date: null,
  is_always_open: true,
  apply_url: "https://example.com/apply",
  source_name: "테스트 출처",
  source_url: "https://example.com",
  logo_url: null,
  image_url: null,
  place_name: null,
  latitude: null,
  longitude: null,
  tags: [],
  recommend_rank: 1,
  verified_at: "2026-01-01",
  is_published: true,
};

describe("공개 혜택 조회", () => {
  const eq = vi.fn();

  beforeEach(() => {
    const rows = [
      publicRow,
      {
        ...publicRow,
        id: "11f06bed-d729-44cc-842b-33245501c640",
        slug: "closed-benefit",
        end_date: "2026-01-31",
        is_always_open: false,
      },
      {
        ...publicRow,
        id: "297dcda2-221a-4a0d-8d50-a775f0d38695",
        slug: "private-benefit",
        is_published: false,
      },
    ];

    // DB 응답에 비공개 행이 섞여도 서버에서 제외하는지 검증한다.
    eq.mockReset().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: rows, error: null }),
    });
    createServerSupabase.mockReturnValue({
      from: (table: string) => ({
        select: () => table === "benefits"
          ? { eq }
          : { order: async () => ({ data: [], error: null }) },
      }),
      rpc: withdrawnRpc,
    });
    withdrawnRpc.mockClear();
  });

  // 검수 완료 후 내린 혜택은 get_withdrawn_benefit이 돌려준다. 초안은 DB 함수가 걸러 빈 배열이다.
  const withdrawnRow = {
    ...publicRow,
    id: "5d2a8c1e-7b3f-4e6a-9c1d-2f4b6a8c0e12",
    slug: "withdrawn-benefit",
    is_published: false,
  };
  const withdrawnRpc = vi.fn(async (fn: string, args?: { p_slug: string }) =>
    fn === "get_withdrawn_benefit" && args?.p_slug === "withdrawn-benefit"
      ? { data: [withdrawnRow], error: null }
      : { data: [], error: null },
  );

  it("홈·검색 카탈로그에는 공개된 미종료 혜택만 담는다", async () => {
    const { benefits } = await getDiscoveryCatalog();

    expect(eq).toHaveBeenCalledWith("is_published", true);
    expect(benefits.map((benefit) => benefit.slug)).toEqual(["open-benefit"]);
  });

  it("종료된 공개 혜택을 상세에서 종료 상태로 반환한다", async () => {
    await expect(getBenefitBySlug("closed-benefit")).resolves.toMatchObject({
      status: "closed",
      daysLeft: null,
    });
  });

  it("검수 전 비공개 혜택(초안)은 상세 조회에서도 제외한다", async () => {
    await expect(getBenefitBySlug("private-benefit")).resolves.toBeNull();
  });

  it("공개했다가 내린 혜택은 상세에서 종료 상태로 보여 준다", async () => {
    const benefit = await getBenefitBySlug("withdrawn-benefit");

    expect(benefit).toMatchObject({ slug: "withdrawn-benefit", status: "closed", daysLeft: null });
    expect(withdrawnRpc).toHaveBeenCalledWith("get_withdrawn_benefit", { p_slug: "withdrawn-benefit" });
  });

  it("내린 혜택은 홈·검색 목록에는 나오지 않는다", async () => {
    const { benefits } = await getDiscoveryCatalog();
    expect(benefits.some((b) => b.slug === "withdrawn-benefit")).toBe(false);
  });

  it("형식이 틀린 주소는 DB를 부르지 않고 바로 404", async () => {
    await expect(getBenefitBySlug("../Bad Slug")).resolves.toBeNull();
    expect(withdrawnRpc).not.toHaveBeenCalledWith("get_withdrawn_benefit", expect.anything());
  });
});
