import type { TitleSummary } from "@/types/domain";

export type TitleMembershipAction = {
  state: "add" | "remove";
  label: string;
  selected: boolean;
};

export function getTitleMembershipAction(
  title: Pick<TitleSummary, "type" | "status" | "isWatched">,
): TitleMembershipAction {
  const selected =
    title.type === "movie"
      ? title.status === "PLAN_TO_WATCH"
      : Boolean(title.status);

  if (!selected) {
    return {
      state: "add",
      label: "Add to watchlist",
      selected: false,
    };
  }

  return {
    state: "remove",
    label: "Remove from watchlist",
    selected: true,
  };
}
