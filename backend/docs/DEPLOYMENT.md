# Deployment — Running the API and Worker Together

This application is **two separate Node processes**, not one:

| Process    | Command                                | Responsibility                                                                 |
| ---------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| API server | `npm start` (or `npm run dev` locally) | HTTP API, Socket.IO, everything the frontend talks to                          |
| Worker     | `npm run worker`                       | Scheduled jobs: monthly invoice generation, payment reminders (email/WhatsApp) |

**The worker is not optional in production.** If it isn't running, scheduled jobs silently never fire — residents don't get billed automatically, overdue reminders never go out — while the API and every other feature keeps working normally. There is no error on the frontend; the only visible signal is the **Automation** admin page (`/automation`, under Organization in the sidebar), which shows whether a worker is currently alive via a heartbeat, its next scheduled run times, and recent job history.

## Running both in production

Both processes need the same environment variables (`.env`) and both need network access to MongoDB and Redis. Pick whichever process manager you're already using:

### Option A — two systemd services

```ini
# /etc/systemd/system/hostel-api.service
[Unit]
Description=Hostel Management API
After=network.target

[Service]
WorkingDirectory=/opt/hostel-management/backend
ExecStart=/usr/bin/node src/server.js
Restart=always
EnvironmentFile=/opt/hostel-management/backend/.env

[Install]
WantedBy=multi-user.target
```

```ini
# /etc/systemd/system/hostel-worker.service
[Unit]
Description=Hostel Management Automation Worker
After=network.target

[Service]
WorkingDirectory=/opt/hostel-management/backend
ExecStart=/usr/bin/node src/jobs/worker.js
Restart=always
EnvironmentFile=/opt/hostel-management/backend/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now hostel-api hostel-worker
```

### Option B — PM2

```bash
pm2 start src/server.js --name hostel-api
pm2 start src/jobs/worker.js --name hostel-worker
pm2 save
```

### Option C — Docker Compose

```yaml
services:
  api:
    build: ./backend
    command: node src/server.js
    env_file: ./backend/.env
    ports: ['5000:5000']
    depends_on: [mongo, redis]

  worker:
    build: ./backend
    command: node src/jobs/worker.js
    env_file: ./backend/.env
    depends_on: [mongo, redis]

  mongo:
    image: mongo:7
  redis:
    image: redis:7
```

Same image, two different `command`s — the key point either way is **two running containers/processes, not one**.

## After deploying

1. Open `/automation` in the app and confirm the worker banner shows **"Worker process is running"** with a recent heartbeat timestamp.
2. If it shows **"No worker process detected"**, the worker process either isn't running or can't reach the same Redis instance the API uses (check `REDIS_URL` matches on both).
3. Each hostel's jobs run in that hostel's own configured timezone (Settings page) — verify the "Next scheduled run" time on `/automation` looks right before relying on it.
