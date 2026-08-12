# Backend

Node.js + Express + MongoDB + TypeScript API for a news/article publishing
application. Provides JWT authentication, article CRUD with scheduled
publishing, realtime updates over Socket.IO, and S3-compatible file uploads.

## Features

- **Authentication** -- register / login / logout and a `/me` endpoint. JWTs are
  stored in an `httpOnly` cookie (`token`) with `sameSite=strict`; passwords are
  hashed with bcrypt. A `Bearer` token is also accepted.
- **Articles CRUD** -- create / read / update / delete with author-ownership
  checks, automatic slug generation, optional summary & category, and
  `attachments` metadata.
- **Listing** -- public list of published news with `limit` / `offset` pagination
  and optional `category` filter, plus single-item lookup by `_id` or `slug`.
- **Scheduled publishing** -- a background timer (`newsPublisher`) flips
  `published` to `true` for any post whose `publish_at` time has passed, then
  emits realtime update events.
- **Realtime** -- Socket.IO emits `notification` events
  (`news:created`, `news:updated`, `news:deleted`) to authenticated clients.
- **File uploads** -- `multipart/form-data` uploads to S3-compatible storage via
  [Tigris](https://www.tigrisdata.com) (`@tigrisdata/storage`) and Multer.
- **Security & ops** -- Helmet headers, CORS locked to the client URL, structured
  request logging with per-request IDs (Pino + pino-http), graceful shutdown on
  `SIGINT` / `SIGTERM`, and a `/api/health` check.

## Tech stack

- **Runtime** -- Node.js >= 20, TypeScript
- **Web** -- Express 5, Helmet, CORS, cookie-parser
- **Data** -- MongoDB via Mongoose 9
- **Auth** -- `jsonwebtoken`, `bcrypt`
- **Realtime** -- Socket.IO 4
- **Storage** -- `@tigrisdata/storage`, Multer
- **Logging** -- Pino, pino-http, pino-pretty
- **Tooling** -- tsx (dev), tsc (build), Prettier, dotenv

## Project structure

```
src/
  app.ts          # Express app factory (middleware + routes)
  server.ts       # Boots DB, HTTP server, socket, scheduler; handles shutdown
  config/
    env.ts        # Loads + validates environment variables
    db.ts         # Mongoose connection
  controllers/    # Route handlers: auth, news, upload
  middleware/
    auth.ts       # Cookie/Bearer JWT verification, attaches req.user
    errors.ts     # ApiError, asyncHandler, 404 + error handlers
  models/         # Mongoose models: User, News
  routes/         # Express routers (auth, news, upload) + index mount
  services/
    socket.ts     # Socket.IO server + auth, news event emitter
    newsPublisher.ts  # Interval that publishes due articles
    tigris.ts     # S3 object upload helper
  types/          # Shared TS types (request, realtime, express decls)
  utils/          # cookie, jwt, logger helpers
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

   | Variable               | Description                                  |
   | ---------------------- | -------------------------------------------- |
   | `MONGODB_URI`          | MongoDB connection string                    |
   | `JWT_SECRET`           | Long random secret for signing JWTs          |
   | `JWT_EXPIRES_IN`       | Token lifetime, e.g. `7d` (parsed via `ms`)  |
   | `BCRYPT_SALT_ROUNDS`   | bcrypt cost factor, default `10`             |
   | `CLIENT_URL`           | Frontend origin, used for CORS and Socket.IO |
   | `S3_ACCESS_KEY_ID`     | S3 / Tigris access key                       |
   | `S3_SECRET_ACCESS_KEY` | S3 / Tigris secret key                       |
   | `S3_ENDPOINT`          | S3 / Tigris endpoint URL                     |
   | `S3_IAM_ENDPOINT`      | Tigris IAM endpoint                          |
   | `S3_BUCKET`            | Target bucket name                           |

3. Run in development:

   ```bash
   pnpm dev
   ```

## Scripts

| Script              | Description                                |
| ------------------- | ------------------------------------------ |
| `pnpm dev`          | Start the API with live reload (tsx watch) |
| `pnpm build`        | Compile TypeScript to `dist/`              |
| `pnpm start`        | Run the compiled server (`dist/server.js`) |
| `pnpm typecheck`    | Type-check without emitting                |
| `pnpm format`       | Format `src/**` with Prettier              |
| `pnpm format:check` | Check formatting without writing           |

## API overview

All routes are mounted under `/api`. Authenticated routes require the `token`
cookie (or `Authorization: Bearer <token>`).

| Method   | Route                | Auth | Description                                                |
| -------- | -------------------- | ---- | ---------------------------------------------------------- |
| `GET`    | `/api/health`        | -    | Health check                                               |
| `POST`   | `/api/auth/register` | -    | Register, sets cookie, returns user                        |
| `POST`   | `/api/auth/login`    | -    | Login, sets cookie, returns user                           |
| `POST`   | `/api/auth/logout`   | -    | Clears the cookie                                          |
| `GET`    | `/api/me`            | yes  | Current user                                               |
| `GET`    | `/api/news`          | -    | List published news (`limit`, `offset`, `category`)        |
| `GET`    | `/api/news/:id`      | -    | Get one by `_id` or `slug` (drafts only visible to author) |
| `POST`   | `/api/news`          | yes  | Create                                                     |
| `PATCH`  | `/api/news/:id`      | yes  | Update (author only)                                       |
| `DELETE` | `/api/news/:id`      | yes  | Delete (author only)                                       |
| `POST`   | `/api/upload`        | yes  | Upload a file (`multipart/form-data`, field `file`)        |

## Realtime

On startup the server attaches Socket.IO to the HTTP server and authenticates
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
