import { ChatWindow } from "@/components/chat-window";
import { Colors } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { supabase } from "@/lib/supabase";
import { Messages } from "@/models/conversation.model";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

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
        data.forEach((msg) => {
          if (msg.sender_id !== studentId && !msg.read_at) {
            markMessageAsRead(msg.id);
          }
        });
      }
    } catch {
      Alert.alert("Error", "Error fetching messages!");
    } finally {
      setLoading(false);
    }
  }, [chatId, setLoading]);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("id", messageId);
    } catch {
      // console.error("Error marking message as read:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
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
                if (payload.new.sender_id !== studentId) {
                  markMessageAsRead(payload.new.id);
                }
                // Mark all previous unread messages as read
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
    }, [studentTkn, chatId, fetchMessages, studentId, markMessageAsRead])
  );

  const handleBack = useCallback(() => {
    router.push("/(dash)/chat");
    setMsgList([]);
  }, [router]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      try {
        setLoading(true);
        const { error } = await supabase
          .from("messages")
          .insert({
            conversation_id: chatId,
            sender_id: studentId,
            message: text,
          })
          .select();

        if (error) {
          Alert.alert("Error", "Error sending message!");
        } else {
          const { error: conError } = await supabase
            .from("conversations")
            .update({ last_message_at: new Date().toISOString() })
            .eq("id", chatId);
          if (conError) {
            Alert.alert("Error", JSON.stringify(conError));
          }
        }
      } catch {
        Alert.alert("Error", "Error sending message!");
      } finally {
        setLoading(false);
      }
    },
    [chatId, studentId, setLoading]
  );

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
              <Ionicons
                name="chevron-back"
                size={28}
                color={Colors[colorScheme ?? "light"].tint}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ChatWindow
        messages={msgList}
        currentUserId={studentId!}
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
});
