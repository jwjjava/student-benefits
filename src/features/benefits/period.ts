import type { Period } from "./schema";

export type PeriodStatus = "always" | "upcoming" | "open" | "closingSoon" | "closed";

/** 마감 임박으로 보는 남은 일수 */
export const CLOSING_SOON_DAYS = 7;

/** 서울 기준 오늘 날짜 (YYYY-MM-DD) */
export function todayInSeoul(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function dayNumber(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

export function getPeriodStatus(
  period: Period,
  today: string,
): { status: PeriodStatus; daysLeft: number | null } {
  if (period.isAlwaysOpen) return { status: "always", daysLeft: null };

  const t = dayNumber(today);
  if (period.startDate && dayNumber(period.startDate) > t) {
    return { status: "upcoming", daysLeft: null };
  }
  if (!period.endDate) return { status: "open", daysLeft: null };

  const daysLeft = dayNumber(period.endDate) - t;
  if (daysLeft < 0) return { status: "closed", daysLeft: null };
  if (daysLeft <= CLOSING_SOON_DAYS) return { status: "closingSoon", daysLeft };
  return { status: "open", daysLeft };
}

/** 2026-09-01 → 2026.09.01 */
export function formatDate(isoDate: string): string {
  return isoDate.replaceAll("-", ".");
}

export function formatPeriod(period: Period): string {
  if (period.isAlwaysOpen) return "상시";
  const { startDate, endDate } = period;
  if (startDate && endDate) return `${formatDate(startDate)} – ${formatDate(endDate)}`;
  if (endDate) return `~ ${formatDate(endDate)}`;
  if (startDate) return `${formatDate(startDate)} ~`;
  return "상시";
}

export function isClosed(status: PeriodStatus): boolean {
  return status === "closed";
}
