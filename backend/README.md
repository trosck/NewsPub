# Backend

NestJS + MongoDB + TypeScript API for a news/article publishing application.
Provides JWT authentication, article CRUD with scheduled publishing, realtime
updates over Socket.IO, and S3-compatible file uploads.

## Features

- **Authentication** -- register / login / logout and a `/me` endpoint. JWTs are
  stored in an `httpOnly` cookie (`token`) with `sameSite=strict`; passwords are
  hashed with bcrypt. A `Bearer` token is also accepted.
- **Articles CRUD** -- create / read / update / delete with author-ownership
  checks, automatic slug generation, optional summary & category, and
  `attachments` metadata.
- **Listing** -- list of published news with `limit` / `offset` pagination and
  optional `category` filter, plus single-item lookup by `_id` or `slug`.
- **Scheduled publishing** -- a background service (`NewsPublisherService`)
  flips `published` to `true` for any post whose `publish_at` time has passed,
  then emits realtime update events.
- **Realtime** -- Socket.IO emits `notification` events
  (`news:created`, `news:updated`, `news:deleted`) to authenticated clients.
- **File uploads** -- `multipart/form-data` uploads to S3-compatible storage via
  [Tigris](https://www.tigrisdata.com) (`@tigrisdata/storage`) and Multer.
- **Security & ops** -- Helmet headers, CORS locked to the client URL, structured
  request logging with per-request IDs, graceful shutdown on
  `SIGINT` / `SIGTERM`, and a `/api/health` check.
- **Errors** -- a global exception filter renders every error as
  `{ error: message }` (the shape the frontend expects); non-HTTP errors are
  masked as `500 Internal Server Error`.

## Tech stack

- **Runtime** -- Node.js >= 20, TypeScript
- **Framework** -- NestJS 11 (Express 5 adapter), Helmet, CORS, cookie-parser
- **Data** -- MongoDB via Mongoose 9 (`@nestjs/mongoose`)
- **Auth** -- `@nestjs/jwt`, `bcrypt`
- **Realtime** -- Socket.IO 4 (`@nestjs/websockets`)
- **Storage** -- `@tigrisdata/storage`, Multer
- **Tooling** -- Nest CLI (dev/build), Jest + supertest + mongodb-memory-server
  (e2e tests), Prettier

## Project structure

```
src/
  main.ts             # Bootstrap: middleware stack, pipes, filters, shutdown hooks
  app.module.ts       # Config, logger, Mongoose + feature modules
  app.controller.ts   # GET / banner, GET /api/health
  config/
    configuration.ts  # Env validation (throws at startup on missing vars)
  common/
    filters/          # AllExceptionsFilter -> { error: message }
    guards/           # JwtAuthGuard (cookie "token" or Bearer fallback)
    decorators/       # @CurrentUser()
    utils/            # auth cookie set/clear helpers
  users/              # User model + UsersService
  auth/               # AuthController/Service, global JwtModule, DTOs
  news/               # NewsController/Service, NewsPublisherService, DTOs, schema
  upload/             # UploadController, TigrisService (S3)
  realtime/           # NewsGateway (Socket.IO), RealtimeService (event emitter)
  test/               # Jest e2e specs (supertest + mongodb-memory-server)
```

## Prerequisites

- Node.js >= 20
- pnpm
- A MongoDB instance (Atlas or local)
- An S3-compatible bucket (e.g. Tigris) for file uploads

## Getting started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the example env file and fill in the values:

   ```bash
   cp .env.example .env
   ```

   Required variables:

   | Variable                  | Description                                    |
   | ------------------------- | ---------------------------------------------- |
   | `MONGODB_URI`             | MongoDB connection string                      |
   | `JWT_SECRET`              | Long random secret for signing JWTs            |
   | `JWT_EXPIRES_IN`          | Token lifetime, e.g. `7d` (parsed via `ms`)    |
   | `BCRYPT_SALT_ROUNDS`      | bcrypt cost factor, default `10`               |
   | `NEWS_PUBLISH_INTERVAL_MS`| Scheduler interval, default `60000`            |
   | `CLIENT_URL`              | Frontend origin, used for CORS and Socket.IO   |
   | `S3_ACCESS_KEY_ID`        | S3 access key                                  |
   | `S3_SECRET_ACCESS_KEY`    | S3 secret key                                  |
   | `S3_ENDPOINT`             | S3 endpoint URL                                |
   | `S3_BUCKET`               | Target bucket name                             |

3. Run in development:

   ```bash
   pnpm start:dev
   ```

## Scripts

| Script              | Description                                   |
| ------------------- | --------------------------------------------- |
| `pnpm start:dev`    | Start the API with live reload (nest watch)   |
| `pnpm build`        | Compile to `dist/` via the Nest CLI           |
| `pnpm start`        | Run the compiled server (`dist/main.js`)      |
| `pnpm test`         | Run e2e tests (Jest + in-memory MongoDB)      |
| `pnpm typecheck`    | Type-check without emitting                   |
| `pnpm format`       | Format `src/**` with Prettier                 |
| `pnpm format:check` | Check formatting without writing              |

## API overview

All routes are mounted under `/api`. Authenticated routes require the `token`
cookie (or `Authorization: Bearer <token>`) and return `401 Not authorized`
otherwise.

| Method   | Route                | Auth | Description                                                |
| -------- | -------------------- | ---- | ---------------------------------------------------------- |
| `GET`    | `/api/health`        | -    | Health check                                               |
| `POST`   | `/api/auth/register` | -    | Register, sets cookie, returns user                        |
| `POST`   | `/api/auth/login`    | -    | Login, sets cookie, returns user                           |
| `POST`   | `/api/auth/logout`   | -    | Clears the cookie                                          |
| `GET`    | `/api/me`            | yes  | Current user                                               |
| `GET`    | `/api/news`          | yes  | List published news (`limit`, `offset`, `category`)        |
| `GET`    | `/api/news/:id`      | yes  | Get one by `_id` or `slug` (drafts only visible to author) |
| `POST`   | `/api/news`          | yes  | Create                                                     |
| `PATCH`  | `/api/news/:id`      | yes  | Update (author only)                                       |
| `DELETE` | `/api/news/:id`      | yes  | Delete (author only)                                       |
| `POST`   | `/api/upload`        | yes  | Upload a file (`multipart/form-data`, field `file`)        |

## Realtime

On startup the Socket.IO gateway attaches to the HTTP server and authenticates
each connection using the `token` cookie. News mutations and the scheduled
publisher emit a `notification` event to all connected clients:

```ts
{
  type: "news:created" | "news:updated" | "news:deleted";
  data: {
    id: string;
  }
}
```
