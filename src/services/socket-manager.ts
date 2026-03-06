import { io, Socket } from "socket.io-client";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

class SocketManager {
  private socket: Socket | null = null;
  private static instance: SocketManager;
  private notificationCallback: ((data: any) => void) | null = null;

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public connect(token: string) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(BASE_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
    });

    this.socket.on("connect", () => {
      console.log("[SocketManager] Connected to WebSocket");
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`[SocketManager] Disconnected: ${reason}`);
    });

    this.socket.on("connect_error", (error) => {
      console.log(`[SocketManager] Connection Error: ${error.message}`);
    });

    // Re-register stored callback on the new socket
    if (this.notificationCallback) {
      this.socket.on("notification:new", this.notificationCallback);
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  public onNotification(callback: (data: any) => void) {
    this.notificationCallback = callback;

    if (!this.socket) {
      return;
    }

    this.socket.off("notification:new");
    this.socket.on("notification:new", callback);
  }

  public offNotification() {
    this.notificationCallback = null;

    if (this.socket) {
      this.socket.off("notification:new");
    }
  }
}

export const socketManager = SocketManager.getInstance();
