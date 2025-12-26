import { Tabs, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Platform,
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
import { supabase } from "@/lib/supabase";
import { isNotificationRead, Notification } from "@/models/notification.model";
import { Ionicons } from "@expo/vector-icons";

function CustomHeader({ title }: { title: string }) {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { studentId, studentRole } = useAppContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const [studentUniversities, setStudentUniversities] = useState<string[]>([]);
  const [studentClubs, setStudentClubs] = useState<string[]>([]);

  // Fetch student's universities
  const fetchStudentUniversities = useCallback(async () => {
    if (!studentId) return;
    try {
      const { data: appliedData, error: appliedError } = await supabase
        .from("applied_universities")
        .select("university_id")
        .eq("user_id", studentId)
        .eq("status", "active");

      if (appliedError) throw appliedError;

      if (appliedData && appliedData.length > 0) {
        const universityIds = appliedData.map(
          (item: { university_id: string }) => item.university_id
        );
        setStudentUniversities(universityIds);
      }
    } catch {
      console.error("Error fetching student universities");
    }
  }, [studentId]);

  // Fetch student's clubs
  const fetchStudentClubs = useCallback(async () => {
    if (!studentId) return;
    try {
      const { data: memberData, error: memberError } = await supabase
        .from("applied_clubs")
        .select("club_id")
        .eq("user_id", studentId)
        .eq("status", "active");

      if (memberError) throw memberError;

      if (memberData && memberData.length > 0) {
        const clubIds = memberData.map(
          (item: { club_id: string }) => item.club_id
        );
        setStudentClubs(clubIds);
      }
    } catch {
      console.error("Error fetching student clubs");
    }
  }, [studentId]);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    if (!studentId || !studentRole) return;
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;

      // Filter relevant notifications for this user
      const relevantNotifications = isNotificationRead(
        data || [],
        studentId,
        studentRole,
        studentUniversities,
        studentClubs
      );

      // Count unread notifications
      const unread = (relevantNotifications || []).filter(
        (notification: Notification) => {
          if (!notification.is_read) return true;
          return !notification.is_read.some(
            (read) => read.userId === studentId
          );
        }
      ).length;

      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [studentId, studentRole, studentUniversities, studentClubs]);

  // Initial load
  useEffect(() => {
    fetchStudentUniversities();
    fetchStudentClubs();
  }, [fetchStudentUniversities, fetchStudentClubs]);

  useEffect(() => {
    fetchUnreadCount();

    // Set up real-time subscription for notifications
    const subscription = supabase
      .channel("notifications-header")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUnreadCount]);

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
          source={require("@/assets/images/university-seniors.png")}
          style={headerStyles.logo}
        />
        {/* <Text
          style={[
            headerStyles.title,
            { color: Colors[colorScheme ?? "light"].background },
          ]}
        >
          {title}
        </Text> */}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <TouchableOpacity
          style={headerStyles.profileButton}
          onPress={() => router.push("/(dash)/support")}
        >
          <IconSymbol
            size={28}
            name="questionmark.circle.fill"
            color={Colors[colorScheme ?? "light"].background}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={headerStyles.profileButton}
          onPress={() => router.push("/(dash)/notifications")}
        >
          <View>
            <IconSymbol
              size={28}
              name="bell.fill"
              color={Colors[colorScheme ?? "light"].background}
            />
            {unreadCount > 0 && (
              <View style={headerStyles.badgeContainer}>
                <Text style={headerStyles.badgeText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
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
    gap: 5,
  },
  logo: {
    width: 90,
    height: 32,
    resizeMode: "contain",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  profileButton: {
    padding: 4,
  },
  badgeContainer: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "#F44336",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: Platform.OS === "ios" ? 160 : 150,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
});

export default function TabLayout() {
  const router = useRouter();
  const { studentStatus } = useAppContext();
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  useEffect(() => {
    if (studentStatus === "approved") {
      setProfileModalVisible(true);
    }
  }, [studentStatus]);

  return (
    <>
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
            href: null,
            title: "Groups",
            headerShown: true,
            header: () => <CustomHeader title="Groups" />,
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person.3.fill" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="accommodation"
          options={{
            title: "Accommodations",
            headerShown: true,
            header: () => <CustomHeader title="Accommodations" />,
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="bed.double.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notes"
          options={{
            href: null,
            title: "Notes",
            headerShown: true,
            header: () => <CustomHeader title="Notes" />,
            tabBarIcon: ({ color }) => (
              <Ionicons size={28} name="document-text-outline" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="support"
          options={{
            href: null,
            title: "Support",
            headerShown: true,
            header: () => <CustomHeader title="Support" />,
            tabBarIcon: ({ color }) => (
              <IconSymbol
                size={28}
                name="questionmark.circle.fill"
                color={color}
              />
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
        <Tabs.Screen
          name="notifications"
          options={{
            href: null, // Hide from tab bar
            headerShown: true,
            title: "Notifications",
            header: () => <CustomHeader title="Notifications" />,
          }}
        />
      </Tabs>
      <TouchableOpacity
        style={headerStyles.fab}
        onPress={() => router.push("/(dash)/notes")}
      >
        <Ionicons name="document-text-outline" size={28} color="#fff" />
      </TouchableOpacity>
      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
    </>
  );
}
