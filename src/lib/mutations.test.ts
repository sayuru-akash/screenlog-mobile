import { describe, expect, it } from "vitest";
import { assertOnlineForMutation, getMutationBlockedReason } from "./mutations";

describe("getMutationBlockedReason", () => {
  it("blocks unsafe mutations while offline", () => {
    expect(getMutationBlockedReason({ isConnected: false })).toBe(
      "Connect to the internet before saving changes.",
    );
  });

  it("allows mutations when network state is unknown or connected", () => {
    expect(getMutationBlockedReason({ isConnected: null })).toBeNull();
    expect(getMutationBlockedReason({ isConnected: true })).toBeNull();
  });
});

describe("assertOnlineForMutation", () => {
  it("throws a user-safe error while offline", () => {
    expect(() => assertOnlineForMutation({ isConnected: false })).toThrow(
      "Connect to the internet before saving changes.",
    );
  });
});
