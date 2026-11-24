/** 측정 이벤트 정의. supabase/migrations의 events.name 체크 목록과 같아야 한다. */
export type SourceSurface = "list" | "detail" | "saved" | "recent" | "search";

export type AnalyticsEvent =
  | { name: "page_view"; props?: Record<string, never> }
  | { name: "benefit_view"; benefitId: string }
  | { name: "search"; props: { query: string; resultCount: number } }
  | { name: "category_select"; props: { category: string } }
  | { name: "sort_select"; props: { sort: string } }
  | { name: "benefit_save"; benefitId: string; props: { from: SourceSurface } }
  | { name: "benefit_unsave"; benefitId: string; props: { from: SourceSurface } }
  | { name: "outbound_click"; benefitId: string; props: { from: SourceSurface } }
  | { name: "survey_open"; benefitId: string }
  | { name: "survey_submit"; benefitId: string; props: { response: string } }
  | { name: "survey_dismiss"; benefitId: string }
  | { name: "report_submit"; benefitId: string; props: { kind: string } };

export type AnalyticsEventName = AnalyticsEvent["name"];
