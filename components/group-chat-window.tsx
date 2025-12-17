import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { GroupMessage } from "@/models/group.model";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface GroupChatWindowProps {
  /** Messages to display */
  messages: GroupMessage[];
  /** Current user's ID to determine message alignment */
  currentUserId: string;
  /** Whether this is a group chat (shows sender names on received messages) */
  isGroupChat?: boolean;
  /** Callback when send button is pressed */
  onSendMessage: (text: string) => void;
  /** Placeholder text for input */
  inputPlaceholder?: string;
  /** Whether the chat is loading */
  isLoading?: boolean;
}

export function GroupChatWindow({
  messages,
  currentUserId,
  isGroupChat = false,
  onSendMessage,
  inputPlaceholder = "Type a message...",
  isLoading = false,
}: GroupChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(() => {
    const trimmedText = inputText.trim();
    if (trimmedText) {
      onSendMessage(trimmedText);
      setInputText("");
    }
  }, [inputText, onSendMessage]);

  const formatTime = (timestamp: Date | string) => {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = ({
    item,
    index,
  }: {
    item: GroupMessage;
    index: number;
  }) => {
    const isOwn = item.sender_id === currentUserId;
    const showSenderName = isGroupChat && !isOwn && item.sender;

    // Check if we should show the sender name (first message or different sender)
    const previousMessage = index > 0 ? messages[index - 1] : null;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwn ? styles.ownMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isOwn ? styles.ownMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <ThemedText
            style={[
              styles.messageText,
              isOwn ? styles.ownMessageText : styles.otherMessageText,
            ]}
          >
            {item.message}
          </ThemedText>
          <ThemedText
            style={[
              styles.messageTime,
              isOwn ? styles.ownMessageTime : styles.otherMessageTime,
            ]}
          >
            {item.sender_id !== currentUserId ? (
              <>
                {item.sender_type === "admin" && "Admin"}
                {item.sender_type === "moderator" && "Moderator"}
                {item.sender_type === "student" && (
                  <>
                    {item.sender?.first_name} {item.sender?.last_name}
                  </>
                )}
              </>
            ) : (
              "You"
            )}
            {" - "}
            {formatTime(item.created_at)}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Messages List */}
      <KeyboardAvoidingView
        style={styles.messagesWrapper}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          inverted={false}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={64}
                  color={Colors.light.text}
                  style={{ opacity: 0.3 }}
                />
                <ThemedText style={styles.emptyText}>
                  No messages yet. Start the conversation!
                </ThemedText>
              </View>
            ) : null
          }
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={inputPlaceholder}
              placeholderTextColor="rgba(132, 45, 28, 0.5)"
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              onPress={handleSend}
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              activeOpacity={0.7}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? "#fff" : "rgba(255,255,255,0.5)"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesWrapper: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: "80%",
  },
  ownMessageContainer: {
    alignSelf: "flex-end",
  },
  otherMessageContainer: {
    alignSelf: "flex-start",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    marginLeft: 12,
    opacity: 0.7,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: Colors.light.tint,
  },
  ownMessageBubble: {
    borderBottomRightRadius: 3,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 3,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: Colors.light.helpBackground,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  ownMessageTime: {
    color: "rgba(255,255,255,0.7)",
  },
  otherMessageTime: {
    color: Colors.light.background,
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    opacity: 0.5,
    textAlign: "center",
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(132, 45, 28, 0.2)",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
    color: Colors.light.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(132, 45, 28, 0.4)",
  },
});

export default GroupChatWindow;
