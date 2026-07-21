# Uptime Monitor

A minimal uptime monitoring app. The backend (FastAPI + SQLite) periodically checks
registered URLs; the frontend (React + Vite + TypeScript + Tailwind) displays live
status, HTTP code, response time, and last-checked time, polling every 5 seconds.

```
project-root/
├── docker-compose.yml
├── backend/     # FastAPI + SQLite
└── frontend/    # React + Vite + TypeScript + Tailwind
```

## Quick start

Requires Docker and Docker Compose.

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

Stop with `Ctrl+C`, or run detached and tear down with:

```bash
docker compose up -d --build
docker compose down
```

The SQLite database is stored in the `backend-data` named volume, so data survives
container restarts and rebuilds. To wipe it: `docker compose down -v`.

### Running without Docker (local dev)

**Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
mkdir -p data                   # required — SQLite won't create this dir itself
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Vite's dev server runs at http://localhost:5173 and expects the backend at
http://localhost:8000 (configured in `frontend/src/services/apiClient.ts`).

## Testing instructions

### Backend API — manual smoke test

With the stack running, exercise the endpoints directly:

```bash
# List monitors (should return [] on a fresh DB)
curl http://localhost:8000/urls

# Create a monitor that will pass health checks
curl -X POST http://localhost:8000/urls \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "label": "Example"}'

# Create a monitor that will fail health checks, to verify DOWN rendering
curl -X POST http://localhost:8000/urls \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:1/does-not-exist", "label": "Broken"}'

# The scheduler checks every 60s; trigger an immediate cycle instead of waiting
curl -X POST http://localhost:8000/urls/check-now

# Give it a couple seconds to complete, then confirm both monitors show a
# latest_check with status_code, response_time_ms, and is_up populated
curl http://localhost:8000/urls
```

If your backend has its own automated test suite (e.g. pytest), run it from the
`backend/` directory:

```bash
cd backend
pip install -r requirements.txt
pytest
```

### Frontend — manual verification checklist

With `docker compose up` running (or `npm run dev`), open http://localhost:5173 and check:

- [ ] **Empty state**: on a fresh DB, table shows "No monitors yet."
- [ ] **Add monitor**: fill in Label + URL, click "Add Monitor" — form clears, table
      updates without a page reload.
- [ ] **Pending state**: a just-added monitor shows `Pending` / `—` until its first check completes.
- [ ] **UP status**: a healthy URL (e.g. `https://example.com`) shows 🟢 UP, a 2xx
      status code, and a response time.
- [ ] **DOWN status**: an unreachable URL (e.g. `http://localhost:1/does-not-exist`)
      shows 🔴 DOWN.
- [ ] **Response time coloring**: green under 100ms, amber 100–300ms, red above 300ms.
- [ ] **Auto-refresh**: leave the tab open for 5+ seconds — status/response time
      update in place with no manual refresh.
- [ ] **API down**: stop the backend (`docker compose stop backend`) — an error
      banner appears; restart it and confirm the banner clears on the next poll.
- [ ] **Responsive layout**: table remains usable at mobile widths (horizontal scroll,
      no broken layout).

### Type-checking and build validation

```bash
cd frontend
npx tsc --noEmit   # type check
npm run build      # production build
```

Both should complete with no errors before shipping a change.

## Deployment sketch

The current `docker-compose.yml` is a good local/staging baseline. For a real
deployment, the shape looks like this:

```
                         ┌─────────────────────┐
                         │        Users         │
                         └──────────┬───────────┘
                                    │ HTTPS
                                    ▼
                         ┌─────────────────────┐
                         │  Reverse proxy / CDN │   (nginx, Caddy, Cloudflare,
                         │   TLS termination     │    or a managed LB)
                         └──────────┬───────────┘
                     ┌──────────────┴──────────────┐
                     ▼                              ▼
          ┌─────────────────────┐       ┌─────────────────────────┐
          │  frontend container  │       │    backend container     │
          │  (static build via   │──────▶│  FastAPI + Uvicorn        │
          │   nginx, port 80)     │  API  │  (port 8000)              │
          └─────────────────────┘  calls └───────────┬─────────────┘
                                                       │
                                                       ▼
                                          ┌─────────────────────────┐
                                          │  Persistent volume /     │
                                          │  managed disk (SQLite)   │
                                          └─────────────────────────┘
```

Suggested path to production:

1. **Container registry**: build and push `backend` and `frontend` images in CI
   (`docker build`, tag by git SHA, push to ECR/GHCR/Docker Hub).
2. **Compute**: run both containers on a single small VM via `docker compose up -d`
   for the simplest MVP deploy, or move to a managed container platform
   (ECS/Fargate, Cloud Run, Fly.io, Render) once you need scaling or zero-downtime
   deploys.
3. **Reverse proxy / TLS**: put nginx, Caddy, or a platform load balancer in front
   to terminate HTTPS and route `/` to the frontend and `/api` (or a subdomain) to
   the backend — avoids hardcoding `localhost:8000` in the frontend for prod builds.
4. **Database**: SQLite is fine for an MVP with light write volume, but it doesn't
   like concurrent writers across multiple backend replicas. Keep the backend to a
   single replica with a persistent volume, or migrate to Postgres (RDS/Cloud SQL/
   managed Postgres) if you need to scale the backend horizontally.
5. **Background checks**: the scheduler that performs periodic URL health checks
   runs in-process with the API (APScheduler), so it must stay a singleton — run
   exactly one backend replica, or split the scheduler into its own service before
   scaling the API horizontally, to avoid duplicate/conflicting checks.
6. **Observability**: ship container logs to a log aggregator (CloudWatch, Loki,
   Datadog). The backend already exposes `GET /health` for platform-level health
   checks, separate from the app-level `/urls` endpoint used by the frontend.
7. **Secrets/config**: move the frontend's API base URL and any backend config
   (DB path, check interval) to environment variables read at build/runtime rather
   than hardcoded values, once there's more than one environment (staging/prod).

## Environment reference

| Variable | Where | Default | Notes |
|---|---|---|---|
| Backend port | `backend/Dockerfile`, `docker-compose.yml` | `8000` | Exposed and published as `8000:8000` |
| Frontend port | `docker-compose.yml` | `5173` (host) → `80` (container) | nginx serves the static build |
| API base URL | `frontend/src/services/apiClient.ts` | `http://localhost:8000` | Update for non-local deployments |
| SQLite data | `docker-compose.yml` volume `backend-data`; local dev `backend/data/` | mounted at `/app/data` | Persists across rebuilds |
| Check interval | `backend/app/scheduler.py` (`CHECK_INTERVAL_MINUTES`) | `1` minute | First check fires immediately on startup |
