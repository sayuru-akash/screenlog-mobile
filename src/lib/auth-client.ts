import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { getPublicConfig } from "./api-client";

const config = getPublicConfig();
const STORAGE_PREFIX = "watchlog";
const LEGACY_STORAGE_PREFIXES = ["screenlog", "better-auth"];

for (const key of ["cookie", "session_data"] as const) {
  const currentKey = `${STORAGE_PREFIX}_${key}`;
  const currentValue = SecureStore.getItem(currentKey);
  if (currentValue) continue;

  for (const legacyPrefix of LEGACY_STORAGE_PREFIXES) {
    const legacyValue = SecureStore.getItem(`${legacyPrefix}_${key}`);
    if (legacyValue) {
      SecureStore.setItem(currentKey, legacyValue);
      break;
    }
  }
}

export const authClient = createAuthClient({
  baseURL: config.apiOrigin,
  plugins: [
    expoClient({
      scheme: config.appScheme,
      storagePrefix: STORAGE_PREFIX,
      cookiePrefix: ["watchlog", "screenlog", "better-auth"],
      storage: SecureStore,
    }),
  ],
});

export function getAuthCookie() {
  return authClient.getCookie?.() ?? "";
}
