import React from "react";
import { View, Text, StyleSheet } from "react-native";

export type PriorityLevel = "info" | "warning" | "critical";

interface PriorityBadgeProps {
  priority: PriorityLevel;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getBadgeStyle = () => {
    switch (priority) {
      case "critical":
        return styles.critical;
      case "warning":
        return styles.warning;
      case "info":
      default:
        return styles.info;
    }
  };

  const getLabel = () => {
    switch (priority) {
      case "critical":
        return "Critical";
      case "warning":
        return "Warning";
      case "info":
      default:
        return "Info";
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
  info: {
    backgroundColor: "#3b82f6", // blue-500
  },
  warning: {
    backgroundColor: "#f59e0b", // amber-500
  },
  critical: {
    backgroundColor: "#ef4444", // red-500
  },
});
