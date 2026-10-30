import React, {useState} from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
} from "react-native";

interface LanguageChipGroupProps {
  label?: string;
  languages: string[];
  onAddLanguage: (lang: string) => void;
  onRemoveLanguage: (lang: string) => void;
}

const AVAILABLE_LANGUAGES = [
  "Hindi", "English", "Marathi", "Urdu", "Punjabi",
  "Bengali", "Gujarati", "Tamil", "Telugu", "Kannada", "Malayalam",
];

export const LanguageChipGroup: React.FC<LanguageChipGroupProps> = ({
  label = "Language Known",
  languages,
  onAddLanguage,
  onRemoveLanguage,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [customLang, setCustomLang] = useState("");

  const handleAdd = (lang: string) => {
    if (lang && !languages.includes(lang)) {
      onAddLanguage(lang);
    }
    setModalVisible(false);
    setCustomLang("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.chipsRow}>
        {languages.map((lang, index) => (
          <View key={index} style={styles.chip}>
            <Text style={styles.chipText}>{lang}</Text>
            <TouchableOpacity
              onPress={() => onRemoveLanguage(lang)}
              hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
              style={styles.removeBtn}>
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* + Add More Dashed Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setModalVisible(true)}
          style={styles.addMoreBtn}>
          <Text style={styles.addMoreText}>+ Add More</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for adding language */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Select Languages</Text>

                <View style={styles.langList}>
                  {AVAILABLE_LANGUAGES.map(item => {
                    const isAdded = languages.includes(item);
                    return (
                      <TouchableOpacity
                        key={item}
                        activeOpacity={0.7}
                        onPress={() => {
                          if (!isAdded) handleAdd(item);
                        }}
                        style={[
                          styles.langOption,
                          isAdded && styles.langOptionDisabled,
                        ]}>
                        <Text
                          style={[
                            styles.langOptionText,
                            isAdded && styles.langOptionTextDisabled,
                          ]}>
                          {item} {isAdded ? "✓" : "+"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Custom language input */}
                <View style={styles.customRow}>
                  <TextInput
                    placeholder="Other language..."
                    value={customLang}
                    onChangeText={setCustomLang}
                    placeholderTextColor="#9CA3AF"
                    style={styles.customInput}
                  />
                  <TouchableOpacity
                    onPress={() => handleAdd(customLang.trim())}
                    disabled={!customLang.trim()}
                    style={[
                      styles.customAddBtn,
                      !customLang.trim() && {opacity: 0.5},
                    ]}>
                    <Text style={styles.customAddBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
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
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: "500",
    color: "#1F2937",
    marginRight: 6,
  },
  removeBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "700",
    lineHeight: 16,
  },
  addMoreBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  addMoreText: {
    fontSize: 12.5,
    color: "#6B7280",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },
  langList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  langOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F0FAF5",
    borderWidth: 1,
    borderColor: "#A3E1C1",
  },
  langOptionDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  langOptionText: {
    fontSize: 12.5,
    color: "#114B3E",
    fontWeight: "600",
  },
  langOptionTextDisabled: {
    color: "#9CA3AF",
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
    gap: 8,
  },
  customInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 10,
    fontSize: 13,
    color: "#1F2937",
  },
  customAddBtn: {
    backgroundColor: "#114B3E",
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  customAddBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
