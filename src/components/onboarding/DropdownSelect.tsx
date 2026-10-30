import React, {useState} from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";

interface DropdownSelectProps {
  label: string;
  placeholder?: string;
  value?: string;
  options: string[];
  onSelect: (option: string) => void;
  error?: string;
}

export const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  placeholder = "Select Option",
  value,
  options,
  onSelect,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || placeholder}`}
        style={[
          styles.inputBox,
          isOpen && styles.inputFocused,
          Boolean(error) && styles.inputError,
        ]}>
        <Text
          style={[
            styles.valueText,
            !value && styles.placeholderText,
          ]}>
          {value || placeholder}
        </Text>
        <Text style={styles.chevronIcon}>⌄</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Floating Options Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownCard}>
                <Text style={styles.dropdownTitle}>{label}</Text>
                {options.map((opt, idx) => {
                  const isSelected = value === opt;
                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.7}
                      onPress={() => handleSelect(opt)}
                      style={[
                        styles.optionRow,
                        isSelected && styles.optionSelected,
                      ]}>
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}>
                        {opt}
                      </Text>
                      {isSelected ? (
                        <Text style={styles.checkIcon}>✓</Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  inputBox: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputFocused: {
    borderColor: "#114B3E",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  valueText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  placeholderText: {
    color: "#9CA3AF",
    fontWeight: "400",
  },
  chevronIcon: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: -4,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dropdownCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionSelected: {
    backgroundColor: "#F0FAF5",
  },
  optionText: {
    fontSize: 14.5,
    color: "#374151",
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#114B3E",
    fontWeight: "700",
  },
  checkIcon: {
    color: "#114B3E",
    fontSize: 16,
    fontWeight: "700",
  },
});
