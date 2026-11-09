# Escalas — Shift Scheduler

Schedules specialists and interns into morning and night shifts. FastAPI +
SQLAlchemy backend (`backend/`), React + Vite frontend (`frontend/`).

## Backend

Requires Python 3.11+ (tested with 3.13).

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt   # requirements.txt for runtime only
export APP_ENV=development                      # allows the built-in dev SECRET_KEY
.venv/bin/python -m app.cli create-user alice    # prompts for a password (min. 8 characters)
.venv/bin/uvicorn app.main:app --reload --port 8000
```

Tables are created on first startup; `python -m app.cli init-db` creates
them without starting the server. There are no migrations yet: add Alembic
before the first schema change. Without `DATABASE_URL` data is stored in
`backend/escalas.db`. `create-user` needs only `DATABASE_URL`.

## Frontend

Requires Node 20.19+ (tested with 26).

```bash
cd frontend
npm ci
npm run dev        # http://localhost:5173, proxies /api to localhost:8000
```

Sign in with the user created above.

## Environment variables

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `APP_ENV` | backend | `production` | `development` allows running without `SECRET_KEY` |
| `SECRET_KEY` | backend | none (required outside development) | Signs login tokens, at least 32 characters |
| `DATABASE_URL` | backend | `sqlite:///backend/escalas.db` | SQLAlchemy URL; `postgres://` and `postgresql://` both work |
| `FRONTEND_URL` | backend | `http://localhost:5173` | Allowed browser origins (CORS), comma-separated |
| `TOKEN_TTL_MINUTES` | backend | `720` | Login lifetime |
| `VITE_API_URL` | frontend build | empty (same origin) | Backend URL when the frontend is served from another host |

See `backend/.env.example` and `frontend/.env.example`.

## Deploying (Render)

- Backend web service: root `backend`, build `pip install -r requirements.txt`,
  start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Set `SECRET_KEY`,
  `DATABASE_URL` (from a Render Postgres database) and `FRONTEND_URL` (the
  static site URL). Create the first user from the service shell:
  `python -m app.cli create-user <name>`.
- Frontend static site: root `frontend`, build `npm ci && npm run build`,
  publish `dist`, set `VITE_API_URL` to the backend URL.

## Tests and lint

```bash
cd backend && .venv/bin/python -m pytest && .venv/bin/ruff check .
cd frontend && npm run lint && npm test && npm run build
```

Backend tests use a temporary SQLite file per test. Set `TEST_DATABASE_URL`
to run them against Postgres instead (its tables are dropped first).

## CSV export

The CSV is UTF-8 with a BOM and uses `;` as separator. It opens directly in
Excel where the list separator is `;` (Portuguese and most European
settings); elsewhere import it with Data > From Text and choose `;`.

## Known limits

- No rate limiting on login.
- Logout only discards the token in the browser; a token stays valid until
  it expires (`TOKEN_TTL_MINUTES`).

## Scheduling rules

Documented at the top of `backend/app/services.py`.
