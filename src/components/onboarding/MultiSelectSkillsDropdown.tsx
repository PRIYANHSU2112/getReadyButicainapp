import React, {useState} from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";

export const SKILL_CATEGORIES = [
  "Facial",
  "Makeup",
  "Bridal",
  "Skin care",
  "Hair cut",
  "Hair coloring",
  "Hair Spa",
  "Nail Arts",
];

interface MultiSelectSkillsDropdownProps {
  label?: string;
  placeholder?: string;
  selectedSkills: string[];
  onToggleSkill: (skill: string) => void;
  error?: string;
}

export const MultiSelectSkillsDropdown: React.FC<MultiSelectSkillsDropdownProps> = ({
  label = "Select Skills",
  placeholder = "Choose categories",
  selectedSkills,
  onToggleSkill,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const displayText =
    selectedSkills.length > 0
      ? selectedSkills.join(", ")
      : placeholder;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${displayText}`}
        style={[
          styles.inputBox,
          isOpen && styles.inputFocused,
          Boolean(error) && styles.inputError,
        ]}>
        <Text
          numberOfLines={1}
          style={[
            styles.valueText,
            selectedSkills.length === 0 && styles.placeholderText,
          ]}>
          {displayText}
        </Text>
        <Text style={styles.chevronIcon}>⌄</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Floating Checkbox Dropdown Modal matching Screenshot 4 */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Choose Categories</Text>
                  <TouchableOpacity
                    onPress={() => setIsOpen(false)}
                    style={styles.doneBtn}>
                    <Text style={styles.doneBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {SKILL_CATEGORIES.map(category => {
                    const isChecked = selectedSkills.includes(category);
                    return (
                      <TouchableOpacity
                        key={category}
                        activeOpacity={0.7}
                        onPress={() => onToggleSkill(category)}
                        style={styles.optionRow}>
                        {/* Checkbox box */}
                        <View
                          style={[
                            styles.checkbox,
                            isChecked && styles.checkboxChecked,
                          ]}>
                          {isChecked ? (
                            <Text style={styles.checkmarkIcon}>✓</Text>
                          ) : null}
                        </View>

                        <Text
                          style={[
                            styles.optionLabel,
                            isChecked && styles.optionLabelChecked,
                          ]}>
                          {category}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
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
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
    marginRight: 8,
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
    maxHeight: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  doneBtn: {
    backgroundColor: "#114B3E",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.8,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#114B3E", // Deep emerald checked
    borderColor: "#114B3E",
  },
  checkmarkIcon: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 14,
  },
  optionLabel: {
    fontSize: 14.5,
    color: "#374151",
    fontWeight: "500",
  },
  optionLabelChecked: {
    color: "#114B3E",
    fontWeight: "700",
  },
});
