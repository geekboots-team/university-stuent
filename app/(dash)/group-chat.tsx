import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { Groups } from "@/models/group.model";
import { AppliedUniversity } from "@/models/student.model";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function GroupChatScreen() {
  const router = useRouter();
  const { studentTkn, studentId, studentRole, loading, setLoading } =
    useAppContext();
  const [groups, setGroups] = useState<Groups[]>([]);
  const [studentUniversity, setStudentUniversity] = useState<string[]>([]);

  const [studentCourses, setStudentCourses] = useState<string[]>([]);
  const [availableUniversities, setAvailableUniversities] = useState<
    { id: string; name: string }[]
  >([]);
  const [availableCourses, setAvailableCourses] = useState<
    { id: string; name: string; university_id: string }[]
  >([]);

  const handleGroupPress = (groupId: string, groupName: string) => {
    router.push({
      pathname: "/(dash)/group-individual-chat",
      params: { groupId, groupName, senderType: studentRole },
    });
  };

  const fetchAvailableUniversities = useCallback(async () => {
    try {
      if (studentUniversity.length === 0) return;

      const { data, error } = await supabase
        .from("university")
        .select("id, name")
        .in("id", studentUniversity)
        .order("name", { ascending: true });

      if (error) throw error;

      if (data) {
        setAvailableUniversities(data);
      }
    } catch {
      Alert.alert("Error", "Error fetching universities!");
    }
  }, [studentUniversity]);

  const fetchAvailableCourses = useCallback(
    async (universityId?: string) => {
      try {
        if (studentCourses.length === 0) return;

        let query = supabase
          .from("courses")
          .select("id, name, university_id")
          .in("id", studentCourses)
          .order("name", { ascending: true });

        if (universityId && universityId !== "all") {
          query = query.eq("university_id", universityId);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
          setAvailableCourses(data);
        }
      } catch {
        Alert.alert("Error", "Error fetching courses!");
      }
    },
    [studentCourses]
  );

  const fetchUsrProf = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("applied_universities")
        .select("*")
        .eq("status", "active")
        .eq("user_id", studentId!);

      if (error) {
        throw error;
      }

      if (data && !error) {
        const activeUni = data
          .map((uni: AppliedUniversity) => uni.university_id)
          .filter((id): id is string => !!id);
        setStudentUniversity(activeUni);

        const activeCourses = data
          .map((uni: AppliedUniversity) => uni.course_id)
          .filter((id): id is string => !!id);
        setStudentCourses(activeCourses);
      } else if (error) {
        Alert.alert("Error", "Error fetching universities!");
        return;
      }
    } catch {
      Alert.alert("Error", "Error fetching universities!");
    }
  }, [studentId]);

  useEffect(() => {
    if (studentTkn) fetchUsrProf();
  }, [studentTkn, fetchUsrProf]);

  useEffect(() => {
    if (studentUniversity.length > 0) {
      fetchAvailableUniversities();
    }
  }, [studentUniversity, fetchAvailableUniversities]);

  useEffect(() => {
    if (studentCourses.length > 0) {
      fetchAvailableCourses();
    }
  }, [studentCourses, fetchAvailableCourses]);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("groups")
        .select("*, university(name), courses(name), clubs(name)")
        .or(`group_for.eq.${studentRole},group_for.eq.all`)
        .in("university_id", studentUniversity)
        .order("name", { ascending: true });

      if (error) {
        Alert.alert("Error", "Failed to fetch groups");
        return;
      }

      const filteredData = data.filter((group) => {
        // If group has a course requirement, check if student's course matches
        if (group.course_id) {
          return studentCourses.includes(group.course_id);
        }
        // If no course requirement, include the group
        return true;
      });

      setGroups((prev) => {
        const newGroups = filteredData.filter(
          (group) => !prev.some((existing) => existing.id === group.id)
        );
        return [...prev, ...newGroups];
      });
    } catch {
      Alert.alert("Error", "Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  }, [studentRole, setLoading, studentCourses, studentUniversity]);

  useEffect(() => {
    fetchGroups();
  }, [studentUniversity, fetchGroups]);

  const renderGroupItem = ({ item }: { item: Groups }) => (
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
        </View>
        <View style={styles.groupMeta}>
          <ThemedText style={styles.memberCount}>
            {item.group_for === "all" && "Mixed Group"}
            {item.group_for === "mentor" && "Mentor Group"}
            {item.group_for === "student" && "Student Group"}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <View style={styles.header}>
          <ThemedText style={styles.message}>Loading groups...</ThemedText>
        </View>
      ) : (
        <>
          {groups && groups.length > 0 ? (
            <FlatList
              data={groups}
              renderItem={renderGroupItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.header}>
              <ThemedText style={styles.message}>No groups found.</ThemedText>
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
    opacity: 0.8,
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
