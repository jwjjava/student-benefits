import { describe, expect, it } from "vitest";
import { formatPeriod, getPeriodStatus, todayInSeoul } from "./period";

const period = (startDate: string | null, endDate: string | null, isAlwaysOpen = false) => ({
  startDate,
  endDate,
  isAlwaysOpen,
});

describe("getPeriodStatus", () => {
  it("상시 혜택은 always", () => {
    expect(getPeriodStatus(period(null, null, true), "2026-11-24")).toEqual({
      status: "always",
      daysLeft: null,
    });
  });

  it("시작 전이면 upcoming", () => {
    expect(getPeriodStatus(period("2026-12-01", "2026-12-31"), "2026-11-24").status).toBe("upcoming");
  });

  it("마감 7일 이내면 closingSoon과 남은 일수", () => {
    expect(getPeriodStatus(period("2026-11-01", "2026-11-30"), "2026-11-24")).toEqual({
      status: "closingSoon",
      daysLeft: 6,
    });
  });

  it("마감일 당일은 0일 남음", () => {
    expect(getPeriodStatus(period(null, "2026-11-24"), "2026-11-24")).toEqual({
      status: "closingSoon",
      daysLeft: 0,
    });
  });

  it("마감일이 지나면 closed", () => {
    expect(getPeriodStatus(period("2026-09-01", "2026-11-15"), "2026-11-24").status).toBe("closed");
  });

  it("마감일이 멀면 open", () => {
    expect(getPeriodStatus(period("2026-09-01", "2026-12-18"), "2026-11-24")).toEqual({
      status: "open",
      daysLeft: 24,
    });
  });
});

describe("todayInSeoul", () => {
  it("UTC 저녁은 서울 기준 다음 날", () => {
    expect(todayInSeoul(new Date("2026-11-24T16:00:00Z"))).toBe("2026-11-25");
  });
});

describe("formatPeriod", () => {
  it("시작·종료일", () => {
    expect(formatPeriod(period("2026-09-01", "2026-12-18"))).toBe("2026.09.01 – 2026.12.18");
  });
  it("상시", () => {
    expect(formatPeriod(period(null, null, true))).toBe("상시");
  });
  it("종료일만", () => {
    expect(formatPeriod(period(null, "2026-12-18"))).toBe("~ 2026.12.18");
  });
});
