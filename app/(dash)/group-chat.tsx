import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { Groups } from "@/models/group.model";
import { AppliedUniversity } from "@/models/student.model";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
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

  const handleGroupPress = async (groupId: string, groupName: string) => {
    try {
      // Check if the student is already in the group
      const { data: existingParticipant, error: checkError } = await supabase
        .from("group_participants")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", studentId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "not found", which is expected if not exists
        throw checkError;
      }

      if (existingParticipant) {
        router.push({
          pathname: "/(dash)/group-individual-chat",
          params: { groupId, groupName },
        });
        return;
      }

      // If not exists, add the student to the group
      const { error: error } = await supabase
        .from("group_participants")
        .insert({
          group_id: groupId,
          user_id: studentId,
        });

      if (error) {
        throw error;
      }

      router.push({
        pathname: "/(dash)/group-individual-chat",
        params: { groupId, groupName },
      });
    } catch {
      Alert.alert("Error", "Failed to join group");
    }
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
    if (studentUniversity.length === 0) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("groups")
        .select("*, university(name), courses(name), clubs(name)")
        .or(`group_for.eq.${studentRole},group_for.eq.all`)
        .in("university_id", studentUniversity)
        .order("name", { ascending: true });

      if (error) {
        return;
      }

      if (data) {
        const filteredData = data.filter((group) => {
          // If group has a course requirement, check if student's course matches
          if (group.course_id) {
            return studentCourses.includes(group.course_id);
          }
          // If no course requirement, include the group
          return true;
        });

        const dataWithUnread = await Promise.all(
          filteredData.map(async (group) => {
            const { data: participantData } = await supabase
              .from("group_participants")
              .select("last_read_at")
              .eq("group_id", group.id)
              .eq("user_id", studentId)
              .single();

            const { count } = await supabase
              .from("group_messages")
              .select("*", { count: "exact", head: true })
              .eq("group_id", group.id)
              .gt(
                "created_at",
                participantData?.last_read_at || new Date(0).toISOString()
              );

            return {
              ...group,
              unread_count: count || 0,
            };
          })
        );

        setGroups(dataWithUnread);
      }
    } catch {
      Alert.alert("Error", "Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  }, [studentRole, setLoading, studentCourses, studentUniversity, studentId]);

  useEffect(() => {
    fetchGroups();
  }, [studentUniversity, fetchGroups]);

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [fetchGroups])
  );

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
          <ThemedText style={styles.memberCount}>
            {item.group_for === "all" && "Mixed Group"}
            {item.group_for === "mentor" && "Mentor Group"}
            {item.group_for === "student" && "Student Group"}
          </ThemedText>
        </View>

        <ThemedText
          style={
            item.unread_count && item.unread_count > 0
              ? styles.bubble
              : undefined
          }
        >
          {item.unread_count && item.unread_count > 0
            ? item.unread_count
            : null}
        </ThemedText>
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
  groupInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupHeader: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  bubble: {
    backgroundColor: Colors.light.tint,
    color: "#fff",
    borderRadius: 18,
    paddingHorizontal: 9,
    paddingVertical: 2,
    fontSize: 14,
    fontWeight: "600",
  },
});
