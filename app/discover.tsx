import { Screen } from "@/components/primitives/Screen";
import { Section } from "@/components/primitives/Section";
import { EmptyState, ErrorState, LoadingState } from "@/components/primitives/StateViews";
import { TitleRail } from "@/components/content/TitleRail";
import { useDiscoverQuery } from "@/features/discover/queries";

export default function DiscoverScreen() {
  const discover = useDiscoverQuery();
  const rows = discover.data?.rows ?? [];
  return (
    <Screen title="Discover" subtitle="Fresh rows from Watchlog.">
      {discover.isLoading ? <LoadingState label="Loading discovery" /> : null}
      {discover.isError ? <ErrorState message={discover.error.message} onRetry={() => void discover.refetch()} /> : null}
      {!discover.isLoading && !rows.length ? <EmptyState title="No discovery rows" /> : null}
      {rows.map((row) => (
        <Section key={row.id} title={row.title}>
          <TitleRail items={row.items} empty="Nothing in this row." />
        </Section>
      ))}
    </Screen>
  );
}
