import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/src/stores/auth-store";
import { useNotificationStore } from "@/src/stores/notification-store";
import { CriticalNotificationModal } from "@/src/components/critical-modal";

// Prevent the splash screen from auto-hiding until we finish restoring session
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const [isReady, setIsReady] = useState(false);
  const criticalNotification = useNotificationStore(
    (state) => state.modalQueue[0] ?? null,
  );

  // Restore session on app launch
  useEffect(() => {
    const restore = async () => {
      try {
        await restoreSession();
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    };

    restore();
  }, [restoreSession]);

  // Auth redirect logic
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect unauthenticated users to login
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect authenticated users to tabs
      router.replace("/(tabs)");
    }
  }, [isReady, isAuthenticated, segments, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
        {criticalNotification && (
          <CriticalNotificationModal notification={criticalNotification} />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
