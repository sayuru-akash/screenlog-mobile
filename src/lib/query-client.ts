import { QueryClient } from "@tanstack/react-query";

export function createWatchlogQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 1000 * 60 * 60 * 6,
        retry: (failureCount, error) => {
          const status =
            typeof error === "object" && error && "status" in error
              ? error.status
              : null;
          if (status === 401 || status === 403 || status === 404) return false;
          return failureCount < 2;
        },
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export const queryClient = createWatchlogQueryClient();
