import { ChatWindow, Message } from "@/components/chat-window";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// Mock messages data for group chats - replace with actual API calls
const getMockGroupMessages = (groupId: string): Message[] => {
  const mockConversations: Record<string, Message[]> = {
    "1": [
      {
        id: "1",
        text: "Hey everyone! Ready for the study session?",
        senderId: "user-1",
        senderName: "Alice",
        timestamp: new Date(Date.now() - 3600000 * 3),
        isOwnMessage: false,
      },
      {
        id: "2",
        text: "Yes! I've prepared some notes on Chapter 5.",
        senderId: "current-user",
        timestamp: new Date(Date.now() - 3600000 * 2.5),
        isOwnMessage: true,
      },
      {
        id: "3",
        text: "That's great! Can you share them with the group?",
        senderId: "user-2",
        senderName: "Bob",
        timestamp: new Date(Date.now() - 3600000 * 2),
        isOwnMessage: false,
      },
      {
        id: "4",
        text: "I'll be joining in 10 minutes",
        senderId: "user-3",
        senderName: "Charlie",
        timestamp: new Date(Date.now() - 3600000),
        isOwnMessage: false,
      },
      {
        id: "5",
        text: "Anyone up for study session?",
        senderId: "user-1",
        senderName: "Alice",
        timestamp: new Date(Date.now() - 1800000),
        isOwnMessage: false,
      },
    ],
    "2": [
      {
        id: "1",
        text: "Team, we need to finalize the project proposal",
        senderId: "user-4",
        senderName: "Emma",
        timestamp: new Date(Date.now() - 7200000),
        isOwnMessage: false,
      },
      {
        id: "2",
        text: "I've updated the slides. Please review them.",
        senderId: "current-user",
        timestamp: new Date(Date.now() - 5400000),
        isOwnMessage: true,
      },
      {
        id: "3",
        text: "Looks good! Just a few minor changes needed.",
        senderId: "user-2",
        senderName: "Bob",
        timestamp: new Date(Date.now() - 3600000),
        isOwnMessage: false,
      },
      {
        id: "4",
        text: "Meeting at 5 PM",
        senderId: "user-2",
        senderName: "Bob",
        timestamp: new Date(Date.now() - 1800000),
        isOwnMessage: false,
      },
    ],
    "3": [
      {
        id: "1",
        text: "🎉 There's a cultural fest this weekend!",
        senderId: "user-admin",
        senderName: "Admin",
        timestamp: new Date(Date.now() - 86400000),
        isOwnMessage: false,
      },
      {
        id: "2",
        text: "Exciting! What events are planned?",
        senderId: "user-5",
        senderName: "David",
        timestamp: new Date(Date.now() - 82800000),
        isOwnMessage: false,
      },
      {
        id: "3",
        text: "Music performances, food stalls, and games!",
        senderId: "user-admin",
        senderName: "Admin",
        timestamp: new Date(Date.now() - 79200000),
        isOwnMessage: false,
      },
      {
        id: "4",
        text: "New event this weekend!",
        senderId: "user-admin",
        senderName: "Admin",
        timestamp: new Date(Date.now() - 3600000),
        isOwnMessage: false,
      },
    ],
    "4": [
      {
        id: "1",
        text: "Can someone explain integration by parts?",
        senderId: "user-6",
        senderName: "Frank",
        timestamp: new Date(Date.now() - 86400000 * 2),
        isOwnMessage: false,
      },
      {
        id: "2",
        text: "Sure! It's basically the reverse of the product rule.",
        senderId: "current-user",
        timestamp: new Date(Date.now() - 86400000 * 1.5),
        isOwnMessage: true,
      },
      {
        id: "3",
        text: "Thanks! That makes more sense now.",
        senderId: "user-6",
        senderName: "Frank",
        timestamp: new Date(Date.now() - 86400000),
        isOwnMessage: false,
      },
      {
        id: "4",
        text: "Can someone explain the homework?",
        senderId: "user-3",
        senderName: "Charlie",
        timestamp: new Date(Date.now() - 43200000),
        isOwnMessage: false,
      },
    ],
    "5": [
      {
        id: "1",
        text: "Graduation trip ideas? 🎓",
        senderId: "user-7",
        senderName: "Grace",
        timestamp: new Date(Date.now() - 172800000),
        isOwnMessage: false,
      },
      {
        id: "2",
        text: "Beach vacation sounds fun!",
        senderId: "user-8",
        senderName: "Henry",
        timestamp: new Date(Date.now() - 86400000 * 1.5),
        isOwnMessage: false,
      },
      {
        id: "3",
        text: "Or maybe a camping trip?",
        senderId: "current-user",
        timestamp: new Date(Date.now() - 86400000),
        isOwnMessage: true,
      },
      {
        id: "4",
        text: "Let's plan the trip!",
        senderId: "current-user",
        timestamp: new Date(Date.now() - 43200000),
        isOwnMessage: true,
      },
    ],
  };

  return mockConversations[groupId] || [];
};

// Mock group data
const getGroupData = (groupId: string) => {
  const groups: Record<string, { name: string; members: number }> = {
    "1": { name: "CS Study Group", members: 12 },
    "2": { name: "Project Team Alpha", members: 5 },
    "3": { name: "Campus Events", members: 150 },
    "4": { name: "Math 101 Help", members: 28 },
    "5": { name: "Senior Year Squad", members: 8 },
  };

  return groups[groupId] || { name: "Unknown Group", members: 0 };
};

export default function GroupIndividualChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ groupId: string; groupName: string }>();
  const groupId = params.groupId || "1";
  const groupData = getGroupData(groupId);
  const colorScheme = useColorScheme();

  const [messages, setMessages] = useState<Message[]>(() =>
    getMockGroupMessages(groupId)
  );

  const handleBack = useCallback(() => {
    router.push("/(dash)/group-chat");
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
    console.log("Sending group message:", text);
  }, []);

  const headerRight = useCallback(
    () => (
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
          <Ionicons
            name="people"
            size={22}
            color={Colors[colorScheme ?? "light"].tint}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
          <Ionicons
            name="ellipsis-vertical"
            size={22}
            color={Colors[colorScheme ?? "light"].tint}
          />
        </TouchableOpacity>
      </View>
    ),
    [colorScheme]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: params.groupName || groupData.name,
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
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <ThemedText style={styles.headerTitleText}>
                {params.groupName || groupData.name}
              </ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                {groupData.members} members
              </ThemedText>
            </View>
          ),
        }}
      />
      <ChatWindow
        messages={messages}
        currentUserId="current-user"
        isGroupChat={true}
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
  headerTitle: {
    alignItems: "center",
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
});
