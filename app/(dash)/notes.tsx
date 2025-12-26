import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { UserNote } from "@/models/note.model";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function NotesScreen() {
  const { studentTkn, studentId, loading, setLoading } = useAppContext();
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [selectedNote, setSelectedNote] = useState<UserNote | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", studentId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch {
      Alert.alert("Error", "Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  }, [studentId, setLoading]);

  useEffect(() => {
    if (studentTkn) {
      fetchNotes();
    }
  }, [studentTkn, fetchNotes]);

  const handleCreateNote = async () => {
    if (!noteContent.trim()) {
      Alert.alert("Error", "Please enter some content for your note");
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from("notes").insert({
        user_id: studentId,
        content: noteContent.trim(),
      });

      if (error) throw error;

      Alert.alert("Success", "Note created successfully!");
      setModalVisible(false);
      setNoteContent("");
      fetchNotes();
    } catch {
      Alert.alert("Error", "Failed to create note");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote || !noteContent.trim()) {
      Alert.alert("Error", "Please enter some content for your note");
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from("notes")
        .update({
          content: noteContent.trim(),
        })
        .eq("id", selectedNote.id);

      if (error) throw error;

      Alert.alert("Success", "Note updated successfully!");
      setEditModalVisible(false);
      setNoteContent("");
      setSelectedNote(null);
      fetchNotes();
    } catch {
      Alert.alert("Error", "Failed to update note");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = (note: UserNote) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const { error } = await supabase
              .from("notes")
              .delete()
              .eq("id", note.id);

            if (error) throw error;

            Alert.alert("Success", "Note deleted successfully!");
            fetchNotes();
          } catch {
            Alert.alert("Error", "Failed to delete note");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const openEditModal = (note: UserNote) => {
    setSelectedNote(note);
    setNoteContent(note.content);
    setEditModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderNoteItem = ({ item }: { item: UserNote }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => openEditModal(item)}
      activeOpacity={0.8}
    >
      <View style={styles.noteHeader}>
        <ThemedText style={styles.noteDate}>
          {formatDate(item.updated_at)}
        </ThemedText>
        <TouchableOpacity
          onPress={() => handleDeleteNote(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
      <ThemedText style={styles.noteContent} numberOfLines={4}>
        {item.content}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color="#ccc" />
      <ThemedText style={styles.emptyText}>No notes yet</ThemedText>
      <ThemedText style={styles.emptySubtext}>
        Tap the + button to create your first note
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setNoteContent("");
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Create Note Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>New Note</ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Write your note here..."
              placeholderTextColor="#999"
              multiline
              value={noteContent}
              onChangeText={setNoteContent}
              autoFocus
            />

            <ThemedButton
              title={submitting ? "Creating..." : "Create Note"}
              onPress={handleCreateNote}
              disabled={submitting}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Note Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Edit Note</ThemedText>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Write your note here..."
              placeholderTextColor="#999"
              multiline
              value={noteContent}
              onChangeText={setNoteContent}
              autoFocus
            />

            <ThemedButton
              title={submitting ? "Updating..." : "Update Note"}
              onPress={handleUpdateNote}
              disabled={submitting}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  noteCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: "#888",
  },
  noteContent: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    color: "#666",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: Platform.OS === "ios" ? 10 : 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 350,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 200,
    textAlignVertical: "top",
  },
});
