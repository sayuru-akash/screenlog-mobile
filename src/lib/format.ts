export function compactDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

export function initials(name: string | null | undefined) {
  const parts = (name ?? "W")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return (parts[0]?.[0] ?? "W").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}

export function yearFrom(value: string | number | null | undefined) {
  if (typeof value === "number") return String(value);
  if (!value) return "";
  const match = value.match(/\d{4}/);
  return match?.[0] ?? "";
}
