import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import {
  isNotificationRead,
  Notification,
} from "@/models/notification.model";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

type FilterType = "all" | "unread" | "read";

const priorityColors: Record<string, string> = {
  low: "#4CAF50",
  medium: "#2196F3",
  high: "#FF9800",
  urgent: "#F44336",
};

const typeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  general: "information-circle",
  reminder: "alarm",
  alert: "warning",
  announcement: "megaphone",
};

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const { studentId, studentRole, loading, setLoading } = useAppContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);
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

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!studentId || !studentRole) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter relevant notifications for this user
      const relevantNotifications = isNotificationRead(
        data || [],
        studentId,
        studentRole,
        studentUniversities,
        studentClubs
      );

      setNotifications(relevantNotifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [studentId, studentRole, studentUniversities, studentClubs, setLoading]);

  // Check if a notification is read by the current user
  const isRead = useCallback(
    (notification: Notification): boolean => {
      if (!notification.is_read || !studentId) return false;
      return notification.is_read.some((read) => read.userId === studentId);
    },
    [studentId]
  );

  // Filter notifications based on active filter
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredNotifications(notifications);
    } else if (activeFilter === "unread") {
      setFilteredNotifications(
        notifications.filter((n) => !isRead(n))
      );
    } else {
      setFilteredNotifications(
        notifications.filter((n) => isRead(n))
      );
    }
  }, [activeFilter, notifications, isRead]);

  // Mark notification as read
  const markAsRead = async (notification: Notification) => {
    if (!studentId || isRead(notification)) return;

    try {
      const newReadEntry = {
        userId: studentId,
        readAt: new Date().toISOString(),
      };

      const updatedIsRead = [
        ...(notification.is_read || []),
        newReadEntry,
      ];

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: updatedIsRead })
        .eq("id", notification.id);

      if (error) throw error;

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, is_read: updatedIsRead }
            : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!studentId) return;

    const unreadNotifications = notifications.filter((n) => !isRead(n));
    if (unreadNotifications.length === 0) return;

    try {
      for (const notification of unreadNotifications) {
        const newReadEntry = {
          userId: studentId,
          readAt: new Date().toISOString(),
        };

        const updatedIsRead = [
          ...(notification.is_read || []),
          newReadEntry,
        ];

        await supabase
          .from("notifications")
          .update({ is_read: updatedIsRead })
          .eq("id", notification.id);
      }

      // Refresh notifications
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  // Initial load
  useEffect(() => {
    fetchStudentUniversities();
    fetchStudentClubs();
  }, [fetchStudentUniversities, fetchStudentClubs]);

  useEffect(() => {
    if (studentUniversities.length > 0 || studentClubs.length > 0) {
      fetchNotifications();
    } else if (studentId && studentRole) {
      fetchNotifications();
    }
  }, [
    studentUniversities,
    studentClubs,
    studentId,
    studentRole,
    fetchNotifications,
  ]);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} min ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNotificationItem = ({
    item,
  }: {
    item: Notification;
  }) => {
    const notificationIsRead = isRead(item);

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          {
            backgroundColor: notificationIsRead
              ? Colors[colorScheme ?? "light"].background
              : colorScheme === "dark"
              ? "#1a2a3a"
              : "#E3F2FD",
            borderColor: Colors[colorScheme ?? "light"].text + "20",
          },
        ]}
        onPress={() => markAsRead(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={typeIcons[item.type] || "notifications"}
              size={24}
              color={priorityColors[item.priority] || Colors.light.tint}
            />
          </View>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <ThemedText
                style={[
                  styles.notificationTitle,
                  !notificationIsRead && styles.unreadTitle,
                ]}
                numberOfLines={1}
              >
                {item.title}
              </ThemedText>
              {!notificationIsRead && (
                <View
                  style={[
                    styles.unreadDot,
                    { backgroundColor: Colors.light.tint },
                  ]}
                />
              )}
            </View>
            <ThemedText style={styles.timestamp}>
              {formatDate(item.created_at)}
            </ThemedText>
          </View>
        </View>

        <ThemedText
          style={styles.notificationMessage}
          numberOfLines={2}
        >
          {item.message}
        </ThemedText>

        <View style={styles.notificationFooter}>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: priorityColors[item.priority] + "20" },
            ]}
          >
            <ThemedText
              style={[
                styles.priorityText,
                { color: priorityColors[item.priority] },
              ]}
            >
              {item.priority.toUpperCase()}
            </ThemedText>
          </View>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: Colors.light.tint + "20" },
            ]}
          >
            <ThemedText
              style={[styles.typeText, { color: Colors.light.tint }]}
            >
              {item.type.toUpperCase()}
            </ThemedText>
          </View>
          {item.action_label && (
            <TouchableOpacity style={styles.actionButton}>
              <ThemedText
                style={[styles.actionText, { color: Colors.light.tint }]}
              >
                {item.action_label}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => !isRead(n)).length;

  return (
    <ThemedView style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <View style={styles.filterTabs}>
          {(["all", "unread", "read"] as FilterType[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                activeFilter === filter && {
                  backgroundColor: Colors.light.tint,
                },
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.activeFilterText,
                ]}
              >
                {filter === "all"
                  ? `All (${notifications.length})`
                  : filter === "unread"
                  ? `Unread (${unreadCount})`
                  : `Read (${notifications.length - unreadCount})`}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Ionicons
              name="checkmark-done"
              size={18}
              color={Colors.light.tint}
            />
            <ThemedText
              style={[styles.markAllText, { color: Colors.light.tint }]}
            >
              Mark all read
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      ) : filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="notifications-off-outline"
            size={64}
            color={Colors[colorScheme ?? "light"].text + "40"}
          />
          <ThemedText style={styles.emptyText}>
            {activeFilter === "unread"
              ? "No unread notifications"
              : activeFilter === "read"
              ? "No read notifications"
              : "No notifications yet"}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.light.tint]}
              tintColor={Colors.light.tint}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  filterTabs: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "600",
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 6,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  notificationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  unreadTitle: {
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  notificationMessage: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 12,
    paddingLeft: 52,
  },
  notificationFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 52,
    flexWrap: "wrap",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  actionButton: {
    marginLeft: "auto",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
