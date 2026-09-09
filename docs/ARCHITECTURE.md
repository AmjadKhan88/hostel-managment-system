# Architecture

## Overall shape

A **modular monolith**, not microservices, per the master instructions'
decision-making rule (simplest solution that meets production requirements):

```
React (Vite)  ──HTTP/JSON──▶  Express API  ──▶  MongoDB (Mongoose)
     ▲                             │
     │ WebSocket                  ├──▶ Redis (cache + BullMQ queues/workers)
     └────────Socket.IO───────────┤
                                   ├──▶ Cloudinary (file storage)
                                   └──▶ AI provider (via provider-agnostic interface)
```

## Backend layering

`routes → controllers → services → (repositories) → models`

- **Routes** only wire an HTTP method + path to a controller, with
  middleware (auth, validation) attached.
- **Controllers** stay thin: parse the request, call one service method,
  shape the response with `ApiResponse`. No business logic here.
- **Services** hold business logic and orchestrate models/repositories.
  This is where things like "atomic bed allocation" or "idempotent invoice
  generation" will live.
- **Repositories** are used where a data-access pattern is complex or reused
  across services, to keep services from being littered with raw Mongoose
  queries.
- **Models** are Mongoose schemas — kept close to the domain, not
  general-purpose "God objects."

## Cross-cutting concerns (built once, reused everywhere)

- **Errors**: every thrown error is an `ApiError` (or gets normalized into
  one by `errorHandler`). Consumers never see stack traces in production.
- **Responses**: `ApiResponse` enforces the `{ success, data, message }` /
  `{ success: false, message, code, errors }` contract across all endpoints.
- **Validation**: Zod schemas + a `validate()` middleware, applied per-route.
  Backend validation is authoritative regardless of what the frontend does.
- **Auth**: HttpOnly, Secure, SameSite cookies — not localStorage — once the
  Authentication day is implemented. `apiClient` on the frontend is already
  configured with `withCredentials: true` in anticipation of this.
- **Authorization**: centralized RBAC/permission checks, enforced
  server-side, are added starting the Authorization day. The frontend will
  mirror permissions for UI purposes only — never as the source of truth.
- **Logging**: Pino, with a redaction list covering passwords, tokens, and
  auth headers, plus per-request correlation IDs.
- **Rate limiting**: a global limiter on `/api/v1` today; stricter,
  endpoint-specific limiters (e.g. login) are added when those routes exist.

## AI architecture

Business logic depends only on `ai/AIProvider.js` (the interface) via
`ai/index.js`'s `getAIProvider()` factory — never on a vendor SDK directly.
`AI_PROVIDER` in `.env` selects the implementation. This means:

- Swapping or adding a vendor is a new file in `ai/providers/` plus one
  factory branch — no changes to feature code.
- AI-driven database questions will go through a controlled tool/function
  layer (the AI proposes a structured, allow-listed action; the backend
  validates authorization and executes the actual query) — the AI is never
  given direct, unrestricted database access.
- AI output is treated as untrusted input and validated with Zod before use,
  per the master instructions' AI security rules.

## Money representation

Monetary values will be stored as **integer minor units (e.g. paise/cents)**,
never as floating-point major units, once the Fees & Accounting module is
built. This is documented here now so every later day is consistent.

## Multi-hostel readiness

Business entities are designed to be scoped by `hostelId` from the start
(added as those schemas are built), so multi-hostel support doesn't require
a later data-model rewrite — without introducing full enterprise
multi-tenancy prematurely.

## What Day 1 deliberately does NOT include

- No database models, auth, or business routes — those belong to their own
  scoped days.
- No sidebar/topbar dashboard UI — only a setup-verification page proving
  the toolchain and design tokens work end-to-end.
