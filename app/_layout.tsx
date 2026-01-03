import "@/utils/backgroundNotifications";
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
import { Alert, TouchableOpacity } from "react-native";

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { studentId, updateBadgeCount } = useAppContext();

  useEffect(() => {
    // Request notification permissions
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission not granted",
          "Notification permissions not granted"
        );
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

    const handleNotificationResponse = (
      response: Notifications.NotificationResponse
    ) => {
      const data = response.notification.request.content.data;
      if (data?.type === "individual" && data?.chatId && data?.userName) {
        router.push({
          pathname: "/(dash)/individual-chat",
          params: {
            chatId: data.chatId as string,
            userName: data.userName as string,
          },
        });
      } else if (data?.type === "group" && data?.groupId && data?.groupName) {
        router.push({
          pathname: "/(dash)/group-individual-chat",
          params: {
            groupId: data.groupId as string,
            groupName: data.groupName as string,
          },
        });
      }
      // Update badge count when user interacts with notification
      updateBadgeCount();
    };

    // Check if app was opened from a notification (cold start)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    // Listen for notification response (when user taps on notification)
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );

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
