import { describe, expect, it, vi } from "vitest";
import { apiRequest, buildApiUrl, createApiHeaders, getPublicConfig } from "./api-client";

describe("getPublicConfig", () => {
  it("normalizes the backend origin and app scheme", () => {
    const config = getPublicConfig({
      EXPO_PUBLIC_APP_NAME: "Watchlog",
      EXPO_PUBLIC_API_ORIGIN: "https://watchlog.tv/",
      EXPO_PUBLIC_APP_SCHEME: "",
    });

    expect(config).toEqual({
      appName: "Watchlog",
      apiOrigin: "https://watchlog.tv",
      appScheme: "watchlog",
    });
  });

  it("rejects missing backend origins", () => {
    expect(() => getPublicConfig({ EXPO_PUBLIC_API_ORIGIN: "" })).toThrow("EXPO_PUBLIC_API_ORIGIN");
  });
});

describe("buildApiUrl", () => {
  it("builds versioned API URLs with encoded query values", () => {
    expect(
      buildApiUrl("/search", {
        q: "One Piece",
        type: "show",
        empty: null,
      }),
    ).toBe("http://localhost:5173/api/v1/search?q=One+Piece&type=show");
  });

  it("never allows non-versioned app data paths", () => {
    expect(() => buildApiUrl("/api/search")).toThrow("/api/v1");
  });
});

describe("createApiHeaders", () => {
  it("adds the required mobile compatibility header and cookie", () => {
    expect(createApiHeaders({ cookie: "watchlog.session=value" })).toMatchObject({
      Accept: "application/json",
      Cookie: "watchlog.session=value",
      "x-watchlog-client": "watchlog-mobile",
    });
  });

  it("adds content-type only for JSON mutations", () => {
    expect(createApiHeaders({ json: true })).toMatchObject({
      "Content-Type": "application/json",
      "x-watchlog-client": "watchlog-mobile",
    });
  });
});

describe("apiRequest", () => {
  it("uses credentials omit and parses JSON responses", async () => {
    const fetcher = vi.fn(() => Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 })));

    await expect(apiRequest("/health", { fetcher })).resolves.toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledWith(
      "http://localhost:5173/api/v1/health",
      expect.objectContaining({ credentials: "omit" }),
    );
  });

  it("throws safe ApiError values for server errors", async () => {
    const fetcher = vi.fn(
      () => Promise.resolve(new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })),
    );

    await expect(apiRequest("/watchlist", { fetcher })).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      userMessage: "Please sign in again.",
    });
  });
});
