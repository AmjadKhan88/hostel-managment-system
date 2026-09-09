# Backend — Hostel Management API

Node.js + Express + MongoDB (Mongoose) API, following a modular-monolith,
services-over-fat-controllers architecture.

## Folder structure

| Folder          | Purpose                                                              |
| ---------------- | --------------------------------------------------------------------- |
| `config/`         | Env validation, DB, Redis, logger — single source of truth            |
| `routes/v1/`      | Express routers, mounted under `/api/v1`                              |
| `controllers/`    | Thin HTTP layer — parse request, call a service, format response      |
| `services/`       | Business logic lives here, not in controllers or routes               |
| `models/`         | Mongoose schemas                                                      |
| `repositories/`   | Query modules for complex/reused data-access patterns                 |
| `middlewares/`    | Auth, validation, error handling, rate limiting                       |
| `validators/`     | Zod schemas for request validation                                    |
| `jobs/`           | BullMQ queues, workers, and job schedulers                            |
| `events/`         | Socket.IO event emitters/handlers                                     |
| `ai/`             | Provider-independent AI abstraction + concrete provider adapters      |
| `utils/`          | ApiError, ApiResponse, asyncHandler, etc.                             |
| `docs/`           | Swagger/OpenAPI setup                                                 |

## Conventions

- **Response shape** — every endpoint returns `{ success, data, message }` on
  success or `{ success: false, message, code, errors: [] }` on failure. Use
  `ApiResponse` and `ApiError` rather than `res.json(...)` / `throw new Error(...)`.
- **Async routes** — wrap controller functions in `asyncHandler` so rejected
  promises reach the central error handler instead of hanging or crashing.
- **Validation** — define a Zod schema in `validators/`, apply it with the
  `validate({ body, query, params })` middleware before the controller runs.
- **API versioning** — new modules are mounted under `routes/v1/`. A breaking
  change gets a `v2` router rather than mutating `v1` behavior.
- **Authorization** — backend authorization is authoritative. Every protected
  route must check permissions server-side even if the frontend already hides
  the relevant UI.

## Scripts

```bash
npm run dev        # start with nodemon
npm start           # start (production)
npm run lint         # ESLint
npm run test          # Vitest
```
