import { describe, expect, it } from "vitest";
import {
  backendRatingToStars,
  formatStarsFromBackend,
  starsToBackendRating,
} from "./rating";

describe("review rating helpers", () => {
  it("maps backend ten-point ratings to five visible stars", () => {
    expect(backendRatingToStars(10)).toBe(5);
    expect(backendRatingToStars(9)).toBe(4.5);
    expect(backendRatingToStars(7)).toBe(3.5);
    expect(backendRatingToStars(null)).toBeNull();
  });

  it("maps selected stars back to the backend rating scale", () => {
    expect(starsToBackendRating(5)).toBe(10);
    expect(starsToBackendRating(3.5)).toBe(7);
    expect(starsToBackendRating(3)).toBe(6);
    expect(starsToBackendRating(0)).toBeNull();
    expect(starsToBackendRating(null)).toBeNull();
  });

  it("formats existing ratings for mobile review cards", () => {
    expect(formatStarsFromBackend(7)).toBe("3.5/5");
    expect(formatStarsFromBackend(8)).toBe("4/5");
    expect(formatStarsFromBackend(null)).toBeNull();
  });
});
