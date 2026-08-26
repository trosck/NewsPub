import type { AuthResponse, User } from "../types.ts";
import { request } from "./http.ts";

function normalizeUser(raw: AuthResponse["user"]): User {
  return {
    id: raw.id ?? raw._id ?? "",
    name: raw.name,
    email: raw.email,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function fetchMe(): Promise<User> {
  const data = await request<{ user: AuthResponse["user"] }>("/auth/me");
  return normalizeUser(data.user);
}

export async function login(email: string, password: string): Promise<User> {
  const data = await request<{ user: AuthResponse["user"] }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  );
  return normalizeUser(data.user);
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const data = await request<{ user: AuthResponse["user"] }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    },
  );
  return normalizeUser(data.user);
}

export async function logout(): Promise<void> {
  await request<{ success?: boolean }>("/auth/logout", {
    method: "POST",
  });
}
