import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Check,
  Heart,
  ListPlus,
  MessageCircle,
  Pin,
  Play,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  Switch,
  TextInput,
  View,
} from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { Section } from "@/components/primitives/Section";
import {
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
} from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import { ProviderChip } from "./ProviderChip";
import { TitleRail } from "./TitleRail";
import {
  titleToWatchlistInput,
  useCreateReviewMutation,
  useProgressMutation,
  useWatchlistRemoveMutation,
  useWatchlistUpdateMutation,
} from "@/features/content/actions";
import { useTitleExtrasQuery, useTitleQuery } from "@/features/content/queries";
import {
  useAddListItemMutation,
  useListsQuery,
} from "@/features/lists/queries";
import {
  useProfileQuery,
  useSetProfilePinMutation,
} from "@/features/profile/queries";
import { openExternalUrl } from "@/lib/external-links";
import { useTheme } from "@/lib/theme";
import type {
  CustomListSummary,
  MediaType,
  ProviderSummary,
  ReviewSummary,
  SearchResult,
  Visibility,
} from "@/types/domain";
import {
  formatStarsFromBackend,
  starsToBackendRating,
} from "@/features/reviews/rating";
import {
  StarRatingDisplay,
  StarRatingInput,
} from "@/components/reviews/StarRating";

export function TitleDetailView({ type, id }: { type: MediaType; id: string }) {
  const theme = useTheme();
  const title = useTitleQuery(type, id);
  const extras = useTitleExtrasQuery(type, id);
  const progress = useProgressMutation(type === "show" ? id : undefined);
  const watchlistUpdate = useWatchlistUpdateMutation();
  const remove = useWatchlistRemoveMutation();
  const review = useCreateReviewMutation(type, id);
  const lists = useListsQuery();
  const setPin = useSetProfilePinMutation();
  const profile = useProfileQuery();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [listPickerOpen, setListPickerOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [ratingStars, setRatingStars] = useState<number | null>(null);
  const [spoiler, setSpoiler] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const [pinnedKey, setPinnedKey] = useState<string | null>(null);
  const [revealedReviews, setRevealedReviews] = useState<Set<string>>(
    () => new Set(),
  );
  const data = title.data;
  const currentPinKey = `${type}:${id}`;
  const profileHasPin = Boolean(
    profile.data?.pinned?.some((pin) => pin.type === type && pin.id === id),
  );
  const isPinnedNow = profileHasPin || pinnedKey === currentPinKey;
  const seasons = useMemo(() => data?.seasons ?? [], [data?.seasons]);
  const nextEpisode = seasons
    .flatMap((season) => season.episodes ?? [])
    .find((episode) => !episode.watched);
  const defaultSeason =
    seasons.find((season) =>
      season.episodes?.some((episode) => episode.id === nextEpisode?.id),
    ) ?? seasons[0];
  const selectedSeason =
    seasons.find((season) => season.id === selectedSeasonId) ?? defaultSeason;
  const listItem = useMemo<SearchResult | null>(() => {
    if (!data) return null;
    return {
      id: data.id,
      type: data.type,
      tmdbId: data.tmdbId,
      title: data.title,
      year: data.year,
      overview: data.overview,
      posterUrl: data.posterUrl,
      backdropUrl: data.backdropUrl,
    };
  }, [data]);
  const addedListIds = useMemo(
    () => new Set((data?.lists ?? []).map((list) => list.id)),
    [data?.lists],
  );

  const confirmRemove = () => {
    if (!data) return;
    Alert.alert(
      `Remove ${type === "show" ? "show" : "movie"}?`,
      type === "show"
        ? `${data.title} and episode progress will be removed from your watchlist. Reviews stay on your profile.`
        : `${data.title} will be removed from your watchlist. Reviews stay on your profile.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => remove.mutate({ type, id }),
        },
      ],
    );
  };

  const confirmReset = () => {
    if (!data) return;
    Alert.alert(
      "Reset progress?",
      `Episode progress for ${data.title} will be cleared.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => progress.mutate({ action: "resetShow", showId: id }),
        },
      ],
    );
  };

  const openTrailer = async (url?: string | null) => {
    if (!url) return;
    const opened = await openExternalUrl(url, Linking).catch(() => false);
    if (!opened) {
      Alert.alert(
        "Trailer unavailable",
        "This trailer cannot be opened on this device.",
      );
    }
  };

  const addToWatchlist = () => {
    if (!data) return;
    watchlistUpdate.mutate({
      ...titleToWatchlistInput(data),
      userStatus: type === "show" ? "WATCHING" : "PLAN_TO_WATCH",
    });
  };

  const markMovieWatched = (isRewatch = false) => {
    review.mutate({
      type: "movie",
      movieId: id,
      rating: "",
      review: "",
      spoiler: false,
      rewatch: isRewatch,
      visibility,
      tags: "",
    });
  };

  return (
    <Screen
      back
      title={data?.title || (type === "show" ? "Show" : "Movie")}
      subtitle={data?.year ? String(data.year) : undefined}
    >
      {title.isLoading ? <LoadingState label="Loading title" /> : null}
      {title.isError ? (
        <ErrorState
          message={title.error.message}
          onRetry={() => void title.refetch()}
        />
      ) : null}
      {data ? (
        <>
          <View
            style={{
              borderRadius: theme.radius.md,
              overflow: "hidden",
              backgroundColor: theme.colors.surfaceMuted,
            }}
          >
            <View style={{ minHeight: 260 }}>
              {data.backdropUrl || data.posterUrl ? (
                <Image
                  source={{
                    uri: data.backdropUrl || data.posterUrl || undefined,
                  }}
                  style={{ position: "absolute", inset: 0 }}
                  contentFit="cover"
                />
              ) : null}
              <View
                style={{
                  position: "absolute",
                  top: theme.spacing.md,
                  right: theme.spacing.md,
                  zIndex: 2,
                }}
              >
                <IconButton
                  label={
                    data.isFavourite ? "Remove favourite" : "Add favourite"
                  }
                  onPress={() =>
                    watchlistUpdate.mutate({
                      ...titleToWatchlistInput(data),
                      isFavourite: !data.isFavourite,
                    })
                  }
                >
                  <Heart
                    size={19}
                    color={
                      data.isFavourite ? theme.colors.accent : theme.colors.text
                    }
                    fill={
                      data.isFavourite ? theme.colors.accent : "transparent"
                    }
                  />
                </IconButton>
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-end",
                  padding: theme.spacing.lg,
                  backgroundColor:
                    theme.mode === "dark"
                      ? "rgba(0,0,0,0.42)"
                      : "rgba(255,255,255,0.62)",
                  gap: theme.spacing.md,
                }}
              >
                <View style={{ gap: theme.spacing.sm }}>
                  <AppText variant="heading">{data.title}</AppText>
                  {isPinnedNow ? (
                    <View
                      style={{
                        alignSelf: "flex-start",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: theme.spacing.xs,
                        borderRadius: 999,
                        backgroundColor: theme.colors.accentSoft,
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.xs,
                      }}
                    >
                      <Pin size={14} color={theme.colors.accent} />
                      <AppText
                        variant="caption"
                        style={{
                          color: theme.colors.accent,
                          fontWeight: "700",
                        }}
                      >
                        Pinned to profile
                      </AppText>
                    </View>
                  ) : null}
                </View>
                <AppText muted numberOfLines={4}>
                  {data.overview || "No overview yet."}
                </AppText>
                <View
                  style={{
                    flexDirection: "row",
                    gap: theme.spacing.sm,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <View style={{ flexGrow: 1, flexBasis: 160 }}>
                    <Button
                      loading={progress.isPending || watchlistUpdate.isPending}
                      disabled={
                        type === "show" && Boolean(data.status) && !nextEpisode
                      }
                      icon={
                        !data.status ? (
                          <Plus size={16} color="#FFFFFF" />
                        ) : type === "movie" && data.isWatched ? (
                          <RotateCcw size={16} color="#FFFFFF" />
                        ) : (
                          <Check size={16} color="#FFFFFF" />
                        )
                      }
                      onPress={() => {
                        if (!data.status) {
                          addToWatchlist();
                          return;
                        }
                        if (type === "show" && nextEpisode?.id) {
                          progress.mutate({
                            action: "watch",
                            episodeId: nextEpisode.id,
                          });
                        } else if (type === "movie") {
                          markMovieWatched(Boolean(data.isWatched));
                        }
                      }}
                    >
                      {!data.status
                        ? "Add to watchlist"
                        : type === "show"
                          ? nextEpisode?.episodeLabel
                            ? `Watch ${nextEpisode.episodeLabel}`
                            : "Caught up"
                          : data.isWatched
                            ? "Rewatch"
                            : "Mark Watched"}
                    </Button>
                  </View>
                  <Button
                    variant="secondary"
                    onPress={() => setReviewOpen(true)}
                  >
                    Review
                  </Button>
                </View>
              </View>
            </View>
          </View>
          {(progress.isError ||
            watchlistUpdate.isError ||
            remove.isError ||
            setPin.isError) && (
            <AppText style={{ color: theme.colors.danger }}>
              {progress.error?.message ||
                watchlistUpdate.error?.message ||
                remove.error?.message ||
                setPin.error?.message}
            </AppText>
          )}
          <Section title="Availability">
            {data.providers?.length || data.provider ? (
              <ProviderList
                providers={
                  data.providers?.length ? data.providers : [data.provider!]
                }
                region={data.providerRegion}
              />
            ) : (
              <EmptyState
                title="No provider match yet"
                body="Change your country or selected services in Settings to refine availability."
              />
            )}
          </Section>
          <Section title={type === "show" ? "Manage show" : "More options"}>
            <View style={{ gap: theme.spacing.sm }}>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: theme.spacing.sm,
                }}
              >
                <Button
                  variant="secondary"
                  icon={<ListPlus size={15} color={theme.colors.accent} />}
                  onPress={() => setListPickerOpen(true)}
                >
                  Add to list
                </Button>
                <Button
                  variant={isPinnedNow ? "primary" : "secondary"}
                  icon={
                    isPinnedNow ? (
                      <Check size={15} color="#FFFFFF" />
                    ) : (
                      <Pin size={15} color={theme.colors.accent} />
                    )
                  }
                  loading={setPin.isPending}
                  onPress={() =>
                    setPin.mutate(
                      {
                        type: type === "show" ? "SHOW" : "MOVIE",
                        showId: type === "show" ? id : undefined,
                        movieId: type === "movie" ? id : undefined,
                        rank: 0,
                      },
                      { onSuccess: () => setPinnedKey(currentPinKey) },
                    )
                  }
                >
                  {isPinnedNow ? "Pinned" : "Pin"}
                </Button>
                {type === "movie" && data.status ? (
                  <Button
                    variant="danger"
                    icon={<Trash2 size={15} color={theme.colors.danger} />}
                    loading={remove.isPending}
                    onPress={confirmRemove}
                  >
                    Remove
                  </Button>
                ) : null}
              </View>
              {type === "show" && data.status ? (
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: theme.spacing.sm,
                  }}
                >
                  {data.status === "PAUSED" || data.status === "DROPPED" ? (
                    <Button
                      variant="secondary"
                      onPress={() =>
                        watchlistUpdate.mutate({
                          ...titleToWatchlistInput(data),
                          userStatus: "WATCHING",
                        })
                      }
                    >
                      Resume
                    </Button>
                  ) : null}
                  {data.status === "PLAN_TO_WATCH" ? (
                    <Button
                      variant="secondary"
                      onPress={() =>
                        watchlistUpdate.mutate({
                          ...titleToWatchlistInput(data),
                          userStatus: "WATCHING",
                        })
                      }
                    >
                      Start watching
                    </Button>
                  ) : null}
                  {data.status === "WATCHING" || data.status === "CAUGHT_UP" ? (
                    <Button
                      variant="ghost"
                      onPress={() =>
                        watchlistUpdate.mutate({
                          ...titleToWatchlistInput(data),
                          userStatus: "PAUSED",
                        })
                      }
                    >
                      Pause
                    </Button>
                  ) : null}
                  {data.status !== "DROPPED" ? (
                    <Button
                      variant="danger"
                      onPress={() =>
                        watchlistUpdate.mutate({
                          ...titleToWatchlistInput(data),
                          userStatus: "DROPPED",
                        })
                      }
                    >
                      Drop
                    </Button>
                  ) : null}
                  <Button
                    variant="danger"
                    icon={<Trash2 size={15} color={theme.colors.danger} />}
                    onPress={confirmRemove}
                  >
                    Remove
                  </Button>
                </View>
              ) : null}
            </View>
          </Section>
          {type === "show" ? (
            <Section title="Progress">
              {seasons.length ? (
                <View style={{ gap: theme.spacing.md }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: theme.spacing.sm,
                        paddingRight: theme.spacing.lg,
                      }}
                    >
                      {seasons.map((season, index) => (
                        <Button
                          key={`${season.id}-${index}`}
                          variant={
                            selectedSeason?.id === season.id
                              ? "secondary"
                              : "ghost"
                          }
                          onPress={() => setSelectedSeasonId(season.id)}
                        >
                          {season.name}
                        </Button>
                      ))}
                    </View>
                  </ScrollView>
                  {selectedSeason ? (
                    <View style={{ gap: theme.spacing.md }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: theme.spacing.sm,
                        }}
                      >
                        <AppText variant="label">{selectedSeason.name}</AppText>
                        <Button
                          variant="ghost"
                          loading={progress.isPending}
                          onPress={() =>
                            progress.mutate({
                              action: "markSeason",
                              seasonId: selectedSeason.id,
                            })
                          }
                        >
                          Mark Season
                        </Button>
                      </View>
                      {selectedSeason.episodes?.map((episode, index) => (
                        <View
                          key={`${episode.id}-${index}`}
                          style={{
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            borderRadius: theme.radius.md,
                            backgroundColor: theme.colors.surface,
                            overflow: "hidden",
                          }}
                        >
                          {episode.stillUrl ? (
                            <Image
                              source={{ uri: episode.stillUrl }}
                              style={{ width: "100%", height: 132 }}
                              contentFit="cover"
                            />
                          ) : null}
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              padding: theme.spacing.md,
                              gap: theme.spacing.sm,
                            }}
                          >
                            <View style={{ flex: 1, gap: 3 }}>
                              <AppText variant="label" numberOfLines={2}>
                                {episode.title}
                              </AppText>
                              <AppText muted>
                                {episode.episodeLabel || "Episode"}
                                {episode.runtimeLabel
                                  ? ` · ${episode.runtimeLabel}`
                                  : ""}
                                {episode.airDate
                                  ? ` · ${formatDate(episode.airDate)}`
                                  : ""}
                                {episode.watched ? " · watched" : ""}
                              </AppText>
                              {episode.overview ? (
                                <AppText muted numberOfLines={3}>
                                  {episode.overview}
                                </AppText>
                              ) : null}
                            </View>
                            <Button
                              variant={episode.watched ? "ghost" : "secondary"}
                              loading={progress.isPending}
                              onPress={() => {
                                if (episode.watched) {
                                  progress.mutate({
                                    action: "unwatch",
                                    episodeId: episode.id,
                                  });
                                  return;
                                }
                                review.mutate({
                                  type: "show",
                                  showId: id,
                                  episodeId: episode.id,
                                  rating: "",
                                  review: "",
                                  spoiler: false,
                                  rewatch: false,
                                  visibility,
                                  tags: "",
                                });
                              }}
                            >
                              {episode.watched ? "Undo" : "Mark"}
                            </Button>
                            {episode.watched ? (
                              <IconButton
                                label="Mark rewatch"
                                onPress={() =>
                                  review.mutate({
                                    type: "show",
                                    showId: id,
                                    episodeId: episode.id,
                                    rating: "",
                                    review: "",
                                    spoiler: false,
                                    rewatch: true,
                                    visibility,
                                    tags: "",
                                  })
                                }
                              >
                                <RotateCcw
                                  size={17}
                                  color={theme.colors.text}
                                />
                              </IconButton>
                            ) : null}
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
                    <Button
                      variant="secondary"
                      loading={progress.isPending}
                      onPress={() =>
                        progress.mutate({ action: "markCaughtUp", showId: id })
                      }
                    >
                      Caught Up
                    </Button>
                    <Button
                      variant="danger"
                      loading={progress.isPending}
                      onPress={confirmReset}
                    >
                      Reset
                    </Button>
                  </View>
                </View>
              ) : (
                <EmptyState title="No episode progress" />
              )}
            </Section>
          ) : null}
          <Section title="Trailers">
            {extras.isLoading ? (
              <LoadingState label="Loading trailers" />
            ) : extras.data?.trailers?.length ? (
              <View style={{ gap: theme.spacing.sm }}>
                {extras.data.trailers.slice(0, 3).map((trailer, index) => (
                  <Button
                    key={`${trailer.id}-${index}`}
                    variant="secondary"
                    icon={<Play size={15} color={theme.colors.accent} />}
                    disabled={!trailer.url}
                    onPress={() => void openTrailer(trailer.url)}
                  >
                    {trailer.title}
                  </Button>
                ))}
              </View>
            ) : (
              <EmptyState title="No trailers available" />
            )}
          </Section>
          <Section title="Cast">
            {extras.data?.cast?.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View
                  style={{
                    flexDirection: "row",
                    gap: theme.spacing.md,
                    paddingRight: theme.spacing.lg,
                  }}
                >
                  {extras.data.cast.slice(0, 12).map((person, index) => (
                    <View
                      key={`${person.id}-${person.role ?? "cast"}-${index}`}
                      style={{ width: 112, gap: theme.spacing.sm }}
                    >
                      <View
                        style={{
                          width: 112,
                          height: 112,
                          borderRadius: theme.radius.md,
                          backgroundColor: theme.colors.surfaceMuted,
                          overflow: "hidden",
                        }}
                      >
                        {person.imageUrl ? (
                          <Image
                            source={{ uri: person.imageUrl }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                          />
                        ) : null}
                      </View>
                      <AppText variant="label" numberOfLines={1}>
                        {person.name}
                      </AppText>
                      {person.role ? (
                        <AppText variant="caption" muted numberOfLines={1}>
                          {person.role}
                        </AppText>
                      ) : null}
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <EmptyState title="No cast available" />
            )}
          </Section>
          {extras.data?.crew?.length ? (
            <Section title="Crew">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View
                  style={{
                    flexDirection: "row",
                    gap: theme.spacing.sm,
                    paddingRight: theme.spacing.lg,
                  }}
                >
                  {extras.data.crew.slice(0, 12).map((person, index) => (
                    <View
                      key={`${person.id}-${person.role ?? "crew"}-${index}`}
                      style={{
                        minWidth: 140,
                        maxWidth: 180,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: theme.radius.sm,
                        backgroundColor: theme.colors.surface,
                        padding: theme.spacing.md,
                        gap: 3,
                      }}
                    >
                      <AppText variant="label" numberOfLines={1}>
                        {person.name}
                      </AppText>
                      {person.role ? (
                        <AppText variant="caption" muted numberOfLines={2}>
                          {person.role}
                        </AppText>
                      ) : null}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </Section>
          ) : null}
          {data.lists?.length ? (
            <Section title="Lists">
              <View style={{ gap: theme.spacing.sm }}>
                {data.lists.slice(0, 4).map((list, index) => (
                  <Button
                    key={`${list.id}-${index}`}
                    variant="ghost"
                    onPress={() => router.push(`/list/${list.id}`)}
                  >
                    {list.title}
                  </Button>
                ))}
              </View>
            </Section>
          ) : null}
          <Section title="Reviews">
            {data.reviews?.length ? (
              <View style={{ gap: theme.spacing.md }}>
                {data.reviews.slice(0, 3).map((item, index) => (
                  <ReviewCard
                    key={`${item.id}-${item.createdAt ?? item.watchedAt ?? index}`}
                    review={item}
                    revealed={revealedReviews.has(item.id)}
                    onReveal={() =>
                      setRevealedReviews((current) => {
                        const next = new Set(current);
                        next.add(item.id);
                        return next;
                      })
                    }
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                title="No reviews yet"
                body="Be the first to leave a rating or note."
              />
            )}
          </Section>
          <Modal
            visible={reviewOpen}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setReviewOpen(false)}
          >
            <Screen
              title="Review"
              subtitle={data.title}
              right={
                <IconButton
                  label="Close review"
                  onPress={() => setReviewOpen(false)}
                >
                  <X size={18} color={theme.colors.text} />
                </IconButton>
              }
            >
              <StarRatingInput value={ratingStars} onChange={setRatingStars} />
              <TextInput
                accessibilityLabel="Review"
                placeholder="Write a review"
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                placeholderTextColor={theme.colors.faint}
                style={[
                  inputStyle(theme),
                  { minHeight: 140, textAlignVertical: "top" },
                ]}
              />
              <ToggleRow
                label="Spoiler"
                value={spoiler}
                onValueChange={setSpoiler}
              />
              <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
                {(["PRIVATE", "FOLLOWERS", "PUBLIC"] as const).map((option) => (
                  <Button
                    key={option}
                    variant={visibility === option ? "primary" : "ghost"}
                    onPress={() => setVisibility(option)}
                  >
                    {option === "PRIVATE"
                      ? "Private"
                      : option === "FOLLOWERS"
                        ? "Followers"
                        : "Public"}
                  </Button>
                ))}
              </View>
              {review.isError ? (
                <AppText style={{ color: theme.colors.danger }}>
                  {review.error.message}
                </AppText>
              ) : null}
              <Button
                loading={review.isPending}
                disabled={!ratingStars && !reviewText.trim()}
                onPress={() =>
                  review.mutate(
                    {
                      type,
                      showId: type === "show" ? id : undefined,
                      movieId: type === "movie" ? id : undefined,
                      rating: ratingStars
                        ? String(starsToBackendRating(ratingStars))
                        : "",
                      review: reviewText,
                      spoiler,
                      rewatch: false,
                      visibility,
                      tags: "",
                    },
                    {
                      onSuccess: () => {
                        setReviewOpen(false);
                        setReviewText("");
                        setRatingStars(null);
                        setSpoiler(false);
                      },
                    },
                  )
                }
              >
                Save Review
              </Button>
            </Screen>
          </Modal>
          <Modal
            visible={listPickerOpen}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setListPickerOpen(false)}
          >
            <Screen
              title="Add to list"
              subtitle={data.title}
              right={
                <IconButton
                  label="Close list picker"
                  onPress={() => setListPickerOpen(false)}
                >
                  <X size={18} color={theme.colors.text} />
                </IconButton>
              }
            >
              {lists.isLoading ? <LoadingState label="Loading lists" /> : null}
              {lists.isError ? (
                <ErrorState
                  message={lists.error.message}
                  onRetry={() => void lists.refetch()}
                />
              ) : null}
              {lists.data?.lists?.length && listItem ? (
                <View style={{ gap: theme.spacing.sm }}>
                  {lists.data.lists.map((list, index) => (
                    <ListPickerRow
                      key={`${list.id}-${index}`}
                      list={list}
                      item={listItem}
                      added={addedListIds.has(list.id)}
                      onAdded={() => setListPickerOpen(false)}
                    />
                  ))}
                </View>
              ) : lists.isLoading ? null : (
                <EmptyState title="No lists yet" />
              )}
            </Screen>
          </Modal>
          <Section title="Related">
            <TitleRail
              items={extras.data?.related}
              empty="No related titles."
            />
          </Section>
        </>
      ) : null}
    </Screen>
  );
}

function ReviewCard({
  review,
  revealed,
  onReveal,
}: {
  review: ReviewSummary;
  revealed: boolean;
  onReveal: () => void;
}) {
  const theme = useTheme();
  const ratingLabel = formatStarsFromBackend(review.rating);
  const hidden = Boolean(review.spoiler && !revealed);
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        gap: theme.spacing.sm,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: theme.spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <AppText variant="label" numberOfLines={1}>
            {review.user?.username
              ? `@${review.user.username}`
              : review.user?.name || "Watchlog"}
          </AppText>
          <AppText variant="caption" muted numberOfLines={1}>
            {review.watchedAt ? formatDate(review.watchedAt) : "Review"}
            {review.rewatch ? " · rewatch" : ""}
          </AppText>
        </View>
        {ratingLabel ? <StarRatingDisplay rating={review.rating} /> : null}
      </View>
      {hidden ? (
        <View style={{ gap: theme.spacing.sm }}>
          <AppText muted>Spoiler review.</AppText>
          <Button variant="ghost" onPress={onReveal}>
            Reveal
          </Button>
        </View>
      ) : (
        <AppText muted={!review.body} numberOfLines={5}>
          {review.body || "Rated without a written review."}
        </AppText>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: theme.spacing.sm,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.xs,
          }}
        >
          <MessageCircle size={15} color={theme.colors.muted} />
          <AppText variant="caption" muted>
            {review.commentCount ?? 0}
          </AppText>
        </View>
        <Button
          variant="ghost"
          onPress={() => router.push(`/log/${review.id}`)}
        >
          Open discussion
        </Button>
      </View>
    </View>
  );
}

function ProviderList({
  providers,
  region,
}: {
  providers: ProviderSummary[];
  region?: string | null;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      {region ? (
        <AppText variant="caption" muted>
          Availability in {region}
        </AppText>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: theme.spacing.sm,
        }}
      >
        {providers.slice(0, 8).map((provider, index) => (
          <ProviderChip
            key={`${provider.id ?? provider.name}-${provider.type ?? "provider"}-${index}`}
            provider={provider}
          />
        ))}
      </View>
      {providers.length > 8 ? (
        <AppText variant="caption" muted>
          +{providers.length - 8} more services
        </AppText>
      ) : null}
    </View>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function ListPickerRow({
  list,
  item,
  added,
  onAdded,
}: {
  list: CustomListSummary;
  item: SearchResult;
  added: boolean;
  onAdded: () => void;
}) {
  const theme = useTheme();
  const addItem = useAddListItemMutation(list.id);
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        gap: theme.spacing.sm,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: theme.spacing.md,
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="label" numberOfLines={1}>
            {list.title}
          </AppText>
          <AppText variant="caption" muted>
            {list.count ?? 0} titles
            {list.visibility ? ` · ${list.visibility.toLowerCase()}` : ""}
            {list.ranked ? " · ranked" : ""}
          </AppText>
        </View>
        <Button
          variant={added ? "ghost" : "secondary"}
          loading={addItem.isPending}
          disabled={added}
          onPress={() =>
            addItem.mutate(item, {
              onSuccess: onAdded,
            })
          }
        >
          {added ? "Added" : "Add"}
        </Button>
      </View>
      {list.description ? (
        <AppText muted numberOfLines={2}>
          {list.description}
        </AppText>
      ) : null}
      {addItem.isError ? (
        <AppText style={{ color: theme.colors.danger }}>
          {addItem.error.message}
        </AppText>
      ) : null}
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 44,
      }}
    >
      <AppText>{label}</AppText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: theme.colors.accentSoft }}
        thumbColor={value ? theme.colors.accent : undefined}
      />
    </View>
  );
}

function inputStyle(theme: ReturnType<typeof useTheme>) {
  return {
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    fontSize: 16,
  } as const;
}
