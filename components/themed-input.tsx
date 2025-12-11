import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  label?: string;
  error?: string;
};

export function ThemedInput({
  style,
  lightColor,
  darkColor,
  label,
  error,
  placeholderTextColor,
  ...rest
}: ThemedInputProps) {
  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "text"
  );
  const backgroundColor = useThemeColor(
    { light: "#f5f5f5", dark: "#fff" },
    "background"
  );
  const borderColor = error ? "#ff4444" : "#ccc";
  const placeholderColor = placeholderTextColor ?? "#999";

  return (
    <View style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor,
            borderColor,
            color: textColor,
            outline: "none",
          },
          style,
        ]}
        placeholderTextColor={placeholderColor}
        {...rest}
      />
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    color: "#ff4444",
    marginTop: 4,
  },
});
