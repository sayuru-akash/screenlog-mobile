import { describe, expect, it } from "vitest";
import {
  mapCalendarPayload,
  mapDiscoverPayload,
  mapFeedPayload,
  mapHomePayload,
  mapListDetailPayload,
  mapLogPayload,
  mapProfilePayload,
  mapSettingsPayload,
  mapTitleDetailPayload,
  mapTitleExtrasPayload,
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

describe("mapHomePayload", () => {
  it("derives favourites from the home watchlist while preserving up-next data", () => {
    expect(
      mapHomePayload({
        watchlist: {
          shows: [
            {
              showId: "show-1",
              isFavourite: true,
              status: "WATCHING",
              show: { id: "show-1", title: "Severance" },
            },
            {
              showId: "show-2",
              isFavourite: false,
              show: { id: "show-2", title: "Dark" },
            },
          ],
          movies: [
            {
              movieId: "movie-1",
              isFavourite: true,
              movie: { id: "movie-1", title: "Heat" },
            },
          ],
        },
        upNext: {
          primary: { id: "show-1", kind: "show", title: "Severance" },
          items: [{ id: "movie-1", kind: "movie", title: "Heat" }],
        },
      }),
    ).toMatchObject({
      upNext: { id: "show-1", title: "Severance" },
      continueWatching: [{ id: "movie-1", title: "Heat" }],
      favourites: [
        { id: "show-1", type: "show", title: "Severance" },
        { id: "movie-1", type: "movie", title: "Heat" },
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

describe("mapDiscoverPayload", () => {
  it("converts backend discover buckets into app rows", () => {
    expect(
      mapDiscoverPayload({
        trendingShows: [
          {
            tmdbId: 100,
            title: "Silo",
            posterPath: "/silo.jpg",
            firstAirDate: "2023-05-05",
          },
        ],
        popularMovies: [
          {
            tmdbId: 200,
            title: "Heat",
            posterPath: "/heat.jpg",
            releaseDate: "1995-12-15",
          },
        ],
      }),
    ).toMatchObject({
      rows: [
        {
          id: "trending-shows",
          items: [
            {
              type: "show",
              tmdbId: 100,
              posterPath: "/silo.jpg",
              firstAirDate: "2023-05-05",
            },
          ],
        },
        {
          id: "popular-movies",
          items: [
            {
              type: "movie",
              tmdbId: 200,
              posterPath: "/heat.jpg",
              releaseDate: "1995-12-15",
            },
          ],
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
        list: {
          id: "list-1",
          title: "Best",
          canEdit: true,
          ranked: true,
          tags: ["noir"],
          items: [
            {
              id: "item-1",
              movie: {
                id: "movie-1",
                title: "Heat",
                tmdbId: 949,
                posterPath: "/heat.jpg",
              },
            },
          ],
        },
      }),
    ).toMatchObject({
      id: "list-1",
      title: "Best",
      canEdit: true,
      ranked: true,
      tags: ["noir"],
      covers: ["https://image.tmdb.org/t/p/w500/heat.jpg"],
      items: [
        {
          id: "item-1",
          movieId: "movie-1",
          tmdbId: 949,
          posterUrl: "https://image.tmdb.org/t/p/w500/heat.jpg",
        },
      ],
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

describe("mapProfilePayload", () => {
  it("maps backend pins and keeps stats render-safe for React Native text", () => {
    expect(
      mapProfilePayload({
        user: {
          id: "user-1",
          name: "Ada",
          username: "ada",
          image: "https://cdn.example/ada.jpg",
        },
        stats: {
          showsTracked: 4,
          totalWatchTimeMinutes: 125,
          topGenres: [
            { name: "Drama", count: 3 },
            { name: "Comedy", count: 2 },
          ],
        },
        calendar: [{ date: "2026-05-27", total: 1, parts: ["1 episode"] }],
        following: true,
        isSelf: false,
        logs: [
          {
            id: "log-2",
            watchedAt: "2026-05-26T00:00:00.000Z",
            rating: 8,
            movie: { id: "movie-2", title: "Thief", posterPath: "/thief.jpg" },
          },
        ],
        pins: [
          {
            type: "SHOW",
            showId: "show-1",
            show: { id: "show-1", title: "Silo", posterPath: "/silo.jpg" },
          },
          {
            type: "MOVIE",
            movieId: "movie-1",
            movie: { id: "movie-1", title: "Heat" },
          },
          {
            type: "LIST",
            listId: "list-1",
            list: { id: "list-1", title: "Comfort watches" },
          },
          {
            type: "LOG",
            logId: "log-1",
            log: { id: "log-1", title: "Silo", rating: 9 },
          },
        ],
      }),
    ).toMatchObject({
      user: {
        id: "user-1",
        username: "ada",
        avatarUrl: "https://cdn.example/ada.jpg",
      },
      stats: {
        "Shows tracked": 4,
        "Watch time": "2h 5m",
        "Top genres": "Drama, Comedy",
      },
      calendar: [{ date: "2026-05-27", total: 1 }],
      following: true,
      isSelf: false,
      logs: [
        {
          id: "log-2",
          title: "Thief",
          watchedAt: "2026-05-26T00:00:00.000Z",
          posterUrl: "https://image.tmdb.org/t/p/w500/thief.jpg",
        },
      ],
      pinned: [
        { id: "show-1", type: "show", title: "Silo", href: "/show/show-1" },
        { id: "movie-1", type: "movie", title: "Heat", href: "/movie/movie-1" },
        {
          id: "list-1",
          type: "list",
          title: "Comfort watches",
          href: "/list/list-1",
        },
        { id: "log-1", type: "log", title: "Silo", href: "/log/log-1" },
      ],
    });
  });
});

describe("mapSettingsPayload", () => {
  it("merges user and preference settings into safe mobile scalars", () => {
    expect(
      mapSettingsPayload({
        user: {
          username: "ada",
          bio: null,
          profileVisibility: "PUBLIC",
        },
        preferences: {
          region: 42,
          timezone: "Europe/London",
          theme: "dark",
          defaultLogVisibility: "FOLLOWERS",
          defaultListVisibility: "PRIVATE",
        },
      }),
    ).toEqual({
      preferences: {
        username: "ada",
        bio: "",
        profileVisibility: "PUBLIC",
        region: "US",
        language: null,
        timezone: "Europe/London",
        theme: "dark",
        defaultLogVisibility: "FOLLOWERS",
        defaultListVisibility: "PRIVATE",
      },
    });
  });
});

describe("mapTitleExtrasPayload", () => {
  it("builds playable trailer URLs from YouTube keys and protocol-relative URLs", () => {
    expect(
      mapTitleExtrasPayload({
        trailers: [
          { id: "a", name: "Official trailer", key: "abc_123-XYZ" },
          { id: "b", name: "Teaser", url: "//www.youtube.com/watch?v=def456" },
          { id: "c", name: "Bad", url: "javascript:alert(1)" },
        ],
      }).trailers,
    ).toEqual([
      {
        id: "a",
        title: "Official trailer",
        url: "https://www.youtube.com/watch?v=abc_123-XYZ",
      },
      {
        id: "b",
        title: "Teaser",
        url: "https://www.youtube.com/watch?v=def456",
      },
      { id: "c", title: "Bad", url: null },
    ]);
  });
});

describe("mapFeedPayload", () => {
  it("normalizes raw feed logs and lists into navigable activity rows", () => {
    expect(
      mapFeedPayload({
        items: [
          {
            type: "log",
            log: {
              id: "log-1",
              review: "Great",
              user: { name: "Ada", username: "ada", image: "/ada.jpg" },
              show: { title: "Silo" },
            },
          },
          {
            type: "list",
            list: {
              id: "list-1",
              title: "Weekend",
              user: { username: "grace" },
            },
          },
        ],
      }),
    ).toMatchObject({
      items: [
        {
          id: "log-1",
          text: "Ada reviewed Silo",
          href: "/log/log-1",
          user: { username: "ada" },
        },
        {
          id: "list-1",
          text: "grace updated Weekend",
          href: "/list/list-1",
        },
      ],
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
