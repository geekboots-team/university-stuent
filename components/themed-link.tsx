import { Link, type Href } from "expo-router";
import { StyleSheet, type StyleProp, type TextStyle } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";
import { ThemedText } from "./themed-text";

export type ThemedLinkProps = {
  href: Href;
  lightColor?: string;
  darkColor?: string;
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  underline?: boolean;
  asChild?: boolean;
};

export function ThemedLink({
  href,
  lightColor,
  darkColor,
  children,
  style,
  underline = true,
  asChild,
}: ThemedLinkProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "tint");

  return (
    <Link href={href} asChild={asChild}>
      <ThemedText
        style={[styles.link, { color }, underline && styles.underline, style]}
      >
        {children}
      </ThemedText>
    </Link>
  );
}

const styles = StyleSheet.create({
  link: {
    fontSize: 16,
    lineHeight: 24,
  },
  underline: {
    textDecorationLine: "underline",
  },
});
