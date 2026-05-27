import { useState } from "react";
import { TextInput, View } from "react-native";
import { Check, Plus } from "lucide-react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/primitives/StateViews";
import { TitleRow } from "@/components/content/TitleRow";
import { AppText } from "@/components/primitives/Text";
import { useAddToWatchlistMutation, useSearchQuery } from "@/features/search/queries";
import { useTheme } from "@/lib/theme";
import type { MediaType } from "@/types/domain";

export default function SearchScreen() {
  const theme = useTheme();
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | MediaType>("all");
  const search = useSearchQuery(q, type);
  const add = useAddToWatchlistMutation();
  const results = search.data?.results ?? [];

  return (
    <Screen title="Search" subtitle="Find shows and movies." contentStyle={{ gap: theme.spacing.lg }}>
      <TextInput
        accessibilityLabel="Search"
        placeholder="Search titles"
        value={q}
        onChangeText={setQ}
        autoCapitalize="none"
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
      <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
        {(["all", "show", "movie"] as const).map((option) => (
          <Button key={option} variant={type === option ? "primary" : "ghost"} onPress={() => setType(option)}>
            {option === "all" ? "All" : option === "show" ? "Shows" : "Movies"}
          </Button>
        ))}
      </View>
      {q.trim().length < 2 ? <EmptyState title="Type to search" body="Two or more characters." /> : null}
      {search.isLoading ? <LoadingState label="Searching" /> : null}
      {search.isError ? <ErrorState message={search.error.message} onRetry={() => void search.refetch()} /> : null}
      {!search.isLoading && q.trim().length >= 2 && !results.length ? <EmptyState title="No matches" /> : null}
      <View style={{ gap: theme.spacing.md }}>
        {results.map((item) => (
          <TitleRow
            key={`${item.type}-${item.id || item.tmdbId}`}
            item={item}
            right={
              <Button
                variant="secondary"
                loading={add.isPending}
                onPress={() => add.mutate(item)}
                icon={add.isSuccess ? <Check size={15} color={theme.colors.accent} /> : <Plus size={15} color={theme.colors.accent} />}
              >
                Add
              </Button>
            }
          />
        ))}
      </View>
      {add.isError ? <AppText style={{ color: theme.colors.danger }}>{add.error.message}</AppText> : null}
    </Screen>
  );
}
