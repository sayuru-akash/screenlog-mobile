import { useState } from "react";
import { View } from "react-native";
import { Screen } from "@/components/primitives/Screen";
import { Button } from "@/components/primitives/Button";
import { EmptyState, ErrorState, LoadingState } from "@/components/primitives/StateViews";
import { TitleRow } from "@/components/content/TitleRow";
import { useWatchlistQuery } from "@/features/watchlist/queries";
import { useTheme } from "@/lib/theme";

export default function WatchlistScreen() {
  const theme = useTheme();
  const [kind, setKind] = useState<"shows" | "movies">("shows");
  const watchlist = useWatchlistQuery(kind);
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
        {items?.map((item) => <TitleRow key={`${item.type}-${item.id}`} item={item} />)}
      </View>
    </Screen>
  );
}
