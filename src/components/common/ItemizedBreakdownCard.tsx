import React from "react";
import {StyleSheet, Text, View, ViewStyle} from "react-native";

export interface ItemizedServiceItem {
  id: string;
  title: string;
  subtitle?: string;
  price: number;
  isMidService?: boolean;
  requestNote?: string;
}

interface ItemizedBreakdownCardProps {
  items: ItemizedServiceItem[];
  style?: ViewStyle;
}

export const ItemizedBreakdownCard: React.FC<ItemizedBreakdownCardProps> = React.memo(({
  items,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {items.map(item => {
        if (item.isMidService) {
          return (
            <View key={item.id} style={styles.midServiceCard}>
              <View style={styles.accentBar} />
              <View style={styles.midServiceContent}>
                <View style={styles.headerRow}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemPriceEmerald}>
                    ₹{item.price.toLocaleString("en-IN")}
                  </Text>
                </View>
                <View style={styles.midServicePill}>
                  <Text style={styles.midServicePillText}>ADDED MID-SERVICE</Text>
                </View>
                {item.requestNote ? (
                  <View style={styles.noteRow}>
                    <Text style={styles.noteIcon}>ⓘ</Text>
                    <Text style={styles.noteText}>{item.requestNote}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        }

        return (
          <View key={item.id} style={styles.standardCard}>
            <View style={styles.headerRow}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemPrice}>
                ₹{item.price.toLocaleString("en-IN")}
              </Text>
            </View>
            {item.subtitle ? (
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  standardCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  midServiceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  accentBar: {
    width: 4.5,
    backgroundColor: "#114B3E",
  },
  midServiceContent: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  itemPriceEmerald: {
    fontSize: 16,
    fontWeight: "800",
    color: "#114B3E",
  },
  itemSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
  },
  midServicePill: {
    alignSelf: "flex-start",
    backgroundColor: "#E6F7F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  midServicePillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#114B3E",
    letterSpacing: 0.5,
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  noteIcon: {
    fontSize: 12,
    color: "#64748B",
    marginRight: 6,
  },
  noteText: {
    fontSize: 12,
    color: "#64748B",
  },
});
