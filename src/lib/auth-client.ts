import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { getPublicConfig } from "./api-client";

const config = getPublicConfig();

export const authClient = createAuthClient({
  baseURL: config.apiOrigin,
  plugins: [
    expoClient({
      scheme: config.appScheme,
      storagePrefix: "watchlog",
      cookiePrefix: "watchlog",
      storage: SecureStore,
    }),
  ],
});

export function getAuthCookie() {
  return authClient.getCookie?.() ?? "";
}
