import { Link, router } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { AppText } from "@/components/primitives/Text";
import { signUpWithEmail } from "@/features/auth/actions";
import { useTheme } from "@/lib/theme";

export default function SignUpScreen() {
  const theme = useTheme();
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
    <Screen title="Create account" subtitle="Use the same Watchlog account everywhere.">
      <View style={{ gap: theme.spacing.md }}>
        <Input label="Name" value={name} onChangeText={setName} />
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {message ? <AppText muted>{message}</AppText> : null}
        <Button loading={loading} disabled={!name || !email || password.length < 8} onPress={() => void submit()}>
          Sign Up
        </Button>
        <Link href="/(auth)/sign-in" asChild>
          <Button variant="ghost">Sign In</Button>
        </Link>
        <Button variant="secondary" onPress={() => router.push("/onboarding")}>
          Setup Later
        </Button>
      </View>
    </Screen>
  );
}

function Input(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const theme = useTheme();
  const { label, ...inputProps } = props;
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        style={{
          minHeight: 48,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.sm,
          paddingHorizontal: theme.spacing.md,
          color: theme.colors.text,
          backgroundColor: theme.colors.surface,
          fontSize: 16,
        }}
        {...inputProps}
      />
    </View>
  );
}
