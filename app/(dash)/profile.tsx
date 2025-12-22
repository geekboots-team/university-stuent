import { ThemedButton } from "@/components/themed-button";
import { DropdownOption, ThemedDropdown } from "@/components/themed-dropdown";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { AppliedUniversity, Student } from "@/models/student.model";
import { Course, University } from "@/models/university.model";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const genderOptions: DropdownOption[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { studentId, upStudentStatus } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Profile fields based on Student model
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [nativeCourse, setNativeCourse] = useState("");
  const [nativeCity, setNativeCity] = useState("");
  const [nativeState, setNativeState] = useState("");
  const [nativeCountry, setNativeCountry] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Applied Universities
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [appliedUniversities, setAppliedUniversities] = useState<
    AppliedUniversity[]
  >([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [addUniversityModalVisible, setAddUniversityModalVisible] =
    useState(false);
  const [addingUniversity, setAddingUniversity] = useState(false);

  const colorScheme = useColorScheme();

  const fetchUniversities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("university")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching universities:", error);
        return;
      }

      if (data) {
        setUniversities(data);
      }
    } catch (error) {
      console.error("Error fetching universities:", error);
    }
  }, []);

  const fetchCourses = useCallback(async (universityId: string) => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("university_id", universityId)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching courses:", error);
        return;
      }

      if (data) {
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  }, []);

  const fetchAppliedUniversities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("applied_universities")
        .select("*, university:university_id(name), courses:course_id(name)")
        .eq("user_id", studentId);

      if (error) {
        console.error("Error fetching applied universities:", error);
        return;
      }

      if (data) {
        setAppliedUniversities(data);
      }
    } catch (error) {
      console.error("Error fetching applied universities:", error);
    }
  }, [studentId]);

  const fetchStudentData = useCallback(async () => {
    try {
      setFetchingData(true);
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();

      if (error) {
        console.error("Error fetching student data:", error);
        return;
      }

      if (data) {
        const student = data as Student;
        setFirstName(student.first_name || "");
        setLastName(student.last_name || "");
        setGender(student.gender || "");
        setBio(student.bio || "");
        setCity(student.city || "");
        setState(student.state || "");
        setCountry(student.country || "");
        setCollegeName(student.college_name || "");
        setNativeCourse(student.native_course || "");
        setNativeCity(student.native_city || "");
        setNativeState(student.native_state || "");
        setNativeCountry(student.native_country || "");
        setProfilePic(student.profile_pic || "");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setFetchingData(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
      fetchUniversities();
      fetchAppliedUniversities();
    }
  }, [
    studentId,
    fetchStudentData,
    fetchUniversities,
    fetchAppliedUniversities,
  ]);

  useEffect(() => {
    if (selectedUniversity) {
      fetchCourses(selectedUniversity);
      setSelectedCourse("");
    } else {
      setCourses([]);
    }
  }, [selectedUniversity, fetchCourses]);

  const handleAddUniversity = async () => {
    if (!selectedUniversity) {
      Alert.alert("Error", "Please select a university");
      return;
    }

    // Check if already applied
    const alreadyApplied = appliedUniversities.some(
      (au) =>
        au.university_id === selectedUniversity &&
        au.course_id === (selectedCourse || null)
    );

    if (alreadyApplied) {
      Alert.alert(
        "Error",
        "You have already applied to this university/course combination"
      );
      return;
    }

    try {
      setAddingUniversity(true);
      const { error } = await supabase.from("applied_universities").insert({
        user_id: studentId,
        university_id: selectedUniversity,
        course_id: selectedCourse || null,
        status: "pending",
      });

      if (error) {
        console.error("Error adding university:", error);
        Alert.alert("Error", "Failed to add university");
        return;
      }

      await fetchAppliedUniversities();
      setSelectedUniversity("");
      setSelectedCourse("");
      setAddUniversityModalVisible(false);
      Alert.alert("Success", "University added successfully!");
    } catch (error) {
      console.error("Error adding university:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setAddingUniversity(false);
    }
  };

  const openAddUniversityModal = () => {
    setSelectedUniversity("");
    setSelectedCourse("");
    setCourses([]);
    setAddUniversityModalVisible(true);
  };

  const handleRemoveUniversity = async (id: string) => {
    Alert.alert(
      "Remove University",
      "Are you sure you want to remove this university application?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("applied_universities")
                .delete()
                .eq("id", id);

              if (error) {
                console.error("Error removing university:", error);
                Alert.alert("Error", "Failed to remove university");
                return;
              }

              await fetchAppliedUniversities();
            } catch (error) {
              console.error("Error removing university:", error);
              Alert.alert("Error", "An unexpected error occurred");
            }
          },
        },
      ]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!gender) {
      newErrors.gender = "Please select your gender";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("students")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          gender: gender,
          bio: bio.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          college_name: collegeName.trim(),
          native_course: nativeCourse.trim(),
          native_city: nativeCity.trim(),
          native_state: nativeState.trim(),
          native_country: nativeCountry.trim(),
          profile_pic: profilePic,
          status: "active",
        })
        .eq("id", studentId);

      if (error) {
        Alert.alert("Error", "Failed to update profile. Please try again.");
        console.error("Update error:", error);
        return;
      }

      // Update the student status in context
      upStudentStatus("active");

      // Switch back to view mode
      setIsEditing(false);

      Alert.alert("Success", "Profile updated successfully!");
    } catch {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to upload a profile picture."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadImage(imageUri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploadingImage(true);

      //   const imageUrl = await uploadProfileImage(uri, studentId || "");

      // Get file extension
      const ext = uri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${studentId}_${Date.now()}.${ext}`;
      const filePath = `avatars/${fileName}`;

      // Fetch the image and convert to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Convert blob to ArrayBuffer
      const arrayBuffer = await new Response(blob).arrayBuffer();

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, arrayBuffer, {
          contentType: `image/${ext}`,
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        Alert.alert("Error", "Failed to upload image. Please try again.");
        return;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setProfilePic(publicUrl);
      Alert.alert("Success", "Profile picture uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {fetchingData ? (
            <View style={styles.loadingContainer}>
              <ThemedText
                style={[
                  styles.loadingText,
                  { color: Colors[colorScheme ?? "light"].subText },
                ]}
              >
                Loading your profile...
              </ThemedText>
            </View>
          ) : (
            <>
              {/* Profile Picture Section */}
              <View style={styles.profilePicSection}>
                <TouchableOpacity
                  onPress={isEditing ? handlePickImage : undefined}
                  disabled={uploadingImage || !isEditing}
                  style={styles.profilePicContainer}
                >
                  {profilePic ? (
                    <Image
                      source={{ uri: profilePic }}
                      style={styles.profilePic}
                    />
                  ) : (
                    <View
                      style={[
                        styles.profilePicPlaceholder,
                        {
                          backgroundColor:
                            colorScheme === "dark" ? "#333" : "#e0e0e0",
                        },
                      ]}
                    >
                      <Ionicons
                        name="person"
                        size={30}
                        color={Colors[colorScheme ?? "light"].subText}
                      />
                    </View>
                  )}
                  {isEditing && (
                    <View
                      style={[
                        styles.editPicOverlay,
                        {
                          backgroundColor:
                            colorScheme === "dark"
                              ? "rgba(0,0,0,0.6)"
                              : "rgba(0,0,0,0.4)",
                        },
                      ]}
                    >
                      <Ionicons
                        name={uploadingImage ? "hourglass" : "camera"}
                        size={18}
                        color="#fff"
                      />
                    </View>
                  )}
                </TouchableOpacity>
                <View>
                  <ThemedText style={styles.profileName}>
                    {firstName} {lastName}
                  </ThemedText>
                  <ThemedText>{gender}</ThemedText>
                </View>
                <View style={styles.editButtonContainer}>
                  {!isEditing ? (
                    <ThemedButton
                      title="Edit Profile"
                      onPress={() => setIsEditing(true)}
                      variant="outline"
                      size="small"
                    />
                  ) : (
                    <ThemedButton
                      title="Cancel"
                      onPress={() => setIsEditing(false)}
                      variant="outline"
                      size="small"
                    />
                  )}
                </View>
              </View>
              {!isEditing && (
                <>
                  <View style={styles.locationRow}>
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color={Colors[colorScheme ?? "light"].icon}
                      style={styles.locationIcon}
                    />
                    <ThemedText style={styles.locationText}>
                      {[city, state, country].filter(Boolean).join(", ") || "-"}
                    </ThemedText>
                  </View>

                  {(collegeName || nativeCourse) && (
                    <View style={styles.educationRow}>
                      <Ionicons
                        name="school-outline"
                        size={18}
                        color={Colors[colorScheme ?? "light"].icon}
                        style={styles.locationIcon}
                      />
                      <View style={styles.educationDetails}>
                        {collegeName && (
                          <ThemedText style={styles.collegeName}>
                            {collegeName}{" "}
                            {nativeCourse && (
                              <ThemedText style={styles.courseText}>
                                ({nativeCourse})
                              </ThemedText>
                            )}
                          </ThemedText>
                        )}

                        {(nativeCity || nativeState || nativeCountry) && (
                          <ThemedText style={styles.educationLocation}>
                            {[nativeCity, nativeState, nativeCountry]
                              .filter(Boolean)
                              .join(", ")}
                          </ThemedText>
                        )}
                      </View>
                    </View>
                  )}
                </>
              )}

              {/* Edit Button */}

              {/* Basic Information Section */}
              <View
                style={[
                  styles.section,
                  {
                    borderBottomColor: Colors[colorScheme ?? "light"].subText,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.sectionTitle,
                    { color: Colors[colorScheme ?? "light"].icon },
                  ]}
                >
                  {isEditing ? "Basic Information" : "About"}
                </ThemedText>

                {isEditing ? (
                  <>
                    <View style={styles.row}>
                      <View style={styles.halfWidth}>
                        <ThemedInput
                          label="First Name *"
                          placeholder="Enter first name"
                          value={firstName}
                          onChangeText={setFirstName}
                          error={errors.firstName}
                        />
                      </View>
                      <View style={styles.halfWidth}>
                        <ThemedInput
                          label="Last Name *"
                          placeholder="Enter last name"
                          value={lastName}
                          onChangeText={setLastName}
                          error={errors.lastName}
                        />
                      </View>
                    </View>

                    <ThemedDropdown
                      label="Gender *"
                      placeholder="Select gender"
                      options={genderOptions}
                      value={gender}
                      onSelect={setGender}
                      error={errors.gender}
                    />

                    <ThemedInput
                      label="Bio"
                      placeholder="Tell us about yourself..."
                      value={bio}
                      onChangeText={setBio}
                      multiline
                      numberOfLines={3}
                      style={styles.bioInput}
                    />
                  </>
                ) : (
                  <ThemedText>{bio || "-"}</ThemedText>
                )}
              </View>

              {/* Current Location Section */}
              {isEditing && (
                <View
                  style={[
                    styles.section,
                    {
                      borderBottomColor: Colors[colorScheme ?? "light"].subText,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.sectionTitle,
                      { color: Colors[colorScheme ?? "light"].icon },
                    ]}
                  >
                    Current Location
                  </ThemedText>

                  <ThemedInput
                    label="City"
                    placeholder="Enter your city"
                    value={city}
                    onChangeText={setCity}
                  />

                  <View style={styles.row}>
                    <View style={styles.halfWidth}>
                      <ThemedInput
                        label="State"
                        placeholder="Enter state"
                        value={state}
                        onChangeText={setState}
                      />
                    </View>
                    <View style={styles.halfWidth}>
                      <ThemedInput
                        label="Country"
                        placeholder="Enter country"
                        value={country}
                        onChangeText={setCountry}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Native Location Section */}
              {isEditing && (
                <View
                  style={[
                    styles.section,
                    {
                      borderBottomColor: Colors[colorScheme ?? "light"].subText,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.sectionTitle,
                      { color: Colors[colorScheme ?? "light"].icon },
                    ]}
                  >
                    Bachelor Degree
                  </ThemedText>

                  <>
                    <ThemedInput
                      label="College Name"
                      placeholder="Enter your college name"
                      value={collegeName}
                      onChangeText={setCollegeName}
                    />
                    <ThemedInput
                      label="Course Name"
                      placeholder="Enter your course name"
                      value={nativeCourse}
                      onChangeText={setNativeCourse}
                    />

                    <ThemedInput
                      label="City"
                      placeholder="Enter your city"
                      value={nativeCity}
                      onChangeText={setNativeCity}
                    />

                    <View style={styles.row}>
                      <View style={styles.halfWidth}>
                        <ThemedInput
                          label="State"
                          placeholder="Enter state"
                          value={nativeState}
                          onChangeText={setNativeState}
                        />
                      </View>
                      <View style={styles.halfWidth}>
                        <ThemedInput
                          label="Country"
                          placeholder="Enter country"
                          value={nativeCountry}
                          onChangeText={setNativeCountry}
                        />
                      </View>
                    </View>
                  </>
                </View>
              )}

              {/* Applied Universities Section */}
              <View
                style={[
                  styles.section,
                  {
                    borderBottomColor: Colors[colorScheme ?? "light"].subText,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.sectionTitle,
                    { color: Colors[colorScheme ?? "light"].icon },
                  ]}
                >
                  Applied Universities
                </ThemedText>

                {/* List of applied universities */}
                {appliedUniversities.length > 0 && (
                  <View style={styles.appliedList}>
                    {appliedUniversities.map((au) => (
                      <View
                        key={au.id}
                        style={[
                          styles.appliedItem,
                          {
                            backgroundColor:
                              colorScheme === "dark" ? "#333" : "#f5f5f5",
                          },
                        ]}
                      >
                        <View style={styles.appliedItemContent}>
                          <ThemedText style={styles.appliedUniName}>
                            {au.university?.name || "Unknown University"}
                          </ThemedText>
                          {au.courses?.name && (
                            <ThemedText
                              style={[
                                styles.appliedCourseName,
                                {
                                  color: Colors[colorScheme ?? "light"].subText,
                                },
                              ]}
                            >
                              {au.courses.name}
                            </ThemedText>
                          )}
                          <ThemedText
                            style={[
                              styles.appliedStatus,
                              {
                                color:
                                  au.status === "active"
                                    ? "#4CAF50"
                                    : au.status === "rejected"
                                    ? "#f44336"
                                    : "#FF9800",
                              },
                            ]}
                          >
                            {au.status.charAt(0).toUpperCase() +
                              au.status.slice(1)}
                          </ThemedText>
                        </View>
                        <TouchableOpacity
                          onPress={() => au.id && handleRemoveUniversity(au.id)}
                          style={styles.removeButton}
                        >
                          <Ionicons
                            name="close-circle"
                            size={24}
                            color="#f44336"
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Add new university */}
                <View style={styles.addUniversityContainer}>
                  <ThemedButton
                    title="+ Add University"
                    onPress={openAddUniversityModal}
                    variant="primary"
                    size="small"
                  />
                </View>
              </View>

              {/* Submit Button - Only show in edit mode */}
              {isEditing && (
                <View style={styles.buttonContainer}>
                  <View style={styles.buttonRow}>
                    <View style={styles.buttonWrapper}>
                      <ThemedButton
                        title={loading ? "Updating..." : "Update Profile"}
                        onPress={handleUpdateProfile}
                        loading={loading}
                      />
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add University Popup Modal */}
      <Modal
        visible={addUniversityModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setAddUniversityModalVisible(false)}
      >
        <View style={styles.popupOverlay}>
          <View
            style={[
              styles.popupContainer,
              { backgroundColor: Colors[colorScheme ?? "light"].background },
            ]}
          >
            <View style={styles.popupHeader}>
              <ThemedText style={styles.popupTitle}>Add University</ThemedText>
              <TouchableOpacity
                onPress={() => setAddUniversityModalVisible(false)}
                style={styles.popupCloseButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={Colors[colorScheme ?? "light"].text}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.popupContent}>
              <ThemedDropdown
                label="University *"
                placeholder="Select university"
                options={universities.map((uni) => ({
                  label: uni.name,
                  value: uni.id,
                }))}
                value={selectedUniversity}
                onSelect={setSelectedUniversity}
              />

              {selectedUniversity && (
                <ThemedDropdown
                  label="Course (Optional)"
                  placeholder="Select course"
                  options={courses.map((course) => ({
                    label: course.name,
                    value: course.id,
                  }))}
                  value={selectedCourse}
                  onSelect={setSelectedCourse}
                />
              )}

              <View style={styles.popupButtons}>
                <View style={styles.popupButtonWrapper}>
                  <ThemedButton
                    title="Cancel"
                    onPress={() => setAddUniversityModalVisible(false)}
                    variant="outline"
                  />
                </View>
                <View style={styles.popupButtonWrapper}>
                  <ThemedButton
                    title={addingUniversity ? "Adding..." : "Add"}
                    onPress={handleAddUniversity}
                    loading={addingUniversity}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
  },
  bioInput: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  section: {
    marginTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 0.2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
  profilePicSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  profilePicContainer: {
    position: "relative",
    width: 60,
    height: 60,
    borderRadius: 80,
    overflow: "hidden",
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 80,
  },
  profilePicPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  editPicOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  editPicText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
  },
  editButtonContainer: {
    alignItems: "flex-end",
    marginLeft: "auto",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    opacity: 0.8,
  },
  educationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    marginBottom: 8,
  },
  educationDetails: {
    flex: 1,
  },
  collegeName: {
    fontSize: 15,
    fontWeight: "600",
  },
  courseText: {
    fontSize: 12,
    opacity: 0.85,
  },
  educationLocation: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  viewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  viewLabel: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.7,
    flex: 1,
  },
  viewValue: {
    fontSize: 14,
    flex: 2,
    textAlign: "right",
  },
  appliedList: {
    marginBottom: 16,
  },
  appliedItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  appliedItemContent: {
    flex: 1,
  },
  appliedUniName: {
    fontSize: 16,
    fontWeight: "600",
  },
  appliedCourseName: {
    fontSize: 14,
    marginTop: 2,
  },
  appliedStatus: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  removeButton: {
    padding: 4,
  },
  addUniversityContainer: {
    marginTop: 4,
    alignItems: "flex-end",
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  popupContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  popupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  popupCloseButton: {
    padding: 4,
  },
  popupContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  popupButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  popupButtonWrapper: {
    flex: 1,
  },
});
