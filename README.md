# Hostel Management System

A production-grade Hostel Management System built as a modular monolith:
**React (Vite) frontend + Node/Express API + MongoDB + Redis/BullMQ + Socket.IO**,
with a provider-independent AI layer.

This project is being built incrementally, one scoped **DAY** at a time, per the
Master Project Instructions. Each day's completion report lives in `docs/daily-reports/`.

## Current status: Day 1 — Project Setup ✅

Infrastructure and tooling only. No business modules (auth, residents, rooms,
payments, etc.) exist yet — those are built on their own scoped days.

## Repository layout

```
hostel-management-system/
├── backend/     Express API (see backend/README.md)
├── frontend/    React + Vite app (see frontend/README.md)
├── docs/        Architecture & design decisions
```

## Prerequisites

- Node.js 20+
- MongoDB running locally or a connection string (e.g. MongoDB Atlas)
- Redis running locally (used by BullMQ from the automation-engine day onward)

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env    # then fill in real secrets
npm install
npm run dev              # http://localhost:5000
```

Health check: `GET http://localhost:5000/api/v1/health`
API docs (Swagger UI): `http://localhost:5000/api-docs`

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

The dev server proxies `/api` to `http://localhost:5000`, and the home page
(`/`) is currently a **setup verification page** confirming the toolchain and
API connectivity — not the product dashboard (that's built on its own day).

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — architectural decisions and conventions
- [`docs/DESIGN_TOKENS.md`](docs/DESIGN_TOKENS.md) — visual design tokens extracted from the reference dashboard
