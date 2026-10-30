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

interface CalendarDatePickerModalProps {
  label: string;
  value: string;
  onChangeDate: (date: string) => void;
  error?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export const CalendarDatePickerModal: React.FC<CalendarDatePickerModalProps> = ({
  label,
  value,
  onChangeDate,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(1996);
  const [currentMonth, setCurrentMonth] = useState(4); // 0-indexed (4 = May)
  const [selectedDay, setSelectedDay] = useState(19);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Monday = 0

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const monthNum = currentMonth + 1;
    const monthStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
    const formatted = `${dayStr}/${monthStr}/${currentYear}`;
    onChangeDate(formatted);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsOpen(true)}
        style={[
          styles.inputBox,
          isOpen && styles.inputFocused,
          Boolean(error) && styles.inputError,
        ]}>
        <TextInput
          value={value}
          onChangeText={onChangeDate}
          placeholder="DD/MM/YYYY"
          placeholderTextColor="#9CA3AF"
          style={styles.textInput}
          editable={false}
          pointerEvents="none"
        />
        <Text style={styles.calendarIcon}>📅</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Interactive Calendar Modal matching Figma Screenshot 1 */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.calendarCard}>
                {/* Month & Navigation Header */}
                <View style={styles.calendarHeader}>
                  <Text style={styles.monthTitle}>
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </Text>
                  <View style={styles.navArrows}>
                    <TouchableOpacity
                      onPress={handlePrevMonth}
                      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                      style={styles.arrowBtn}>
                      <Text style={styles.arrowText}>‹</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleNextMonth}
                      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                      style={styles.arrowBtn}>
                      <Text style={styles.arrowText}>›</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Weekday Labels: Mo Tu We Th Fr Sa Su */}
                <View style={styles.weekRow}>
                  {WEEK_DAYS.map(day => (
                    <Text key={day} style={styles.weekDayText}>
                      {day}
                    </Text>
                  ))}
                </View>

                {/* Day Grid */}
                <View style={styles.daysGrid}>
                  {/* Empty slots before first day */}
                  {Array.from({length: firstDayIndex}).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.daySlot} />
                  ))}

                  {/* Days 1..N */}
                  {Array.from({length: daysInMonth}).map((_, i) => {
                    const day = i + 1;
                    const isSelected = selectedDay === day;
                    return (
                      <TouchableOpacity
                        key={`day-${day}`}
                        activeOpacity={0.7}
                        onPress={() => handleSelectDay(day)}
                        style={[
                          styles.daySlot,
                          isSelected && styles.daySlotSelected,
                        ]}>
                        <Text
                          style={[
                            styles.dayNumber,
                            isSelected && styles.dayNumberSelected,
                          ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
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
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  calendarIcon: {
    fontSize: 18,
    opacity: 0.7,
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
  calendarCard: {
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
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  navArrows: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  arrowText: {
    fontSize: 18,
    color: "#374151",
    fontWeight: "700",
    lineHeight: 20,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 6,
  },
  weekDayText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#9CA3AF",
    width: 36,
    textAlign: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  daySlot: {
    width: `${100 / 7}%`,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginVertical: 2,
  },
  daySlotSelected: {
    backgroundColor: "#114B3E", // Deep emerald
  },
  dayNumber: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  dayNumberSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
