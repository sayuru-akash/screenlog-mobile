import type { TitleSummary } from "@/types/domain";

export type TitleMembershipAction = {
  state: "add" | "remove" | "removeWatched";
  label: string;
  selected: boolean;
};

export function getTitleMembershipAction(
  title: Pick<TitleSummary, "type" | "status" | "isWatched">,
): TitleMembershipAction {
  const selected = Boolean(title.status);

  if (!selected) {
    return {
      state: "add",
      label: "Add to watchlist",
      selected: false,
    };
  }

  if (title.type === "movie" && title.isWatched) {
    return {
      state: "removeWatched",
      label: "Remove watched status",
      selected: true,
    };
  }

  return {
    state: "remove",
    label: "Remove from watchlist",
    selected: true,
  };
}
