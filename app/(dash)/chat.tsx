import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { Conversation, ConversationUser } from "@/models/conversation.model";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatScreen() {
  const { studentTkn, studentId, loading, setLoading } = useAppContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const router = useRouter();

  const fetchConversations = useCallback(async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          *,
          participant1:students!participant1_id(id, first_name, last_name),
          participant2:students!participant2_id(id, first_name, last_name)
        `
        )
        .or(`participant1_id.eq.${studentId},participant2_id.eq.${studentId}`);

      if (error) throw error;
      setConversations(data);
    } catch {
      Alert.alert("Error", "Error fetching conversations!");
    } finally {
      setLoading(false);
    }
  }, [studentId, setLoading]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  const handleChatPress = (chatId: string, userName: string) => {
    router.push({
      pathname: "/(dash)/individual-chat",
      params: { chatId, userName },
    });
  };

  const renderChatItem = ({ item }: { item: Conversation }) => {
    const otherPersonName: ConversationUser =
      studentId === item.participant1_id
        ? item.participant2
        : item.participant1;
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          handleChatPress(
            item.id,
            `${otherPersonName.first_name} ${otherPersonName.last_name}`
          )
        }
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>
            {otherPersonName.first_name.charAt(0)}
          </ThemedText>
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <ThemedText
              style={styles.chatName}
            >{`${otherPersonName.first_name} ${otherPersonName.last_name}`}</ThemedText>
            <ThemedText style={styles.chatTime}>
              {item.last_message_at}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <View style={styles.header}>
          <ThemedText style={styles.message}>
            Loading conversations...
          </ThemedText>
        </View>
      ) : (
        <>
          {conversations && conversations.length > 0 ? (
            <FlatList
              data={conversations}
              renderItem={renderChatItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.header}>
              <ThemedText style={styles.message}>
                No conversations found.
              </ThemedText>
            </View>
          )}
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
  },
  chatTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    opacity: 0.7,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.light.tint,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
