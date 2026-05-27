export type SpoilerKind = "review" | "comment" | "reply";

export function shouldHideSpoilerText({
  spoiler,
  revealed,
}: {
  spoiler?: boolean | null;
  revealed: boolean;
}) {
  return Boolean(spoiler && !revealed);
}

export function getSpoilerLabel(kind: SpoilerKind) {
  if (kind === "reply") return "Spoiler reply";
  if (kind === "comment") return "Spoiler comment";
  return "Spoiler review";
}
