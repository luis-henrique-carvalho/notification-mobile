import { performLogin, performRegister } from "@/src/hooks/use-auth";
import { useAuthStore, type AuthState } from "@/src/stores/auth-store";
import client from "@/src/api/client";

jest.mock("@/src/api/client", () => ({
  __esModule: true,
  default: {
    POST: jest.fn(),
  },
}));

jest.mock("@/src/utils/secure-storage", () => ({
  getToken: jest.fn(),
  setToken: jest.fn(),
  removeToken: jest.fn(),
}));

const mockedPOST = client.POST as jest.MockedFunction<any>;

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

describe("use-auth", () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe("performLogin", () => {
    it("should call POST /auth/login with email and password", async () => {
      mockedPOST.mockResolvedValue({
        data: { accessToken: mockToken, user: mockUser },
        error: undefined,
      });

      await performLogin("john@example.com", "password123");

      expect(mockedPOST).toHaveBeenCalledWith("/auth/login", {
        body: { email: "john@example.com", password: "password123" },
      });
    });

    it("should store token and user on successful login", async () => {
      mockedPOST.mockResolvedValue({
        data: { accessToken: mockToken, user: mockUser },
        error: undefined,
      });

      await performLogin("john@example.com", "password123");

      const state = useAuthStore.getState();
      expect(state.token).toBe(mockToken);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it("should throw error on login failure with invalid credentials", async () => {
      mockedPOST.mockResolvedValue({
        data: undefined,
        error: { message: "Invalid credentials" },
      });

      await expect(
        performLogin("john@example.com", "wrongpassword")
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw generic error on network failure", async () => {
      mockedPOST.mockRejectedValue(
        new Error("Network error")
      );

      await expect(
        performLogin("john@example.com", "password123")
      ).rejects.toThrow("Network error");
    });
  });

  describe("performRegister", () => {
    it("should call POST /auth/register with name, email and password", async () => {
      mockedPOST.mockResolvedValue({
        data: { accessToken: mockToken, user: mockUser },
        error: undefined,
      });

      await performRegister("John Doe", "john@example.com", "password123");

      expect(mockedPOST).toHaveBeenCalledWith("/auth/register", {
        body: {
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        },
      });
    });

    it("should store token and user on successful registration", async () => {
      mockedPOST.mockResolvedValue({
        data: { accessToken: mockToken, user: mockUser },
        error: undefined,
      });

      await performRegister("John Doe", "john@example.com", "password123");

      const state = useAuthStore.getState();
      expect(state.token).toBe(mockToken);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it("should throw error when registration fails (email already exists)", async () => {
      mockedPOST.mockResolvedValue({
        data: undefined,
        error: { message: "Email already in use" },
      });

      await expect(
        performRegister("John Doe", "john@example.com", "password123")
      ).rejects.toThrow("Email already in use");
    });

    it("should throw generic error on network failure during registration", async () => {
      mockedPOST.mockRejectedValue(
        new Error("Network error")
      );

      await expect(
        performRegister("John Doe", "john@example.com", "password123")
      ).rejects.toThrow("Network error");
    });
  });
});
