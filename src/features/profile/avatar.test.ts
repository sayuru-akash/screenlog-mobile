import { describe, expect, it } from "vitest";
import { buildProfileAvatarPayload } from "./avatar";
import type { ProfileAvatarCandidate } from "@/types/domain";

describe("buildProfileAvatarPayload", () => {
  it("posts only the selected server candidate image", () => {
    const candidate: ProfileAvatarCandidate = {
      id: "cast-1",
      gender: "female",
      name: "Rebecca Ferguson",
      character: "Juliette Nichols",
      image: "https://image.tmdb.org/t/p/w185/rebecca.jpg",
      sourceTitle: "Silo",
      sourceType: "show",
    };

    expect(buildProfileAvatarPayload(candidate)).toEqual({
      image: "https://image.tmdb.org/t/p/w185/rebecca.jpg",
    });
  });
});
