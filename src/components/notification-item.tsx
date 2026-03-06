import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NotificationItem as NotificationType } from "../hooks/use-notifications";
import { PriorityBadge } from "./priority-badge";

interface NotificationItemProps {
  notification: NotificationType;
  onPress?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
}) => {
  const { title, body, priority, isRead, createdAt } = notification;

  // Simple relative time display (e.g. "Just now", "2 hours ago")
  // For simplicity, falling back to a dummy display or DateString if needed
  const dateStr = new Date(createdAt).toLocaleDateString();

  return (
    <TouchableOpacity
      style={[styles.container, isRead ? styles.read : styles.unread]}
      onPress={onPress}
      testID="notification-item"
    >
      <View style={styles.header}>
        <Text style={[styles.title, isRead ? styles.textRead : styles.textUnread]}>
          {title}
        </Text>
        <PriorityBadge priority={priority} />
      </View>
      <Text style={styles.body} numberOfLines={2}>
        {body}
      </Text>
      <Text style={styles.timestamp}>{dateStr}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  unread: {
    backgroundColor: "#f9fafb",
  },
  read: {
    backgroundColor: "#ffffff",
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  textUnread: {
    fontWeight: "bold",
    color: "#111827",
  },
  textRead: {
    fontWeight: "normal",
    color: "#6b7280",
  },
  body: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: "#9ca3af",
  },
});
