import { API_URL } from "../config.ts";

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const data = (await res.json().catch(() => null)) as unknown;

  if (!res.ok) {
    const message =
      (data as { error?: string } | null)?.error ?? "Request failed";
    throw new Error(message);
  }

  return data as T;
}
