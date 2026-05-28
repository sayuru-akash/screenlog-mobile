import { Screen } from "@/components/primitives/Screen";
import { Section } from "@/components/primitives/Section";
import {
  EmptyState,
  ErrorState,
  DashboardSkeleton,
} from "@/components/primitives/StateViews";
import { TitleRail } from "@/components/content/TitleRail";
import { useDiscoverQuery } from "@/features/discover/queries";

export default function DiscoverScreen() {
  const discover = useDiscoverQuery();
  const rows = discover.data?.rows ?? [];
  return (
    <Screen
      back
      title="Discover"
      subtitle="Fresh rows from Watchlog."
      refreshing={discover.isRefetching}
      onRefresh={() => void discover.refetch()}
    >
      {discover.isLoading ? <DashboardSkeleton /> : null}
      {discover.isError ? (
        <ErrorState
          message={discover.error.message}
          onRetry={() => void discover.refetch()}
        />
      ) : null}
      {!discover.isLoading && !rows.length ? (
        <EmptyState title="No discovery rows" />
      ) : null}
      {rows.map((row, index) => (
        <Section key={`${row.id}-${index}`} title={row.title}>
          <TitleRail items={row.items} empty="Nothing in this row." />
        </Section>
      ))}
    </Screen>
  );
}
