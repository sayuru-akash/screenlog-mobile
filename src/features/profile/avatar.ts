import type { ProfileAvatarCandidate } from "@/types/domain";

export function buildProfileAvatarPayload(candidate: ProfileAvatarCandidate) {
  return { image: candidate.image };
}
