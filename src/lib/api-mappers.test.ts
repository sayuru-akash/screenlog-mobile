import { describe, expect, it } from "vitest";
import {
  mapCalendarPayload,
  mapListDetailPayload,
  mapLogPayload,
  mapTitleDetailPayload,
  mapUpNextPayload,
  mapWatchlistPayload,
  mobileRouteFromHref,
  tmdbImageUrl,
} from "./api-mappers";

describe("tmdbImageUrl", () => {
  it("turns TMDB paths into usable image URLs and preserves absolute URLs", () => {
    expect(tmdbImageUrl("/poster.jpg")).toBe(
      "https://image.tmdb.org/t/p/w500/poster.jpg",
    );
    expect(tmdbImageUrl("https://cdn.example/poster.jpg")).toBe(
      "https://cdn.example/poster.jpg",
    );
    expect(tmdbImageUrl(null)).toBeNull();
  });
});

describe("mapWatchlistPayload", () => {
  it("normalizes nested web watchlist rows into mobile title summaries", () => {
    expect(
      mapWatchlistPayload({
        shows: [
          {
            showId: "show-1",
            status: "WATCHING",
            isFavourite: true,
            show: {
              id: "show-1",
              title: "Severance",
              firstAirDate: "2022-02-18T00:00:00.000Z",
              posterPath: "/show.jpg",
              backdropPath: "/back.jpg",
            },
            availability: {
              providers: [
                { id: "p1", name: "Apple TV+", logoPath: "/apple.jpg" },
              ],
            },
          },
        ],
        movies: [
          {
            movieId: "movie-1",
            status: "WATCHED",
            movie: {
              id: "movie-1",
              title: "Heat",
              releaseDate: "1995-12-15T00:00:00.000Z",
              posterPath: "/heat.jpg",
            },
          },
        ],
      }),
    ).toMatchObject({
      shows: [
        {
          id: "show-1",
          type: "show",
          title: "Severance",
          year: "2022",
          posterUrl: "https://image.tmdb.org/t/p/w500/show.jpg",
          backdropUrl: "https://image.tmdb.org/t/p/w780/back.jpg",
          status: "WATCHING",
          isFavourite: true,
          provider: { name: "Apple TV+" },
        },
      ],
      movies: [
        {
          id: "movie-1",
          type: "movie",
          title: "Heat",
          year: "1995",
          isWatched: true,
        },
      ],
    });
  });
});

describe("mapUpNextPayload", () => {
  it("maps /up-next primary and remaining items into the home shape", () => {
    expect(
      mapUpNextPayload({
        primary: {
          id: "show-1",
          kind: "show",
          title: "Silo",
          subtitle: "S1E2 · Holston's Pick",
          posterPath: "/silo.jpg",
          progress: { watched: 1, total: 10, nextEpisodeId: "episode-2" },
        },
        items: [
          {
            id: "movie-1",
            kind: "movie",
            title: "Alien",
            subtitle: "1979",
            runtime: 117,
          },
        ],
      }),
    ).toMatchObject({
      upNext: {
        id: "show-1",
        type: "show",
        nextLabel: "S1E2 · Holston's Pick",
        progressLabel: "1/10 watched",
        nextEpisodeId: "episode-2",
      },
      continueWatching: [
        { id: "movie-1", type: "movie", runtimeLabel: "117 min" },
      ],
    });
  });
});

describe("mapCalendarPayload", () => {
  it("flattens grouped backend calendar payloads while keeping episode ids actionable", () => {
    expect(
      mapCalendarPayload({
        groups: {
          today: [
            {
              id: "ep-1",
              showId: "show-1",
              showTitle: "Slow Horses",
              seasonNumber: 2,
              episodeNumber: 3,
              episodeTitle: "Drinking Games",
              airDate: "2026-05-27T00:00:00.000Z",
            },
          ],
          later: [],
        },
      }),
    ).toEqual({
      items: [
        {
          id: "ep-1",
          episodeId: "ep-1",
          showId: "show-1",
          title: "Slow Horses",
          episodeLabel: "S2E3 · Drinking Games",
          airDate: "2026-05-27T00:00:00.000Z",
          group: "today",
          posterUrl: null,
        },
      ],
    });
  });
});

describe("mapTitleDetailPayload", () => {
  it("unwraps show details and marks watched episodes from progress ids", () => {
    expect(
      mapTitleDetailPayload("show", {
        show: {
          id: "show-1",
          title: "Dark",
          firstAirDate: "2017-12-01T00:00:00.000Z",
          seasons: [
            {
              id: "season-1",
              name: null,
              seasonNumber: 1,
              episodes: [
                {
                  id: "ep-1",
                  name: "Secrets",
                  seasonNumber: 1,
                  episodeNumber: 1,
                  stillPath: "/still.jpg",
                },
              ],
            },
          ],
        },
        userShow: { status: "WATCHING", isFavourite: false },
        progress: [{ episodeId: "ep-1" }],
      }),
    ).toMatchObject({
      id: "show-1",
      type: "show",
      year: "2017",
      seasons: [
        {
          name: "Season 1",
          episodes: [
            {
              id: "ep-1",
              title: "Secrets",
              episodeLabel: "S1E1",
              watched: true,
            },
          ],
        },
      ],
    });
  });
});

describe("list and log wrappers", () => {
  it("unwraps list and log payloads from web API envelopes", () => {
    expect(
      mapListDetailPayload({
        list: { id: "list-1", title: "Best", canEdit: true, items: [] },
      }),
    ).toMatchObject({
      id: "list-1",
      title: "Best",
      canEdit: true,
    });
    expect(
      mapLogPayload({
        log: { id: "log-1", review: "Great", title: "Heat", rating: 9 },
      }),
    ).toMatchObject({
      id: "log-1",
      body: "Great",
      rating: 9,
    });
  });
});

describe("mobileRouteFromHref", () => {
  it("allows only supported in-app routes from notification hrefs", () => {
    expect(mobileRouteFromHref("/show/show-1")).toBe("/show/show-1");
    expect(mobileRouteFromHref("/home")).toBe("/(tabs)");
    expect(mobileRouteFromHref("https://evil.example/show/show-1")).toBeNull();
  });
});
