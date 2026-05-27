export function backendRatingToStars(value?: number | null) {
  if (!value || !Number.isFinite(value)) return null;
  return Math.max(1, Math.min(5, Math.round(value / 2)));
}

export function starsToBackendRating(value?: number | null) {
  if (!value || !Number.isFinite(value)) return null;
  return Math.max(1, Math.min(5, Math.round(value))) * 2;
}

export function formatStarsFromBackend(value?: number | null) {
  const stars = backendRatingToStars(value);
  return stars ? `${stars}/5` : null;
}
