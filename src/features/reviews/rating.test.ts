import { describe, expect, it } from "vitest";
import {
  backendRatingToStars,
  formatStarsFromBackend,
  starsToBackendRating,
} from "./rating";

describe("review rating helpers", () => {
  it("maps backend ten-point ratings to five discrete visible stars", () => {
    expect(backendRatingToStars(10)).toBe(5);
    expect(backendRatingToStars(9)).toBe(5);
    expect(backendRatingToStars(7)).toBe(4);
    expect(backendRatingToStars(null)).toBeNull();
  });

  it("maps selected stars back to the supported backend rating values", () => {
    expect(starsToBackendRating(1)).toBe(2);
    expect(starsToBackendRating(2)).toBe(4);
    expect(starsToBackendRating(3)).toBe(6);
    expect(starsToBackendRating(4)).toBe(8);
    expect(starsToBackendRating(5)).toBe(10);
    expect(starsToBackendRating(0)).toBeNull();
    expect(starsToBackendRating(null)).toBeNull();
  });

  it("formats existing ratings for mobile review cards", () => {
    expect(formatStarsFromBackend(7)).toBe("4/5");
    expect(formatStarsFromBackend(8)).toBe("4/5");
    expect(formatStarsFromBackend(null)).toBeNull();
  });
});
