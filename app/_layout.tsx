import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { AppProvider, useAppContext } from "@/context/AppContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { studentId, updateBadgeCount } = useAppContext();

  useEffect(() => {
    // Request notification permissions
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Notification permissions not granted");
      }
    };

    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    requestPermissions();

    // Update badge when student logs in
    if (studentId) {
      updateBadgeCount();
    }

    // Listen for notification received (when app is in foreground)
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        // Update badge count when notification is received
        updateBadgeCount();
      }
    );

    // Listen for notification response (when user taps on notification)
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        // Update badge count when user interacts with notification
        updateBadgeCount();
      });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [studentId, updateBadgeCount]);

  const handleBack = () => {
    router.back();
  };

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            presentation: "modal",
            title: "Create Account",
            headerShown: true,
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: "600",
              color: Colors[colorScheme ?? "light"].tint,
            },
            headerBackButtonMenuEnabled: false,
            headerLeft: () => (
              <TouchableOpacity
                onPress={handleBack}
                style={{ padding: 4, marginRight: 8 }}
              >
                <IconSymbol
                  size={28}
                  name="chevron.left"
                  color={Colors[colorScheme ?? "light"].tint}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{
            presentation: "modal",
            title: "Forgot Password",
            headerShown: true,
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: "600",
              color: Colors[colorScheme ?? "light"].tint,
            },
            headerBackButtonMenuEnabled: false,
            headerLeft: () => (
              <TouchableOpacity
                onPress={handleBack}
                style={{ padding: 4, marginRight: 8 }}
              >
                <IconSymbol
                  size={28}
                  name="chevron.left"
                  color={Colors[colorScheme ?? "light"].tint}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="(dash)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootLayoutContent />
    </AppProvider>
  );
}
