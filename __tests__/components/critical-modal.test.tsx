import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { CriticalNotificationModal } from "@/src/components/critical-modal";
import { useNotificationStore } from "@/src/stores/notification-store";
import client from "@/src/api/client";

jest.mock("@/src/api/client", () => ({
  __esModule: true,
  default: {
    POST: jest.fn(),
  },
}));

const mockDequeueModal = jest.fn();

jest.mock("@/src/stores/notification-store", () => ({
  useNotificationStore: jest.fn(),
}));

const mockNotification = {
  id: "notif-123",
  title: "Critical Alert",
  body: "This is a critical notification body",
  priority: "high" as const,
  createdAt: new Date("2026-01-15T10:00:00Z").toISOString(),
};

describe("CriticalNotificationModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNotificationStore as unknown as jest.Mock).mockImplementation(
      (selector: (s: { dequeueModal: jest.Mock }) => unknown) =>
        selector({ dequeueModal: mockDequeueModal }),
    );
    (client.POST as jest.Mock).mockResolvedValue({ data: {}, error: null });
  });

  it("renders notification title, body, and timestamp", () => {
    const { getByText } = render(
      <CriticalNotificationModal notification={mockNotification} />,
    );

    expect(getByText("Critical Alert")).toBeTruthy();
    expect(getByText("This is a critical notification body")).toBeTruthy();
    // Timestamp should appear in some formatted form
    const dateStr = new Date(mockNotification.createdAt).toLocaleDateString();
    expect(getByText(dateStr)).toBeTruthy();
  });

  it("renders the Acknowledge button", () => {
    const { getByText } = render(
      <CriticalNotificationModal notification={mockNotification} />,
    );

    expect(getByText("Acknowledge")).toBeTruthy();
  });

  it("does not close on back press (onRequestClose is a no-op)", () => {
    const { getByTestId } = render(
      <CriticalNotificationModal notification={mockNotification} />,
    );

    // The modal element should be present and visible
    const modal = getByTestId("critical-modal");
    expect(modal).toBeTruthy();

    // Simulate back press - modal should remain visible
    fireEvent(modal, "requestClose");
    expect(mockDequeueModal).not.toHaveBeenCalled();
  });

  it("calls POST /notifications/:id/acknowledge on Acknowledge tap", async () => {
    const { getByText } = render(
      <CriticalNotificationModal notification={mockNotification} />,
    );

    fireEvent.press(getByText("Acknowledge"));

    await waitFor(() => {
      expect(client.POST).toHaveBeenCalledWith(
        "/notifications/{id}/acknowledge",
        {
          params: { path: { id: "notif-123" } },
        },
      );
    });
  });

  it("dequeues from store on successful acknowledge", async () => {
    (client.POST as jest.Mock).mockResolvedValue({ data: {}, error: null });

    const { getByText } = render(
      <CriticalNotificationModal notification={mockNotification} />,
    );

    fireEvent.press(getByText("Acknowledge"));

    await waitFor(() => {
      expect(mockDequeueModal).toHaveBeenCalledTimes(1);
    });
  });

  it("shows error state when acknowledge fails and allows retry", async () => {
    (client.POST as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "Server error" },
    });

    const { getByText } = render(
      <CriticalNotificationModal notification={mockNotification} />,
    );

    fireEvent.press(getByText("Acknowledge"));

    await waitFor(() => {
      // Error message is shown
      expect(getByText(/failed to acknowledge/i)).toBeTruthy();
      // Button text changes to "Retry"
      expect(getByText("Retry")).toBeTruthy();
    });

    expect(mockDequeueModal).not.toHaveBeenCalled();
  });

  it("does not dequeue when API returns an error", async () => {
    (client.POST as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "Network error" },
    });

    const { getByText } = render(
      <CriticalNotificationModal notification={mockNotification} />,
    );

    fireEvent.press(getByText("Acknowledge"));

    await waitFor(() => {
      expect(mockDequeueModal).not.toHaveBeenCalled();
    });
  });
});
