import {
  type StyleProp,
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  error?: string;
};

export function ThemedInput({
  style,
  lightColor,
  darkColor,
  label,
  labelStyle,
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
  const borderColor = error ? "#ff4444" : "#f0f0f0";
  const placeholderColor = placeholderTextColor ?? "#999";

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText style={[styles.label, labelStyle]}>{label}</ThemedText>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor,
            borderColor,
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
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.light.helpBackground,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontWeight: "400",
    color: "#212121",
  },
  error: {
    fontSize: 12,
    color: "#ff4444",
    marginTop: 4,
  },
});
