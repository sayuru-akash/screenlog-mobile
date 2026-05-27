import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import resetCharacter from "../../assets/auth/reset-character.png";
import {
  AuthInput,
  AuthMessage,
  AuthScaffold,
} from "@/components/auth/AuthScaffold";
import { Button } from "@/components/primitives/Button";
import { resetPassword } from "@/features/auth/actions";

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!token) return;
    setLoading(true);
    try {
      await resetPassword(token, password);
      router.replace("/(auth)/sign-in");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScaffold
      title="New password"
      subtitle="Choose at least eight characters for your Watchlog account."
      art={resetCharacter}
      backHref="/(auth)/sign-in"
    >
      <AuthInput
        label="New password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="newPassword"
      />
      {!token ? (
        <AuthMessage tone="danger">
          This reset link is missing a valid token.
        </AuthMessage>
      ) : null}
      {message ? <AuthMessage tone="danger">{message}</AuthMessage> : null}
      <Button
        loading={loading}
        disabled={!token || password.length < 8}
        onPress={() => void submit()}
      >
        Save Password
      </Button>
    </AuthScaffold>
  );
}
