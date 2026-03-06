import * as SecureStore from "expo-secure-store";

const AUTH_TOKEN_KEY = "auth_token";

/**
 * Thin wrapper over expo-secure-store for JWT token management.
 */
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}
