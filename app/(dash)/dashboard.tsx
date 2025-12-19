import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleChatPress = () => {
    router.push("/(dash)/chat");
  };

  const handleGroupChatPress = () => {
    router.push("/(dash)/group-chat");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Dashboard</ThemedText>
        <ThemedText style={styles.subtitle}>
          Welcome to UniversitySeniors
        </ThemedText>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionCard}
          onPress={handleChatPress}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: Colors[colorScheme ?? "light"].text },
            ]}
          >
            <IconSymbol size={28} name="message.fill" color="#fff" />
          </View>
          <ThemedText style={styles.optionTitle}>Chat</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={handleGroupChatPress}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: Colors[colorScheme ?? "light"].text },
            ]}
          >
            <IconSymbol size={28} name="person.3.fill" color="#fff" />
          </View>
          <ThemedText style={styles.optionTitle}>Group Chat</ThemedText>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingBottom: 100,
  },
  optionCard: {
    borderRadius: 100,
    alignItems: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
