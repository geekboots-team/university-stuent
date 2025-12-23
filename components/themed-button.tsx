import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ThemedText } from "./themed-text";

export type ThemedButtonProps = Omit<PressableProps, "style"> & {
  title: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
};

export function ThemedButton({
  title,
  variant = "primary",
  size = "medium",
  style,
  disabled,
  loading = false,
  ...rest
}: ThemedButtonProps) {
  const tintColor = useThemeColor(
    { light: Colors.light.tint, dark: Colors.dark.tint },
    "tint"
  );
  const getTextColor = () => {
    if (disabled) return "#888";
    switch (variant) {
      case "primary":
        return "#fff";
      case "secondary":
      case "outline":
        return tintColor;
      default:
        return "#fff";
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return "#ccc";
    switch (variant) {
      case "primary":
        return Colors.light.text;
      case "secondary":
        return "#fff";
      case "outline":
        return "transparent";
      default:
        return Colors.light.text;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        size === "small" && styles.small,
        size === "medium" && styles.medium,
        size === "large" && styles.large,
        {
          backgroundColor: getBackgroundColor(),
          opacity: pressed || loading ? 0.8 : 1,
        },
        variant === "outline" && {
          ...styles.outline,
          borderColor: tintColor,
        },
        style,
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={styles.loader}
        />
      ) : (
        <ThemedText
          style={[
            styles.text,
            size === "small" && styles.smallText,
            size === "large" && styles.largeText,
            { color: getTextColor() },
          ]}
        >
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  small: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  outline: {
    borderWidth: 2,
  },
  loader: {
    marginVertical: 2,
  },
  text: {
    fontWeight: "600",
    fontSize: 16,
  },
  smallText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 18,
  },
});
