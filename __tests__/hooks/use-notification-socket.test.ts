import { renderHook, act } from "@testing-library/react-native";
import { useNotificationSocket } from "../../src/hooks/use-notification-socket";
import { socketManager } from "../../src/services/socket-manager";
import { useAuthStore } from "../../src/stores/auth-store";
import { useNotificationStore } from "../../src/stores/notification-store";
import { useQueryClient } from "@tanstack/react-query";

jest.mock("../../src/services/socket-manager", () => ({
  socketManager: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    isConnected: jest.fn(),
    onNotification: jest.fn(),
    offNotification: jest.fn(),
  },
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(),
}));

jest.mock("@react-native-community/netinfo", () => {
  return {
    addEventListener: jest.fn(() => jest.fn()),
  };
});

describe("useNotificationSocket", () => {
  let mockInvalidateQueries: jest.Mock;
  let mockOnNotification: (data: any) => void;

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      token: "fake-jwt-token",
      user: null,
      isAuthenticated: true,
    });
    useNotificationStore.setState({ unreadCount: 0, modalQueue: [] });

    mockInvalidateQueries = jest.fn();
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });

    (socketManager.onNotification as jest.Mock).mockImplementation(
      (callback) => {
        mockOnNotification = callback;
      },
    );
  });

  it("connects with JWT when token is present", () => {
    renderHook(() => useNotificationSocket());
    expect(socketManager.connect).toHaveBeenCalledWith("fake-jwt-token");
    expect(socketManager.onNotification).toHaveBeenCalled();
  });

  it("disconnects when unmounting", () => {
    const { unmount } = renderHook(() => useNotificationSocket());
    unmount();
    expect(socketManager.disconnect).toHaveBeenCalled();
  });

  it("calls handler on notification event updating cache and store", () => {
    renderHook(() => useNotificationSocket());

    act(() => {
      mockOnNotification({ id: "1", title: "Test", priority: "info" });
    });

    expect(useNotificationStore.getState().unreadCount).toBe(1);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["notifications"],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["notifications", "unread-count"],
    });
    expect(useNotificationStore.getState().modalQueue).toHaveLength(0);
  });

  it("handles critical notifications by enqueuing modal", () => {
    renderHook(() => useNotificationSocket());

    const criticalNotif = { id: "2", title: "Critical", priority: "critical" };

    act(() => {
      mockOnNotification(criticalNotif);
    });

    expect(useNotificationStore.getState().modalQueue).toHaveLength(1);
    expect(useNotificationStore.getState().modalQueue[0]).toEqual(
      criticalNotif,
    );
  });
});
