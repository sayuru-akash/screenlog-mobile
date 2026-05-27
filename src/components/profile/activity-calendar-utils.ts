import type { ProfileCalendarDay } from "@/types/domain";

export function visibleActivityDays(days: ProfileCalendarDay[] = []) {
  return days.filter((day) => day?.date);
}

export function activityDayLabel(day: ProfileCalendarDay) {
  const date = formatActivityDate(day.date);
  if (!day.total) return `${date}: no activity`;
  const parts = day.parts?.length ? day.parts.join(", ") : "Active on Watchlog";
  return `${date}: ${parts}`;
}

export type ActivityCalendarDay = ProfileCalendarDay & {
  weekday: number;
};

export type ActivityCalendarWeek = {
  key: string;
  days: Array<ActivityCalendarDay | null>;
};

export type ActivityMonthLabel = {
  key: string;
  label: string;
  weekIndex: number;
};

export function buildGithubActivityCalendar(
  days: ProfileCalendarDay[] = [],
  now: Date = new Date(),
) {
  const byDate = new Map(
    visibleActivityDays(days).map((day) => [day.date, day] as const),
  );
  const today = startOfLocalDay(now);
  const start = addDays(today, -364);
  const range: ActivityCalendarDay[] = [];

  for (let index = 0; index < 365; index += 1) {
    const date = addDays(start, index);
    const key = isoDate(date);
    const supplied = byDate.get(key);
    range.push({
      date: key,
      total: supplied?.total ?? 0,
      parts: supplied?.parts,
      appOpened: supplied?.appOpened,
      weekday: date.getDay(),
    });
  }

  const leadingEmptyDays = start.getDay();
  const weeks = buildWeeks(range);
  return {
    days: range,
    weeks,
    monthLabels: buildMonthLabels(range, leadingEmptyDays),
  };
}

function buildWeeks(days: ActivityCalendarDay[]) {
  const weeks: ActivityCalendarWeek[] = [];
  let current: Array<ActivityCalendarDay | null> = [];

  days.forEach((day, index) => {
    if (index === 0) {
      current = Array.from({ length: day.weekday }, () => null);
    }
    current.push(day);
    if (current.length === 7) {
      weeks.push({
        key: current.find(Boolean)?.date ?? `week-${weeks.length}`,
        days: current,
      });
      current = [];
    }
  });

  if (current.length) {
    while (current.length < 7) current.push(null);
    weeks.push({
      key: current.find(Boolean)?.date ?? `week-${weeks.length}`,
      days: current,
    });
  }

  return weeks;
}

function buildMonthLabels(
  days: ActivityCalendarDay[],
  leadingEmptyDays: number,
) {
  const labels: ActivityMonthLabel[] = [];

  days.forEach((day, index) => {
    const isFirstVisibleDay = index === 0;
    const isFirstDayOfMonth = day.date.endsWith("-01");
    if (isFirstVisibleDay || isFirstDayOfMonth) {
      const weekIndex = Math.floor((index + leadingEmptyDays) / 7);
      labels.push({
        key: `${day.date}-${weekIndex}`,
        label: monthShortName(day.date),
        weekIndex,
      });
    }
  });

  return labels;
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthShortName(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
  });
}

function formatActivityDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
