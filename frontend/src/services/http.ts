import { API_PREFIX, API_URL } from "../config.ts";

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${API_PREFIX}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error("Request failed", data);
  }

  return data as T;
}
