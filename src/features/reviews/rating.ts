export function backendRatingToStars(value?: number | null) {
  if (!value || !Number.isFinite(value)) return null;
  return Math.max(0.5, Math.min(5, value / 2));
}

export function starsToBackendRating(value?: number | null) {
  if (!value || !Number.isFinite(value)) return null;
  return Math.round(Math.max(0.5, Math.min(5, value)) * 2);
}

export function formatStarsFromBackend(value?: number | null) {
  const stars = backendRatingToStars(value);
  return stars
    ? `${Number.isInteger(stars) ? stars : stars.toFixed(1)}/5`
    : null;
}
