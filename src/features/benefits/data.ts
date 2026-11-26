import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import sampleFile from "../../../supabase/sample-benefits.json";
import { getPeriodStatus, todayInSeoul } from "./period";
import { excludeClosed } from "./search";
import {
  benefitRowSchema,
  categoryRowSchema,
  sampleFileSchema,
  type Benefit,
  type Category,
} from "./schema";
import type { BenefitView, Catalog } from "./types";

export const CATALOG_TAG = "benefits";

/**
 * 공개 혜택 전체와 분야 목록.
 * 5분마다 백그라운드에서 다시 읽으므로 대시보드 수정은 배포 없이 반영된다.
 */
export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 86_400 });
  cacheTag(CATALOG_TAG);

  const supabase = createServerSupabase();
  const { categories, benefits, popularity, isSample } = supabase
    ? await loadFromSupabase(supabase)
    : loadSample();

  const today = todayInSeoul();
  const categoryNames = new Map(categories.map((c) => [c.id, c.name]));

  const views: BenefitView[] = benefits.map((b) => ({
    ...b,
    categoryName: categoryNames.get(b.categoryId) ?? "기타",
    ...getPeriodStatus(b.period, today),
    popularity: popularity.get(b.id) ?? 0,
  }));

  return { categories, benefits: views, isSample };
}

/** 홈과 검색에 전달할 카탈로그. 종료된 혜택의 상세 조회는 getCatalog를 사용한다. */
export async function getDiscoveryCatalog(): Promise<Catalog> {
  const catalog = await getCatalog();
  return { ...catalog, benefits: excludeClosed(catalog.benefits) };
}

/**
 * 상세 화면용 혜택 하나. 공개 목록에 없으면 '내린 혜택'(검수 완료 후 비공개)인지 확인해
 * 종료된 혜택으로 돌려준다. 공유 링크로 들어온 사람이 404 대신 종료 안내를 보게 하기 위해서다.
 * 검수 전 초안은 null(404)이다.
 */
export async function getBenefitBySlug(slug: string): Promise<BenefitView | null> {
  const { benefits, categories, isSample } = await getCatalog();
  const published = benefits.find((b) => b.slug === slug);
  if (published) return published;
  if (isSample || !SLUG_PATTERN.test(slug)) return null;

  const withdrawn = await getWithdrawnBenefit(slug);
  if (!withdrawn) return null;
  return {
    ...withdrawn,
    categoryName: categories.find((c) => c.id === withdrawn.categoryId)?.name ?? "기타",
    status: "closed",
    daysLeft: null,
    popularity: 0,
  };
}

/** DB slug 제약과 같다. 형식이 틀린 주소로 DB를 부르거나 캐시를 늘리지 않는다. */
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

async function getWithdrawnBenefit(slug: string): Promise<Benefit | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 86_400 });
  cacheTag(CATALOG_TAG);

  const supabase = createServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("get_withdrawn_benefit", { p_slug: slug });
  if (error) {
    console.error("[benefits] 내린 혜택 조회 실패", error.message);
    return null;
  }
  const row = data?.[0];
  if (!row) return null;

  const parsed = benefitRowSchema.safeParse(row);
  if (!parsed.success) {
    console.error(`[benefits] 잘못된 혜택 행 제외: ${row.slug}`, parsed.error.issues);
    return null;
  }
  return parsed.data;
}

type Loaded = {
  categories: Category[];
  benefits: Benefit[];
  popularity: Map<string, number>;
  isSample: boolean;
};

async function loadFromSupabase(
  supabase: NonNullable<ReturnType<typeof createServerSupabase>>,
): Promise<Loaded> {
  const [categoriesRes, benefitsRes, popularityRes] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("benefits")
      .select("*")
      .eq("is_published", true)
      .order("recommend_rank"),
    supabase.rpc("benefit_popularity"),
  ]);

  // 혜택 조회 실패는 숨기지 않는다. 재생성이 실패하면 이전 페이지가 계속 서비스된다.
  if (categoriesRes.error) throw new Error(`분야 조회 실패: ${categoriesRes.error.message}`);
  if (benefitsRes.error) throw new Error(`혜택 조회 실패: ${benefitsRes.error.message}`);

  const categories = categoriesRes.data.flatMap((row) => {
    const parsed = categoryRowSchema.safeParse(row);
    return parsed.success ? [parsed.data] : [];
  });

  // 형식이 잘못된 혜택 한 건 때문에 사이트 전체가 깨지지 않도록 그 행만 뺀다.
  const benefits = benefitsRes.data.flatMap((row) => {
    if (row.is_published !== true) return [];
    const parsed = benefitRowSchema.safeParse(row);
    if (!parsed.success) {
      console.error(`[benefits] 잘못된 혜택 행 제외: ${row.slug}`, parsed.error.issues);
      return [];
    }
    return [parsed.data];
  });

  // 인기 점수는 없어도 사이트가 동작해야 한다.
  const popularity = new Map<string, number>();
  if (popularityRes.error) {
    console.error("[benefits] 인기 점수 조회 실패", popularityRes.error.message);
  } else {
    for (const row of popularityRes.data ?? []) popularity.set(row.benefit_id, Number(row.score));
  }

  return { categories, benefits, popularity, isSample: false };
}

function loadSample(): Loaded {
  const parsed = sampleFileSchema.parse(sampleFile);
  return {
    categories: parsed.categories,
    benefits: parsed.benefits,
    popularity: new Map(),
    isSample: true,
  };
}
