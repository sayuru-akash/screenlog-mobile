import type { MediaType } from "@/types/domain";

export type ActionConfirmation = {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
};

export function pinConfirmationCopy(input: {
  title: string;
  type: MediaType | "list";
}): ActionConfirmation {
  return {
    title: "Pin to profile?",
    message: `${input.title} will appear in your profile showcase and may replace an older pinned item.`,
    confirmLabel: "Pin",
  };
}

export function removeWatchlistConfirmationCopy(input: {
  title: string;
  type: MediaType;
  watched?: boolean;
}): ActionConfirmation {
  if (input.type === "movie" && input.watched) {
    return {
      title: "Remove watched status?",
      message: `${input.title} will no longer be marked watched in your watchlist. Existing reviews and history logs stay on your profile.`,
      confirmLabel: "Remove status",
      destructive: true,
    };
  }

  return {
    title: `Remove ${input.type === "show" ? "show" : "movie"}?`,
    message:
      input.type === "show"
        ? `${input.title} and episode progress will be removed from your watchlist. Reviews stay on your profile.`
        : `${input.title} will be removed from your watchlist. Reviews stay on your profile.`,
    confirmLabel: "Remove",
    destructive: true,
  };
}

export function dropShowConfirmationCopy(title: string): ActionConfirmation {
  return {
    title: "Drop this show?",
    message: `${title} will leave Home and active watching sections. Your progress and reviews stay saved until you resume.`,
    confirmLabel: "Drop",
    destructive: true,
  };
}

export function markSeasonConfirmationCopy(
  seasonName: string,
): ActionConfirmation {
  return {
    title: "Mark season watched?",
    message: `All episodes in ${seasonName} will be marked watched. You can undo individual episodes later.`,
    confirmLabel: "Mark watched",
  };
}

export function markCaughtUpConfirmationCopy(
  title: string,
): ActionConfirmation {
  return {
    title: "Mark aired episodes watched?",
    message: `All aired episodes for ${title} will be marked watched. Future episodes will stay unwatched.`,
    confirmLabel: "Mark watched",
  };
}

export function movieLogConfirmationCopy(input: {
  title: string;
  rewatch?: boolean;
}): ActionConfirmation {
  return {
    title: input.rewatch ? "Log rewatch?" : "Mark movie watched?",
    message: input.rewatch
      ? `A new rewatch log for ${input.title} will be added to your history.`
      : `${input.title} will be marked watched and a viewing log will be added to your history.`,
    confirmLabel: input.rewatch ? "Log rewatch" : "Mark watched",
  };
}
