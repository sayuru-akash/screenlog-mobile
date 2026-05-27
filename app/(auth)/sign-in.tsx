import { Link, router } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { AppText } from "@/components/primitives/Text";
import { signInWithEmail } from "@/features/auth/actions";
import { useTheme } from "@/lib/theme";

export default function SignInScreen() {
  const theme = useTheme();
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
    <Screen
      title="Welcome back"
      subtitle="Sign in to continue tracking."
      contentStyle={{ flex: 1, justifyContent: "center" }}
    >
      <View style={{ gap: theme.spacing.md }}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error ? (
          <AppText style={{ color: theme.colors.danger }}>{error}</AppText>
        ) : null}
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
      </View>
    </Screen>
  );
}

function Input(
  props: React.ComponentProps<typeof TextInput> & { label: string },
) {
  const theme = useTheme();
  const { label, ...inputProps } = props;
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.faint}
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
