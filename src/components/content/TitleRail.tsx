import { ScrollView, View } from "react-native";
import { PosterCard } from "./PosterCard";
import { EmptyState } from "@/components/primitives/StateViews";
import { useTheme } from "@/lib/theme";
import type { TitleSummary } from "@/types/domain";

export function TitleRail({
  items,
  empty,
}: {
  items?: TitleSummary[];
  empty: string;
}) {
  const theme = useTheme();
  if (!items?.length) return <EmptyState title={empty} />;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View
        style={{
          flexDirection: "row",
          gap: theme.spacing.md,
          paddingRight: theme.spacing.lg,
        }}
      >
        {items.map((item, index) => (
          <PosterCard
            key={`${item.type}-${item.id}-${index}`}
            item={item}
            compact
          />
        ))}
      </View>
    </ScrollView>
  );
}
