import { describe, expect, it } from "vitest";
import {
  buildProfileAvatarPayload,
  avatarCandidateCopy,
  canChangeProfileAvatar,
  shouldRefetchAvatarCandidates,
} from "./avatar";
import { ApiError } from "@/lib/api-client";
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

  it("allows changing only an own profile with server-provided candidates", () => {
    expect(
      canChangeProfileAvatar({
        isSelf: true,
        avatarCandidates: [
          {
            id: "cast-1",
            gender: "female",
            name: "Rebecca Ferguson",
            image: "https://image.tmdb.org/t/p/w185/rebecca.jpg",
            sourceType: "show",
          },
        ],
      }),
    ).toBe(true);
    expect(canChangeProfileAvatar({ isSelf: true, avatarCandidates: [] })).toBe(
      false,
    );
    expect(
      canChangeProfileAvatar({
        isSelf: false,
        avatarCandidates: [
          {
            id: "cast-1",
            gender: "female",
            name: "Rebecca Ferguson",
            image: "https://image.tmdb.org/t/p/w185/rebecca.jpg",
            sourceType: "show",
          },
        ],
      }),
    ).toBe(false);
  });

  it("refreshes avatar candidates after stale-candidate backend rejection", () => {
    expect(
      shouldRefetchAvatarCandidates(new ApiError(400, "Invalid avatar")),
    ).toBe(true);
    expect(
      shouldRefetchAvatarCandidates(new ApiError(500, "Server error")),
    ).toBe(false);
  });

  it("describes avatar choices as picture options, not user gender", () => {
    expect(
      avatarCandidateCopy({
        id: "cast-1",
        gender: "female",
        name: "Rebecca Ferguson",
        character: "Juliette Nichols",
        image: "https://image.tmdb.org/t/p/w185/rebecca.jpg",
        sourceTitle: "Silo",
        sourceType: "show",
      }),
    ).toEqual({
      title: "Rebecca Ferguson",
      subtitle: "Juliette Nichols",
      label: "Picture",
    });
  });
});
