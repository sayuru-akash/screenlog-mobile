import { View } from "react-native";
import { Image } from "expo-image";
import { Heart, MoreHorizontal, Play } from "lucide-react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { Section } from "@/components/primitives/Section";
import { EmptyState, ErrorState, IconButton, LoadingState } from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import { TitleRail } from "./TitleRail";
import { useTitleExtrasQuery, useTitleQuery } from "@/features/content/queries";
import { useTheme } from "@/lib/theme";
import type { MediaType } from "@/types/domain";

export function TitleDetailView({ type, id }: { type: MediaType; id: string }) {
  const theme = useTheme();
  const title = useTitleQuery(type, id);
  const extras = useTitleExtrasQuery(type, id);
  const data = title.data;

  return (
    <Screen title={data?.title || (type === "show" ? "Show" : "Movie")} subtitle={data?.year ? String(data.year) : undefined}>
      {title.isLoading ? <LoadingState label="Loading title" /> : null}
      {title.isError ? <ErrorState message={title.error.message} onRetry={() => void title.refetch()} /> : null}
      {data ? (
        <>
          <View style={{ borderRadius: theme.radius.md, overflow: "hidden", backgroundColor: theme.colors.surfaceMuted }}>
            <View style={{ minHeight: 230 }}>
              {data.backdropUrl || data.posterUrl ? (
                <Image
                  source={{ uri: data.backdropUrl || data.posterUrl || undefined }}
                  style={{ position: "absolute", inset: 0 }}
                  contentFit="cover"
                />
              ) : null}
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-end",
                  padding: theme.spacing.lg,
                  backgroundColor: theme.mode === "dark" ? "rgba(0,0,0,0.46)" : "rgba(255,255,255,0.66)",
                  gap: theme.spacing.md,
                }}
              >
                <AppText variant="heading">{data.title}</AppText>
                <AppText muted numberOfLines={4}>
                  {data.overview || "No overview yet."}
                </AppText>
                <View style={{ flexDirection: "row", gap: theme.spacing.sm, alignItems: "center" }}>
                  <Button>{type === "show" ? "Mark Next" : "Mark Watched"}</Button>
                  <IconButton label="Favourite">
                    <Heart size={18} color={theme.colors.text} />
                  </IconButton>
                  <IconButton label="More actions">
                    <MoreHorizontal size={18} color={theme.colors.text} />
                  </IconButton>
                </View>
              </View>
            </View>
          </View>
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
                      <AppText variant="label">{season.name}</AppText>
                      {season.episodes?.slice(0, 4).map((episode) => (
                        <AppText key={episode.id} muted>
                          {episode.episodeLabel || episode.title} {episode.watched ? "· watched" : ""}
                        </AppText>
                      ))}
                    </View>
                  ))}
                </View>
              ) : (
                <EmptyState title="No episode progress" />
              )}
            </Section>
          ) : null}
          <Section title="Trailers">
            {extras.isLoading ? <LoadingState label="Loading trailers" /> : null}
            {extras.data?.trailers?.length ? (
              <View style={{ gap: theme.spacing.sm }}>
                {extras.data.trailers.slice(0, 3).map((trailer) => (
                  <Button key={trailer.id} variant="secondary" icon={<Play size={15} color={theme.colors.accent} />}>
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
                  <AppText key={review.id}>{review.spoiler ? "Spoiler review" : review.body || review.title}</AppText>
                ))}
              </View>
            ) : (
              <EmptyState title="No reviews yet" />
            )}
          </Section>
          <Section title="Related">
            <TitleRail items={extras.data?.related} empty="No related titles." />
          </Section>
        </>
      ) : null}
    </Screen>
  );
}
