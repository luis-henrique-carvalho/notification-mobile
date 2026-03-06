import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  priority: "info" | "warning" | "critical";
  isRead?: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface PaginatedNotifications {
  data: NotificationItem[];
  meta: {
    total?: number;
    lastPage?: number;
    currentPage?: number;
    perPage?: number;
    prev?: number | null;
    next?: number | null;
  };
}

export const useNotificationList = () => {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: async ({ pageParam = 1 }) => {
      const { data, error } = await client.GET("/notifications", {
        params: {
          query: {
            page: pageParam,
            limit: 20,
          },
        },
      });

      if (error) {
        throw new Error("Failed to fetch notifications");
      }

      return data as unknown as PaginatedNotifications;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.meta.lastPage && allPages.length < lastPage.meta.lastPage) {
        return allPages.length + 1;
      }
      return undefined;
    },
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { data, error } = await client.GET("/notifications/unread-count", {});

      if (error) {
        throw new Error("Failed to fetch unread count");
      }

      // the DTO usually returns { count: number } or just the number depending on backend.
      // Based on typical NestJS, it might be { count: number } or similar.
      return (data as any)?.count ?? data ?? 0;
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await client.PATCH("/notifications/{id}/read", {
        params: {
          path: { id },
        },
      });

      if (error) {
        throw new Error("Failed to mark as read");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
};
