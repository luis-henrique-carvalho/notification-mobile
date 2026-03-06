import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NotificationItem } from "@/src/components/notification-item";

describe("NotificationItem", () => {
  const mockNotification = {
    id: "1",
    title: "Test Title",
    body: "Test Body",
    priority: "low" as const,
    isRead: false,
    createdAt: new Date("2023-01-01T12:00:00Z").toISOString(),
  };

  it("renders title, body, timestamp, and priority badge", () => {
    const { getByText } = render(
      <NotificationItem notification={mockNotification} />,
    );

    expect(getByText("Test Title")).toBeTruthy();
    expect(getByText("Test Body")).toBeTruthy();
    expect(getByText("Low")).toBeTruthy(); // From PriorityBadge

    // Check if the localized date string is rendered
    const dateStr = new Date(mockNotification.createdAt).toLocaleDateString();
    expect(getByText(dateStr)).toBeTruthy();
  });

  it("displays correct priority badge for high", () => {
    const { getByText } = render(
      <NotificationItem
        notification={{ ...mockNotification, priority: "high" }}
      />,
    );

    expect(getByText("High")).toBeTruthy();
  });

  it("calls onPress when tapped", () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <NotificationItem
        notification={mockNotification}
        onPress={onPressMock}
      />,
    );

    const item = getByTestId("notification-item");
    fireEvent.press(item);

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
