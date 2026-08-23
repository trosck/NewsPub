import request from "supertest";

import { setupMemoryDb, teardownMemoryDb } from "./env";
import { createTestApp, setCookies, cookieHeader } from "./setup";

import type { INestApplication } from "@nestjs/common";

describe("News (e2e)", () => {
  let app: INestApplication;
  let cookieA: string;
  let cookieB: string;
  let authorAId: string;

  const userA = { name: "Author", email: "author@example.com", password: "password123" };
  const userB = { name: "Other", email: "other@example.com", password: "password123" };

  async function login(email: string, password: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email, password });
    return cookieHeader(res);
  }

  beforeAll(async () => {
    await setupMemoryDb();
    app = await createTestApp();
    await app.listen(0);

    const reg = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send(userA)
      .expect(201);
    authorAId = reg.body.user._id;

    await request(app.getHttpServer())
      .post("/api/auth/register")
      .send(userB)
      .expect(201);

    cookieA = await login(userA.email, userA.password);
    cookieB = await login(userB.email, userB.password);
  });

  afterAll(async () => {
    await app.close();
    await teardownMemoryDb();
  });

  it("requires auth on list and get", async () => {
    const list = await request(app.getHttpServer()).get("/api/news").expect(401);
    expect(list.body).toEqual({ error: "Not authorized" });

    const get = await request(app.getHttpServer())
      .get("/api/news/some-slug")
      .expect(401);
    expect(get.body).toEqual({ error: "Not authorized" });
  });

  it("create → 201 with generated slug, author populated", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/news")
      .set("Cookie", cookieA)
      .send({ title: "First Post", content: "Hello world" })
      .expect(201);

    expect(res.body.news.title).toBe("First Post");
    expect(res.body.news.slug).toMatch(/^first-post-/);
    expect(res.body.news.published).toBe(false);
  });

  it("create missing title → 400", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/news")
      .set("Cookie", cookieA)
      .send({ content: "no title" })
      .expect(400);

    expect(res.body).toEqual({ error: "title and content are required" });
  });

  it("create invalid publish_at → 400", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/news")
      .set("Cookie", cookieA)
      .send({ title: "Dated", content: "x", publish_at: "not-a-date" })
      .expect(400);

    expect(res.body).toEqual({
      error: "publish_at must be a valid ISO 8601 date",
    });
  });

  it("list returns only published with pagination and category filter", async () => {
    await request(app.getHttpServer())
      .post("/api/news")
      .set("Cookie", cookieA)
      .send({ title: "Pub One", content: "x", published: true, category: "tech" });
    await request(app.getHttpServer())
      .post("/api/news")
      .set("Cookie", cookieA)
      .send({ title: "Pub Two", content: "x", published: true, category: "news" });
    await request(app.getHttpServer())
      .post("/api/news")
      .set("Cookie", cookieA)
      .send({ title: "Draft One", content: "x" });

    const all = await request(app.getHttpServer())
      .get("/api/news")
      .set("Cookie", cookieA)
      .expect(200);

    expect(all.body.total).toBeGreaterThanOrEqual(2);
    expect(all.body.items.every((n: { published: boolean }) => n.published)).toBe(true);
    expect(all.body.limit).toBe(20);
    expect(all.body.offset).toBe(0);
    expect(all.body.items[0].author.name).toBe(userA.name);

    const tech = await request(app.getHttpServer())
      .get("/api/news?category=tech")
      .set("Cookie", cookieA)
      .expect(200);
    expect(tech.body.total).toBe(1);
    expect(tech.body.items[0].category).toBe("tech");

    const paged = await request(app.getHttpServer())
      .get("/api/news?limit=1&offset=1")
      .set("Cookie", cookieA)
      .expect(200);
    expect(paged.body.items).toHaveLength(1);
    expect(paged.body.limit).toBe(1);
    expect(paged.body.offset).toBe(1);
  });

  it("get by id and by slug; draft hidden from non-author with 404", async () => {
    const created = await request(app.getHttpServer())
      .post("/api/news")
      .set("Cookie", cookieA)
      .send({ title: "Slug Fetch", content: "x" })
      .expect(201);

    const { _id, slug } = created.body.news;

    const byId = await request(app.getHttpServer())
      .get(`/api/news/${_id}`)
      .set("Cookie", cookieA)
      .expect(200);
    expect(byId.body._id).toBe(_id);

    const bySlug = await request(app.getHttpServer())
      .get(`/api/news/${slug}`)
      .set("Cookie", cookieA)
      .expect(200);
    expect(bySlug.body.slug).toBe(slug);

    // draft as non-author → 404
    await request(app.getHttpServer())
      .get(`/api/news/${_id}`)
      .set("Cookie", cookieB)
      .expect(404);

    const missing = await request(app.getHttpServer())
      .get("/api/news/does-not-exist")
      .set("Cookie", cookieA)
      .expect(404);
    expect(missing.body).toEqual({ error: "News not found" });
  });

  it("update by non-author → 403; by author → 200", async () => {
    const created = await request(app.getHttpServer())
      .post("/api/news")
      .set("Cookie", cookieA)
      .send({ title: "Update Me", content: "x" })
      .expect(201);
    const id = created.body.news._id;

    const forbidden = await request(app.getHttpServer())
      .patch(`/api/news/${id}`)
      .set("Cookie", cookieB)
      .send({ title: "Hijack" })
      .expect(403);
    expect(forbidden.body).toEqual({
      error: "Only the author can modify this news",
    });

    const ok = await request(app.getHttpServer())
      .patch(`/api/news/${id}`)
      .set("Cookie", cookieA)
      .send({ title: "Updated Title", published: true })
      .expect(200);
    expect(ok.body.news.title).toBe("Updated Title");
    expect(ok.body.news.published).toBe(true);
  });

  it("slug conflict → 409", async () => {
    const created = await request(app.getHttpServer())
      .post("/api/news")
      .set("Cookie", cookieA)
      .send({ title: "Conflict Base", content: "x", slug: "fixed-slug" })
      .expect(201);
    expect(created.body.news.slug).toBe("fixed-slug");

    const conflict = await request(app.getHttpServer())
      .post("/api/news")
      .set("Cookie", cookieA)
      .send({ title: "Conflict Dup", content: "x", slug: "fixed-slug" })
      .expect(409);
    expect(conflict.body).toEqual({ error: "Slug already in use" });
  });

  it("delete by non-author → 403; by author → 204", async () => {
    const created = await request(app.getHttpServer())
      .post("/api/news")
      .set("Cookie", cookieA)
      .send({ title: "Delete Me", content: "x" })
      .expect(201);
    const id = created.body.news._id;

    const forbidden = await request(app.getHttpServer())
      .delete(`/api/news/${id}`)
      .set("Cookie", cookieB)
      .expect(403);
    expect(forbidden.body).toEqual({
      error: "Only the author can delete this news",
    });

    await request(app.getHttpServer())
      .delete(`/api/news/${id}`)
      .set("Cookie", cookieA)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/api/news/${id}`)
      .set("Cookie", cookieA)
      .expect(404);
  });
});
