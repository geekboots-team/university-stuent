import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedLink } from "@/components/themed-link";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Image } from "expo-image";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (validateForm()) {
      // Handle registration logic here
      console.log("Register with:", { firstName, lastName, email, password });
    }
  };

  return (
    <ThemedView style={styles.container}>
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
            <ThemedText style={styles.title}>Create Account</ThemedText>
            <ThemedText style={styles.subtitle}>
              Join UniversitySeniors.com today
            </ThemedText>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.nameRow}>
              <View style={styles.nameInput}>
                <ThemedInput
                  label="First Name"
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
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
            />

            <ThemedInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              error={errors.password}
            />

            <ThemedInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
              error={errors.confirmPassword}
            />

            <ThemedText style={styles.passwordHint}>
              Password must be at least 8 characters
            </ThemedText>

            <ThemedButton
              title="Create Account"
              onPress={handleRegister}
              style={styles.registerButton}
            />

            <View style={styles.termsContainer}>
              <ThemedText style={styles.termsText}>
                By creating an account, you agree to our{" "}
              </ThemedText>
              <ThemedLink href="/modal" style={styles.termsLink}>
                Terms of Service
              </ThemedLink>
              <ThemedText style={styles.termsText}> and </ThemedText>
              <ThemedLink href="/modal" style={styles.termsLink}>
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
    color: "#842d1c",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
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
    color: "#666",
    marginBottom: 20,
    marginTop: -8,
  },
  registerButton: {
    marginBottom: 16,
    shadowColor: "#842d1c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
