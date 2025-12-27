import { ThemedButton } from "@/components/themed-button";
import { ThemedDropdown } from "@/components/themed-dropdown";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { AppliedClubs, AppliedUniversity } from "@/models/student.model";
import { Support, SupportForm } from "@/models/support.model";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type TabType = "all" | "open" | "closed";

const categoryOptions = [
  { label: "Technical", value: "technical" },
  { label: "Account", value: "account" },
  { label: "Billing", value: "billing" },
  { label: "Feature Request", value: "feature_request" },
  { label: "Bug Report", value: "bug_report" },
  { label: "General", value: "general" },
];

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

const requestToOptions = [
  { label: "Admin", value: "admin" },
  { label: "University", value: "university" },
  { label: "Club", value: "club" },
];

const initialFormState: SupportForm = {
  request_to: "admin",
  subject: "",
  category: "general",
  priority: "medium",
  status: "open",
  message: "",
};

export default function SupportScreen() {
  const router = useRouter();
  const { studentTkn, studentId, loading, setLoading } = useAppContext();
  const [tickets, setTickets] = useState<Support[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [formData, setFormData] = useState<SupportForm>(initialFormState);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [studentUniversities, setStudentUniversities] = useState<
    AppliedUniversity[]
  >([]);
  const [studentClubs, setStudentClubs] = useState<AppliedClubs[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch student's universities
  const fetchUniversities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("applied_universities")
        .select("*, university(name)")
        .eq("user_id", studentId!)
        .eq("status", "active");

      if (data && !error) {
        setStudentUniversities(data);
      } else if (error) {
        return;
      }
    } catch {
      Alert.alert("Error", "Error fetching universities!");
    }
  }, [studentId]);

  // Fetch student's clubs
  const fetchClubs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("applied_clubs")
        .select("*, clubs(name)")
        .eq("user_id", studentId!)
        .eq("status", "active");

      if (data && !error) {
        setStudentClubs(data);
      } else if (error) {
        return;
      }
    } catch {
      Alert.alert("Error", "Error fetching clubs!");
    }
  }, [studentId]);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", studentId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch {
      Alert.alert("Error", "Error fetching support tickets!");
    } finally {
      setLoading(false);
    }
  }, [setLoading, studentId]);

  useEffect(() => {
    if (studentTkn) {
      fetchTickets();
      fetchUniversities();
      fetchClubs();
    }
  }, [studentTkn, fetchTickets, fetchUniversities, fetchClubs]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    }
    if (!formData.message.trim()) {
      errors.message = "Message is required";
    }
    if (formData.request_to === "university" && !formData.university_id) {
      errors.university_id = "Please select a university";
    }
    if (formData.request_to === "club" && !formData.club_id) {
      errors.club_id = "Please select a club";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateTicketId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TKT-${timestamp}-${random}`;
  };

  const handleCreateTicket = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const ticketData = {
        ticket_id: generateTicketId(),
        user_id: studentId,
        subject: formData.subject,
        category: formData.category,
        priority: formData.priority,
        status: "open",
        request_to: formData.request_to,
        university_id:
          formData.request_to === "university" ? formData.university_id : null,
        club_id: formData.request_to === "club" ? formData.club_id : null,
      };

      const { data: ticketResult, error: ticketError } = await supabase
        .from("support_tickets")
        .insert(ticketData)
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Create initial message
      const messageData = {
        ticket_id: ticketResult.id,
        sender_id: studentId,
        sender_role: "student",
        message: formData.message,
      };

      const { error: messageError } = await supabase
        .from("support_messages")
        .insert(messageData);

      if (messageError) throw messageError;

      Alert.alert("Success", "Support ticket created successfully!");
      setCreateModalVisible(false);
      setFormData(initialFormState);
      setFormErrors({});
      fetchTickets();
    } catch {
      Alert.alert("Error", "Failed to create support ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormData({ ...initialFormState });
    setFormErrors({});
    setCreateModalVisible(true);
  };

  const handleTicketPress = (ticket: Support) => {
    router.push({
      pathname: "/(dash)/support-individual-chat",
      params: { ticketId: ticket.id },
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "#dc3545";
      case "high":
        return "#fd7e14";
      case "medium":
        return "#ffc107";
      case "low":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "#28a745";
      case "in_progress":
        return "#007bff";
      case "pending_user":
        return "#ffc107";
      case "resolved":
        return "#17a2b8";
      case "closed":
        return "#6c757d";
      default:
        return "#6c757d";
    }
  };

  const renderTicketItem = ({ item }: { item: Support }) => (
    <TouchableOpacity
      style={styles.ticketItem}
      onPress={() => handleTicketPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Ionicons name="help-circle" size={24} color="#fff" />
      </View>
      <View style={styles.ticketInfo}>
        <View style={styles.ticketHeader}>
          <ThemedText style={styles.ticketTitle} numberOfLines={1}>
            {item.subject}
          </ThemedText>
        </View>
        <View style={styles.ticketMeta}>
          <ThemedText style={styles.ticketId}>#{item.ticket_id}</ThemedText>
        </View>
        <View style={styles.ticketFooter}>
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(item.priority) },
              ]}
            >
              <ThemedText style={styles.badgeText}>{item.priority}</ThemedText>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <ThemedText style={styles.badgeText}>
                {item.status.replace("_", " ")}
              </ThemedText>
            </View>
          </View>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: Colors.light.tint },
            ]}
          >
            <ThemedText style={styles.badgeText}>
              {item.category.replace("_", " ")}
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCreateModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={createModalVisible}
      onRequestClose={() => setCreateModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.createModalContent]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setCreateModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

          <ThemedText style={styles.modalTitle}>
            Create Support Ticket
          </ThemedText>

          <ScrollView showsVerticalScrollIndicator={false}>
            <ThemedInput
              label="Subject"
              placeholder="Enter ticket subject"
              value={formData.subject}
              onChangeText={(text) =>
                setFormData({ ...formData, subject: text })
              }
              error={formErrors.subject}
            />

            <ThemedDropdown
              label="Request To"
              placeholder="Select recipient"
              options={requestToOptions}
              value={formData.request_to}
              onSelect={(value) =>
                setFormData({
                  ...formData,
                  request_to: value as "admin" | "university" | "club",
                  university_id: undefined,
                  club_id: undefined,
                })
              }
            />

            {formData.request_to === "university" && (
              <ThemedDropdown
                label="University"
                placeholder="Select university"
                options={studentUniversities
                  .filter((uni) => uni.id !== undefined)
                  .map((uni) => ({
                    label: uni.university?.name || "Unnamed University",
                    value: uni.id!,
                  }))}
                value={formData.university_id || ""}
                onSelect={(value) =>
                  setFormData({ ...formData, university_id: value })
                }
                error={formErrors.university_id}
              />
            )}

            {formData.request_to === "club" && (
              <ThemedDropdown
                label="Club"
                placeholder="Select club"
                options={studentClubs
                  .filter((club) => club.id !== undefined)
                  .map((club) => ({
                    label: club.clubs?.name || "Unnamed Club",
                    value: club.id!,
                  }))}
                value={formData.club_id || ""}
                onSelect={(value) =>
                  setFormData({ ...formData, club_id: value })
                }
                error={formErrors.club_id}
              />
            )}

            <ThemedDropdown
              label="Category"
              placeholder="Select category"
              options={categoryOptions}
              value={formData.category}
              onSelect={(value) =>
                setFormData({
                  ...formData,
                  category: value as SupportForm["category"],
                })
              }
            />

            <ThemedDropdown
              label="Priority"
              placeholder="Select priority"
              options={priorityOptions}
              value={formData.priority}
              onSelect={(value) =>
                setFormData({
                  ...formData,
                  priority: value as SupportForm["priority"],
                })
              }
            />

            <ThemedInput
              label="Message"
              placeholder="Describe your issue in detail"
              value={formData.message}
              onChangeText={(text) =>
                setFormData({ ...formData, message: text })
              }
              multiline
              numberOfLines={4}
              style={styles.textArea}
              error={formErrors.message}
            />

            <View style={styles.formActions}>
              <ThemedButton
                title="Cancel"
                variant="outline"
                onPress={() => setCreateModalVisible(false)}
                style={styles.cancelButton}
              />
              <ThemedButton
                title="Submit"
                onPress={handleCreateTicket}
                loading={submitting}
                style={styles.submitButton}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const getFilteredTickets = () => {
    switch (activeTab) {
      case "open":
        return tickets.filter(
          (t) =>
            t.status === "open" ||
            t.status === "in_progress" ||
            t.status === "pending_user"
        );
      case "closed":
        return tickets.filter(
          (t) => t.status === "closed" || t.status === "resolved"
        );
      default:
        return tickets;
    }
  };

  const currentList = getFilteredTickets();

  return (
    <ThemedView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "all" && styles.activeTabText,
            ]}
          >
            All
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "open" && styles.activeTab]}
          onPress={() => setActiveTab("open")}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "open" && styles.activeTabText,
            ]}
          >
            Open
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "closed" && styles.activeTab]}
          onPress={() => setActiveTab("closed")}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "closed" && styles.activeTabText,
            ]}
          >
            Closed
          </ThemedText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ThemedText style={styles.message}>Loading tickets...</ThemedText>
        </View>
      ) : (
        <>
          {currentList && currentList.length > 0 ? (
            <FlatList
              data={currentList}
              renderItem={renderTicketItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.centerContainer}>
              <ThemedText style={styles.message}>
                {activeTab === "all" && "No support tickets found."}
                {activeTab === "open" && "No open tickets."}
                {activeTab === "closed" && "No closed tickets."}
              </ThemedText>
            </View>
          )}
        </>
      )}

      {/* Floating Create Button */}
      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {renderCreateModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  ticketItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.2)",
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
  ticketInfo: {
    flex: 1,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  ticketMeta: {
    marginBottom: 4,
  },
  ticketId: {
    fontSize: 12,
    opacity: 0.7,
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 4,
  },
  priorityBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxHeight: "85%",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    paddingRight: 30,
    color: "#333",
  },
  ticketDetails: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  messagesTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  messagesList: {
    maxHeight: 200,
    marginBottom: 12,
  },
  noMessages: {
    textAlign: "center",
    color: "#666",
    paddingVertical: 20,
  },
  messageContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    maxWidth: "80%",
  },
  studentMessage: {
    backgroundColor: Colors.light.tint,
    alignSelf: "flex-end",
  },
  supportMessage: {
    backgroundColor: "#e9ecef",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 14,
    color: "#333",
  },
  messageTime: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  },
  messageInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  messageInput: {
    flex: 1,
    marginBottom: 0,
  },
  sendButton: {
    padding: 10,
  },
  // Tab styles
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },
  // FAB styles
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
  // Create modal styles
  createModalContent: {
    maxHeight: "90%",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
