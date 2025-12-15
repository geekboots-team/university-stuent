import { ChatWindow, Message } from "@/components/chat-window";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// Mock messages data - replace with actual API calls
const getMockMessages = (chatId: string): Message[] => {
  const mockConversations: Record<string, Message[]> = {
    "1": [
      {
        id: "1",
        text: "Hey! How are you doing?",
        senderId: "user-1",
        senderName: "John Doe",
        timestamp: new Date(Date.now() - 3600000 * 2),
        isOwnMessage: false,
      },
      {
        id: "2",
        text: "I'm doing great, thanks for asking! How about you?",
        senderId: "current-user",
        timestamp: new Date(Date.now() - 3600000 * 1.5),
        isOwnMessage: true,
      },
      {
        id: "3",
        text: "Pretty good! Just working on the project.",
        senderId: "user-1",
        senderName: "John Doe",
        timestamp: new Date(Date.now() - 3600000),
        isOwnMessage: false,
      },
      {
        id: "4",
        text: "Hey, how are you?",
        senderId: "user-1",
        senderName: "John Doe",
        timestamp: new Date(Date.now() - 1800000),
        isOwnMessage: false,
      },
    ],
    "2": [
      {
        id: "1",
        text: "Are we still meeting tomorrow?",
        senderId: "current-user",
        timestamp: new Date(Date.now() - 7200000),
        isOwnMessage: true,
      },
      {
        id: "2",
        text: "Yes! See you tomorrow at 10 AM",
        senderId: "user-2",
        senderName: "Jane Smith",
        timestamp: new Date(Date.now() - 3600000),
        isOwnMessage: false,
      },
      {
        id: "3",
        text: "See you tomorrow!",
        senderId: "user-2",
        senderName: "Jane Smith",
        timestamp: new Date(Date.now() - 1800000),
        isOwnMessage: false,
      },
    ],
    "3": [
      {
        id: "1",
        text: "Could you help me with the assignment?",
        senderId: "user-3",
        senderName: "Mike Johnson",
        timestamp: new Date(Date.now() - 86400000),
        isOwnMessage: false,
      },
      {
        id: "2",
        text: "Sure! What do you need help with?",
        senderId: "current-user",
        timestamp: new Date(Date.now() - 82800000),
        isOwnMessage: true,
      },
      {
        id: "3",
        text: "Thanks for your help!",
        senderId: "user-3",
        senderName: "Mike Johnson",
        timestamp: new Date(Date.now() - 3600000),
        isOwnMessage: false,
      },
    ],
  };

  return mockConversations[chatId] || [];
};

// Mock user data
const getUserData = (chatId: string) => {
  const users: Record<string, { name: string; status: string }> = {
    "1": { name: "John Doe", status: "Online" },
    "2": { name: "Jane Smith", status: "Last seen 5 min ago" },
    "3": { name: "Mike Johnson", status: "Online" },
    "4": { name: "Sarah Wilson", status: "Last seen 2 hours ago" },
    "5": { name: "David Brown", status: "Last seen yesterday" },
  };

  return users[chatId] || { name: "Unknown User", status: "" };
};

export default function IndividualChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ chatId: string; userName: string }>();
  const chatId = params.chatId || "1";
  const userData = getUserData(chatId);
  const colorScheme = useColorScheme();

  const [messages, setMessages] = useState<Message[]>(() =>
    getMockMessages(chatId)
  );

  const handleBack = useCallback(() => {
    router.push("/(dash)/chat");
  }, [router]);

  const handleSendMessage = useCallback((text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      senderId: "current-user",
      timestamp: new Date(),
      isOwnMessage: true,
    };

    setMessages((prev) => [...prev, newMessage]);

    // TODO: Send message to backend API
    console.log("Sending message:", text);
  }, []);

  const headerRight = useCallback(
    () => (
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
          <Ionicons
            name="ellipsis-vertical"
            size={22}
            color={Colors[colorScheme ?? "light"].tint}
          />
        </TouchableOpacity>
      </View>
    ),
    []
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: params.userName || userData.name,
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
          headerRight: headerRight,
        }}
      />
      <ChatWindow
        messages={messages}
        currentUserId="current-user"
        isGroupChat={false}
        onSendMessage={handleSendMessage}
        inputPlaceholder="Type a message..."
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
});
