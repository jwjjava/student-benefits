"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { track } from "@/features/analytics/track";
import { pushRecent, recentSearchStore, RECENT_SEARCH_LIMIT } from "@/features/recent/storage";
import { searchBenefits } from "../search";
import type { Catalog } from "../types";
import { BenefitGrid } from "./BenefitGrid";

/** 인기 검색어. 검색 기록이 충분히 쌓이면 events 집계로 바꾼다. */
export const POPULAR_KEYWORDS = ["구독 할인", "음식점 할인", "IT 학생 혜택"];

export function SearchViewFromUrl({ catalog }: { catalog: Catalog }) {
  const searchParams = useSearchParams();
  return <SearchView catalog={catalog} initialQuery={searchParams.get("q") ?? ""} />;
}

type SearchViewProps = { catalog: Catalog; initialQuery: string };

export function SearchView({ catalog, initialQuery }: SearchViewProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const recentSearches = recentSearchStore.useValue();

  const results = useMemo(() => searchBenefits(catalog.benefits, query), [catalog.benefits, query]);
  const hasQuery = query.trim().length > 0;

  const syncUrl = (q: string) => {
    router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search", { scroll: false });
  };

  const commit = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    recentSearchStore.set((prev) => pushRecent(prev, trimmed, RECENT_SEARCH_LIMIT));
    track({
      name: "search",
      props: { query: trimmed.slice(0, 50), resultCount: searchBenefits(catalog.benefits, trimmed).length },
    });
  };

  const runKeyword = (keyword: string) => {
    setQuery(keyword);
    syncUrl(keyword);
    commit(keyword);
  };

  return (
    <>
      <form
        role="search"
        className="px-5"
        onSubmit={(e) => {
          e.preventDefault();
          commit(query);
          inputRef.current?.blur();
        }}
      >
        <label className="flex h-[42px] items-center gap-2.5 rounded-xl bg-field px-3.5">
          <SearchIcon size={20} className="shrink-0 text-sub" />
          <span className="sr-only">혜택 검색</span>
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            autoFocus={!initialQuery}
            value={query}
            maxLength={50}
            placeholder="혜택 이름을 입력하세요"
            onChange={(e) => {
              setQuery(e.target.value);
              syncUrl(e.target.value.trim());
            }}
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-sub [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              aria-label="검색어 지우기"
              onClick={() => {
                setQuery("");
                syncUrl("");
                inputRef.current?.focus();
              }}
              className="text-sub"
            >
              <CloseIcon size={16} />
            </button>
          ) : null}
        </label>
      </form>

      {!hasQuery ? (
        <div className="px-5 pt-8">
          <section aria-labelledby="recent-searches">
            <div className="flex items-center justify-between">
              <h2 id="recent-searches" className="text-base font-bold text-ink">
                최근 검색어
              </h2>
              {recentSearches.length > 0 ? (
                <button
                  type="button"
                  onClick={() => recentSearchStore.set([])}
                  className="text-[13px] text-sub"
                >
                  전체 삭제
                </button>
              ) : null}
            </div>
            {recentSearches.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <li key={term} className="flex h-[30px] items-center rounded-full border border-[#C9CDD8] bg-surface pl-3.5 pr-2">
                    <button type="button" onClick={() => runKeyword(term)} className="text-xs text-ink-list">
                      {term}
                    </button>
                    <button
                      type="button"
                      aria-label={`${term} 검색어 삭제`}
                      onClick={() => recentSearchStore.set((prev) => prev.filter((t) => t !== term))}
                      className="ml-2 text-sub"
                    >
                      <CloseIcon size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[13px] text-sub">최근 검색한 기록이 없어요.</p>
            )}
          </section>

          <hr className="my-8 border-field" />

          <section aria-labelledby="popular-searches">
            <h2 id="popular-searches" className="text-base font-bold text-ink">
              인기 검색어
            </h2>
            <ol className="mt-4 space-y-1">
              {POPULAR_KEYWORDS.map((keyword, i) => (
                <li key={keyword}>
                  <button
                    type="button"
                    onClick={() => runKeyword(keyword)}
                    className="flex w-full items-center gap-5 py-1.5 text-left text-[15px] text-ink"
                  >
                    <span className="w-4 text-accent">{String(i + 1).padStart(2, "0")}</span>
                    {keyword}
                  </button>
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center px-6 pt-40 text-center">
          <SearchIcon size={52} strokeWidth={2.4} className="text-brand/65" />
          <h2 className="mt-4 text-xl font-bold text-ink">검색 결과가 없어요</h2>
          <p className="mt-2 text-[13px] text-sub">다른 혜택 이름이나 브랜드명으로 검색해 보세요.</p>
        </div>
      ) : (
        <>
          <h2 className="px-5 pb-4 pt-6 text-base font-bold text-ink" aria-live="polite">
            검색 결과 {results.length}개
          </h2>
          <BenefitGrid benefits={results} from="search" />
        </>
      )}
    </>
  );
}
