import { Tabs } from "expo-router";
import { Redirect } from "expo-router";
import { CalendarDays, Home, Search, User, Library } from "lucide-react-native";
import { LoadingState } from "@/components/primitives/StateViews";
import { Screen } from "@/components/primitives/Screen";
import { authClient } from "@/lib/auth-client";
import { useTheme } from "@/lib/theme";

export default function TabsLayout() {
  const theme = useTheme();
  const session = authClient.useSession();

  if (session.isPending) {
    return (
      <Screen scroll={false}>
        <LoadingState label="Checking session" />
      </Screen>
    );
  }

  if (!session.data) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.faint,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => <Search size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: "Watchlist",
          tabBarIcon: ({ color }) => <Library size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => <CalendarDays size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
