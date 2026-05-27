import type { TitleSummary } from "@/types/domain";

export function filterWatchlistTabItems(
  items: readonly TitleSummary[] = [],
  kind: "shows" | "movies",
) {
  if (kind === "shows") {
    return items.filter(
      (item) => item.type === "show" && item.status === "WATCHING",
    );
  }

  return items.filter(
    (item) =>
      item.type === "movie" &&
      item.status !== "WATCHED" &&
      item.status !== "COMPLETED" &&
      !item.isWatched,
  );
}
