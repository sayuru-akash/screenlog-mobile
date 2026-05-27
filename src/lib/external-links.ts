type LinkOpener = {
  openURL: (url: string) => Promise<unknown>;
  canOpenURL?: (url: string) => Promise<boolean>;
};

export function normalizedExternalUrl(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;

  try {
    const url = new URL(withProtocol);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export async function openExternalUrl(
  value: string | null | undefined,
  opener: LinkOpener,
) {
  const url = normalizedExternalUrl(value);
  if (!url) return false;
  await opener.openURL(url);
  return true;
}
