import { useQuery } from "@tanstack/react-query";
import { mapCalendarPayload } from "@/lib/api-mappers";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import type { CalendarItem } from "@/types/domain";

export function useCalendarQuery(
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
) {
  return useQuery({
    queryKey: queryKeys.calendar(timezone),
    queryFn: async (): Promise<{ items?: CalendarItem[] }> =>
      mapCalendarPayload(
        await authedApiRequest("/calendar", { query: { timezone } }),
      ),
  });
}
