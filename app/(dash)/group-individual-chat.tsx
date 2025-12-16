import GroupChatWindow from "@/components/group-chat-window";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { supabase } from "@/lib/supabase";
import { GroupMessage, Groups } from "@/models/group.model";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

export default function GroupIndividualChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    groupId: string;
    groupName: string;
    senderType: string;
  }>();
  const groupId = params.groupId || "1";
  const senderType = params.senderType || "student";
  const colorScheme = useColorScheme();
  const { loading, setLoading, studentId } = useAppContext();
  const [group, setGroup] = useState<Groups>();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [participantCount, setParticipantCount] = useState<number>(0);

  const handleBack = useCallback(() => {
    router.push("/(dash)/group-chat");
  }, [router]);

  const fetchGroup = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("groups")
        .select("*, university(name), courses(name), clubs(name)")
        .eq("id", groupId)
        .single();

      if (error || !data) {
        Alert.alert("Error", "Failed to fetch group details");
        handleBack();
      }

      setGroup(data);
    } catch {
      Alert.alert("Error", "Failed to fetch groups");
    }
  }, [groupId, handleBack]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const fetchParticipantCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from("group_participants")
        .select("*", { count: "exact", head: true })
        .eq("group_id", groupId);

      if (error) {
        throw error;
      }

      setParticipantCount(count || 0);
    } catch {
      Alert.alert("Error", "Failed to fetch participant count");
    }
  }, [groupId]);

  useEffect(() => {
    if (group) {
      fetchParticipantCount();
    }
  }, [group, fetchParticipantCount]);

  const fetchMessages = useCallback(async () => {
    if (!group) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("group_messages")
        .select("*, sender:students(first_name, last_name)")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true })
        .range(0, 99);

      if (error) {
        throw error;
      }

      setMessages(data || []);
    } catch {
      Alert.alert("Error", "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, [group, groupId, setLoading]);
  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`group_messages-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMsg = payload.new as GroupMessage;
            if (newMsg.sender_type === "student" && newMsg.sender_id) {
              supabase
                .from("students")
                .select("first_name, last_name")
                .eq("id", newMsg.sender_id)
                .single()
                .then(({ data }) => {
                  newMsg.sender = data;
                  setMessages((prev) => [...prev, newMsg]);
                });
            } else {
              setMessages((prev) => [...prev, newMsg]);
            }
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === payload.new.id ? (payload.new as GroupMessage) : msg
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
      channel.unsubscribe();
    };
  }, [fetchMessages, groupId]);

  const handleSendMessage = useCallback(async (text: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("group_messages")
        .insert({
          group_id: groupId,
          sender_id: senderType === "student" ? studentId : null,
          sender_type: senderType,
          club_id: senderType === "club" ? studentId : null,
          admin_id: senderType === "admin" ? studentId : null,
          moderator_id: senderType === "moderator" ? studentId : null,
          message: text,
        })
        .select();

      if (error) {
        Alert.alert("Error", "Error sending message");
      }
    } catch {
      Alert.alert("Error", "Error sending message");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: group?.name,
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
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <ThemedText
                style={styles.headerTitleText}
                lightColor={Colors.light.tint}
                darkColor={Colors.dark.tint}
              >
                {group?.name || params.groupName}
              </ThemedText>
              <ThemedText
                style={styles.headerSubtitle}
                lightColor={Colors.light.tint}
                darkColor={Colors.dark.tint}
              >
                {participantCount} members
              </ThemedText>
            </View>
          ),
        }}
      />
      <GroupChatWindow
        messages={messages}
        currentUserId={studentId!}
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
    opacity: 0.8,
  },
});
