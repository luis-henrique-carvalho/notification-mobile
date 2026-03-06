import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

/**
 * Auth middleware that injects the JWT from the auth store
 * into the Authorization header of every request.
 *
 * We lazily import the auth store to avoid circular dependencies
 * (auth-store imports client → client imports auth-store).
 */
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    // Lazy import to break circular dependency
    const { useAuthStore } = await import("@/src/stores/auth-store");
    const token = useAuthStore.getState().token;

    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }

    return request;
  },
};

const client = createClient<paths>({ baseUrl: BASE_URL });

client.use(authMiddleware);

export default client;
