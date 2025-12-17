import { ThemedButton } from "@/components/themed-button";
import { ThemedDropdown } from "@/components/themed-dropdown";
import { ThemedInput } from "@/components/themed-input";
import { ThemedLink } from "@/components/themed-link";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { University } from "@/models/university.model";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

export default function RegisterScreen() {
  const { studentTkn, loading, setLoading } = useAppContext();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [university, setUniversity] = useState<string>("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (studentTkn) {
      router.push("/dashboard");
    }
  }, [studentTkn, router]);

  const fetchUniversities = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("university")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        Alert.alert("Error", "Failed to fetch universities");
        return;
      }

      if (data) {
        setUniversities(data);
      }
    } catch {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!university) {
      newErrors.university = "Please select a university";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      if (validateForm()) {
        // Handle registration logic here
        const { data: existingStudent, error: checkError } = await supabase
          .from("students")
          .select("email")
          .eq("email", email)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          Alert.alert("Error", "Error checking existing student");
          return;
        }

        if (existingStudent) {
          Alert.alert("Error", "Student with this email already exists");
          return;
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: email,
            password: password,
            options: {
              data: {
                first_name: firstName,
                last_name: lastName,
                is_super_admin: false,
              },
              emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}verify`,
            },
          }
        );

        if (authError) {
          Alert.alert("Error", authError.message);
          return;
        }

        if (!authData.user) {
          Alert.alert("Error", "Failed to create user account");
          return;
        }

        // Insert student data into student table
        // Get selected university details to extract language
        const selectedUniversity = universities.find(
          (uni) => uni.id === university
        );

        const { error: studentError } = await supabase.from("students").insert({
          id: authData.user.id, // Use Auth user ID as primary key
          first_name: firstName,
          last_name: lastName,
          email: email,
          role: "student",
          language: selectedUniversity?.language || null,
          status: "pending",
        });

        if (studentError) {
          Alert.alert("Error", "Failed to create student profile");
          return;
        }

        const { error: uniError } = await supabase
          .from("applied_universities")
          .insert({
            user_id: authData.user.id, // Use Auth user ID as primary key
            university_id: university,
            course_id: null,
            status: "pending",
          });

        if (uniError) {
          Alert.alert("Error", "Failed to create university application");
          return;
        }

        Alert.alert(
          "Success",
          "Account created successfully! Please check your email to verify your account."
        );

        // Redirect to login or verification page
        router.push("/");
      }
    } catch {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: Colors.dark.tint }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/students.png")}
                style={styles.logoCircle}
                resizeMode="contain"
              />
            </View>
            <ThemedText style={[styles.title, { color: Colors.light.text }]}>
              Create Account
            </ThemedText>
            <ThemedText
              style={[styles.subtitle, { color: Colors.light.subText }]}
            >
              Join UniversitySeniors.com today
            </ThemedText>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.nameRow}>
              <View style={styles.nameInput}>
                <ThemedInput
                  label="First Name"
                  labelStyle={{ color: Colors.light.text }}
                  placeholder="First name"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoComplete="given-name"
                  error={errors.firstName}
                />
              </View>
              <View style={styles.nameInput}>
                <ThemedInput
                  label="Last Name"
                  labelStyle={{ color: Colors.light.text }}
                  placeholder="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoComplete="family-name"
                  error={errors.lastName}
                />
              </View>
            </View>

            <ThemedInput
              label="Email"
              labelStyle={{ color: Colors.light.text }}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
            />

            <ThemedDropdown
              label="University"
              labelStyle={{ color: Colors.light.text }}
              placeholder="Select your university"
              options={universities.map((uni) => ({
                label: uni.name,
                value: uni.id,
              }))}
              value={university}
              onSelect={setUniversity}
              error={errors.university}
            />

            <ThemedInput
              label="Password"
              labelStyle={{ color: Colors.light.text }}
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              error={errors.password}
            />

            <ThemedInput
              label="Confirm Password"
              labelStyle={{ color: Colors.light.text }}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
              error={errors.confirmPassword}
            />

            <ThemedText
              style={[styles.passwordHint, { color: Colors.light.subText }]}
            >
              Password must be at least 8 characters
            </ThemedText>

            <ThemedButton
              title={loading ? "Creating..." : "Create Account"}
              onPress={handleRegister}
              loading={loading}
            />

            <View style={styles.termsContainer}>
              <ThemedText
                style={[styles.termsText, { color: Colors.light.subText }]}
              >
                By creating an account, you agree to our{" "}
              </ThemedText>
              <ThemedLink
                href="/"
                style={[styles.termsLink, { color: Colors.light.tint }]}
              >
                Terms of Service
              </ThemedLink>
              <ThemedText
                style={[styles.termsText, { color: Colors.light.subText }]}
              >
                {" "}
                and{" "}
              </ThemedText>
              <ThemedLink
                href="/"
                style={[styles.termsLink, { color: Colors.light.tint }]}
              >
                Privacy Policy
              </ThemedLink>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <ThemedText style={styles.dividerText}>or</ThemedText>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.loginContainer}>
              <ThemedText style={styles.hasAccountText}>
                Already have an account?{" "}
              </ThemedText>
              <ThemedLink href="/" style={styles.loginText}>
                Sign In
              </ThemedLink>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  loadingIndicator: {
    marginTop: -16,
    marginBottom: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  backButtonText: {
    color: "#842d1c",
    fontSize: 16,
    fontWeight: "500",
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formSection: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  passwordHint: {
    fontSize: 12,
    marginBottom: 20,
    marginTop: -8,
  },
  termsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 14,
  },
  termsText: {
    fontSize: 12,
    color: "#666",
  },
  termsLink: {
    fontSize: 12,
    color: "#842d1c",
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#fff",
  },
  dividerText: {
    paddingHorizontal: 16,
    color: "#666",
    fontSize: 14,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  hasAccountText: {
    color: "#666",
    fontSize: 14,
  },
  loginText: {
    color: "#842d1c",
    fontSize: 14,
    fontWeight: "bold",
  },
});
