import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { AppProvider } from "@/context/AppContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { TouchableOpacity } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <AppProvider>
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
    </AppProvider>
  );
}
