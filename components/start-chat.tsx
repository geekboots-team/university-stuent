import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "./themed-text";

export const startConversation = async (usrId1: string, usrId2: string) => {
  try {
    const { data: existingConversation, error: searchError } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(participant1_id.eq.${usrId1},participant2_id.eq.${usrId2}),` +
          `and(participant1_id.eq.${usrId2},participant2_id.eq.${usrId1})`
      )
      .maybeSingle();

    if (searchError) {
      Alert.alert("Error", "Error searching for conversation");
      return null;
    }

    // Return existing conversation
    if (existingConversation) {
      return existingConversation.id;
    } else {
      const { data: newConversation, error: createError } = await supabase
        .from("conversations")
        .insert({
          participant1_id: usrId1,
          participant2_id: usrId2,
        })
        .select("id")
        .single();

      if (createError) {
        Alert.alert("Error", "Error creating conversation");
        return null;
      }

      return newConversation!.id;
    }
  } catch {
    return null;
  }
};

export default function ChatNow({
  usrId1,
  usrId2,
  uName,
}: {
  usrId1: string;
  usrId2: string;
  uName: string;
}) {
  const router = useRouter();
  const { studentId } = useAppContext();

  const triggerConversation = async () => {
    const conversationId = await startConversation(usrId1, usrId2);
    if (conversationId) {
      router.push({
        pathname: "/(dash)/individual-chat",
        params: {
          chatId: conversationId,
          userId: usrId2 === studentId ? usrId1 : usrId2,
          userName: uName,
        },
      });
    }
  };

  return (
    <TouchableOpacity style={styles.chatButton} onPress={triggerConversation}>
      <Ionicons name="chatbubble" size={20} color="#fff" />
      <ThemedText style={styles.buttonText}>Chat</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chatButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4caf50",
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
