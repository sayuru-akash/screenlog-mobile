import { describe, expect, it } from "vitest";
import { getAuthErrorMessage } from "./errors";

describe("getAuthErrorMessage", () => {
  it("shows a helpful message for unverified email accounts", () => {
    expect(getAuthErrorMessage({ code: "EMAIL_NOT_VERIFIED" })).toContain(
      "Email not verified",
    );
  });

  it("maps invalid credentials instead of using the generic fallback", () => {
    expect(
      getAuthErrorMessage({
        code: "INVALID_EMAIL_OR_PASSWORD",
        message: "Invalid email or password",
        status: 401,
      }),
    ).toBe("Invalid email or password.");
  });

  it("falls back to status text or the generic auth message", () => {
    expect(getAuthErrorMessage({ statusText: "Forbidden" })).toBe("Forbidden");
    expect(getAuthErrorMessage({})).toBe("Authentication failed");
  });
});
