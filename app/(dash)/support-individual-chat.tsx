import SupportChatWindow from "@/components/support-chat-window";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { supabase } from "@/lib/supabase";
import { Support, SupportMessage } from "@/models/support.model";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function SupportIndividualChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    ticketId: string;
  }>();
  const colorScheme = useColorScheme();
  const { setLoading, studentId } = useAppContext();
  const [ticket, setTicket] = useState<Support | null>(null);
  const [ticketId, setTicketId] = useState<string>();
  const [messages, setMessages] = useState<SupportMessage[]>([]);

  useEffect(() => {
    if (params.ticketId) setTicketId(params.ticketId);
  }, [params]);

  const handleBack = useCallback(() => {
    router.push("/(dash)/support");
    setMessages([]);
    setTicketId(undefined);
    setTicket(null);
  }, [router]);

  const fetchTicket = useCallback(async () => {
    try {
      if (!ticketId) return;
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("id", ticketId)
        .single();

      if (error || !data) {
        Alert.alert("Error", "Failed to fetch ticket");
        handleBack();
        return;
      }

      setTicket(data);
    } catch {
      Alert.alert("Error", "Failed to fetch ticket");
      handleBack();
    }
  }, [ticketId, handleBack]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const fetchMessages = useCallback(async () => {
    if (!ticket || !ticketId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("ticket_id", ticket.id)
        .order("created_at", { ascending: true });

      if (error) {
        Alert.alert("Error", "Failed to fetch messages");
        return;
      }

      setMessages(data || []);
    } catch {
      Alert.alert("Error", "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, [ticket, ticketId, setLoading]);

  useFocusEffect(
    useCallback(() => {
      if (!ticket) return;
      fetchMessages();

      // Subscribe to realtime changes
      const channel = supabase
        .channel(`support_messages-${ticket.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "support_messages",
            filter: `ticket_id=eq.${ticket.id}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newMsg = payload.new as SupportMessage;
              setMessages((prev) => [...prev, newMsg]);
            } else if (payload.eventType === "UPDATE") {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === payload.new.id
                    ? (payload.new as SupportMessage)
                    : msg
                )
              );
            } else if (payload.eventType === "DELETE") {
              setMessages((prev) =>
                prev.filter((msg) => msg.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [ticket, fetchMessages])
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !ticket || !studentId) return;

      try {
        setLoading(true);
        const messageData = {
          ticket_id: ticket.id,
          sender_id: studentId,
          sender_role: "student",
          message: text,
        };

        const { error } = await supabase
          .from("support_messages")
          .insert(messageData);

        if (error) throw error;
      } catch {
        Alert.alert("Error", "Failed to send message");
      } finally {
        setLoading(false);
      }
    },
    [ticket, studentId]
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "#dc3545";
      case "high":
        return "#fd7e14";
      case "medium":
        return "#ffc107";
      case "low":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "#28a745";
      case "in_progress":
        return "#007bff";
      case "pending_user":
        return "#ffc107";
      case "resolved":
        return "#17a2b8";
      case "closed":
        return "#6c757d";
      default:
        return "#6c757d";
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <ThemedText
                style={styles.headerTitleText}
                lightColor={Colors.light.tint}
                darkColor={Colors.dark.tint}
              >
                {ticket?.subject || "Support Ticket"}
              </ThemedText>
              <ThemedText
                style={styles.headerSubtitle}
                lightColor={Colors.light.tint}
                darkColor={Colors.dark.tint}
              >
                #{ticket?.ticket_id || ""}
              </ThemedText>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons
                name="chevron-back"
                size={28}
                color={Colors[colorScheme ?? "light"].tint}
              />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor:
              colorScheme === "dark" ? Colors.dark.background : "#fff",
          },
        }}
      />

      {ticket && (
        <>
          <View style={styles.ticketDetails}>
            <View style={styles.categoryBadge}>
              <ThemedText style={styles.badgeText}>
                {ticket.category.replace("_", " ")}
              </ThemedText>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getStatusColor(ticket.status),
                },
              ]}
            >
              <ThemedText style={styles.badgeText}>
                {ticket.status.replace("_", " ")}
              </ThemedText>
            </View>
            <View
              style={[
                styles.priorityBadge,
                {
                  backgroundColor: getPriorityColor(ticket.priority),
                },
              ]}
            >
              <ThemedText style={styles.badgeText}>
                {ticket.priority}
              </ThemedText>
            </View>
          </View>
          <SupportChatWindow
            status={ticket.status}
            messages={messages}
            currentUserId={studentId!}
            onSendMessage={handleSendMessage}
            inputPlaceholder="Type your message..."
          />
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    alignItems: Platform.OS === "ios" ? "center" : "flex-start",
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.8,
  },
  ticketDetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    textTransform: "capitalize",
  },

  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.light.tabIconSelected,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  studentMessage: {
    alignSelf: "flex-end",
    backgroundColor: Colors.light.tint,
  },
  supportMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e9ecef",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 4,
  },
  noMessages: {
    textAlign: "center",
    fontSize: 14,
    opacity: 0.5,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "flex-end",
    backgroundColor: "#fff",
  },
  messageInput: {
    flex: 1,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
