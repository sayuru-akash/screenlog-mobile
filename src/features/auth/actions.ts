import { authClient } from "@/lib/auth-client";

type AuthResult = { error?: { message?: string } | null };
type AuthApi = {
  signIn?: { email?: (input: { email: string; password: string }) => Promise<AuthResult> };
  signUp?: {
    email?: (input: { email: string; password: string; name: string }) => Promise<AuthResult>;
  };
  signOut?: () => Promise<AuthResult>;
  requestPasswordReset?: (input: { email: string; redirectTo?: string }) => Promise<AuthResult>;
  resetPassword?: (input: { newPassword: string; token: string }) => Promise<AuthResult>;
};

const api = authClient as AuthApi;

export async function signInWithEmail(email: string, password: string) {
  const result = await api.signIn?.email?.({ email, password });
  throwIfAuthError(result);
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  const result = await api.signUp?.email?.({ name, email, password });
  throwIfAuthError(result);
}

export async function signOut() {
  const result = await api.signOut?.();
  throwIfAuthError(result);
}

export async function requestPasswordReset(email: string) {
  const result = await api.requestPasswordReset?.({ email });
  throwIfAuthError(result);
}

export async function resetPassword(token: string, newPassword: string) {
  const result = await api.resetPassword?.({ token, newPassword });
  throwIfAuthError(result);
}

function throwIfAuthError(result: AuthResult | undefined) {
  if (result?.error) throw new Error(result.error.message || "Authentication failed");
}
