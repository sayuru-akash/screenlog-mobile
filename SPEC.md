# Watchlog Mobile Product Specification

## Product Goal

Build a production-quality native mobile app for Watchlog on iOS and Android.
The app must expose the same product surface as the current Watchlog web app:
tracking shows, movies, and anime; progress; Up Next; streaming availability;
notifications; calendar; logs; reviews; comments; custom lists; profiles; follows;
feed; and settings. The mobile app must not invent new features or create a
parallel backend. It consumes the existing Watchlog Cloudflare/SvelteKit backend
through `/api/auth/*` and `/api/v1/*`.

## Best Stack Decision

Use Expo + React Native, not separate Swift/Kotlin apps. This is the best fit for
Watchlog now because one TypeScript codebase can ship high-quality native iOS and
Android experiences while sharing mental models with the existing SvelteKit app.
Expo gives native builds, OTA update capability, dev clients, EAS Build, and enough
native module access for notifications, secure storage, haptics, blur, images, and
deep links without building two teams or two apps.

Target versions as of 2026-05-26:

- Expo SDK 56.
- React Native 0.85.
- React 19.2.
- Expo Router 56.
- TypeScript strict mode.
- React Native New Architecture enabled.

Core libraries:

- `expo-router` for file-based navigation.
- `better-auth` and `@better-auth/expo` for auth.
- `expo-secure-store` for auth cookie/session storage.
- `@tanstack/react-query` for API cache, loading, retries, and invalidation.
- `zustand` only for small app UI/session preference state.
- `expo-image` for posters, backdrops, people images, and provider logos.
- `expo-notifications` for local/push notification plumbing.
- `expo-haptics` for quiet success/destructive/action feedback.
- `react-native-reanimated` and `react-native-gesture-handler` for native motion.
- `@gorhom/bottom-sheet` for native action sheets and compact editors.
- `@shopify/flash-list` for long watchlists, search results, logs, and comments.
- `zod` for API response validation at client boundaries.
- `react-native-mmkv` for non-sensitive cache metadata and view preferences.

## Backend Contract

Backend origin is configured with:

```sh
EXPO_PUBLIC_APP_NAME=Watchlog
EXPO_PUBLIC_API_ORIGIN=http://localhost:5173
EXPO_PUBLIC_APP_SCHEME=watchlog
```

Production must set `EXPO_PUBLIC_API_ORIGIN` to the deployed Cloudflare Worker
origin. The backend must set `MOBILE_APP_SCHEME=watchlog` so Better Auth trusts
the app deep link scheme.

Auth remains canonical at:

```text
/api/auth/*
```

Versioned app data uses:

```text
/api/v1/*
```

`/api/v1` is a thin proxy over existing `/api/*` handlers. It exists to give the
mobile app a stable API namespace without duplicating backend business logic.

## Auth Model

Use Better Auth Expo integration.

Client setup:

```ts
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_ORIGIN,
  plugins: [
    expoClient({
      scheme: process.env.EXPO_PUBLIC_APP_SCHEME ?? "watchlog",
      storagePrefix: "watchlog",
      cookiePrefix: "watchlog",
      storage: SecureStore,
    }),
  ],
});
```

Authenticated app API requests must attach the Better Auth cookie:

```ts
const headers = {
  Accept: "application/json",
  Cookie: authClient.getCookie(),
  "X-Watchlog-Client": "watchlog-mobile",
};
```

For JSON mutations, also send:

```ts
{
	'Content-Type': 'application/json',
	'X-Watchlog-Client': 'watchlog-mobile'
}
```

Use `credentials: 'omit'` for app API requests because the mobile client manually
sets the session cookie header from SecureStore.

## API Rules

All `/api/v1` responses are JSON.

Common status behavior:

- `200` for successful reads and most mutations.
- `201` for created logs, lists, and comments.
- `400` for invalid input.
- `401` when the Better Auth session is absent or expired.
- `403` for private profile/list/log visibility or rejected mutation metadata.
- `404` for missing resources.
- `415` when mutating requests are not `application/json`.
- `429` for route-level rate limits.
- `500` for safe public error messages on server/upstream failures.

Common error shape:

```json
{ "error": "Message" }
```

The mobile client must not depend on internal Prisma field names that are not shown
in screen-specific response examples. Treat unknown fields as optional.

## API Endpoint Map

Auth endpoints:

| Method | Path                                | Purpose                                   |
| ------ | ----------------------------------- | ----------------------------------------- |
| `POST` | `/api/auth/sign-up/email`           | Email/password signup through Better Auth |
| `POST` | `/api/auth/sign-in/email`           | Email/password signin through Better Auth |
| `POST` | `/api/auth/sign-out`                | Sign out current session                  |
| `GET`  | `/api/auth/get-session`             | Read current session                      |
| `POST` | `/api/auth/request-password-reset`  | Request reset email                       |
| `POST` | `/api/auth/reset-password`          | Complete password reset                   |
| `POST` | `/api/auth/send-verification-email` | Resend verification email                 |
| `POST` | `/api/auth/delete-user`             | Request/confirm account deletion          |

App API endpoints:

| Method   | Path                                                     | Purpose                                          |
| -------- | -------------------------------------------------------- | ------------------------------------------------ |
| `GET`    | `/api/v1`                                                | API manifest                                     |
| `GET`    | `/api/v1/health`                                         | Lightweight service health                       |
| `GET`    | `/api/v1/ready`                                          | Database readiness                               |
| `GET`    | `/api/v1/watchlist`                                      | Current user's shows, movies, availability       |
| `POST`   | `/api/v1/watchlist`                                      | Add/update show or movie watchlist item          |
| `DELETE` | `/api/v1/watchlist`                                      | Remove show/movie and dependent progress         |
| `GET`    | `/api/v1/up-next?filter=all`                             | Ranked Up Next recommendation set                |
| `GET`    | `/api/v1/calendar?timezone=Asia/Colombo`                 | Upcoming unwatched episodes for tracked shows    |
| `GET`    | `/api/v1/search?q=Inception`                             | TMDB search with availability enrichment         |
| `POST`   | `/api/v1/lookup`                                         | Ensure/cross-map TMDB title to local ID          |
| `GET`    | `/api/v1/discover`                                       | Discovery rows                                   |
| `GET`    | `/api/v1/shows/:id`                                      | Show detail, seasons, progress, reviews, extras  |
| `GET`    | `/api/v1/shows/:id/extras`                               | Show trailers, cast, crew, related, external IDs |
| `GET`    | `/api/v1/movies/:id`                                     | Movie detail, reviews, extras, lists             |
| `GET`    | `/api/v1/movies/:id/extras`                              | Movie trailers, cast, crew, related, external IDs |
| `GET`    | `/api/v1/progress?showId=:id`                            | Episode progress for a show                      |
| `GET`    | `/api/v1/progress`                                       | Recent watched episode progress across shows     |
| `POST`   | `/api/v1/progress`                                       | Watch/unwatch episode, season, caught-up actions |
| `GET`    | `/api/v1/providers?region=US`                            | Region provider catalog and selections           |
| `POST`   | `/api/v1/providers`                                      | Save selected providers and monetization types   |
| `GET`    | `/api/v1/availability?type=movie&tmdbId=27205&region=US` | Title availability                               |
| `GET`    | `/api/v1/notifications`                                  | In-app notifications and unread count            |
| `PATCH`  | `/api/v1/notifications`                                  | Mark selected/all notifications read             |
| `GET`    | `/api/v1/notification-settings`                          | Notification preferences                         |
| `POST`   | `/api/v1/notification-settings`                          | Save notification preferences                    |
| `GET`    | `/api/v1/settings`                                       | User settings and preferences                    |
| `POST`   | `/api/v1/settings`                                       | Save settings and profile defaults               |
| `GET`    | `/api/v1/profile`                                        | Current user's profile, stats, activity calendar |
| `POST`   | `/api/v1/profile/pins`                                   | Set one of three profile showcase pins           |
| `GET`    | `/api/v1/users/:username`                                | Visibility-aware profile and activity calendar   |
| `POST`   | `/api/v1/users/:username/follow`                         | Follow user                                      |
| `DELETE` | `/api/v1/users/:username/follow`                         | Unfollow user                                    |
| `GET`    | `/api/v1/feed`                                           | Followed users' visible activity                 |
| `GET`    | `/api/v1/logs`                                           | Logs filtered by `showId`, `movieId`, `userId`   |
| `POST`   | `/api/v1/logs`                                           | Create watch log/review                          |
| `GET`    | `/api/v1/logs/:id`                                       | Read visible log/review                          |
| `PATCH`  | `/api/v1/logs/:id`                                       | Update owned log/review                          |
| `DELETE` | `/api/v1/logs/:id`                                       | Delete owned log/review                          |
| `POST`   | `/api/v1/logs/:id/reaction`                              | Upvote/downvote/clear review vote                |
| `GET`    | `/api/v1/logs/:id/comments`                              | List review comments                             |
| `POST`   | `/api/v1/logs/:id/comments`                              | Create comment or one-level reply                |
| `POST`   | `/api/v1/comments/:id/reaction`                          | Upvote/downvote/clear comment vote               |
| `GET`    | `/api/v1/lists`                                          | Current or target user's visible custom lists    |
| `POST`   | `/api/v1/lists`                                          | Create custom list                               |
| `GET`    | `/api/v1/lists/:id`                                      | Read visible custom list                         |
| `PATCH`  | `/api/v1/lists/:id`                                      | Update owned custom list                         |
| `DELETE` | `/api/v1/lists/:id`                                      | Delete owned custom list                         |
| `POST`   | `/api/v1/lists/:id/items`                                | Add show/movie item to custom list               |
| `DELETE` | `/api/v1/lists/:id/items`                                | Remove show/movie item from custom list          |

Server-only endpoint, not for the app:

```text
/api/notifications/generate
```

## Mutation Payloads

Add or update watchlist item:

```json
{
  "type": "movie",
  "tmdbId": 27205,
  "userStatus": "PLAN_TO_WATCH",
  "isFavourite": false
}
```

Remove watchlist item:

```json
{ "type": "movie", "id": "local_movie_id" }
```

Progress action:

```json
{ "action": "watch", "episodeId": "episode_id" }
```

Other progress actions:

```json
{ "action": "unwatch", "episodeId": "episode_id" }
{ "action": "markSeason", "seasonId": "season_id" }
{ "action": "markCaughtUp", "showId": "show_id" }
{ "action": "resetShow", "showId": "show_id" }
```

Create log or review:

```json
{
  "type": "movie",
  "movieId": "local_movie_id",
  "watchedAt": "2026-05-26T00:00:00.000Z",
  "rating": 8,
  "review": "Tight and rewatchable.",
  "spoiler": false,
  "rewatch": false,
  "tags": ["mind-bending"],
  "privateNotes": null,
  "visibility": "PUBLIC"
}
```

Create custom list:

```json
{
  "title": "Rainy night thrillers",
  "description": "Dark, focused picks for a quiet night.",
  "visibility": "PUBLIC",
  "ranked": true,
  "tags": ["thriller"]
}
```

Add list item:

```json
{
  "type": "show",
  "tmdbId": 37854,
  "title": "One Piece",
  "overview": "Optional fallback from search result.",
  "posterPath": "/cMD9Ygz11zjJzAovURpO75Qg7rT.jpg",
  "firstAirDate": "1999-10-20",
  "genres": ["Action & Adventure", "Animation"],
  "note": "Best watched slowly.",
  "rank": 1
}
```

When adding from search, prefer `tmdbId` plus fallback metadata so the backend can
create a lightweight local shell without hydrating every episode. If the item
already exists, the backend must keep its existing rank unless the request
explicitly includes a new `rank`.

Provider settings:

```json
{
  "region": "US",
  "providerIds": ["8", "9", "337"],
  "streamingTypes": ["FLATRATE", "FREE"]
}
```

Settings:

```json
{
  "theme": "system",
  "region": "US",
  "language": "en",
  "timezone": "Asia/Colombo",
  "profileVisibility": "PRIVATE",
  "defaultLogVisibility": "PRIVATE",
  "defaultListVisibility": "PUBLIC",
  "username": "sayuru",
  "bio": "Tracking what I watch."
}
```

Profile activity calendar day:

```json
{
  "date": "2026-05-26",
  "total": 9,
  "parts": [
    "Browsed 2 titles",
    "Watched 1 movie",
    "Watched 3 episodes",
    "Wrote 1 review"
  ],
  "appOpened": true,
  "browsedTitles": 2,
  "loggedTitles": 0,
  "watchedMovies": 1,
  "watchedEpisodes": 3,
  "reviews": 1,
  "lists": 1,
  "comments": 1
}
```

Render it as one contribution-style grid only. A square is active if the user
opened Watchlog or had any counted action that day; intensity uses `total`, and
press/hover details use `parts`.

## Screen Coverage

Required app screens:

- Auth: sign in, sign up, verification notice, forgot password, reset password.
- Onboarding: profile basics, region, selected streaming services.
- Home: Up Next, continue watching, favourites, recent activity.
- Search: show/movie search, availability summary, add to watchlist.
- Discover: discovery rails with title cards.
- Watchlist: shows and movies with filters, provider availability, status.
- Show detail: banner, seasons, episodes, progress, trailers, cast/crew, lists,
  reviews, comments, related titles, providers.
- Movie detail: banner, favourite, watched state, review action, trailers,
  cast/crew, lists, reviews, comments, related titles, providers.
- Calendar: upcoming unwatched episodes for tracked shows.
- Notifications: unread/read list and notification settings.
- Lists: list index, list detail, create/edit, add/remove items.
- Logs/reviews: create/edit review, spoiler handling, comments/replies/reactions.
- Profile: stats, one 12-month activity calendar, pinned items, visible lists,
  reviews, follows.
- Public profile: same profile header, visible content only, follow/unfollow.
- Feed: followed users' visible reviews/list activity.
- Settings: account, country, providers, notifications, appearance, visibility.

## Functional Acceptance Criteria

- Every existing web feature has a mobile route or native surface.
- No mobile-only data model or duplicated backend workflow is introduced.
- Auth persists across app restarts using Better Auth Expo and SecureStore.
- Session expiry returns the user to sign in without losing unsent local form text.
- All mutating API requests use `/api/v1`, JSON, session cookie, and mobile header.
- The mobile header value is exact and lowercase: `x-watchlog-client:
  watchlog-mobile`.
- Search and detail pages degrade gracefully when TMDB, providers, trailers, images,
  or cast data are missing.
- Streaming provider logos use cached remote images and accessible text labels.
- Offline state shows cached read data when available and blocks unsafe mutations.
- Notifications can be disabled and never create noisy repeated prompts.
- iOS and Android both pass smoke tests for auth, search, watchlist, progress,
  list add/remove, review/comment, profile visibility, and settings persistence.
- List item ranks are display positions. The app should not show stale stored rank
  prefixes such as duplicate `2.` values; render the current ordered index unless
  edit/reorder mode is active.

## Non-Goals

- No new product features beyond current Watchlog web capabilities.
- No separate mobile backend.
- No webview wrapper.
- No GraphQL rewrite.
- No unauthenticated public social browsing unless the backend adds it later.
- No complex offline-first conflict resolution in the first native app.
