# Frontend — Hostel Management System

React + Vite + Tailwind CSS, following a feature-oriented structure.

## Folder structure

| Folder         | Purpose                                                          |
| --------------- | ------------------------------------------------------------------ |
| `components/`     | Reusable, generic UI (`ui/`), layout shells (`layout/`), shared bits (`common/`) |
| `features/`        | Feature-oriented modules (residents, rooms, payments, etc.) — added per day |
| `routes/`           | Route-level page components                                       |
| `store/`             | Zustand stores — for genuinely global client state only            |
| `lib/`                | `apiClient` (axios), `queryClient` (TanStack Query)                |
| `config/`              | Runtime config (env var wrapper)                                    |
| `styles/`               | Global CSS + Tailwind entry                                          |
| `hooks/`                  | Shared React hooks                                                     |

## Design tokens

Tailwind's theme is extended (not replaced) in `tailwind.config.js` with
colors, radius, and shadow tokens extracted from the client's reference
dashboard screenshot. See [`../docs/DESIGN_TOKENS.md`](../docs/DESIGN_TOKENS.md).
Use these tokens (`bg-canvas`, `bg-surface`, `text-ink`, `bg-brand-500`,
`rounded-card`, `shadow-card`, etc.) rather than ad-hoc Tailwind grays/blues,
so the whole app stays visually consistent with the reference.

## Conventions

- **Server state** lives in TanStack Query (`useQuery`/`useMutation`), never
  copied into Zustand.
- **Global client state** (e.g. sidebar collapsed, active hostel context)
  goes in a Zustand store — only when it's genuinely cross-cutting.
- **Forms** use React Hook Form + a Zod schema (shared shape with the
  backend validator where practical).
- Every data-driven page must handle **loading / success / empty / error**
  states — see `docs/ARCHITECTURE.md`.

## Scripts

```bash
npm run dev       # start Vite dev server (http://localhost:5173)
npm run build      # production build
npm run lint         # ESLint
```
