import { Link } from "expo-router";
import { useState } from "react";
import signUpCharacter from "../../assets/auth/sign-up-character.png";
import {
  AuthInput,
  AuthMessage,
  AuthScaffold,
} from "@/components/auth/AuthScaffold";
import { Button } from "@/components/primitives/Button";
import { signUpWithEmail } from "@/features/auth/actions";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setMessage("");
    try {
      await signUpWithEmail(name.trim(), email.trim(), password);
      setMessage(`Check ${email.trim()} for a verification link.`);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScaffold
      title="Create account"
      subtitle="Start a profile for your ratings, rewatches, lists, and private logs."
      art={signUpCharacter}
    >
      <AuthInput
        label="Name"
        value={name}
        onChangeText={setName}
        textContentType="name"
      />
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
        textContentType="newPassword"
      />
      {message ? <AuthMessage tone="success">{message}</AuthMessage> : null}
      <Button
        loading={loading}
        disabled={!name || !email || password.length < 8}
        onPress={() => void submit()}
      >
        Sign Up
      </Button>
      <Link href="/(auth)/sign-in" asChild>
        <Button variant="ghost">Sign In</Button>
      </Link>
    </AuthScaffold>
  );
}
