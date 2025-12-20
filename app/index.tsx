import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedLink } from "@/components/themed-link";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function LoginScreen() {
  const { loginStudent, studentTkn, loading, setLoading } = useAppContext();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (studentTkn) {
      router.push("/dashboard");
    }
  }, [studentTkn, router]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert("Login Failed", error.message);
        return;
      }

      const { data: userData } = await supabase
        .from("students")
        .select("*")
        .eq("id", data?.user?.id)
        .single();

      if (userData?.status === "active" || userData?.status === "approved") {
        Alert.alert("Success", "Login successful!");

        loginStudent(
          data?.session?.access_token || "",
          data?.session?.refresh_token || "",
          data?.user?.id,
          userData.first_name,
          userData.role,
          userData.status,
          userData.language
        );

        router.replace("/dashboard");
      } else {
        Alert.alert(
          "Error",
          "Your account is not yet approved/suspended. Please contact support."
        );
        setLoading(false);
        return;
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
            <View style={styles.logoText}>
              <ThemedText style={styles.brandName}>
                UniversitySeniors.com
              </ThemedText>
              <ThemedText style={styles.tagline}>
                &ldquo;Living it now&rdquo;
              </ThemedText>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <ThemedInput
              label="Email"
              labelStyle={{ color: Colors.light.text }}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <ThemedInput
              label="Password"
              labelStyle={{ color: Colors.light.text }}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            <View style={styles.forgotPassword}>
              <ThemedLink
                href="/forgot-password"
                underline={false}
                style={styles.forgotPasswordText}
              >
                Forgot Password?
              </ThemedLink>
            </View>

            <ThemedButton
              title={loading ? "Signing In..." : "Sign In"}
              onPress={handleSignIn}
              style={styles.signInButton}
              loading={loading}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <ThemedText style={styles.dividerText}>or</ThemedText>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.createAccountContainer}>
              <ThemedText style={styles.noAccountText}>
                Don&apos;t have an account?{" "}
              </ThemedText>
              <ThemedLink href="/register" style={styles.createAccountText}>
                Create Account
              </ThemedLink>
            </View>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            <ThemedText style={styles.secureText}>
              🔒 Secure login • Your data is protected
            </ThemedText>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: "center",
    gap: 5,
    marginBottom: 20,
  },
  logoText: {
    flex: 1,
  },
  logoContainer: {
    flex: 1,
    marginBottom: 16,
  },
  logoCircle: {
    width: 150,
    height: 150,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#842d1c",
    marginBottom: 8,
    paddingTop: 10,
  },
  tagline: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#282828",
  },
  formSection: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  signInTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#842d1c",
    marginBottom: 24,
    textAlign: "center",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#842d1c",
    fontSize: 14,
    fontWeight: "500",
  },
  signInButton: {
    marginBottom: 24,
    shadowColor: "#842d1c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingIndicator: {
    marginTop: -16,
    marginBottom: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
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
  createAccountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  noAccountText: {
    color: "#666",
    fontSize: 14,
  },
  createAccountText: {
    color: "#842d1c",
    fontSize: 14,
    fontWeight: "bold",
  },
  footerSection: {
    marginTop: 40,
    alignItems: "center",
  },
  secureText: {
    color: "#666",
    fontSize: 12,
  },
});
