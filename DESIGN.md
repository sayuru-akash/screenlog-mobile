# Watchlog Mobile Design System

## Design Direction

Watchlog Mobile should feel native, focused, and quiet. The app is a daily-use
tracking tool, not a marketing surface. It should preserve the web app's poster-led
visual identity while using native iOS and Android patterns: large titles, tab bars,
native sheets, platform typography, real touch feedback, haptics, and predictable
navigation.

The design goal is:

```text
Open app -> know what to watch next -> act in one or two taps.
```

## Principles

- Prioritize the next useful action over showing every possible action.
- Use native screens, sheets, and menus instead of dense web-style button rows.
- Keep title artwork visible but never let overlays make posters/backdrops unreadable.
- Show provider logos with labels where space allows; never show anonymous logo-only
  controls when the logo is actionable.
- Use destructive confirmations for removing shows, movies, logs, lists, and account
  data.
- Keep reviews, list editing, and provider selection in modal sheets.
- Use progressive disclosure for cast, crew, trailers, related titles, provider
  details, and comments.
- Avoid feature-explainer copy in the app UI. The interface should be self-evident.

## Navigation

Use Expo Router.

Root:

```text
app/
  (auth)
  (tabs)
  show/[id]
  movie/[id]
  list/[id]
  log/[id]
  user/[username]
```

Tabs:

- Home
- Search
- Watchlist
- Calendar
- Profile

Secondary screens:

- Notifications
- Settings
- Feed
- Lists
- Provider settings
- Review detail

Native presentation:

- Use stack push for title, list, profile, and log detail pages.
- Use bottom sheets for add-to-list, review editor, provider picker, filters, and
  compact action menus.
- Use full-screen modal only for auth, reset password, large trailer playback, and
  destructive flows that need focus.

## Home

Home answers one question: what should I continue now?

Order:

1. Up Next hero.
2. Continue Watching compact rail.
3. Favourites compact rail.
4. Recent friend activity or recent logs.

Do not duplicate "Watching" and "Continue Watching" as two separate sections. If a
title is in progress, it belongs in Continue Watching. Use the show/movie tabs below
the persistent Up Next area only when the user intentionally filters the lower list.

Up Next card content:

- Poster/backdrop.
- Title.
- Episode label or movie runtime/year.
- One provider chip when available.
- Primary action: mark next episode/movie watched.
- Secondary overflow menu for list, review, favourite, remove.

## Search and Discovery

Search should feel immediate:

- Search input at top.
- Segmented control: All, Shows, Movies.
- Provider availability chips below results when known.
- One-tap add to watchlist.
- Tap result opens detail.

Empty state:

- Short text only.
- No large illustration.
- Keep keyboard focus.

## Watchlist

Watchlist is a working library, not a gallery.

Controls:

- Segmented control: Shows, Movies.
- Filter sheet: status, provider, genre, runtime.
- Sort menu: recently updated, title, release/air date.

Rows/cards:

- Poster.
- Title and year.
- Status pill.
- Progress summary.
- Availability chip.
- Overflow menu.

## Title Details

Title pages must be rich but not crowded.

Top area:

- Backdrop with readable overlay.
- Poster.
- Favourite icon in the banner.
- Status/progress primary action.
- Overflow menu.

Sections:

1. Overview and metadata.
2. Provider availability.
3. Progress or watched state.
4. Trailers.
5. Reviews.
6. Lists.
7. Cast and crew.
8. Related titles.

Show detail specifics:

- Default selected season is the season containing the user's next episode.
- Episode rows expand inline.
- If an episode still image exists, show it in the expanded row.
- Mark watched, unwatch, review, and rewatch actions should be accessible without
  date-picking friction.

Movie detail specifics:

- Favourite and watched are independent states.
- Review is a separate sheet action.
- Rewatch has a clear tooltip/accessibility label and haptic feedback.

Trailers:

- Open in a full-screen video modal.
- Prefer embedded playback.
- Fall back to external YouTube if embed fails.
- Do not autoplay with sound.

## Logs, Reviews, and Comments

Review creation:

- Bottom sheet.
- Rating control.
- Spoiler toggle.
- Visibility menu.
- Optional tags and private note in an advanced section.

Comments:

- One-level replies.
- Upvote/downvote with visible counts.
- Spoiler comments are blurred until tapped.
- Mention reply context compactly.

## Lists

List index:

- Compact cards with cover stack, title, count, visibility.
- Keep cards short; avoid tall empty panels.

List detail:

- Header with title, description, tags, visibility.
- Ranked items show compact position chips. Use the current visible order for
  normal display so duplicate stored rank values never appear as repeated prefixes.
- Draggable reordering appears only in edit mode and persists explicit ranks.
- Add item opens search sheet scoped to shows/movies.
- Adding a title should feel instant; show an optimistic disabled row state, then
  trust the server response. Do not show raw database or transaction errors.

## Profile

Profile should be identity plus proof of taste.

Header:

- Avatar/initials.
- Name, username, bio.
- Follow/following counts.
- Follow or edit profile action.

Main content:

- 12-month activity calendar.
- Pinned showcase, max 3.
- Custom lists compact grid.
- Reviews.
- Stats: watched count, watch time, top genres.

Use one activity calendar, not separate duplicated history maps. It should behave
like a contribution graph: one square per day for the last 12 months, darker by
total usage, with tap/press details such as browsed titles, watched movies,
watched episodes, reviews, list updates, and comments. If the user only opened the
app, the square is still active and the detail says `Active on Watchlog`.

## Notifications

Notification types:

- New episode.
- Season premiere.
- Stale watchlist reminder.
- Follow.
- Review comment.
- Comment reply.
- Review/comment reaction.

UX:

- Bell icon with unread badge.
- Notification center list grouped by recency.
- Tap opens the relevant title, review, list, or profile.
- Settings are compact toggles, not a long preference wall.

## Visual System

Typography:

- Use platform default font stack.
- Large native titles only on top-level screens.
- Detail pages use compact headings.
- Do not scale font size with viewport width.

Color:

- Support light, dark, and system.
- Avoid a one-hue app. Keep neutral structure with restrained accent.
- Use provider logos as color accents where useful.
- Ensure all text meets accessible contrast in both themes.

Shape:

- 8px radius for cards and controls unless a native component dictates otherwise.
- Full-bleed title backdrops are allowed.
- Do not nest cards inside cards.

Iconography:

- Use `lucide-react-native` where appropriate.
- Prefer familiar icon-only buttons for favourite, back, close, share, search,
  settings, notification, play, more, check, plus, and trash.
- Every icon-only control needs an accessibility label.

Motion:

- Motion should communicate state changes, not decorate.
- Use short native-feeling transitions.
- Haptics for watched, favourite, save, delete confirm, and rewatch.
- Respect reduced motion.

## Accessibility

- Minimum touch target: 44x44 points.
- Labels for every icon button.
- Proper roles for tabs, buttons, switches, menus, and dialogs.
- Dynamic type support without clipping.
- VoiceOver/TalkBack order must match visual order.
- Spoiler blur must have accessible "Reveal spoiler" action.
- Provider logos must have provider names in accessible text.

## Loading and Empty States

- Use skeleton rows/cards for network loads.
- Keep cached content visible during background refetch.
- Use inline retry for failed sections.
- Never block the whole screen because trailers, cast, or providers failed.
- Empty copy must be short and specific.

## Offline Behavior

- Read screens may show cached data with an offline banner.
- Mutations are disabled offline in the first version.
- Forms preserve local unsent text while the app is foregrounded.
- Do not claim a mutation succeeded before the server confirms it.
