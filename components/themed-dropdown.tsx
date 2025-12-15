import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export type DropdownOption = {
  label: string;
  value: string;
};

export type ThemedDropdownProps = {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value: string;
  onSelect: (value: string) => void;
  error?: string;
  lightColor?: string;
  darkColor?: string;
};

export function ThemedDropdown({
  label,
  placeholder = "Select an option",
  options,
  value,
  onSelect,
  error,
  lightColor,
  darkColor,
}: ThemedDropdownProps) {
  const [visible, setVisible] = useState(false);
  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "text"
  );
  const backgroundColor = useThemeColor(
    { light: "#f5f5f5", dark: "#fff" },
    "background"
  );
  const borderColor = error ? "#ff4444" : "#ccc";

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor,
            borderColor,
          },
        ]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <ThemedText
          style={[
            styles.selectorText,
            { color: selectedOption ? textColor : "#999" },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </ThemedText>
        <ThemedText style={styles.arrow}>▼</ThemedText>
      </TouchableOpacity>
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={[styles.dropdown, { backgroundColor }]}>
              <View style={styles.dropdownHeader}>
                <ThemedText style={styles.dropdownTitle}>
                  {label || "Select an option"}
                </ThemedText>
                <TouchableOpacity onPress={() => setVisible(false)}>
                  <ThemedText style={styles.closeButton}>✕</ThemedText>
                </TouchableOpacity>
              </View>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      item.value === value && styles.selectedOption,
                    ]}
                    onPress={() => {
                      onSelect(item.value);
                      setVisible(false);
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.optionText,
                        item.value === value && styles.selectedOptionText,
                      ]}
                    >
                      {item.label}
                    </ThemedText>
                    {item.value === value && (
                      <ThemedText style={styles.checkmark}>✓</ThemedText>
                    )}
                  </TouchableOpacity>
                )}
                style={styles.optionsList}
              />
            </View>
          </View>
        </Pressable>
      </Modal>
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
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  selectorText: {
    fontSize: 16,
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    color: "#ff4444",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    maxHeight: "70%",
  },
  dropdown: {
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    fontSize: 18,
    color: "#666",
    padding: 4,
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "#fff5f3",
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    color: "#842d1c",
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 16,
    color: "#842d1c",
    fontWeight: "bold",
  },
});
