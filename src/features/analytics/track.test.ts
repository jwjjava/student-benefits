import { describe, expect, it } from "vitest";
import { isDuplicateEvent } from "./track";

describe("isDuplicateEvent", () => {
  it("1초 안에 같은 이벤트가 다시 오면 중복", () => {
    expect(isDuplicateEvent("benefit_view|a|/benefits/a", 10_000)).toBe(false);
    expect(isDuplicateEvent("benefit_view|a|/benefits/a", 10_005)).toBe(true);
  });

  it("1초가 지나면 다시 기록", () => {
    expect(isDuplicateEvent("benefit_view|b|/benefits/b", 20_000)).toBe(false);
    expect(isDuplicateEvent("benefit_view|b|/benefits/b", 21_500)).toBe(false);
  });

  it("다른 혜택은 따로 센다", () => {
    expect(isDuplicateEvent("benefit_view|c|/benefits/c", 30_000)).toBe(false);
    expect(isDuplicateEvent("benefit_view|d|/benefits/d", 30_001)).toBe(false);
  });
});
