import { z } from "zod";

const isoDate = z.iso.date();
const httpUrl = z.url({ protocol: /^https?$/ });

export type Category = { id: string; name: string; sortOrder: number };

export type Period = {
  startDate: string | null;
  endDate: string | null;
  isAlwaysOpen: boolean;
};

export type Place = { name: string; latitude: number; longitude: number };

export type Benefit = {
  id: string;
  slug: string;
  title: string;
  provider: string;
  categoryId: string;
  cardNote: string;
  eligibility: string[];
  usageMethod: string;
  period: Period;
  applyUrl: string;
  source: { name: string; url: string };
  logoUrl: string | null;
  imageUrl: string | null;
  place: Place | null;
  tags: string[];
  recommendRank: number;
  verifiedAt: string | null;
};

// ── Supabase 행 (snake_case) ──────────────────────────────
export const categoryRowSchema = z
  .object({ id: z.string().min(1), name: z.string().min(1), sort_order: z.number() })
  .transform((r): Category => ({ id: r.id, name: r.name, sortOrder: r.sort_order }));

export const benefitRowSchema = z
  .object({
    id: z.uuid(),
    slug: z.string().min(1),
    title: z.string().min(1),
    provider: z.string().min(1),
    category_id: z.string().min(1),
    card_note: z.string(),
    eligibility: z.array(z.string()),
    usage_method: z.string(),
    start_date: isoDate.nullable(),
    end_date: isoDate.nullable(),
    is_always_open: z.boolean(),
    apply_url: httpUrl,
    source_name: z.string().min(1),
    source_url: httpUrl,
    logo_url: httpUrl.nullable(),
    image_url: httpUrl.nullable(),
    place_name: z.string().nullable(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    tags: z.array(z.string()),
    recommend_rank: z.number(),
    verified_at: isoDate.nullable(),
  })
  .transform(
    (r): Benefit => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      provider: r.provider,
      categoryId: r.category_id,
      cardNote: r.card_note,
      eligibility: r.eligibility,
      usageMethod: r.usage_method,
      period: {
        startDate: r.start_date,
        endDate: r.end_date,
        isAlwaysOpen: r.is_always_open,
      },
      applyUrl: r.apply_url,
      source: { name: r.source_name, url: r.source_url },
      logoUrl: r.logo_url,
      imageUrl: r.image_url,
      place:
        r.latitude !== null && r.longitude !== null
          ? { name: r.place_name ?? r.provider, latitude: r.latitude, longitude: r.longitude }
          : null,
      tags: r.tags,
      recommendRank: r.recommend_rank,
      verifiedAt: r.verified_at,
    }),
  );

// ── 샘플 JSON (camelCase, supabase/sample-benefits.json) ──
export const sampleFileSchema = z.object({
  categories: z.array(
    z.object({ id: z.string(), name: z.string(), sortOrder: z.number() }),
  ),
  benefits: z.array(
    z
      .object({
        id: z.uuid(),
        slug: z.string(),
        title: z.string(),
        provider: z.string(),
        categoryId: z.string(),
        cardNote: z.string().default(""),
        eligibility: z.array(z.string()).default([]),
        usageMethod: z.string().default(""),
        startDate: isoDate.optional(),
        endDate: isoDate.optional(),
        isAlwaysOpen: z.boolean().default(false),
        applyUrl: httpUrl,
        sourceName: z.string(),
        sourceUrl: httpUrl,
        logoUrl: httpUrl.optional(),
        imageUrl: httpUrl.optional(),
        placeName: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        tags: z.array(z.string()).default([]),
        recommendRank: z.number().default(100),
      })
      .transform(
        (b): Benefit => ({
          id: b.id,
          slug: b.slug,
          title: b.title,
          provider: b.provider,
          categoryId: b.categoryId,
          cardNote: b.cardNote,
          eligibility: b.eligibility,
          usageMethod: b.usageMethod,
          period: {
            startDate: b.startDate ?? null,
            endDate: b.endDate ?? null,
            isAlwaysOpen: b.isAlwaysOpen,
          },
          applyUrl: b.applyUrl,
          source: { name: b.sourceName, url: b.sourceUrl },
          logoUrl: b.logoUrl ?? null,
          imageUrl: b.imageUrl ?? null,
          place:
            b.latitude !== undefined && b.longitude !== undefined
              ? { name: b.placeName ?? b.provider, latitude: b.latitude, longitude: b.longitude }
              : null,
          tags: b.tags,
          recommendRank: b.recommendRank,
          verifiedAt: null,
        }),
      ),
  ),
});
