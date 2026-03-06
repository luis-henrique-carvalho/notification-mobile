import { useAuthStore, type AuthState } from "@/src/stores/auth-store";
import * as SecureStorage from "@/src/utils/secure-storage";

jest.mock("@/src/utils/secure-storage", () => ({
  getToken: jest.fn(),
  setToken: jest.fn(),
  removeToken: jest.fn(),
}));

const mockedStorage = SecureStorage as jest.Mocked<typeof SecureStorage>;

const mockUser: NonNullable<AuthState["user"]> = {
  id: "user-123",
  name: "John Doe",
  email: "john@example.com",
  role: "user",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockToken = "jwt-mock-token";

function resetStore() {
  useAuthStore.setState({
    token: null,
    user: null,
    isAuthenticated: false,
  });
}

describe("auth-store", () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("should start with null token and user, and isAuthenticated false", () => {
      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("login()", () => {
    it("should save token and user, and set isAuthenticated to true", async () => {
      await useAuthStore.getState().login(mockToken, mockUser);

      const state = useAuthStore.getState();
      expect(state.token).toBe(mockToken);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it("should persist the token to secure storage", async () => {
      await useAuthStore.getState().login(mockToken, mockUser);

      expect(mockedStorage.setToken).toHaveBeenCalledWith(mockToken);
    });
  });

  describe("logout()", () => {
    it("should clear token, user, and set isAuthenticated to false", async () => {
      // First login, then logout
      await useAuthStore.getState().login(mockToken, mockUser);
      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it("should remove the token from secure storage", async () => {
      await useAuthStore.getState().login(mockToken, mockUser);
      await useAuthStore.getState().logout();

      expect(mockedStorage.removeToken).toHaveBeenCalled();
    });
  });

  describe("restoreSession()", () => {
    it("should load token from secure storage and set isAuthenticated when token exists", async () => {
      mockedStorage.getToken.mockResolvedValue(mockToken);

      await useAuthStore.getState().restoreSession();

      const state = useAuthStore.getState();
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
    });

    it("should remain unauthenticated when no token in secure storage", async () => {
      mockedStorage.getToken.mockResolvedValue(null);

      await useAuthStore.getState().restoreSession();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
