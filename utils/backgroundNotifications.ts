import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

export const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error, executionInfo }) => {
    if (error) {
      console.error("Error in background notification task:", error);
      return;
    }

    if (data) {
      const { notification } = data as any;
      // For debugging/logging purposes
      // console.log("Received background notification:", notification);

      // IMPORTANT: This task is mainly for data-only notifications on Android.
      // If the backend sends a notification with `title` and `body`, the OS handles it automatically
      // and this task might not even be needed for display, but can be used for processing data.

      // However, if the notification is data-only, we must schedule a local notification
      // to show it to the user.

      // Check if it's a data-only notification (no title/body in the trigger payload, theoretically)
      // Or just enforce showing it if we want custom handling.
      // But be careful not to duplicate notifications if the OS already showed one.
      // Typically, standard push notifications (with title/body) are handled by the system.
      // Data messages need manual handling.

      // Assuming the backend sends `data` containing `title` and `body` for data-messages,
      // or we infer it.

      const content = notification?.request?.content;
      const payloadData = content?.data;

      // Example: if payload has `headless: true` or similar, or just relying on `data`
      // If we are sure this is a data-message that needs display:
      if (!content.title && payloadData?.title) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: payloadData.title,
            body: payloadData.body,
            data: payloadData,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: null,
        });
      }
    }
  }
);
