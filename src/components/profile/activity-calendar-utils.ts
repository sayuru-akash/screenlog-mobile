import type { ProfileCalendarDay } from "@/types/domain";

export function visibleActivityDays(days: ProfileCalendarDay[] = []) {
  return days.filter((day) => day?.date);
}

export function activityDayLabel(day: ProfileCalendarDay) {
  if (!day.total) return `${day.date}: no activity`;
  const parts = day.parts?.length ? day.parts.join(", ") : "Active on Watchlog";
  return `${day.date}: ${parts}`;
}
