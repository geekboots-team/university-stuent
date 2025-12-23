import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

function CustomHeader({ title }: { title: string }) {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        headerStyles.container,
        {
          backgroundColor: Colors.light.tint,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <View style={headerStyles.leftSection}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={headerStyles.logo}
          resizeMode="contain"
        />
        <Text
          style={[
            headerStyles.title,
            { color: Colors[colorScheme ?? "light"].background },
          ]}
        >
          {title}
        </Text>
      </View>
      <TouchableOpacity
        style={headerStyles.profileButton}
        onPress={() => router.push("/(dash)/profile")}
      >
        <IconSymbol
          size={28}
          name="person.circle.fill"
          color={Colors[colorScheme ?? "light"].background}
        />
      </TouchableOpacity>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  profileButton: {
    padding: 4,
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.tint,
        tabBarInactiveTintColor: Colors.light.background,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.light.tint,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          headerShown: true,
          header: () => <CustomHeader title="Dashboard" />,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: true,
          header: () => <CustomHeader title="Chat" />,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="message.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="group-chat"
        options={{
          title: "Groups",
          headerShown: true,
          header: () => <CustomHeader title="Groups" />,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.3.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="individual-chat"
        options={{
          href: null, // Hide from tab bar
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="group-individual-chat"
        options={{
          href: null, // Hide from tab bar
          headerShown: true,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Hide from tab bar
          headerShown: true,
          title: "My Profile",
          header: () => <CustomHeader title="My Profile" />,
        }}
      />
    </Tabs>
  );
}
