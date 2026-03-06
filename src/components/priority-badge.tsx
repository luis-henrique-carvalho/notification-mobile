import React from "react";
import { View, Text, StyleSheet } from "react-native";

export type PriorityLevel = "low" | "medium" | "high";

interface PriorityBadgeProps {
  priority: PriorityLevel;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getBadgeStyle = () => {
    switch (priority) {
      case "high":
        return styles.high;
      case "medium":
        return styles.medium;
      case "low":
      default:
        return styles.low;
    }
  };

  const getLabel = () => {
    switch (priority) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
      default:
        return "Low";
    }
  };

  return (
    <View style={[styles.container, getBadgeStyle()]}>
      <Text style={styles.text}>{getLabel()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  low: {
    backgroundColor: "#3b82f6", // blue-500
  },
  medium: {
    backgroundColor: "#f59e0b", // amber-500
  },
  high: {
    backgroundColor: "#ef4444", // red-500
  },
});
