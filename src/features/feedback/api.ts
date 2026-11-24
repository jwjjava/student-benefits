"use client";

import { getBrowserSupabase } from "@/lib/supabase/browser";
import { getVisitorId } from "@/features/analytics/visitor";

export type UsageResponse = "used" | "not_yet";
export type ReportKind = "period" | "eligibility" | "link" | "other";

export const REPORT_KINDS: { value: ReportKind; label: string }[] = [
  { value: "period", label: "기간이 달라요" },
  { value: "eligibility", label: "이용 대상·방법이 달라요" },
  { value: "link", label: "링크가 열리지 않아요" },
  { value: "other", label: "기타" },
];

/** 설정이 없을 때(샘플 모드)는 성공으로 보고 콘솔에만 남긴다. */
export async function submitUsageSurvey(input: {
  benefitId: string;
  response: UsageResponse;
  knewBefore: boolean | null;
}): Promise<boolean> {
  const supabase = getBrowserSupabase();
  const row = {
    visitor_id: getVisitorId(),
    benefit_id: input.benefitId,
    response: input.response,
    knew_before: input.response === "used" ? input.knewBefore : null,
  };
  if (!supabase) {
    console.debug("[survey]", row);
    return true;
  }
  const { error } = await supabase.from("survey_responses").insert(row);
  return !error;
}

export async function submitErrorReport(input: {
  benefitId: string;
  kind: ReportKind;
  message: string;
}): Promise<boolean> {
  const supabase = getBrowserSupabase();
  const row = {
    visitor_id: getVisitorId(),
    benefit_id: input.benefitId,
    kind: input.kind,
    message: input.message.trim().slice(0, 1000),
  };
  if (!supabase) {
    console.debug("[report]", row);
    return true;
  }
  const { error } = await supabase.from("error_reports").insert(row);
  return !error;
}
