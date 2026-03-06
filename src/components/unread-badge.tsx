import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNotificationStore } from "../stores/notification-store";

export const UnreadBadge = () => {
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  if (unreadCount === 0) {
    return null;
  }

  const displayCount = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{displayCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#ef4444", // red-500
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    zIndex: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
  text: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
