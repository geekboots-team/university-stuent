import { ChatWindow } from "@/components/chat-window";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { supabase } from "@/lib/supabase";
import { Messages } from "@/models/conversation.model";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, TouchableOpacity } from "react-native";

export default function IndividualChatScreen() {
  const { studentTkn, setLoading, studentId } = useAppContext();
  const router = useRouter();
  const params = useLocalSearchParams<{ chatId: string; userName: string }>();
  const chatId = params.chatId;
  const userName = params.userName;
  const colorScheme = useColorScheme();
  const [msgList, setMsgList] = useState<Messages[]>([]);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:students!sender_id(id, first_name, last_name)")
        .eq("conversation_id", chatId);

      if (error) {
        Alert.alert("Error", "Error fetching messages!");
      } else {
        setMsgList(data);
      }
    } catch {
      Alert.alert("Error", "Error fetching messages!");
    } finally {
      setLoading(false);
    }
  }, [chatId, setLoading]);

  useEffect(() => {
    if (studentTkn) {
      fetchMessages();

      // Subscribe to realtime changes
      const channel = supabase
        .channel(`messages-${chatId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${chatId}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setMsgList((prev) => [...prev, payload.new as Messages]);
            } else if (payload.eventType === "UPDATE") {
              setMsgList((prev) =>
                prev.map((msg) =>
                  msg.id === payload.new.id ? (payload.new as Messages) : msg
                )
              );
            } else if (payload.eventType === "DELETE") {
              setMsgList((prev) =>
                prev.filter((msg) => msg.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [studentTkn, chatId, fetchMessages]);

  const handleBack = useCallback(() => {
    router.push("/(dash)/chat");
  }, [router]);

  const handleSendMessage = useCallback((text: string) => {
    // const newMessage: Messages = {
    //   id: Date.now().toString(),
    //   message: text,
    //   sender: {
    //     id: "current-user",
    //     first_name: "Current",
    //     last_name: "User",
    //   },
    //   created_at: new Date().toISOString(),
    // };

    // setMessages((prev) => [...prev, newMessage]);

    // TODO: Send message to backend API
    console.log("Sending message:", text);
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: userName,
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "600",
            color: Colors[colorScheme ?? "light"].tint,
          },
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <IconSymbol
                name="chevron.left"
                size={28}
                color={Colors[colorScheme ?? "light"].tint}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ChatWindow
        messages={msgList}
        currentUserId="current-user"
        isGroupChat={false}
        onSendMessage={handleSendMessage}
        inputPlaceholder="Type a message..."
      />
    </>
  );
}

const styles = StyleSheet.create({
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
});
