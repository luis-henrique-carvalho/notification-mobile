import { create } from "zustand";
import { getToken, setToken, removeToken } from "@/src/utils/secure-storage";

export interface AuthState {
  token: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthState["user"]) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

/**
 * Auth store managing JWT token and user state.
 * Persists token to expo-secure-store on login/logout.
 */
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  login: async (token, user) => {
    await setToken(token);
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    await removeToken();
    set({ token: null, user: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    const token = await getToken();
    if (token) {
      set({ token, isAuthenticated: true });
    }
  },
}));
