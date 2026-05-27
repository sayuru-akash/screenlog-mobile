import { useState } from "react";
import { Alert, View } from "react-native";
import { Heart, Trash2 } from "lucide-react-native";
import { Screen } from "@/components/primitives/Screen";
import { Button } from "@/components/primitives/Button";
import { IconButton } from "@/components/primitives/StateViews";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/primitives/StateViews";
import { TitleRow } from "@/components/content/TitleRow";
import {
  titleToWatchlistInput,
  useCreateReviewMutation,
  useWatchlistRemoveMutation,
  useWatchlistUpdateMutation,
} from "@/features/content/actions";
import {
  type ActionConfirmation,
  movieLogConfirmationCopy,
  removeWatchlistConfirmationCopy,
} from "@/features/content/action-confirmations";
import { filterWatchlistTabItems } from "@/features/watchlist/filters";
import { useWatchlistQuery } from "@/features/watchlist/queries";
import { useTheme } from "@/lib/theme";
import type { MediaType, TitleSummary } from "@/types/domain";

export default function WatchlistScreen() {
  const theme = useTheme();
  const [kind, setKind] = useState<"shows" | "movies">("shows");
  const watchlist = useWatchlistQuery(kind);
  const update = useWatchlistUpdateMutation();
  const remove = useWatchlistRemoveMutation();
  const movieLog = useCreateReviewMutation("movie", "watchlist");
  const rawItems =
    kind === "shows" ? watchlist.data?.shows : watchlist.data?.movies;
  const items = filterWatchlistTabItems(rawItems, kind);
  const confirmRemove = (item: {
    id: string;
    title: string;
    type: MediaType;
  }) => {
    const copy = removeWatchlistConfirmationCopy({
      title: item.title,
      type: item.type,
    });
    Alert.alert(copy.title, copy.message, [
      { text: "Cancel", style: "cancel" },
      {
        text: copy.confirmLabel,
        style: "destructive",
        onPress: () => remove.mutate({ type: item.type, id: item.id }),
      },
    ]);
  };
  const confirmWatched = (item: TitleSummary) => {
    confirmAction(movieLogConfirmationCopy({ title: item.title }), () =>
      movieLog.mutate({
        type: "movie",
        movieId: item.id,
        rating: "",
        review: "",
        spoiler: false,
        rewatch: false,
        visibility: "PRIVATE",
        tags: "",
      }),
    );
  };

  return (
    <Screen title="Watchlist" subtitle="Your working library.">
      <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
        <Button
          variant={kind === "shows" ? "primary" : "ghost"}
          onPress={() => setKind("shows")}
        >
          Shows
        </Button>
        <Button
          variant={kind === "movies" ? "primary" : "ghost"}
          onPress={() => setKind("movies")}
        >
          Movies
        </Button>
      </View>
      {watchlist.isLoading ? <LoadingState label="Loading watchlist" /> : null}
      {watchlist.isError ? (
        <ErrorState
          message={watchlist.error.message}
          onRetry={() => void watchlist.refetch()}
        />
      ) : null}
      {!watchlist.isLoading && !watchlist.isError && !items.length ? (
        <EmptyState
          title={kind === "shows" ? "No watching shows" : "No movies to watch"}
          body={
            kind === "shows"
              ? "Start or resume a show to see it here."
              : "Add unwatched movies from Search."
          }
        />
      ) : null}
      <View style={{ gap: theme.spacing.md }}>
        {items.map((item, index) => (
          <TitleRow
            key={`${item.type}-${item.id}-${index}`}
            item={item}
            right={
              <View
                style={{
                  flexDirection: "row",
                  gap: theme.spacing.xs,
                  alignItems: "center",
                }}
              >
                <IconButton
                  label={
                    item.isFavourite
                      ? `Unfavourite ${item.title}`
                      : `Favourite ${item.title}`
                  }
                  onPress={() =>
                    update.mutate({
                      ...titleToWatchlistInput(item),
                      isFavourite: !item.isFavourite,
                    })
                  }
                >
                  <Heart
                    size={17}
                    color={
                      item.isFavourite
                        ? theme.colors.accent
                        : theme.colors.faint
                    }
                    fill={
                      item.isFavourite ? theme.colors.accent : "transparent"
                    }
                  />
                </IconButton>
                {item.type === "movie" ? (
                  <Button
                    variant="secondary"
                    loading={movieLog.isPending}
                    onPress={() => confirmWatched(item)}
                  >
                    Watched
                  </Button>
                ) : null}
                <IconButton
                  label={`Remove ${item.title}`}
                  onPress={() => confirmRemove(item)}
                >
                  <Trash2 size={17} color={theme.colors.danger} />
                </IconButton>
              </View>
            }
          />
        ))}
      </View>
      {(update.isError || remove.isError || movieLog.isError) && (
        <ErrorState
          message={
            update.error?.message ||
            remove.error?.message ||
            movieLog.error?.message
          }
        />
      )}
    </Screen>
  );
}

function confirmAction(copy: ActionConfirmation, onConfirm: () => void) {
  Alert.alert(copy.title, copy.message, [
    { text: "Cancel", style: "cancel" },
    {
      text: copy.confirmLabel,
      style: copy.destructive ? "destructive" : "default",
      onPress: onConfirm,
    },
  ]);
}
