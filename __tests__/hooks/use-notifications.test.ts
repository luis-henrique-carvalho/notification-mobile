import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNotificationList, useUnreadCount, useMarkAsRead } from "../../src/hooks/use-notifications";
import client from "../../src/api/client";
import React, { ReactNode } from "react";

// Mock the openapi-fetch client
jest.mock("../../src/api/client", () => ({
  GET: jest.fn(),
  PATCH: jest.fn(),
}));

describe("use-notifications", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  describe("useNotificationList", () => {
    it("returns paginated data", async () => {
      const mockResponse = {
        data: [
          { id: "1", title: "Test", body: "Body", priority: "info", createdAt: new Date().toISOString() },
        ],
        meta: { lastPage: 2 },
      };

      (client.GET as jest.Mock).mockResolvedValueOnce({
        data: mockResponse,
        error: undefined,
      });

      const { result } = renderHook(() => useNotificationList(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(client.GET).toHaveBeenCalledWith("/notifications", {
        params: { query: { page: 1, limit: 20 } },
      });
      expect(result.current.data?.pages[0]).toEqual(mockResponse);
    });
  });

  describe("useUnreadCount", () => {
    it("reflects server count", async () => {
      (client.GET as jest.Mock).mockResolvedValueOnce({
        data: { count: 5 },
        error: undefined,
      });

      const { result } = renderHook(() => useUnreadCount(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(client.GET).toHaveBeenCalledWith("/notifications/unread-count", {});
      expect(result.current.data).toBe(5);
    });
  });

  describe("useMarkAsRead", () => {
    it("calls PATCH endpoint and invalidates cache", async () => {
      (client.PATCH as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: undefined,
      });

      const { result } = renderHook(() => useMarkAsRead(), { wrapper });

      result.current.mutate("notif-1");

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(client.PATCH).toHaveBeenCalledWith("/notifications/{id}/read", {
        params: { path: { id: "notif-1" } },
      });
    });
  });
});
