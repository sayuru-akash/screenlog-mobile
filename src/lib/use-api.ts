import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { apiRequest, type ApiRequestOptions } from "./api-client";
import { getAuthCookie } from "./auth-client";
import { assertOnlineForMutation } from "./mutations";

export async function authedApiRequest<TResponse>(
  path: string,
  options: Omit<ApiRequestOptions, "cookie"> = {},
) {
  if (options.method && options.method !== "GET") {
    const network = await NetInfo.fetch();
    assertOnlineForMutation({
      isConnected:
        network.isConnected === true && network.isInternetReachable !== false,
    });
  }

  return apiRequest<TResponse>(path, {
    ...options,
    cookie: getAuthCookie(),
  });
}

export function useApiMutation<
  TResponse,
  TVariables extends { path: string; body?: unknown },
>(options?: UseMutationOptions<TResponse, Error, TVariables>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (variables: TVariables) => {
      const network = await NetInfo.fetch();
      assertOnlineForMutation({
        isConnected:
          network.isConnected === true && network.isInternetReachable !== false,
      });
      return authedApiRequest<TResponse>(variables.path, {
        method: "POST",
        body: variables.body,
      });
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries();
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
