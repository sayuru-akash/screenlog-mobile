import { ApiError } from "@/lib/api-client";
import type { ProfileAvatarCandidate } from "@/types/domain";
import type { ProfilePayload } from "@/types/domain";

export function buildProfileAvatarPayload(candidate: ProfileAvatarCandidate) {
  return { image: candidate.image };
}

export function canChangeProfileAvatar(profile?: ProfilePayload | null) {
  return (
    profile?.isSelf !== false && Boolean(profile?.avatarCandidates?.length)
  );
}

export function shouldRefetchAvatarCandidates(error: unknown) {
  return error instanceof ApiError && error.status === 400;
}

export function avatarCandidateCopy(candidate: ProfileAvatarCandidate) {
  return {
    title: candidate.name,
    subtitle:
      candidate.character ||
      candidate.sourceTitle ||
      `${candidate.sourceType === "show" ? "Show" : "Movie"} cast`,
    label: "Picture",
  };
}
