import {
  useNotificationStore,
  type Notification,
} from "@/src/stores/notification-store";

const mockNotification: Notification = {
  id: "notif-1",
  title: "System Update",
  body: "The system will undergo maintenance.",
  priority: "low",
  createdAt: "2026-01-01T00:00:00Z",
};

const mockCriticalNotification: Notification = {
  id: "notif-2",
  title: "Security Alert",
  body: "Unauthorized access detected.",
  priority: "high",
  createdAt: "2026-01-01T01:00:00Z",
};

function resetStore() {
  useNotificationStore.setState({
    unreadCount: 0,
    modalQueue: [],
  });
}

describe("notification-store", () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("should start with unreadCount 0 and empty modalQueue", () => {
      const state = useNotificationStore.getState();
      expect(state.unreadCount).toBe(0);
      expect(state.modalQueue).toEqual([]);
    });
  });

  describe("incrementUnread()", () => {
    it("should increment unreadCount by 1", () => {
      useNotificationStore.getState().incrementUnread();
      expect(useNotificationStore.getState().unreadCount).toBe(1);
    });

    it("should increment unreadCount multiple times", () => {
      const { incrementUnread } = useNotificationStore.getState();
      incrementUnread();
      incrementUnread();
      incrementUnread();
      expect(useNotificationStore.getState().unreadCount).toBe(3);
    });
  });

  describe("decrementUnread()", () => {
    it("should decrement unreadCount by 1", () => {
      useNotificationStore.setState({ unreadCount: 5 });
      useNotificationStore.getState().decrementUnread();
      expect(useNotificationStore.getState().unreadCount).toBe(4);
    });

    it("should not decrement below 0", () => {
      useNotificationStore.setState({ unreadCount: 0 });
      useNotificationStore.getState().decrementUnread();
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
  });

  describe("setUnreadCount()", () => {
    it("should set unreadCount to the given value", () => {
      useNotificationStore.getState().setUnreadCount(42);
      expect(useNotificationStore.getState().unreadCount).toBe(42);
    });

    it("should allow setting unreadCount to 0", () => {
      useNotificationStore.setState({ unreadCount: 10 });
      useNotificationStore.getState().setUnreadCount(0);
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
  });

  describe("enqueueModal()", () => {
    it("should add a notification to the modalQueue", () => {
      useNotificationStore.getState().enqueueModal(mockNotification);
      expect(useNotificationStore.getState().modalQueue).toEqual([
        mockNotification,
      ]);
    });

    it("should append to the end of the modalQueue", () => {
      useNotificationStore.getState().enqueueModal(mockNotification);
      useNotificationStore.getState().enqueueModal(mockCriticalNotification);
      const queue = useNotificationStore.getState().modalQueue;
      expect(queue).toHaveLength(2);
      expect(queue[0]).toEqual(mockNotification);
      expect(queue[1]).toEqual(mockCriticalNotification);
    });
  });

  describe("dequeueModal()", () => {
    it("should remove the first notification from the modalQueue", () => {
      useNotificationStore.getState().enqueueModal(mockNotification);
      useNotificationStore.getState().enqueueModal(mockCriticalNotification);
      useNotificationStore.getState().dequeueModal();
      const queue = useNotificationStore.getState().modalQueue;
      expect(queue).toHaveLength(1);
      expect(queue[0]).toEqual(mockCriticalNotification);
    });

    it("should result in empty queue when dequeuing the last item", () => {
      useNotificationStore.getState().enqueueModal(mockNotification);
      useNotificationStore.getState().dequeueModal();
      expect(useNotificationStore.getState().modalQueue).toEqual([]);
    });

    it("should not throw when dequeuing from an empty queue", () => {
      expect(() => {
        useNotificationStore.getState().dequeueModal();
      }).not.toThrow();
      expect(useNotificationStore.getState().modalQueue).toEqual([]);
    });
  });
});
