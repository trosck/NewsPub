import request from "supertest";

import { setupMemoryDb, teardownMemoryDb } from "./env";
import { createTestApp } from "./setup";

import type { INestApplication } from "@nestjs/common";

describe("App (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    await setupMemoryDb();
    app = await createTestApp();
    await app.listen(0);
  });

  afterAll(async () => {
    await app.close();
    await teardownMemoryDb();
  });

  it("GET / returns the banner", async () => {
    const res = await request(app.getHttpServer()).get("/").expect(200);

    expect(res.body).toEqual({
      message: "API is running",
      docs: "/api/health",
    });
  });

  it("GET /api/health returns ok", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/health")
      .expect(200);

    expect(res.body.status).toBe("ok");
    expect(typeof res.body.timestamp).toBe("string");
  });

  it("unknown route returns { error } 404", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/nope")
      .expect(404);

    expect(res.body).toHaveProperty("error");
  });
});
