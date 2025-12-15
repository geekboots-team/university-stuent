import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "600",
            color: Colors[colorScheme ?? "light"].tint,
          },
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "600",
            color: Colors[colorScheme ?? "light"].tint,
          },
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="message.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="group-chat"
        options={{
          title: "Groups",
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "600",
            color: Colors[colorScheme ?? "light"].tint,
          },
          headerShown: true,
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
    </Tabs>
  );
}
