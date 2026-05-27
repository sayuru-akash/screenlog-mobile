import { Alert, Linking, View } from "react-native";
import { useState } from "react";
import { Modal, Switch, TextInput } from "react-native";
import { Image } from "expo-image";
import { Heart, Pin, Play, Trash2, X } from "lucide-react-native";
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
import { TitleRail } from "./TitleRail";
import {
  titleToWatchlistInput,
  useCreateReviewMutation,
  useProgressMutation,
  useWatchlistRemoveMutation,
  useWatchlistUpdateMutation,
} from "@/features/content/actions";
import { useTitleExtrasQuery, useTitleQuery } from "@/features/content/queries";
import { useSetProfilePinMutation } from "@/features/profile/queries";
import { useTheme } from "@/lib/theme";
import type { MediaType } from "@/types/domain";

export function TitleDetailView({ type, id }: { type: MediaType; id: string }) {
  const theme = useTheme();
  const title = useTitleQuery(type, id);
  const extras = useTitleExtrasQuery(type, id);
  const progress = useProgressMutation(type === "show" ? id : undefined);
  const watchlistUpdate = useWatchlistUpdateMutation();
  const remove = useWatchlistRemoveMutation();
  const review = useCreateReviewMutation(type, id);
  const setPin = useSetProfilePinMutation();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [visibility, setVisibility] = useState<
    "PRIVATE" | "FOLLOWERS" | "PUBLIC"
  >("PUBLIC");
  const data = title.data;
  const nextEpisode = data?.seasons
    ?.flatMap((season) => season.episodes ?? [])
    .find((episode) => !episode.watched);
  const confirmRemove = () => {
    if (!data) return;
    Alert.alert(
      "Remove from watchlist?",
      `${data.title} and related progress will be removed.`,
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
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else
      Alert.alert(
        "Trailer unavailable",
        "This trailer cannot be opened on this device.",
      );
  };

  return (
    <Screen
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
            <View style={{ minHeight: 230 }}>
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
                  flex: 1,
                  justifyContent: "flex-end",
                  padding: theme.spacing.lg,
                  backgroundColor:
                    theme.mode === "dark"
                      ? "rgba(0,0,0,0.46)"
                      : "rgba(255,255,255,0.66)",
                  gap: theme.spacing.md,
                }}
              >
                <AppText variant="heading">{data.title}</AppText>
                <AppText muted numberOfLines={4}>
                  {data.overview || "No overview yet."}
                </AppText>
                <View
                  style={{
                    flexDirection: "row",
                    gap: theme.spacing.sm,
                    alignItems: "center",
                  }}
                >
                  <Button
                    loading={progress.isPending || watchlistUpdate.isPending}
                    disabled={type === "show" && !nextEpisode?.id}
                    onPress={() => {
                      if (type === "show" && nextEpisode?.id) {
                        progress.mutate({
                          action: "watch",
                          episodeId: nextEpisode.id,
                        });
                      } else if (type === "movie") {
                        watchlistUpdate.mutate({
                          ...titleToWatchlistInput(data),
                          userStatus: "WATCHED",
                        });
                      }
                    }}
                  >
                    {type === "show" ? "Mark Next" : "Mark Watched"}
                  </Button>
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
                      size={18}
                      color={
                        data.isFavourite
                          ? theme.colors.accent
                          : theme.colors.text
                      }
                      fill={
                        data.isFavourite ? theme.colors.accent : "transparent"
                      }
                    />
                  </IconButton>
                  <IconButton
                    label="Remove from watchlist"
                    onPress={confirmRemove}
                  >
                    <Trash2 size={18} color={theme.colors.danger} />
                  </IconButton>
                  <IconButton
                    label="Pin to profile"
                    onPress={() =>
                      setPin.mutate({
                        type: type === "show" ? "SHOW" : "MOVIE",
                        showId: type === "show" ? id : undefined,
                        movieId: type === "movie" ? id : undefined,
                        rank: 0,
                      })
                    }
                  >
                    <Pin size={18} color={theme.colors.text} />
                  </IconButton>
                </View>
                <Button variant="secondary" onPress={() => setReviewOpen(true)}>
                  Review
                </Button>
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
            {data.provider ? (
              <AppText>{data.provider.name}</AppText>
            ) : (
              <EmptyState title="No provider match yet" />
            )}
          </Section>
          {type === "show" ? (
            <Section title="Progress">
              {data.seasons?.length ? (
                <View style={{ gap: theme.spacing.md }}>
                  {data.seasons.slice(0, 3).map((season) => (
                    <View key={season.id} style={{ gap: theme.spacing.xs }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          gap: theme.spacing.sm,
                        }}
                      >
                        <AppText variant="label">{season.name}</AppText>
                        <Button
                          variant="ghost"
                          loading={progress.isPending}
                          onPress={() =>
                            progress.mutate({
                              action: "markSeason",
                              seasonId: season.id,
                            })
                          }
                        >
                          Mark Season
                        </Button>
                      </View>
                      {season.episodes?.slice(0, 4).map((episode) => (
                        <View
                          key={episode.id}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: theme.spacing.sm,
                          }}
                        >
                          <AppText muted style={{ flex: 1 }}>
                            {episode.episodeLabel || episode.title}{" "}
                            {episode.watched ? "· watched" : ""}
                          </AppText>
                          <Button
                            variant={episode.watched ? "ghost" : "secondary"}
                            loading={progress.isPending}
                            onPress={() =>
                              progress.mutate({
                                action: episode.watched ? "unwatch" : "watch",
                                episodeId: episode.id,
                              })
                            }
                          >
                            {episode.watched ? "Undo" : "Watch"}
                          </Button>
                        </View>
                      ))}
                    </View>
                  ))}
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
            ) : null}
            {extras.data?.trailers?.length ? (
              <View style={{ gap: theme.spacing.sm }}>
                {extras.data.trailers.slice(0, 3).map((trailer) => (
                  <Button
                    key={trailer.id}
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
          <Section title="Reviews">
            {data.reviews?.length ? (
              <View style={{ gap: theme.spacing.md }}>
                {data.reviews.slice(0, 3).map((review) => (
                  <AppText key={review.id}>
                    {review.spoiler
                      ? "Spoiler review"
                      : review.body || review.title}
                  </AppText>
                ))}
              </View>
            ) : (
              <EmptyState title="No reviews yet" />
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
              <TextInput
                accessibilityLabel="Rating"
                placeholder="Rating 1-10"
                value={rating}
                onChangeText={setRating}
                keyboardType="number-pad"
                placeholderTextColor={theme.colors.faint}
                style={{
                  minHeight: 48,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.sm,
                  paddingHorizontal: theme.spacing.md,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                  fontSize: 16,
                }}
              />
              <TextInput
                accessibilityLabel="Review"
                placeholder="Write a review"
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                placeholderTextColor={theme.colors.faint}
                style={{
                  minHeight: 140,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.sm,
                  padding: theme.spacing.md,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                  fontSize: 16,
                  textAlignVertical: "top",
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <AppText>Spoiler</AppText>
                <Switch value={spoiler} onValueChange={setSpoiler} />
              </View>
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
                onPress={() =>
                  review.mutate(
                    {
                      type,
                      showId: type === "show" ? id : undefined,
                      movieId: type === "movie" ? id : undefined,
                      rating,
                      review: reviewText,
                      spoiler,
                      visibility,
                      tags: "",
                    },
                    {
                      onSuccess: () => {
                        setReviewOpen(false);
                        setReviewText("");
                        setRating("");
                      },
                    },
                  )
                }
              >
                Save Review
              </Button>
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
