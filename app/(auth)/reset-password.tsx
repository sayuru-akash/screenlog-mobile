import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { AppText } from "@/components/primitives/Text";
import { resetPassword } from "@/features/auth/actions";
import { useTheme } from "@/lib/theme";

export default function ResetPasswordScreen() {
  const theme = useTheme();
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
    <Screen title="New password" subtitle="Choose at least eight characters.">
      <View style={{ gap: theme.spacing.md }}>
        <TextInput
          accessibilityLabel="New password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
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
        <Button
          loading={loading}
          disabled={!token || password.length < 8}
          onPress={() => void submit()}
        >
          Save Password
        </Button>
      </View>
    </Screen>
  );
}
