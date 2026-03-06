import React from "react";
import { TouchableOpacity } from "react-native";
import { render } from "@testing-library/react-native";
import { useNotificationSocket } from "@/src/hooks/use-notification-socket";
import TabLayout from "../_layout";

jest.mock("@/src/hooks/use-notification-socket", () => ({
  useNotificationSocket: jest.fn(),
}));

jest.mock("expo-router", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View: mockView } = require("react-native");
  function TabsMock({ children }: { children: React.ReactNode }) {
    return mockReact.createElement(mockView, { testID: "tabs" }, children);
  }
  TabsMock.Screen = function TabsScreen() {
    return null;
  };
  return {
    Tabs: TabsMock,
    router: { push: jest.fn(), replace: jest.fn() },
  };
});

jest.mock("@/components/ui/icon-symbol", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View: mockView } = require("react-native");
  return {
    IconSymbol: function IconSymbol() {
      return mockReact.createElement(mockView);
    },
  };
});

jest.mock("@/components/haptic-tab", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TouchableOpacity: mockTouchableOpacity } = require("react-native");
  return {
    HapticTab: function HapticTab(
      props: React.ComponentProps<typeof TouchableOpacity>,
    ) {
      return mockReact.createElement(mockTouchableOpacity, props);
    },
  };
});

jest.mock("@/src/components/unread-badge", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View: mockView } = require("react-native");
  return {
    UnreadBadge: function UnreadBadge() {
      return mockReact.createElement(mockView);
    },
  };
});

jest.mock("@/hooks/use-color-scheme", () => ({
  useColorScheme: () => "light",
}));

describe("TabLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls useNotificationSocket when TabLayout mounts", () => {
    render(<TabLayout />);
    expect(useNotificationSocket).toHaveBeenCalledTimes(1);
  });
});
