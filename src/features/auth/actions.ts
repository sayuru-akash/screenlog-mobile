import { authClient } from "@/lib/auth-client";
import { getPublicConfig } from "@/lib/api-client";

type AuthResult = { error?: { message?: string } | null };
type AuthApi = {
  signIn?: {
    email?: (input: { email: string; password: string }) => Promise<AuthResult>;
  };
  signUp?: {
    email?: (input: {
      email: string;
      password: string;
      name: string;
    }) => Promise<AuthResult>;
  };
  signOut?: () => Promise<AuthResult>;
  requestPasswordReset?: (input: {
    email: string;
    redirectTo?: string;
  }) => Promise<AuthResult>;
  resetPassword?: (input: {
    newPassword: string;
    token: string;
  }) => Promise<AuthResult>;
  deleteUser?: () => Promise<AuthResult>;
};

const api = authClient as AuthApi;

export async function signInWithEmail(email: string, password: string) {
  const signIn = requireAuthMethod(api.signIn?.email, "signIn.email");
  const result = await signIn({ email, password });
  throwIfAuthError(result);
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string,
) {
  const signUp = requireAuthMethod(api.signUp?.email, "signUp.email");
  const result = await signUp({ name, email, password });
  throwIfAuthError(result);
}

export async function signOut() {
  const signOutAction = requireAuthMethod(api.signOut, "signOut");
  const result = await signOutAction();
  throwIfAuthError(result);
}

export async function requestPasswordReset(email: string) {
  const requestReset = requireAuthMethod(
    api.requestPasswordReset,
    "requestPasswordReset",
  );
  const { appScheme } = getPublicConfig();
  const result = await requestReset({
    email,
    redirectTo: `${appScheme}://reset-password`,
  });
  throwIfAuthError(result);
}

export async function resetPassword(token: string, newPassword: string) {
  const resetPasswordAction = requireAuthMethod(
    api.resetPassword,
    "resetPassword",
  );
  const result = await resetPasswordAction({ token, newPassword });
  throwIfAuthError(result);
}

export async function requestAccountDeletion() {
  const deleteUser = requireAuthMethod(api.deleteUser, "deleteUser");
  const result = await deleteUser();
  throwIfAuthError(result);
}

function requireAuthMethod<
  TMethod extends (...args: never[]) => Promise<AuthResult>,
>(method: TMethod | undefined, name: string) {
  if (!method) throw new Error(`Better Auth method ${name} is unavailable`);
  return method;
}

function throwIfAuthError(result: AuthResult | undefined) {
  if (result?.error)
    throw new Error(result.error.message || "Authentication failed");
}
