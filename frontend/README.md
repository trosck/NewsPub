# Frontend

React 19 + Vite + TypeScript single-page app for a news/article publishing
application. Consumes the backend REST API and Socket.IO realtime feed.

## Features

- **Authentication UI** — sign in / register toggle (SegmentedControl) with
  validation; the session is restored on load via `/api/me` (`AuthContext`).
- **Article list** — cards showing title, category badge, and summary, with edit
  / delete actions and an empty state.
- **Rich-text editor** — TipTap with a full toolbar: bold / italic / underline /
  strike, H1–H3, bullet & ordered lists, blockquote, inline code, syntax-
  highlighted code blocks (lowlight), a link modal, image upload, and undo/redo.
  Markdown input is also supported via `tiptap-markdown`.
- **Write / Preview modes** — toggle between editing and a live HTML preview of
  the article plus its attachments.
- **Attachments** — multi-file upload with progress, download links, and remove.
- **Realtime** — Socket.IO connection (cookie-authenticated) with a live
  connection-status badge and toast notifications on `news:created`,
  `news:updated`, and `news:deleted` events.
- **Mantine UI** with top-right toast notifications and SCSS styling.

## Tech stack

- **Framework** — React 19, Vite 8, TypeScript
- **UI** — Mantine 9 (`core`, `hooks`, `notifications`), Tabler icons
- **Editor** — TipTap (`starter-kit`, `react`, `pm`, `extension-image`,
  `extension-placeholder`, `extension-code-block-lowlight`), lowlight +
  highlight.js, `tiptap-markdown`
- **Realtime** — socket.io-client
- **Tooling** — oxlint, Prettier, Sass, PostCSS

## Project structure

```
src/
  main.tsx              # Entry; mounts App in MantineProvider + Notifications
  App.tsx               # Auth/Socket providers, client-side routing, toasts
  config.ts             # API_URL from VITE_API_URL
  types.ts              # Shared TS types (Article, User, NewsEvent, ...)
  pages/
    Login.tsx           # Sign in / register screen
    ArticleList.tsx     # Article cards with edit/delete
    ArticleEditor.tsx   # Write/Preview editor with validation + attachments
  components/
    editor/
      RichTextEditor.tsx  # TipTap editor wiring
      EditorToolbar.tsx   # Formatting toolbar + link/image modals
      Attachments.tsx     # File upload + list
      ArticlePreview.tsx  # Rendered HTML preview
  context/
    AuthContext.tsx     # user state, login/register/logout, session restore
    SocketContext.tsx   # Socket.IO lifecycle + connection status
  services/
    http.ts             # fetch wrapper (credentials: include, JSON)
    auth.ts             # login / register / logout / fetchMe
    news.ts             # list / create / update / delete articles
    upload.ts           # multipart file upload
    socket.ts           # createSocket()
```

## Prerequisites

- Node.js (>= 20 recommended) and pnpm
- The backend API running (default `http://localhost:5000`)

## Getting started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the example env file and configure the API URL:

   ```bash
   cp .env.example .env
   ```

3. Run the dev server:

   ```bash
   pnpm dev
   ```

## Environment variables

| Variable       | Description                                  | Default                 |
| -------------- | -------------------------------------------- | ----------------------- |
| `VITE_API_URL` | Base URL of the backend API + Socket.IO host | `http://localhost:5000` |

## Scripts

| Script         | Description                                 |
| -------------- | ------------------------------------------- |
| `pnpm dev`     | Start the Vite dev server                   |
| `pnpm build`   | Type-check (`tsc -b`) then production build |
| `pnpm preview` | Preview the production build                |
| `pnpm lint`    | Run oxlint                                  |
| `pnpm format`  | Format the codebase with Prettier           |

## Conventions

See `AGENTS.md` for the full guide. In short:

- Write components as **function components only** (no classes); use Hooks for
  state and lifecycle.
- TypeScript everywhere; avoid `any` without justification.
- Prefer Mantine components and tokens over hand-rolled styling.
- Run `pnpm lint` and `pnpm build` (which includes the type-check) before
  finishing a change.

## Notes

- Authentication relies on the backend's `httpOnly` cookie; all requests are
  sent with `credentials: "include"` (see `services/http.ts`).
- The Socket.IO client connects only after the user is signed in
  (`SocketContext`), using the same cookie for authentication.
- The backend stores article HTML as `content`; this app exposes it as `body`
  (mapping lives in `services/news.ts`).
