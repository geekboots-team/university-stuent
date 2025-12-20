import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { ProfileModal } from "@/components/profile-modal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

function TabBarMenu({ color }: { color: string }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { studentTkn, logoutStudent, studentStatus, upStudentStatus } =
    useAppContext();
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (!studentTkn) {
      router.replace("/");
    }
  }, [studentTkn, router]);

  useEffect(() => {
    if (studentStatus === "approved") {
      setShowProfileModal(true);
    }
    if (studentStatus === "active") {
      setShowProfileModal(false);
    }
  }, [studentStatus]);

  const handleLogout = () => {
    setMenuVisible(false);
    logoutStudent();
    router.replace("/");
  };

  const handleProfile = () => {
    setMenuVisible(false);
    router.push("/(dash)/profile");
  };

  const handleCloseProfileModal = () => {
    upStudentStatus("active");
    setShowProfileModal(false);
    router.push("/(dash)/dashboard");
  };

  return (
    <View style={styles.tabBarMenuContainer}>
      <TouchableOpacity onPress={() => setMenuVisible(true)}>
        <IconSymbol size={28} name="ellipsis" color={color} />
      </TouchableOpacity>

      <ProfileModal
        visible={showProfileModal}
        onClose={handleCloseProfileModal}
      />

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor: Colors[colorScheme ?? "light"].background,
                borderColor: Colors[colorScheme ?? "light"].icon,
              },
            ]}
          >
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text
                style={[
                  styles.menuText,
                  { color: Colors[colorScheme ?? "light"].text },
                ]}
              >
                Logout
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
              <Text
                style={[
                  styles.menuText,
                  { color: Colors[colorScheme ?? "light"].text },
                ]}
              >
                My Profile
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  dropdown: {
    marginBottom: 60,
    marginRight: 16,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 140,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  menuText: {
    fontSize: 16,
  },
  tabBarMenuContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

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
        name="menu"
        options={{
          title: "Menu",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarMenu color={color} />,
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
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "600",
            color: Colors[colorScheme ?? "light"].tint,
          },
        }}
      />
    </Tabs>
  );
}
