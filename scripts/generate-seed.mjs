// supabase/sample-benefits.json → supabase/seed.sql
// 사용: node scripts/generate-seed.mjs
// 혜택은 비공개(is_published=false)로 넣는다. 검수 후 대시보드에서 공개로 바꾼다.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(
  readFileSync(join(root, "supabase/sample-benefits.json"), "utf8"),
);

const q = (v) =>
  v === undefined || v === null ? "null" : `'${String(v).replaceAll("'", "''")}'`;
const arr = (a) => `array[${(a ?? []).map(q).join(", ")}]::text[]`;
const num = (v) => (v === undefined || v === null ? "null" : String(Number(v)));

const lines = [
  "-- 자동 생성 파일: scripts/generate-seed.mjs 로 다시 만든다. 직접 고치지 않는다.",
  "-- 디자인 시안 예시 데이터(검수 전). 모두 비공개로 들어간다.",
  "",
  "insert into public.categories (id, name, sort_order) values",
  data.categories
    .map((c) => `  (${q(c.id)}, ${q(c.name)}, ${num(c.sortOrder)})`)
    .join(",\n") + "\non conflict (id) do update set name = excluded.name, sort_order = excluded.sort_order;",
  "",
  "insert into public.benefits (id, slug, title, provider, category_id, card_note, eligibility, usage_method, start_date, end_date, is_always_open, apply_url, source_name, source_url, logo_url, image_url, place_name, latitude, longitude, tags, recommend_rank, is_published, verified_at) values",
  data.benefits
    .map(
      (b) =>
        `  (${q(b.id)}, ${q(b.slug)}, ${q(b.title)}, ${q(b.provider)}, ${q(b.categoryId)}, ${q(b.cardNote ?? "")}, ${arr(b.eligibility)}, ${q(b.usageMethod ?? "")}, ${q(b.startDate)}, ${q(b.endDate)}, ${b.isAlwaysOpen ? "true" : "false"}, ${q(b.applyUrl)}, ${q(b.sourceName)}, ${q(b.sourceUrl)}, ${q(b.logoUrl)}, ${q(b.imageUrl)}, ${q(b.placeName)}, ${num(b.latitude)}, ${num(b.longitude)}, ${arr(b.tags)}, ${num(b.recommendRank ?? 100)}, false, null)`,
    )
    .join(",\n") + "\non conflict (id) do nothing;",
  "",
];

writeFileSync(join(root, "supabase/seed.sql"), lines.join("\n"), "utf8");
console.log(`seed.sql 생성: 분야 ${data.categories.length}개, 혜택 ${data.benefits.length}개`);
