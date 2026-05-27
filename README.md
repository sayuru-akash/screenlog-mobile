# Watchlog Mobile

![Expo](https://img.shields.io/badge/Expo-SDK%2056-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.85-61dafb?logo=react&logoColor=111)
![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react&logoColor=111)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-GPL--3.0-blue)

Watchlog Mobile is the native iOS and Android app for Watchlog. It gives users
the same watch tracking, progress, streaming availability, notifications, reviews,
custom lists, profile, and social features as the web app in a focused native
interface built with Expo and React Native.

## What This App Does

- Track TV shows, movies, and anime.
- Continue from the next unwatched episode or best movie pick.
- Search TMDB-backed content and add titles to the watchlist.
- See streaming availability from selected providers and country.
- Mark episodes, seasons, shows, and movies as watched.
- Favourite shows and movies independently from status.
- View upcoming tracked-show episodes and quiet reminders.
- Create ratings, reviews, tags, private notes, and rewatch logs.
- Comment, reply, and vote on visible reviews.
- Create ranked custom lists with notes and visibility.
- Follow users, view friends' activity, and open public profiles.
- Use the same single 12-month profile activity calendar as web, with one square
  per day and press details for browsed, watched, reviewed, listed, and commented
  activity.
- Manage profile visibility, provider settings, notifications, and appearance.

## Stack

| Layer              | Choice                        | Reason                                                   |
| ------------------ | ----------------------------- | -------------------------------------------------------- |
| App framework      | Expo SDK 56                   | Best React Native framework for iOS and Android shipping |
| Runtime            | React Native 0.85, React 19.2 | Native UI with current architecture and React model      |
| Language           | TypeScript strict             | Safer API contracts and maintainable app code            |
| Navigation         | Expo Router                   | File-based stacks, tabs, modals, and deep links          |
| Auth               | Better Auth Expo              | Reuses Watchlog web auth and SecureStore cookie handling |
| Server state       | TanStack Query                | Cache, retries, invalidation, stale states               |
| Local state        | Zustand                       | Small UI/session preference state only                   |
| Secure storage     | Expo SecureStore              | Session cookie and auth cache                            |
| Images             | Expo Image                    | Poster/backdrop/provider image caching                   |
| Lists              | FlashList                     | Fast large lists for watchlists, comments, logs          |
| Motion             | Reanimated, Gesture Handler   | Native gestures, sheets, and transitions                 |
| Native affordances | Haptics, Blur, Notifications  | Platform feel without heavy UI kits                      |
| Builds             | EAS Build and Submit          | iOS and Android signing, store builds, preview builds    |

## Project Creation

Create the repo from Expo's SDK 56 template:

```sh
npx create-expo-app@latest watchlog-mobile --template default@sdk-56
cd watchlog-mobile
```

Install required runtime dependencies:

```sh
npm install better-auth @better-auth/expo @tanstack/react-query zustand zod
npm install expo-secure-store expo-image expo-notifications expo-haptics expo-blur
npm install react-native-gesture-handler react-native-reanimated @gorhom/bottom-sheet
npm install @shopify/flash-list react-native-mmkv
```

Install development tooling:

```sh
npm install -D eslint prettier eslint-config-prettier
```

Initialize EAS:

```sh
npx eas-cli@latest init
```

## Environment

Create `.env.local`:

```sh
EXPO_PUBLIC_APP_NAME=Watchlog
EXPO_PUBLIC_API_ORIGIN=http://localhost:5173
EXPO_PUBLIC_APP_SCHEME=watchlog
```

Production builds must set `EXPO_PUBLIC_API_ORIGIN` to the deployed Watchlog
Cloudflare Worker origin, keep `EXPO_PUBLIC_APP_SCHEME=watchlog`, and keep
`EXPO_PUBLIC_APP_NAME=Watchlog`.

## Backend Setup Required

The Watchlog backend must have:

- `MOBILE_APP_SCHEME=watchlog`.
- Better Auth Expo server plugin enabled.
- `/api/v1` app API enabled.
- `BETTER_AUTH_URL` and `PUBLIC_APP_URL` set to the deployed origin.
- Cloudflare secrets configured for database, auth, TMDB, email, and cron.
- `/api/v1/shows/:id/extras` and `/api/v1/movies/:id/extras` enabled for
  trailers, cast, crew, related titles, and external links.

## Auth Client

Create `src/lib/auth-client.ts`:

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

All app API calls should include:

```ts
{
	Accept: 'application/json',
	Cookie: authClient.getCookie(),
	'X-Watchlog-Client': 'watchlog-mobile'
}
```

Mutations must also include:

```ts
{ 'Content-Type': 'application/json' }
```

## API

Use Better Auth for auth:

```text
/api/auth/*
```

Use the versioned app API for Watchlog data:

```text
/api/v1/*
```

Read [SPEC.md](SPEC.md) for the full endpoint map and payloads.

## Recommended Source Layout

```text
app/
  (auth)/
    sign-in.tsx
    sign-up.tsx
    forgot-password.tsx
    reset-password.tsx
  (tabs)/
    index.tsx
    search.tsx
    watchlist.tsx
    calendar.tsx
    profile.tsx
  show/[id].tsx
  movie/[id].tsx
  list/[id].tsx
  log/[id].tsx
  user/[username].tsx
src/
  components/
    content/
    feedback/
    forms/
    layout/
    primitives/
  features/
    auth/
    calendar/
    content/
    feed/
    lists/
    notifications/
    profile/
    reviews/
    settings/
    watchlist/
  lib/
    api-client.ts
    auth-client.ts
    query-client.ts
    query-keys.ts
    theme.ts
  stores/
  types/
```

## Development Commands

Start Metro:

```sh
npx expo start --dev-client
```

Run iOS locally:

```sh
npx expo run:ios
```

Run Android locally:

```sh
npx expo run:android
```

Create preview builds:

```sh
eas build --platform all --profile preview
```

Create production builds:

```sh
eas build --platform all --profile production
```

Submit to stores:

```sh
eas submit --platform all
```

## Quality Gate

Before handoff or release:

```sh
npx expo-doctor
npm run lint
npm run typecheck
npm run test
npx expo run:ios --configuration Release --device generic
npx expo run:android --variant release
eas build --platform all --profile preview
```

Manual smoke coverage:

- Sign up, verify email, sign in, sign out.
- Session persists after force quit.
- Search for a movie and show, add both to watchlist.
- Favourite and unfavourite show/movie without changing watched status.
- Mark a show episode watched and undo it.
- Open show and movie detail pages with trailers, cast, reviews, lists.
- Create/edit/delete a review and list.
- Add items to a custom list from search; existing items must not be re-ranked and
  visible ranks must render as `1`, `2`, `3`, not duplicated stored values.
- Comment, reply, upvote, downvote, and mark notifications read.
- Change country, providers, theme, and visibility settings.
- Open profile, confirm the one-grid activity calendar press details, then open a
  followed user's profile and feed.
- Test offline read cache and mutation disabled states.

## Documentation

- [SPEC.md](SPEC.md) - product scope, API, payloads, acceptance criteria.
- [DESIGN.md](DESIGN.md) - mobile UX, navigation, components, motion, accessibility.
- [AGENTS.md](AGENTS.md) - rules for implementation agents.

## License

Watchlog Mobile follows the same GPL-3.0 license as Watchlog.
