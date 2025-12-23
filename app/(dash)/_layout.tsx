import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { ProfileModal } from "@/components/profile-modal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
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
          backgroundColor: Colors[colorScheme ?? "light"].background,
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
            { color: Colors[colorScheme ?? "light"].tint },
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
          color={Colors[colorScheme ?? "light"].tint}
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
    marginBottom: 80,
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
          header: () => <CustomHeader title="My Profile" />,
        }}
      />
    </Tabs>
  );
}
