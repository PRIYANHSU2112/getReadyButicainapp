import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ViewStyle,
} from "react-native";

interface WorkPortfolioComparisonProps {
  beforeUri?: string;
  afterUri?: string;
  title?: string;
  style?: ViewStyle;
}

const DEFAULT_BEFORE_URI =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80";
const DEFAULT_AFTER_URI =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80";

export const WorkPortfolioComparison: React.FC<WorkPortfolioComparisonProps> = React.memo(({
  beforeUri = DEFAULT_BEFORE_URI,
  afterUri = DEFAULT_AFTER_URI,
  title = "Work Portfolio Entry",
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.imagesRow}>
        {/* Before photo */}
        <View style={styles.imageCard}>
          <Image
            source={{uri: beforeUri}}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.tagPill}>
            <Text style={styles.tagPillText}>Before</Text>
          </View>
        </View>

        {/* After photo */}
        <View style={styles.imageCard}>
          <Image
            source={{uri: afterUri}}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.tagPill}>
            <Text style={styles.tagPillText}>After</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  imagesRow: {
    flexDirection: "row",
    gap: 12,
  },
  imageCard: {
    flex: 1,
    height: 180,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  tagPill: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A",
  },
});
