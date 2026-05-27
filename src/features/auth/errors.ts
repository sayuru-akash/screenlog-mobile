export type AuthErrorLike = {
  message?: unknown;
  code?: unknown;
  status?: unknown;
  statusText?: unknown;
};

export function getAuthErrorMessage(error: AuthErrorLike | null | undefined) {
  if (!error) return "Authentication failed";

  const code = typeof error.code === "string" ? error.code : "";
  const status = typeof error.status === "number" ? error.status : undefined;
  const message = cleanMessage(error.message);
  const statusText = cleanMessage(error.statusText);

  if (code === "EMAIL_NOT_VERIFIED") {
    return "Email not verified. Check your inbox for the verification link, then sign in again.";
  }
  if (code === "INVALID_EMAIL_OR_PASSWORD") {
    return "Invalid email or password.";
  }
  if (code === "MISSING_OR_NULL_ORIGIN" || code === "INVALID_ORIGIN") {
    return "This app is not trusted by the auth server. Restart the app and try again.";
  }
  if (status === 429 || code === "TOO_MANY_REQUESTS") {
    return "Too many sign-in attempts. Wait a minute and try again.";
  }

  return message || statusText || "Authentication failed";
}

function cleanMessage(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
