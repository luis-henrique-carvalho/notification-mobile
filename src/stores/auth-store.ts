import { create } from "zustand";

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
  login: (token: string, user: AuthState["user"]) => void;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

/**
 * Auth store managing JWT token and user state.
 * Full implementation in Section 2 (Auth Store & Hook).
 */
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  login: (token, user) => {
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    set({ token: null, user: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    const { getToken } = await import("@/src/utils/secure-storage");
    const token = await getToken();
    if (token) {
      set({ token, isAuthenticated: true });
    }
  },
}));
