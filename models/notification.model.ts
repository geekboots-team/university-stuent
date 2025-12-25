export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "general" | "reminder" | "alert" | "announcement";
  priority: "low" | "medium" | "high" | "urgent";
  sender_id: string;
  sender_role: "admin" | "moderator" | "company";
  recipient_type: "all" | "specific" | "role" | "university" | "club";
  recipient_users: string[] | null;
  recipient_roles: string[] | null;
  recipient_universities: string[] | null;
  recipient_clubs: string | null;
  is_read: { userId: string; readAt: string }[] | null;
  is_active: boolean | null;
  scheduled_for: string | null;
  expires_at: string | null;
  action_url: string | null;
  action_label: string | null;
  created_at: string;
  updated_at: string;
}

// Helper type for notification card compatibility
export interface NotificationCardData {
  _id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  sender: {
    id: string;
    role: "admin" | "moderator" | "company";
  };
  recipients: {
    type: "all" | "specific" | "role" | "university" | "club";
    users: string[];
    roles: string[];
    universities: string[];
    clubs: string;
  };
  isRead: {
    userId: string;
    readAt: Date;
  }[];
  isActive: boolean;
  scheduledFor: Date;
  expiresAt: Date;
  actionUrl: string;
  actionLabel: string;
  createdAt: Date;
  updatedAt: Date;
}

// Converter function
export function convertToCardData(
  notification: Notification
): NotificationCardData {
  return {
    _id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    priority: notification.priority,
    sender: {
      id: notification.sender_id,
      role: notification.sender_role,
    },
    recipients: {
      type: notification.recipient_type,
      users: notification.recipient_users || [],
      roles: notification.recipient_roles || [],
      universities: notification.recipient_universities || [],
      clubs: notification.recipient_clubs || "",
    },
    isRead: (notification.is_read || []).map((read) => ({
      userId: read.userId,
      readAt: new Date(read.readAt),
    })),
    isActive: notification.is_active ?? true,
    scheduledFor: notification.scheduled_for
      ? new Date(notification.scheduled_for)
      : new Date(),
    expiresAt: notification.expires_at
      ? new Date(notification.expires_at)
      : new Date(),
    actionUrl: notification.action_url || "",
    actionLabel: notification.action_label || "",
    createdAt: new Date(notification.created_at),
    updatedAt: new Date(notification.updated_at),
  };
}

export function isNotificationRead(
  data: Notification[],
  studentId: string,
  studentRole: string,
  userUniversities: string[],
  userClubs: string[]
): Notification[] | undefined {
  if (data) {
    // Filter notifications based on recipient criteria
    const relevantNotifications = data.filter((notification) => {
      // Check if notification is for all users
      if (notification.recipient_type === "all") {
        return true;
      }

      // Check if notification is for specific users
      if (
        notification.recipient_type === "specific" &&
        notification.recipient_users?.includes(studentId)
      ) {
        return true;
      }

      // Check if notification is for specific roles
      if (
        notification.recipient_type === "role" &&
        notification.recipient_roles?.includes(studentRole)
      ) {
        return true;
      }

      // Check if notification is for specific universities
      if (
        notification.recipient_type === "university" &&
        notification.recipient_universities?.some((uniId: string) =>
          userUniversities.includes(uniId)
        )
      ) {
        return true;
      }

      if (
        notification.recipient_type === "club" &&
        notification.recipient_clubs &&
        userClubs.includes(notification.recipient_clubs)
      ) {
        return true;
      }

      return false;
    });

    // Check for expired notifications
    const activeNotifications = relevantNotifications.filter((notification) => {
      if (!notification.expires_at) return true;
      return new Date(notification.expires_at) > new Date();
    });

    return activeNotifications;
  }
}
