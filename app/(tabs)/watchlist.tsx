import { useState } from "react";
import { View } from "react-native";
import { Heart, Trash2 } from "lucide-react-native";
import { Screen } from "@/components/primitives/Screen";
import { Button } from "@/components/primitives/Button";
import { IconButton } from "@/components/primitives/StateViews";
import { EmptyState, ErrorState, LoadingState } from "@/components/primitives/StateViews";
import { TitleRow } from "@/components/content/TitleRow";
import {
  titleToWatchlistInput,
  useWatchlistRemoveMutation,
  useWatchlistUpdateMutation,
} from "@/features/content/actions";
import { useWatchlistQuery } from "@/features/watchlist/queries";
import { useTheme } from "@/lib/theme";

export default function WatchlistScreen() {
  const theme = useTheme();
  const [kind, setKind] = useState<"shows" | "movies">("shows");
  const watchlist = useWatchlistQuery(kind);
  const update = useWatchlistUpdateMutation();
  const remove = useWatchlistRemoveMutation();
  const items = kind === "shows" ? watchlist.data?.shows : watchlist.data?.movies;

  return (
    <Screen title="Watchlist" subtitle="Your working library.">
      <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
        <Button variant={kind === "shows" ? "primary" : "ghost"} onPress={() => setKind("shows")}>
          Shows
        </Button>
        <Button variant={kind === "movies" ? "primary" : "ghost"} onPress={() => setKind("movies")}>
          Movies
        </Button>
      </View>
      {watchlist.isLoading ? <LoadingState label="Loading watchlist" /> : null}
      {watchlist.isError ? <ErrorState message={watchlist.error.message} onRetry={() => void watchlist.refetch()} /> : null}
      {!watchlist.isLoading && !watchlist.isError && !items?.length ? <EmptyState title="Nothing here yet" body="Add titles from Search." /> : null}
      <View style={{ gap: theme.spacing.md }}>
        {items?.map((item) => (
          <TitleRow
            key={`${item.type}-${item.id}`}
            item={item}
            right={
              <View style={{ flexDirection: "row", gap: theme.spacing.xs, alignItems: "center" }}>
                <IconButton
                  label={item.isFavourite ? `Unfavourite ${item.title}` : `Favourite ${item.title}`}
                  onPress={() =>
                    update.mutate({
                      ...titleToWatchlistInput(item),
                      isFavourite: !item.isFavourite,
                    })
                  }
                >
                  <Heart
                    size={17}
                    color={item.isFavourite ? theme.colors.accent : theme.colors.faint}
                    fill={item.isFavourite ? theme.colors.accent : "transparent"}
                  />
                </IconButton>
                {item.type === "movie" ? (
                  <Button
                    variant="secondary"
                    loading={update.isPending}
                    onPress={() =>
                      update.mutate({
                        ...titleToWatchlistInput(item),
                        userStatus: "WATCHED",
                      })
                    }
                  >
                    Watched
                  </Button>
                ) : null}
                <IconButton label={`Remove ${item.title}`} onPress={() => remove.mutate({ type: item.type, id: item.id })}>
                  <Trash2 size={17} color={theme.colors.danger} />
                </IconButton>
              </View>
            }
          />
        ))}
      </View>
      {(update.isError || remove.isError) && (
        <ErrorState message={update.error?.message || remove.error?.message} />
      )}
    </Screen>
  );
}
