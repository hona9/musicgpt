# MusicGPT

A full-stack AI music generation app where users describe a song in plain text and receive a generated audio track in real time. Prompts are processed through a priority job queue, with live status updates delivered via WebSocket.

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

---

## Table of Contents

- [Overview](#overview)
- [Setup & Running the Project](#setup--running-the-project)
  - [Prerequisites](#prerequisites)
  - [Docker (Recommended)](#docker-recommended)
  - [Local Development](#local-development)
  - [Environment Variables](#environment-variables)
- [Backend Architecture](#backend-architecture)
  - [Clean Architecture Layers](#clean-architecture-layers)
  - [Auth: JWT Access + Refresh Token Flow](#auth-jwt-access--refresh-token-flow)
  - [Redis Caching](#redis-caching)
  - [BullMQ: Queue & Workers](#bullmq-queue--workers)
  - [Socket.IO](#socketio-backend)
- [Frontend Architecture](#frontend-architecture)
  - [Project Structure](#project-structure)
  - [Auth Flow](#auth-flow)
  - [Socket.IO Client](#socketio-client)
  - [Caching Strategy](#caching-strategy)
- [Docker Services](#docker-services)
- [API Reference](#api-reference)

---

## Overview

MusicGPT accepts a natural-language prompt (e.g. "an upbeat lo-fi track with piano and rain sounds"), enqueues a generation job, and streams the result back to the user's browser the moment it's ready — no polling required.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Next.js)                        │
│  ┌─────────────┐   HTTP (Axios)   ┌──────────────────────────┐  │
│  │ TanStack Q  │◄────────────────►│      Express API v1      │  │
│  └─────────────┘                  └──────────┬───────────────┘  │
│  ┌─────────────┐   WebSocket      ┌──────────▼───────────────┐  │
│  │ Zustand     │◄────────────────►│      Socket.IO Server    │  │
│  └─────────────┘                  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                          │
                    ┌─────────────────────┼────────────────────┐
                    │                     │                     │
             ┌──────▼──────┐    ┌─────────▼──────┐    ┌────────▼──────┐
             │  PostgreSQL  │    │     Redis       │    │  BullMQ Queue │
             │  (Prisma)    │    │  Cache/Blacklist│    │  + Worker     │
             └─────────────┘    └────────────────┘    └───────────────┘
```

---

## Setup & Running the Project

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2+
- Node.js 20+ _(only for local development without Docker)_

### Docker (Recommended)

All services — PostgreSQL, Redis, API server, BullMQ worker, and the Next.js client — start with a single command.

```bash
# 1. Clone the repository
git clone https://github.com/your-username/musicgpt.git
cd musicgpt

# 2. Create the server environment file
cp server/.env.example server/.env
```

Open `server/.env` and set at minimum:

```env
JWT_ACCESS_SECRET=<a-random-64-char-hex-string>
```

You can generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```bash
# 3. Build and start all services
docker compose up --build
```

| Service  | URL                              |
|----------|----------------------------------|
| Frontend | http://localhost:3000            |
| API      | http://localhost:8000            |
| API Docs | http://localhost:8000/api-docs   |

Database migrations run automatically on first boot. To stop:

```bash
docker compose down
# Add -v to also remove persistent volumes (database data)
docker compose down -v
```

### Local Development

Run each service in its own terminal.

**Terminal 1 — Backend (API + Worker)**

```bash
cd server
npm install
cp .env.example .env      # fill in DATABASE_URL, REDIS_URL, JWT_ACCESS_SECRET
npm run dev               # starts Express with ts-node-dev (hot reload)
```

To run the worker in a separate process:

```bash
# Terminal 2 (optional — server already spawns a worker internally)
cd server
npm run worker
```

**Terminal 3 — Frontend**

```bash
cd client
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                  # starts Next.js with Turbopack on port 3000
```

### Environment Variables

#### Server (`server/.env`)

| Variable            | Required | Default       | Description                                              |
|---------------------|----------|---------------|----------------------------------------------------------|
| `DATABASE_URL`      | Yes      | —             | PostgreSQL connection string                             |
| `REDIS_URL`         | Yes      | —             | Redis connection string                                  |
| `JWT_ACCESS_SECRET` | Yes      | —             | Secret for signing JWTs (min 64 chars recommended)       |
| `NODE_ENV`          | No       | `development` | `development` or `production`                            |
| `PORT`              | No       | `8000`        | HTTP port the Express server listens on                  |
| `CORS_ORIGIN`       | No       | `*`           | Allowed CORS origin (e.g. `http://localhost:3000`)       |

#### Client (`client/.env.local`)

| Variable              | Required | Description                             |
|-----------------------|----------|-----------------------------------------|
| `NEXT_PUBLIC_API_URL` | Yes      | Backend base URL (included at build time) |

---

## Backend Architecture

### Clean Architecture Layers

The server follows a strict Clean Architecture structure. Dependencies point inward — outer layers depend on inner ones, never the reverse.

```
server/src/
├── domain/              # Pure business logic — no framework dependencies
│   ├── entities/        # User, Prompt, GenerationJob, PromptWithJob
│   ├── repositories/    # Interfaces: IUserRepository, IPromptRepository, ...
│   └── services/        # Interfaces: IJwtService, ICacheService, ISocketIOService, ...
│
├── application/         # Orchestrates use cases using domain contracts
│   ├── usecases/        # RegisterUseCase, LoginUseCase, CreatePromptUseCase, ...
│   ├── dtos/            # Zod-validated request/response schemas
│   └── mappers/         # Domain entity ↔ DTO transformation
│
├── infrastructure/      # Concrete implementations of domain interfaces
│   ├── repositories/    # UserRepository (Prisma), PromptRepository, ...
│   ├── services/        # JwtService, CacheService (Redis), RateLimiterService, ...
│   ├── database/        # Prisma and Redis singleton clients
│   ├── queue/           # BullMQ queue definition + worker + scheduler
│   └── socketio/        # Socket.IO server setup + auth middleware
│
└── presentation/        # HTTP entry points — knows Express, knows nothing else
    ├── controllers/     # AuthController, PromptController, SearchController, ...
    ├── routes/          # /api/v1/* route definitions
    └── middlewares/     # auth, validate, rateLimit, error, version
```

---

### Auth: JWT Access + Refresh Token Flow

MusicGPT uses a two-token strategy designed so that the short-lived access token never needs to be stored on disk.

#### Token Properties

| Token          | Lifetime | Storage (server) | Storage (client)  |
|----------------|----------|------------------|-------------------|
| Access token   | 15 min   | Never stored     | Memory only (Zustand) |
| Refresh token  | 10 days  | PostgreSQL       | `localStorage`    |

#### Full Lifecycle

```
Register / Login
  ├── Server hashes password (bcryptjs), saves User
  ├── Issues accessToken (JWT, signed with JWT_ACCESS_SECRET, 15 min)
  ├── Issues refreshToken (JWT, 10 days), stored in DB with expiry timestamp
  └── Returns both to client

Authenticated Request
  └── Client attaches: Authorization: Bearer <accessToken>
      └── auth.middleware.ts:
            1. Verifies JWT signature
            2. Checks Redis blacklist key: blacklist:{jti}
            3. Attaches { userId, email, tier } to req.user

Silent Token Refresh (Axios interceptor on 401)
  1. First 401 → acquire lock (isRefreshing = true)
  2. Queue subsequent requests in a promise array
  3. POST /api/v1/auth/refresh with { refreshToken }
  4. Server: validates refresh token, rotates both tokens (old refresh deleted from DB)
  5. Client: updates Zustand store + re-issues isLoggedIn cookie
  6. Drain queue — replay all pending requests with new access token
  7. On refresh failure → clearAuth() + redirect to /login

Logout
  1. POST /api/v1/auth/logout
  2. Server: adds accessToken's jti to Redis blacklist (TTL = remaining token lifetime)
  3. Server: deletes refreshToken from DB
  4. Client: clearAuth(), disconnect socket, remove cookie
```

**Key files:**
- `server/src/infrastructure/services/JwtService.ts` — sign/verify
- `server/src/presentation/middlewares/auth.middleware.ts` — per-request verification
- `client/src/lib/api/client.ts` — Axios interceptors
- `client/src/store/auth.store.ts` — Zustand auth state

---

### Redis Caching

The `CacheService` (`server/src/infrastructure/services/CacheService.ts`) wraps `ioredis` with a simple `get / set / invalidatePattern` interface. Redis serves three distinct purposes:

#### 1. Prompt List Cache

- **Key:** `cache:prompts:{userId}:{cursor}`
- **TTL:** 60 seconds
- **Set when:** `GET /api/v1/prompts` is called and the result is not already cached
- **Invalidated when:**
  - A new prompt is created (`POST /prompts` → scheduler picks it up → invalidates on dispatch)
  - A job finishes (worker calls `invalidatePattern("cache:prompts:{userId}:*")`)

This avoids redundant DB reads for the same paginated prompt list within a 60-second window.

#### 2. Token Blacklist

- **Key:** `blacklist:{jti}` (jti = JWT ID claim, unique per token)
- **TTL:** Exact remaining lifetime of the access token (so the key auto-expires when the token would have anyway)
- **Set when:** User logs out
- **Checked when:** `auth.middleware.ts` processes every authenticated request

This makes logout effective immediately even though JWTs are stateless by nature.

#### 3. Rate Limiting

- **Key:** `rate_limit:{userId}`
- **TTL:** 1 hour (sliding window)
- **Limits:**
  - `FREE` tier — 3 prompt submissions per hour
  - `PAID` tier — 20 prompt submissions per hour
- **Middleware:** `rateLimitByTier` applied to `POST /api/v1/prompts`

---

### BullMQ: Queue & Workers

Prompt generation is asynchronous. Creating a prompt returns immediately; the actual work happens in a background worker.

#### Job Flow

```
POST /api/v1/prompts
  │
  └─► CreatePromptUseCase
        ├── Inserts Prompt row in PostgreSQL
        └── Inserts GenerationJob row (status: QUEUED, priority: 0 or 10)

          ↓ every 5 seconds

      Scheduler (prompt.worker.ts)
        ├── Queries: SELECT * FROM GenerationJob WHERE status = QUEUED
        │           ORDER BY priority DESC, createdAt ASC   LIMIT 10
        ├── Updates each row: status → DISPATCHED
        └── Adds job to BullMQ queue "prompt-generation"
              { promptId, userId, text }
              retry: 3 attempts, exponential backoff (5s → 10s → 20s)

          ↓

      BullMQ Worker (concurrency = 5)
        ├── Picks up job from queue
        ├── Updates DB: status → PROCESSING
        ├── Emits Socket.IO event: job:processing  → user's room
        ├── Simulates work: 5–10 second delay
        ├── On success:
        │     ├── Updates DB: status → COMPLETED, audioUrl set
        │     ├── Invalidates Redis cache: cache:prompts:{userId}:*
        │     └── Emits Socket.IO event: job:completed  { audioUrl, title }
        └── On failure:
              ├── Updates DB: status → FAILED
              └── Emits Socket.IO event: job:failed  { errorMessage }
```

#### Priority

| Tier | Priority Value | Effect |
|------|---------------|--------|
| FREE | 0             | Processed after PAID jobs |
| PAID | 10            | Processed first |

#### Key files
- `server/src/infrastructure/queue/prompt.queue.ts` — queue definition
- `server/src/infrastructure/queue/prompt.worker.ts` — worker + scheduler
- `server/src/config/limits.ts` — tier priorities and rate limits

---

### Socket.IO (Backend)

Socket.IO provides real-time job status updates without the client needing to poll.

#### Setup & Authentication

```
Client connects: io(SERVER_URL, { auth: { token: accessToken } })
  │
  └─► socketio.server.ts middleware
        ├── Extracts socket.handshake.auth.token
        ├── Verifies JWT (same logic as HTTP auth.middleware)
        ├── Attaches userId to socket.data
        └── Joins socket to room: userId
              (all events are emitted to rooms, not individual sockets)
```

File: `server/src/infrastructure/socketio/socketio.server.ts`

#### Events (Server → Client)

| Event           | Payload                                              | When                       |
|-----------------|------------------------------------------------------|----------------------------|
| `job:processing`| `{ jobId, promptId, userId, status }`               | Worker starts the job      |
| `job:completed` | `{ jobId, promptId, userId, status, audioUrl, title }`| Job finishes successfully  |
| `job:failed`    | `{ jobId, promptId, userId, status, errorMessage }` | Job fails (all retries exhausted) |

#### Redis Pub/Sub for Multi-Process Deployments

When the BullMQ worker runs as a separate Docker container, it cannot reach the Socket.IO server directly. Instead:

1. Worker publishes to Redis channel `socket:events`
2. Socket.IO server subscribes to `socket:events` and re-emits to the correct user room

This keeps the worker stateless and allows horizontal scaling.

---

## Frontend Architecture

### Project Structure

```
client/src/
├── app/
│   ├── layout.tsx           # Root layout: fonts, QueryClientProvider, SocketBridge
│   ├── providers.tsx        # React Query + socket lifecycle wiring
│   ├── (auth)/
│   │   ├── login/page.tsx   # Login form (react-hook-form + Zod)
│   │   └── register/page.tsx
│   └── (app)/
│       ├── layout.tsx       # AppShell: sidebar + main content area
│       └── page.tsx         # Home: PromptBox + RecentStrip
│
├── components/
│   ├── ui/                  # shadcn primitives (Button, Input, Badge, Progress, ...)
│   ├── layout/              # AppShell, Sidebar
│   ├── home/                # PromptBox, RecentStrip
│   └── profile/             # ProfilePopup (job list, sign out)
│
├── hooks/
│   ├── use-auth.ts          # useLogin(), useRegister(), useLogout() mutations
│   ├── use-prompts.ts       # usePrompts() infinite query + useCreatePrompt()
│   ├── use-socket.ts        # Socket connection lifecycle
│   ├── use-job-updates.ts   # Socket event → store + query cache updates
│   └── use-search.ts        # Debounced search
│
├── store/
│   ├── auth.store.ts        # user, accessToken (memory), refreshToken (localStorage)
│   ├── jobs.store.ts        # active jobs map, recentCompleted, unreadCount
│   └── ui.store.ts          # sidebarOpen, profilePopupOpen, activePromptId
│
├── lib/
│   ├── api/
│   │   ├── client.ts        # Axios instance + 401 refresh interceptor
│   │   ├── auth.api.ts      # login(), register(), logout(), me()
│   │   ├── prompts.api.ts   # create(), list()
│   │   └── search.api.ts    # search()
│   └── socket/
│       └── socket.client.ts # Singleton: connectSocket(), disconnectSocket(), getSocket()
│
└── proxy.ts                 # Next.js 16 route guard (redirects unauthenticated users)
```

---

### Auth Flow

```
Login / Register
  ├── react-hook-form + Zod validates input client-side
  ├── Calls auth.api.ts → POST /api/v1/auth/login (or /register)
  ├── Server returns { user, accessToken, refreshToken }
  ├── useAuthStore.setAuth(user, accessToken, refreshToken)
  │     ├── accessToken → memory only (Zustand, never written to disk)
  │     └── refreshToken + user → localStorage (survives page refresh)
  ├── Sets cookie: isLoggedIn=true (7 days, SameSite=Lax)
  │     └── Used by proxy.ts route guard — no token value is stored in the cookie
  └── router.push("/")

Page Refresh Recovery
  └── On mount, auth.store hydrates from localStorage
        └── If refreshToken exists → POST /auth/refresh → restore accessToken in memory

Logout
  ├── POST /api/v1/auth/logout (server blacklists jti in Redis)
  ├── useAuthStore.clearAuth() (wipes memory + localStorage)
  ├── disconnectSocket()
  ├── Removes isLoggedIn cookie
  └── router.push("/login")
```

---

### Socket.IO Client

The socket connection is managed as a singleton tied to the auth state.

#### Connection Management

**`lib/socket/socket.client.ts`** — singleton factory:

```
connectSocket(accessToken)
  └── if socket already exists → return (guard against double-connect)
      else → io(NEXT_PUBLIC_API_URL, { auth: { token }, transports: ["websocket"] })

disconnectSocket()
  └── socket.disconnect() + socket = null
```

**`hooks/use-socket.ts`** — lifecycle hook mounted in `providers.tsx`:

```
useEffect(() => {
  if (accessToken) connectSocket(accessToken)
  else disconnectSocket()
}, [accessToken])
```

The socket connects the moment an access token lands in the Zustand store (login, page refresh recovery) and disconnects on logout or token loss.

#### Receiving Job Updates

**`hooks/use-job-updates.ts`** — mounted in `providers.tsx` alongside the socket hook:

```
socket.on("job:processing", handler)
socket.on("job:completed",  handler)
socket.on("job:failed",     handler)

Each handler:
  1. Maps server event name → client JobStatus enum
       "job:processing" → "PROCESSING"
       "job:completed"  → "COMPLETED"
       "job:failed"     → "FAILED"
  2. jobsStore.setJobEvent(payload)  ← updates Zustand for UI badge/list
  3. qc.setQueryData(["prompts"], patchJobInPages(pages, payload))
       └── patches the job status inline in the TanStack Query page cache
           so the prompt list updates instantly without a network refetch
```

---

### Caching Strategy

MusicGPT uses two layers of client-side caching that work together:

#### TanStack Query — Server Data Cache

`usePrompts()` (`hooks/use-prompts.ts`) fetches the paginated prompt list:

```
queryKey: ["prompts"]
staleTime: 30 seconds
fetchNextPage: cursor-based (limit = 20 per page)
```

- **Populated** by `GET /api/v1/prompts` (server may serve from its own Redis cache)
- **Invalidated** by `useCreatePrompt()` on mutation success — triggers a background refetch
- **Patched inline** by `use-job-updates.ts` when Socket.IO events arrive — the job status, audio URL, and title are written directly into the cached pages without a round trip

#### Zustand — Live UI State

`jobs.store.ts` holds ephemeral UI state that changes rapidly:

| State             | Contents                                    | Used by                          |
|-------------------|---------------------------------------------|----------------------------------|
| `jobs` (map)      | All active/recent jobs keyed by jobId       | ProfilePopup job list, badges    |
| `recentCompleted` | Last 5 completed jobs                       | RecentStrip on home page         |
| `unreadCount`     | Count of new completions since last viewed  | Notification badge on profile button |

Zustand updates are synchronous and immediately reflected in the UI. TanStack Query handles persistence and background sync.

---

## Docker Services

| Service    | Image              | Port  | Purpose                                       |
|------------|--------------------|-------|-----------------------------------------------|
| `postgres` | postgres:16-alpine | 5432  | Primary SQL database (Prisma ORM)             |
| `redis`    | redis:7-alpine     | 6379  | Cache, token blacklist, rate limiting, pub/sub|
| `server`   | Custom Dockerfile  | 8000  | Express API + Socket.IO + embedded worker     |
| `worker`   | Custom Dockerfile  | —     | Standalone BullMQ worker (optional scale-out) |
| `client`   | Custom Dockerfile  | 3000  | Next.js 16 frontend (standalone output)       |

**Health checks** are configured for `postgres` (`pg_isready`) and `redis` (`redis-cli ping`). The `server` service waits for both to be healthy before starting and exposes a `GET /health` endpoint for its own check.

**Database migrations** run automatically via `docker-entrypoint.sh` when the server container starts. The standalone `worker` service sets `SKIP_MIGRATIONS=1` to avoid running migrations twice.

**Volumes:**
- `postgres_data` — persists database across restarts
- `redis_data` — persists Redis data across restarts

### Dockerfiles

Both images use a two-stage build to keep the production image lean.

**`server/Dockerfile`**

```
Stage 1 — builder (node:20-alpine)
  ├── npm ci
  ├── npx prisma generate   ← generates the Prisma client into node_modules
  ├── tsc (npm run build)   ← compiles TypeScript to dist/
  └── copies generated Prisma client into dist/

Stage 2 — production (node:20-alpine)
  ├── Copies node_modules, dist/, prisma/, docker-entrypoint.sh
  ├── ENV NODE_ENV=production
  ├── EXPOSE 8000
  └── ENTRYPOINT docker-entrypoint.sh → runs prisma migrate deploy, then node dist/server.js
```

The entrypoint script runs `prisma migrate deploy` before starting the server so the database schema is always in sync with the deployed image. Set `SKIP_MIGRATIONS=1` on the `worker` service to avoid running migrations twice.

**`client/Dockerfile`**

```
Stage 1 — builder (node:20-alpine)
  ├── ARG NEXT_PUBLIC_API_URL   ← baked in at build time (Next.js public env vars)
  ├── npm ci
  └── next build                ← produces a standalone server bundle

Stage 2 — production (node:20-alpine)
  ├── Copies .next/standalone/  ← self-contained Node server (~no node_modules needed)
  ├── Copies .next/static/      ← hashed static assets
  ├── Copies public/            ← icons, images
  ├── ENV HOSTNAME=0.0.0.0      ← required for Docker networking
  ├── EXPOSE 3000
  └── CMD node server.js        ← Next.js standalone entry point
```

`NEXT_PUBLIC_API_URL` must be passed as a build argument because Next.js inlines public env vars at build time — it cannot be changed at runtime without rebuilding the image:

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 -t musicgpt-client client/
```

In `docker-compose.yml` this is handled automatically via the `args` section under `build`.

---

## API Reference

Interactive API documentation is available via Swagger UI at:

```
http://localhost:8000/api-docs
```

All endpoints are prefixed with `/api/v1/`. Key route groups:

| Prefix               | Description                             |
|----------------------|-----------------------------------------|
| `POST /auth/register`| Create account                          |
| `POST /auth/login`   | Log in, receive token pair              |
| `POST /auth/refresh` | Rotate access + refresh tokens          |
| `POST /auth/logout`  | Blacklist token, clear refresh          |
| `GET  /prompts`      | Paginated prompt + job history          |
| `POST /prompts`      | Submit a new generation prompt          |
| `GET  /search`       | Search prompts                          |
| `GET  /users/me`     | Current user profile                    |
| `GET  /health`       | Service health check                    |
