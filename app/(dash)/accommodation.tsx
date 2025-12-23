import { ThemedButton } from "@/components/themed-button";
import { ThemedDropdown } from "@/components/themed-dropdown";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { Accommodation, AccommodationForm } from "@/models/accommodation.model";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type TabType = "all" | "my" | "accepted";

const initialFormState: AccommodationForm = {
  user_id: "",
  title: "",
  description: "",
  university_id: "",
  clubs: [],
  mode: "sharing",
  map_url: "",
  is_female: "No",
  status: "active",
};

export default function AccommodationScreen() {
  const { studentTkn, studentId, loading, setLoading } = useAppContext();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [myAccommodations, setMyAccommodations] = useState<Accommodation[]>([]);
  const [selectedAccommodation, setSelectedAccommodation] =
    useState<Accommodation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [formData, setFormData] = useState<AccommodationForm>(initialFormState);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [studentUniversities, setStudentUniversities] = useState<
    { id: string; name: string }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch student's universities
  const fetchStudentUniversities = useCallback(async () => {
    try {
      const { data: appliedData, error: appliedError } = await supabase
        .from("applied_universities")
        .select("university_id")
        .eq("user_id", studentId!)
        .eq("status", "active");

      if (appliedError) throw appliedError;

      if (appliedData && appliedData.length > 0) {
        const universityIds = appliedData.map(
          (item: { university_id: string }) => item.university_id
        );
        const { data: uniData, error: uniError } = await supabase
          .from("university")
          .select("id, name")
          .in("id", universityIds);

        if (uniError) throw uniError;
        setStudentUniversities(uniData || []);
      }
    } catch {
      console.error("Error fetching student universities");
    }
  }, [studentId]);

  const fetchAccommodations = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("accommodations")
        .select(
          `
          *,
          creator:students!user_id(first_name, last_name),
          university:university!university_id(name),
          acceptor:students!accepted_by(first_name, last_name)
        `
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccommodations(data || []);
    } catch {
      Alert.alert("Error", "Error fetching accommodations!");
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const fetchMyAccommodations = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("accommodations")
        .select(
          `
          *,
          creator:students!user_id(first_name, last_name),
          university:university!university_id(name),
          acceptor:students!accepted_by(first_name, last_name)
        `
        )
        .eq("user_id", studentId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMyAccommodations(data || []);
    } catch {
      Alert.alert("Error", "Error fetching your accommodations!");
    } finally {
      setLoading(false);
    }
  }, [setLoading, studentId]);

  useEffect(() => {
    if (studentTkn) {
      fetchAccommodations();
      fetchStudentUniversities();
    }
  }, [studentTkn, fetchAccommodations, fetchStudentUniversities]);

  useEffect(() => {
    if (studentTkn && activeTab === "my") {
      fetchMyAccommodations();
    }
  }, [studentTkn, activeTab, fetchMyAccommodations]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }
    if (!formData.university_id) {
      errors.university_id = "Please select a university";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAccommodation = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const accommodationData = {
        ...formData,
        user_id: studentId,
      };

      const { error } = await supabase
        .from("accommodations")
        .insert(accommodationData);

      if (error) throw error;

      Alert.alert("Success", "Accommodation created successfully!");
      setCreateModalVisible(false);
      setFormData(initialFormState);
      setFormErrors({});
      fetchAccommodations();
      if (activeTab === "my") {
        fetchMyAccommodations();
      }
    } catch {
      Alert.alert("Error", "Failed to create accommodation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccommodation = async (accommodationId: string) => {
    Alert.alert(
      "Delete Accommodation",
      "Are you sure you want to delete this accommodation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await supabase
                .from("accommodations")
                .delete()
                .eq("id", accommodationId);

              if (error) throw error;

              Alert.alert("Success", "Accommodation deleted successfully!");
              setModalVisible(false);
              fetchAccommodations();
              if (activeTab === "my") {
                fetchMyAccommodations();
              }
            } catch {
              Alert.alert("Error", "Failed to delete accommodation");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const openCreateModal = () => {
    setFormData({ ...initialFormState, user_id: studentId || "" });
    setFormErrors({});
    setCreateModalVisible(true);
  };

  const handleAccommodationPress = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation);
    setModalVisible(true);
  };

  const handleOpenMap = (mapUrl: string) => {
    if (mapUrl) {
      Linking.openURL(mapUrl).catch(() => {
        Alert.alert("Error", "Unable to open map URL");
      });
    }
  };

  const handleAcceptAccommodation = async (accommodationId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("accommodations")
        .update({
          accepted_by: studentId,
          status: "accepted",
        })
        .eq("id", accommodationId);

      if (error) throw error;

      Alert.alert("Success", "Accommodation accepted successfully!");
      setModalVisible(false);
      fetchAccommodations();
    } catch {
      Alert.alert("Error", "Failed to accept accommodation");
    } finally {
      setLoading(false);
    }
  };

  const renderAccommodationItem = ({ item }: { item: Accommodation }) => (
    <TouchableOpacity
      style={styles.accommodationItem}
      onPress={() => handleAccommodationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Ionicons name="home" size={24} color="#fff" />
      </View>
      <View style={styles.accommodationInfo}>
        <View style={styles.accommodationHeader}>
          <ThemedText style={styles.accommodationTitle}>
            {item.title}
          </ThemedText>
        </View>
        <View style={styles.accommodationMeta}>
          <ThemedText style={styles.universityName}>
            {item.university?.name || "Unknown University"}
          </ThemedText>
        </View>
        <View style={styles.accommodationFooter}>
          <ThemedText style={styles.creatorName}>
            By: {item.creator?.first_name} {item.creator?.last_name}
          </ThemedText>
          <View
            style={[
              styles.modeBadge,
              {
                backgroundColor:
                  item.mode === "sharing" ? Colors.light.tint : "#6c757d",
              },
            ]}
          >
            <ThemedText style={styles.modeText}>{item.mode}</ThemedText>
          </View>
        </View>
        {item.is_female === "Yes" && (
          <View style={styles.femaleBadge}>
            <ThemedText style={styles.femaleText}>Female Only</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

          {selectedAccommodation && (
            <>
              <ThemedText style={styles.modalTitle}>
                {selectedAccommodation.title}
              </ThemedText>

              <View style={styles.modalSection}>
                <ThemedText style={styles.sectionLabel}>Description</ThemedText>
                <ThemedText style={styles.sectionContent}>
                  {selectedAccommodation.description}
                </ThemedText>
              </View>

              <View style={styles.modalSection}>
                <ThemedText style={styles.sectionLabel}>University</ThemedText>
                <ThemedText style={styles.sectionContent}>
                  {selectedAccommodation.university?.name || "Unknown"}
                </ThemedText>
              </View>

              <View style={styles.modalSection}>
                <ThemedText style={styles.sectionLabel}>Posted By</ThemedText>
                <ThemedText style={styles.sectionContent}>
                  {selectedAccommodation.creator?.first_name}{" "}
                  {selectedAccommodation.creator?.last_name}
                </ThemedText>
              </View>

              <View style={styles.modalRow}>
                <View style={styles.modalSection}>
                  <ThemedText style={styles.sectionLabel}>Mode</ThemedText>
                  <ThemedText style={styles.sectionContent}>
                    {selectedAccommodation.mode}
                  </ThemedText>
                </View>

                <View style={styles.modalSection}>
                  <ThemedText style={styles.sectionLabel}>
                    Female Only
                  </ThemedText>
                  <ThemedText style={styles.sectionContent}>
                    {selectedAccommodation.is_female}
                  </ThemedText>
                </View>
              </View>

              {selectedAccommodation.clubs &&
                selectedAccommodation.clubs.length > 0 && (
                  <View style={styles.modalSection}>
                    <ThemedText style={styles.sectionLabel}>Clubs</ThemedText>
                    <ThemedText style={styles.sectionContent}>
                      {selectedAccommodation.clubs.join(", ")}
                    </ThemedText>
                  </View>
                )}

              <View style={styles.modalActions}>
                {selectedAccommodation.map_url && (
                  <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => handleOpenMap(selectedAccommodation.map_url)}
                  >
                    <Ionicons name="map" size={20} color="#fff" />
                    <ThemedText style={styles.buttonText}>
                      View on Map
                    </ThemedText>
                  </TouchableOpacity>
                )}

                {selectedAccommodation.user_id !== studentId &&
                  selectedAccommodation.status === "active" && (
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() =>
                        handleAcceptAccommodation(selectedAccommodation.id)
                      }
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#fff"
                      />
                      <ThemedText style={styles.buttonText}>Accept</ThemedText>
                    </TouchableOpacity>
                  )}

                {selectedAccommodation.user_id === studentId && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() =>
                      handleDeleteAccommodation(selectedAccommodation.id)
                    }
                  >
                    <Ionicons name="trash" size={20} color="#fff" />
                    <ThemedText style={styles.buttonText}>Delete</ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              {selectedAccommodation.status !== "active" && (
                <View style={styles.statusBadge}>
                  <ThemedText style={styles.statusText}>
                    Status: {selectedAccommodation.status}
                  </ThemedText>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
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
            Create Accommodation
          </ThemedText>

          <ScrollView showsVerticalScrollIndicator={false}>
            <ThemedInput
              label="Title"
              placeholder="Enter accommodation title"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              error={formErrors.title}
            />

            <ThemedInput
              label="Description"
              placeholder="Describe your accommodation"
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
              numberOfLines={4}
              style={styles.textArea}
              error={formErrors.description}
            />

            <ThemedDropdown
              label="University"
              placeholder="Select university"
              options={studentUniversities.map((uni) => ({
                label: uni.name,
                value: uni.id,
              }))}
              value={formData.university_id}
              onSelect={(value) =>
                setFormData({ ...formData, university_id: value })
              }
              error={formErrors.university_id}
            />

            <ThemedDropdown
              label="Mode"
              placeholder="Select mode"
              options={[
                { label: "Sharing", value: "sharing" },
                { label: "Individual", value: "individual" },
              ]}
              value={formData.mode}
              onSelect={(value) => setFormData({ ...formData, mode: value })}
            />

            <ThemedDropdown
              label="Female Only"
              placeholder="Select option"
              options={[
                { label: "No", value: "No" },
                { label: "Yes", value: "Yes" },
              ]}
              value={formData.is_female}
              onSelect={(value) =>
                setFormData({
                  ...formData,
                  is_female: value as "Yes" | "No",
                })
              }
            />

            <ThemedInput
              label="Map URL (Optional)"
              placeholder="Enter Google Maps URL"
              value={formData.map_url}
              onChangeText={(text) =>
                setFormData({ ...formData, map_url: text })
              }
            />

            <View style={styles.formActions}>
              <ThemedButton
                title="Cancel"
                variant="outline"
                onPress={() => setCreateModalVisible(false)}
                style={styles.cancelButton}
              />
              <ThemedButton
                title="Create"
                onPress={handleCreateAccommodation}
                loading={submitting}
                style={styles.submitButton}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const currentList = activeTab === "all" ? accommodations : myAccommodations;

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
            For You
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "my" && styles.activeTab]}
          onPress={() => setActiveTab("my")}
        >
          <ThemedText
            style={[styles.tabText, activeTab === "my" && styles.activeTabText]}
          >
            My List
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "accepted" && styles.activeTab]}
          onPress={() => setActiveTab("accepted")}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "accepted" && styles.activeTabText,
            ]}
          >
            Accepted
          </ThemedText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.header}>
          <ThemedText style={styles.message}>
            Loading accommodations...
          </ThemedText>
        </View>
      ) : (
        <>
          {currentList && currentList.length > 0 ? (
            <FlatList
              data={currentList}
              renderItem={renderAccommodationItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.header}>
              <ThemedText style={styles.message}>
                {activeTab === "all" && "No accommodations found."}
                {activeTab === "my" &&
                  "You haven't created any accommodations yet."}
                {activeTab === "accepted" &&
                  "You haven't accepted any accommodations yet."}
              </ThemedText>
            </View>
          )}
        </>
      )}

      {/* Floating Create Button */}
      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {renderModal()}
      {renderCreateModal()}
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
  listContainer: {
    paddingHorizontal: 16,
  },
  accommodationItem: {
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
  accommodationInfo: {
    flex: 1,
  },
  accommodationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  accommodationTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  accommodationMeta: {
    marginBottom: 4,
  },
  universityName: {
    fontSize: 12,
    opacity: 0.8,
  },
  accommodationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  creatorName: {
    fontSize: 12,
    opacity: 0.7,
  },
  modeBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  modeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  femaleBadge: {
    backgroundColor: "#e91e63",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  femaleText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
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
    maxHeight: "80%",
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
  modalSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
    color: "#666",
  },
  sectionContent: {
    fontSize: 14,
    color: "#333",
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  mapButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4285f4",
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc3545",
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
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
    bottom: 20,
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
    maxHeight: "85%",
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
  statusBadge: {
    marginTop: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    color: "#666",
    textTransform: "capitalize",
  },
});
