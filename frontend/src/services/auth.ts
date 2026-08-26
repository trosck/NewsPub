import type { User } from "../types.ts";
import { request } from "./http.ts";

export async function fetchMe() {
  return request<User>("/auth/me");
}

export async function login(email: string, password: string) {
  return request<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name: string, email: string, password: string) {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function logout() {
  await request<void>("/auth/logout", {
    method: "POST",
  });
}
