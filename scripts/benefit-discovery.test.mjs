import { afterEach, describe, expect, it, vi } from "vitest";
import { discoverBenefits, parseDiscoveryResponse, reviewedBenefitsSql } from "./benefit-discovery.mjs";

const date = "2026-11-26";
const options = { topic: "대학생 혜택", domains: ["provider.example"], limit: 5, date };
const sample = {
  slug: "provider-student-discount",
  title: "학생 할인",
  provider: "Provider",
  category_id: "it",
  card_note: "학생 인증",
  eligibility: ["대학생"],
  usage_method: "재학 증명서를 제출하세요.",
  start_date: null,
  end_date: null,
  is_always_open: true,
  apply_url: "https://provider.example/apply",
  source_name: "Provider 학생 할인 안내",
  source_url: "https://provider.example/students",
  evidence: "공식 안내에 학생 자격과 신청 절차가 있습니다.",
};

function responseFor(candidates) {
  return {
    status: "completed",
    output: [
      { type: "web_search_call", status: "completed", action: { sources: [{ url: sample.source_url }] } },
      {
        type: "message",
        content: [{
          type: "output_text",
          text: JSON.stringify({ candidates }),
          annotations: [{ type: "url_citation", url: sample.apply_url }],
        }],
      },
    ],
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("혜택 후보 수집", () => {
  it("공식 출처 두 링크가 확인된 현재 혜택만 검수 전 상태로 담는다", () => {
    const result = parseDiscoveryResponse(responseFor([
      sample,
      { ...sample, slug: "duplicate", title: "학생   할인" },
      { ...sample, slug: "unverified", apply_url: "https://provider.example/unknown" },
      { ...sample, slug: "invalid-url", apply_url: "not a url" },
      { ...sample, slug: "expired", is_always_open: false, end_date: "2026-11-25" },
    ]), options);
    expect(result.candidates).toEqual([{ ...sample, reviewed: false }]);
  });

  it("공식 도메인을 벗어난 후보와 실제로 검색하지 않은 응답을 사용하지 않는다", () => {
    const differentDomains = { ...options, domains: ["other.example"] };
    expect(parseDiscoveryResponse(responseFor([sample]), differentDomains).candidates).toEqual([]);

    const response = responseFor([sample]);
    response.output.shift();
    expect(() => parseDiscoveryResponse(response, options)).toThrow("검색 결과");
  });

  it("검색 도메인과 구조화 응답 형식을 Responses API에 전달한다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(responseFor([sample]))));
    vi.stubGlobal("fetch", fetchMock);
    const result = await discoverBenefits({ ...options, apiKey: "test-key", model: "gpt-5-mini" });
    const [endpoint, request] = fetchMock.mock.calls[0];
    const body = JSON.parse(request.body);
    expect(endpoint).toBe("https://api.openai.com/v1/responses");
    expect(body.tools).toEqual([{ type: "web_search", filters: { allowed_domains: options.domains } }]);
    expect(body.text.format.schema.additionalProperties).toBe(false);
    expect(body.text.format.strict).toBe(true);
    expect(result.candidates).toHaveLength(1);
  });
});

describe("검수 완료 혜택 SQL", () => {
  it("승인한 후보만 포함하고 문자열을 인용하며 비공개로 등록한다", () => {
    const document = parseDiscoveryResponse(responseFor([sample, { ...sample, slug: "pending", title: "미검수 혜택" }]), options);
    expect(() => reviewedBenefitsSql(document, date)).toThrow("검수 완료");
    document.candidates[0].reviewed = true;
    document.candidates[0].provider = "Student's Lab";
    const { count, sql } = reviewedBenefitsSql(document, date);
    expect(count).toBe(1);
    expect(sql).toContain("E'Student''s Lab'");
    expect(sql).toContain(", false, null");
    expect(sql).toContain("on conflict (slug) do nothing");
    expect(sql).not.toContain("미검수 혜택");
  });

  it("검수 중 혜택이 만료되면 SQL을 만들지 않는다", () => {
    const timed = { ...sample, is_always_open: false, end_date: date };
    const document = parseDiscoveryResponse(responseFor([timed]), options);
    document.candidates[0].reviewed = true;
    expect(() => reviewedBenefitsSql(document, "2026-11-27")).toThrow("기간");
  });
});
