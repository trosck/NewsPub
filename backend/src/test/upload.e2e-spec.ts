import request from "supertest";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";

import "./env";
import { AppModule } from "../app.module";
import { setupMemoryDb, teardownMemoryDb } from "./env";
import { cookieHeader } from "./setup";

import type { INestApplication } from "@nestjs/common";
import { TigrisService } from "../modules/upload/tigris.service";

describe("Upload (e2e)", () => {
  let app: INestApplication;
  let cookie: string;

  const user = {
    name: "Uploader",
    email: "uploader@example.com",
    password: "password123",
  };

  beforeAll(async () => {
    await setupMemoryDb();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TigrisService)
      .useValue({
        uploadObject: async () => ({ url: "http://fake/url" }),
      })
      .compile();

    app = moduleRef.createNestApplication({ bodyParser: false });
    app.use(cookieParser());
    await app.init();
    await app.listen(0);

    const reg = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send(user)
      .expect(201);
    cookie = cookieHeader(reg);
  });

  afterAll(async () => {
    await app.close();
    await teardownMemoryDb();
  });

  it("requires auth", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/upload")
      .expect(401);
    expect(res.body).toEqual({ error: "Not authorized" });
  });

  it("no file → 400 File is required", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/upload")
      .set("Cookie", cookie)
      .expect(400);
    expect(res.body).toEqual({ error: "File is required" });
  });

  it("uploads a file → 201 with url/name/size/type", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/upload")
      .set("Cookie", cookie)
      .attach("file", Buffer.from("hello"), "hello.txt")
      .expect(201);

    expect(res.body).toEqual({
      url: "http://fake/url",
      name: "hello.txt",
      size: 5,
      type: "text/plain",
    });
  });
});
