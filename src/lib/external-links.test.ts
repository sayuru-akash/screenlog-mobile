import { describe, expect, it, vi } from "vitest";
import { openExternalUrl } from "@/lib/external-links";

describe("openExternalUrl", () => {
  it("opens valid web URLs without a canOpenURL preflight gate", async () => {
    const openURL = vi.fn().mockResolvedValue(undefined);
    const canOpenURL = vi.fn().mockResolvedValue(false);

    await expect(
      openExternalUrl("https://www.youtube.com/watch?v=abc_123-XYZ", {
        openURL,
        canOpenURL,
      }),
    ).resolves.toBe(true);

    expect(openURL).toHaveBeenCalledWith(
      "https://www.youtube.com/watch?v=abc_123-XYZ",
    );
    expect(canOpenURL).not.toHaveBeenCalled();
  });

  it("rejects unsupported external URL schemes before opening", async () => {
    const openURL = vi.fn().mockResolvedValue(undefined);

    await expect(
      openExternalUrl("javascript:alert(1)", { openURL }),
    ).resolves.toBe(false);

    expect(openURL).not.toHaveBeenCalled();
  });
});
