import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  Notification,
  useNotificationStore,
} from "../stores/notification-store";
import client from "../api/client";

interface CriticalNotificationModalProps {
  notification: Notification;
}

export const CriticalNotificationModal: React.FC<
  CriticalNotificationModalProps
> = ({ notification }) => {
  const dequeueModal = useNotificationStore((state) => state.dequeueModal);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateStr = new Date(notification.createdAt).toLocaleDateString();

  const handleAcknowledge = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: apiError } = await client.POST(
        "/notifications/{id}/acknowledge",
        {
          params: { path: { id: notification.id } },
        },
      );

      if (apiError) {
        setError("Failed to acknowledge. Please retry.");
        return;
      }

      dequeueModal();
    } catch {
      setError("Failed to acknowledge. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      testID="critical-modal"
      visible
      transparent={false}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => {
        // Intentionally no-op: critical modals must be explicitly acknowledged
      }}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.criticalBadge}>
              <Text style={styles.criticalBadgeText}>⚠ CRITICAL</Text>
            </View>
          </View>

          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.body}>{notification.body}</Text>
          <Text style={styles.timestamp}>{dateStr}</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleAcknowledge}
            disabled={isLoading}
            testID="acknowledge-button"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {error ? "Retry" : "Acknowledge"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  criticalBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  criticalBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#fca5a5",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
