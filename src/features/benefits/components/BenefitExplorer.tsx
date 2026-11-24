"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { track } from "@/features/analytics/track";
import {
  LocationDeniedDialog,
  LocationPermissionDialog,
} from "@/features/location/LocationDialogs";
import { useNearbyOrigin } from "@/features/location/useNearbyOrigin";
import { excludeClosed, filterByCategory, sortBenefits } from "../search";
import { ALL_CATEGORY, SORT_OPTIONS, type Catalog, type SortKey } from "../types";
import { BenefitGrid } from "./BenefitGrid";
import { CategoryChips } from "./CategoryChips";
import { SortMenu } from "./SortMenu";

type ExplorerParams = { category: string; sort: SortKey };

export const DEFAULT_EXPLORER_PARAMS: ExplorerParams = {
  category: ALL_CATEGORY,
  sort: "recommended",
};

function parseParams(searchParams: URLSearchParams, catalog: Catalog): ExplorerParams {
  const category = searchParams.get("category") ?? ALL_CATEGORY;
  const sort = searchParams.get("sort");
  return {
    category:
      category === ALL_CATEGORY || catalog.categories.some((c) => c.id === category)
        ? category
        : ALL_CATEGORY,
    sort: SORT_OPTIONS.some((o) => o.key === sort) ? (sort as SortKey) : "recommended",
  };
}

/** URL의 ?category=&sort= 를 읽는 버전. Suspense 안에서 쓴다. */
export function BenefitExplorerFromUrl({ catalog }: { catalog: Catalog }) {
  const searchParams = useSearchParams();
  return <BenefitExplorer catalog={catalog} params={parseParams(searchParams, catalog)} />;
}

type BenefitExplorerProps = { catalog: Catalog; params: ExplorerParams };

export function BenefitExplorer({ catalog, params }: BenefitExplorerProps) {
  const router = useRouter();
  const { category, sort } = params;
  const nearby = useNearbyOrigin(sort === "nearby");

  const navigate = (next: ExplorerParams) => {
    const qs = new URLSearchParams();
    if (next.category !== ALL_CATEGORY) qs.set("category", next.category);
    if (next.sort !== "recommended") qs.set("sort", next.sort);
    const query = qs.toString();
    router.replace(query ? `/?${query}` : "/", { scroll: false });
  };

  const visible = useMemo(() => {
    const base = filterByCategory(excludeClosed(catalog.benefits), category);
    return sortBenefits(base, sort, nearby.origin);
  }, [catalog.benefits, category, sort, nearby.origin]);

  const categoryName = catalog.categories.find((c) => c.id === category)?.name;
  const heading =
    sort === "nearby"
      ? nearby.state.kind === "me"
        ? "내 주변 혜택"
        : nearby.state.kind === "campus"
          ? "에리카 주변 혜택"
          : "가까운 혜택"
      : category === ALL_CATEGORY
        ? "전체 혜택"
        : `${categoryName} 혜택`;

  const waitingForOrigin = sort === "nearby" && !nearby.origin;

  return (
    <>
      <CategoryChips
        categories={catalog.categories}
        selected={category}
        onSelect={(id) => {
          track({ name: "category_select", props: { category: id } });
          navigate({ category: id, sort });
        }}
      />

      <div className="mt-6 flex items-center justify-between px-5 pb-4">
        <h2 className="text-[17px] font-bold text-ink" aria-live="polite">
          {heading}
        </h2>
        <SortMenu
          value={sort}
          onChange={(s) => {
            track({ name: "sort_select", props: { sort: s } });
            navigate({ category, sort: s });
          }}
        />
      </div>

      {waitingForOrigin ? (
        <p className="px-5 py-16 text-center text-sm text-sub">
          {nearby.state.kind === "locating" ? "위치를 확인하고 있어요…" : "기준 위치를 정하면 가까운 순으로 보여드려요."}
        </p>
      ) : visible.length === 0 ? (
        <p className="px-5 py-16 text-center text-sm text-sub">
          {sort === "nearby" ? "근처 매장 혜택이 아직 없어요." : "이 분야의 혜택을 준비하고 있어요."}
        </p>
      ) : (
        <BenefitGrid benefits={visible} from="list" showDistance={sort === "nearby"} />
      )}

      <LocationPermissionDialog
        open={sort === "nearby" && nearby.state.kind === "asking"}
        onAllow={nearby.allow}
        onRefuse={nearby.refuse}
      />
      <LocationDeniedDialog
        open={sort === "nearby" && nearby.state.kind === "denied-notice"}
        onConfirm={nearby.acknowledgeDenied}
      />
    </>
  );
}
