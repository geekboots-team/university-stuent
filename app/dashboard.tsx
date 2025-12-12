import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function DashboardScreen() {
  const handleChatPress = () => {
    // Navigate to chat screen
    console.log("Navigate to Chat");
  };

  const handleGroupChatPress = () => {
    // Navigate to group chat screen
    console.log("Navigate to Group Chat");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Dashboard</ThemedText>
        <ThemedText style={styles.subtitle}>
          Welcome to UniversitySeniors.com
        </ThemedText>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionCard}
          onPress={handleChatPress}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
          </View>
          <ThemedText style={styles.optionTitle}>Chat</ThemedText>
          <ThemedText style={styles.optionDescription}>
            Start a private conversation
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={handleGroupChatPress}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="people" size={28} color="#fff" />
          </View>
          <ThemedText style={styles.optionTitle}>Group Chat</ThemedText>
          <ThemedText style={styles.optionDescription}>
            Join or create group discussions
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 24,
    paddingBottom: 100,
  },
  optionCard: {
    backgroundColor: Colors.light.tint,
    borderRadius: 20,
    padding: 24,
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
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
});
