import { Link, router } from "expo-router";
import { useState } from "react";
import signInCharacter from "../../assets/auth/sign-in-character.png";
import {
  AuthInput,
  AuthMessage,
  AuthScaffold,
} from "@/components/auth/AuthScaffold";
import { Button } from "@/components/primitives/Button";
import { signInWithEmail } from "@/features/auth/actions";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError("");
    try {
      await signInWithEmail(email.trim(), password);
      router.replace("/(tabs)");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScaffold
      title="Welcome back"
      subtitle="Pick up your watchlist, progress, reviews, and friends feed."
      art={signInCharacter}
    >
      <AuthInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        textContentType="emailAddress"
      />
      <AuthInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
      />
      {error ? <AuthMessage tone="danger">{error}</AuthMessage> : null}
      <Button
        loading={loading}
        onPress={() => void submit()}
        disabled={!email || !password}
      >
        Sign In
      </Button>
      <Link href="/(auth)/forgot-password" asChild>
        <Button variant="ghost">Forgot Password</Button>
      </Link>
      <Link href="/(auth)/sign-up" asChild>
        <Button variant="secondary">Create Account</Button>
      </Link>
    </AuthScaffold>
  );
}
