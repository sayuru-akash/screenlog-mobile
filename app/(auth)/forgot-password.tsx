import { Link } from "expo-router";
import { useState } from "react";
import resetCharacter from "../../assets/auth/reset-character.png";
import {
  AuthInput,
  AuthMessage,
  AuthScaffold,
} from "@/components/auth/AuthScaffold";
import { Button } from "@/components/primitives/Button";
import { requestPasswordReset } from "@/features/auth/actions";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setMessage("Check your email for a reset link.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScaffold
      title="Reset password"
      subtitle="Send a secure link and get back to your queue."
      art={resetCharacter}
      backHref="/(auth)/sign-in"
    >
      <AuthInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        textContentType="emailAddress"
      />
      {message ? <AuthMessage tone="success">{message}</AuthMessage> : null}
      <Button loading={loading} disabled={!email} onPress={() => void submit()}>
        Send Link
      </Button>
      <Link href="/(auth)/sign-in" asChild>
        <Button variant="ghost">Back to Sign In</Button>
      </Link>
    </AuthScaffold>
  );
}
