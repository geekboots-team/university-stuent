import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

// Mock data for group chats
const groupChatList = [
  {
    id: "1",
    name: "CS Study Group",
    lastMessage: "Alice: Anyone up for study session?",
    time: "3:45 PM",
    members: 12,
    unread: 5,
  },
  {
    id: "2",
    name: "Project Team Alpha",
    lastMessage: "Bob: Meeting at 5 PM",
    time: "2:00 PM",
    members: 5,
    unread: 0,
  },
  {
    id: "3",
    name: "Campus Events",
    lastMessage: "Admin: New event this weekend!",
    time: "11:30 AM",
    members: 150,
    unread: 12,
  },
  {
    id: "4",
    name: "Math 101 Help",
    lastMessage: "Charlie: Can someone explain...",
    time: "Yesterday",
    members: 28,
    unread: 0,
  },
  {
    id: "5",
    name: "Senior Year Squad",
    lastMessage: "You: Let's plan the trip!",
    time: "Yesterday",
    members: 8,
    unread: 0,
  },
];

export default function GroupChatScreen() {
  const router = useRouter();

  const handleGroupPress = (groupId: string, groupName: string) => {
    router.push({
      pathname: "/(dash)/group-individual-chat",
      params: { groupId, groupName },
    });
  };

  const renderGroupItem = ({ item }: { item: (typeof groupChatList)[0] }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => handleGroupPress(item.id, item.name)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Ionicons name="people" size={24} color="#fff" />
      </View>
      <View style={styles.groupInfo}>
        <View style={styles.groupHeader}>
          <ThemedText style={styles.groupName}>{item.name}</ThemedText>
          <ThemedText style={styles.groupTime}>{item.time}</ThemedText>
        </View>
        <View style={styles.groupMeta}>
          <ThemedText style={styles.memberCount}>
            {item.members} members
          </ThemedText>
        </View>
        <View style={styles.groupFooter}>
          <ThemedText style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </ThemedText>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <ThemedText style={styles.unreadText}>{item.unread}</ThemedText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={groupChatList}
        renderItem={renderGroupItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  groupItem: {
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
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
  },
  groupTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  groupMeta: {
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 12,
    opacity: 0.5,
  },
  groupFooter: {
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
});
