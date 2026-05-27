import { describe, expect, it } from "vitest";
import {
  getSpoilerLabel,
  shouldHideSpoilerText,
} from "@/components/reviews/spoiler-display";

describe("spoiler display helpers", () => {
  it("hides spoiler reviews, comments, and replies until revealed", () => {
    expect(shouldHideSpoilerText({ spoiler: true, revealed: false })).toBe(
      true,
    );
    expect(getSpoilerLabel("review")).toBe("Spoiler review");
    expect(getSpoilerLabel("comment")).toBe("Spoiler comment");
    expect(getSpoilerLabel("reply")).toBe("Spoiler reply");
  });

  it("renders non-spoilers and revealed spoilers normally", () => {
    expect(shouldHideSpoilerText({ spoiler: false, revealed: false })).toBe(
      false,
    );
    expect(shouldHideSpoilerText({ spoiler: true, revealed: true })).toBe(
      false,
    );
  });
});
