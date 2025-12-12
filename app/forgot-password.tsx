import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedLink } from "@/components/themed-link";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return false;
    }
    setError("");
    return true;
  };

  const handleResetPassword = () => {
    if (validateEmail()) {
      // Handle password reset logic here
      console.log("Reset password for:", email);
      setIsSubmitted(true);
    }
  };

  const handleResendEmail = () => {
    console.log("Resend email to:", email);
  };

  if (isSubmitted) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <ThemedText style={styles.successIcon}>✉️</ThemedText>
          </View>
          <ThemedText style={styles.successTitle}>Check Your Email</ThemedText>
          <ThemedText style={styles.successMessage}>
            We&apos;ve sent a password reset link to:
          </ThemedText>
          <ThemedText style={styles.emailText}>{email}</ThemedText>
          <ThemedText style={styles.instructionText}>
            Click the link in the email to reset your password. If you
            don&apos;t see the email, check your spam folder.
          </ThemedText>

          <ThemedButton
            title="Resend Email"
            onPress={handleResendEmail}
            style={styles.resendButton}
            variant="outline"
          />

          <View style={styles.backToLoginContainer}>
            <ThemedLink href="/" style={styles.backToLoginText}>
              ← Back to Sign In
            </ThemedLink>
          </View>
        </View>
      </ThemedView>
    );
  }

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
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol size={24} color="#842d1c" name="chevron.left" />
              <ThemedText style={styles.backButtonText}>Back</ThemedText>
            </Pressable>
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/students.png")}
                style={styles.logoCircle}
                resizeMode="contain"
              />
            </View>
            <ThemedText style={styles.title}>Forgot Password?</ThemedText>
            <ThemedText style={styles.subtitle}>
              No worries! Enter your email address and we&apos;ll send you a
              link to reset your password.
            </ThemedText>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <ThemedInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={error}
            />

            <ThemedButton
              title="Send Reset Link"
              onPress={handleResetPassword}
              style={styles.resetButton}
            />

            <View style={styles.loginContainer}>
              <ThemedText style={styles.rememberText}>
                Remember your password?{" "}
              </ThemedText>
              <ThemedLink href="/" style={styles.loginText}>
                Sign In
              </ThemedLink>
            </View>
          </View>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <ThemedText style={styles.helpTitle}>Need Help?</ThemedText>
            <ThemedText style={styles.helpText}>
              If you&apos;re having trouble accessing your account, please
              contact our support team.
            </ThemedText>
            <ThemedLink href="/modal" style={styles.contactLink}>
              Contact Support
            </ThemedLink>
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
    marginBottom: 32,
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
    flex: 1,
    marginBottom: 16,
  },
  logoCircle: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#842d1c",
    marginBottom: 18,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formSection: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  resetButton: {
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#842d1c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  rememberText: {
    color: "#666",
    fontSize: 14,
  },
  loginText: {
    color: "#842d1c",
    fontSize: 14,
    fontWeight: "bold",
  },
  helpSection: {
    marginTop: 40,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
  },
  contactLink: {
    color: "#842d1c",
    fontSize: 14,
    fontWeight: "500",
  },
  // Success State Styles
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 80,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#842d1c",
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  resendButton: {
    width: "100%",
    maxWidth: 300,
    marginBottom: 24,
  },
  backToLoginContainer: {
    marginTop: 16,
  },
  backToLoginText: {
    color: "#842d1c",
    fontSize: 16,
    fontWeight: "500",
  },
});
