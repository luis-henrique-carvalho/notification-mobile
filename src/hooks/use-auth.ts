import client from "@/src/api/client";
import { useAuthStore, type AuthState } from "@/src/stores/auth-store";
import { useRouter } from "expo-router";
import { useCallback } from "react";

interface AuthResponse {
  access_token: string;
  user: NonNullable<AuthState["user"]>;
}

/**
 * Performs login API call, updates store and persists token.
 * Extracted for testability outside React rendering context.
 */
export async function performLogin(email: string, password: string) {
  const { data, error } = await client.POST("/auth/login", {
    body: { email, password },
  });

  if (error) {
    throw new Error(
      (error as Record<string, unknown>).message as string ?? "Login failed"
    );
  }

  const response = data as unknown as AuthResponse;
  await useAuthStore.getState().login(response.access_token, response.user);
}

/**
 * Performs register API call, updates store and persists token.
 * Extracted for testability outside React rendering context.
 */
export async function performRegister(
  name: string,
  email: string,
  password: string
) {
  const { data, error } = await client.POST("/auth/register", {
    body: { name, email, password },
  });

  if (error) {
    throw new Error(
      (error as Record<string, unknown>).message as string ??
        "Registration failed"
    );
  }

  const response = data as unknown as AuthResponse;
  await useAuthStore.getState().login(response.access_token, response.user);
}

/**
 * Hook providing login mutation with redirect on success.
 */
export function useLogin() {
  const router = useRouter();

  const loginMutation = useCallback(
    async (email: string, password: string) => {
      await performLogin(email, password);
      router.replace("/(tabs)");
    },
    [router]
  );

  return { loginMutation };
}

/**
 * Hook providing register mutation with redirect on success.
 */
export function useRegister() {
  const router = useRouter();

  const registerMutation = useCallback(
    async (name: string, email: string, password: string) => {
      await performRegister(name, email, password);
      router.replace("/(tabs)");
    },
    [router]
  );

  return { registerMutation };
}
