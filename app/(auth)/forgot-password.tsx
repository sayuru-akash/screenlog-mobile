import { Link } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { AppText } from "@/components/primitives/Text";
import { requestPasswordReset } from "@/features/auth/actions";
import { useTheme } from "@/lib/theme";

export default function ForgotPasswordScreen() {
  const theme = useTheme();
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
    <Screen title="Reset password" subtitle="We will send a secure link.">
      <View style={{ gap: theme.spacing.md }}>
        <TextInput
          accessibilityLabel="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
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
        />
        {message ? <AppText muted>{message}</AppText> : null}
        <Button loading={loading} disabled={!email} onPress={() => void submit()}>
          Send Link
        </Button>
        <Link href="/(auth)/sign-in" asChild>
          <Button variant="ghost">Back</Button>
        </Link>
      </View>
    </Screen>
  );
}
