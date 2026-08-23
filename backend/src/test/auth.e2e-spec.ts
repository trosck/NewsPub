import request from "supertest";

import { setupMemoryDb, teardownMemoryDb } from "./env";
import { createTestApp, setCookies, cookieHeader } from "./setup";

import type { INestApplication } from "@nestjs/common";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  const user = { name: "Alice", email: "alice@example.com", password: "password123" };

  beforeAll(async () => {
    await setupMemoryDb();
    app = await createTestApp();
    await app.listen(0);
  });

  afterAll(async () => {
    await app.close();
    await teardownMemoryDb();
  });

  it("register → 201, sets cookie, returns user without password", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send(user)
      .expect(201);

    expect(res.body.user.name).toBe(user.name);
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.user.password).toBeUndefined();

    const setCookie = setCookies(res);
    expect(setCookie?.some((c) => c.startsWith("token="))).toBe(true);
    expect(setCookie?.some((c) => c.includes("HttpOnly"))).toBe(true);
  });

  it("register duplicate email → 409 Email already in use", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ name: "Bob", email: user.email, password: "password123" })
      .expect(409);

    expect(res.body).toEqual({ error: "Email already in use" });
  });

  it("register missing fields → 400", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: "x@example.com" })
      .expect(400);

    expect(res.body).toEqual({ error: "name, email and password are required" });
  });

  it("login → 200 with cookie", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password })
      .expect(200);

    expect(res.body.user.email).toBe(user.email);
    expect(
setCookies(res).some((c) => c.startsWith("token=")),
    ).toBe(true);
  });

  it("login wrong password → 401 Invalid credentials", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: user.email, password: "wrong-password" })
      .expect(401);

    expect(res.body).toEqual({ error: "Invalid credentials" });
  });

  it("login missing fields → 400", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: user.email })
      .expect(400);

    expect(res.body).toEqual({ error: "Email and password required" });
  });

  it("GET /api/me with cookie → 200, without → 401", async () => {
    const login = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    const cookie = cookieHeader(login);

    const unauthorized = await request(app.getHttpServer())
      .get("/api/me")
      .expect(401);
    expect(unauthorized.body).toEqual({ error: "Not authorized" });

    const ok = await request(app.getHttpServer())
      .get("/api/me")
      .set("Cookie", cookie)
      .expect(200);
    expect(ok.body.user.email).toBe(user.email);
  });

  it("logout → clears cookie and returns { success: true }", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/logout")
      .expect(200);

    expect(res.body).toEqual({ success: true });
    expect(
setCookies(res).some((c) => c.includes("token=;")),
    ).toBe(true);
  });
});
