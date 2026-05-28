# Intent Backend

FastAPI service backing the Intent mobile app. Implements the 7-endpoint contract consumed by `services/items.ts` in the React Native client.

## Stack

- **FastAPI** + **uvicorn** — API
- **SQLModel** + **SQLite** (dev) / **Postgres** (prod) — persistence
- **firebase-admin** — verifies client Firebase ID tokens
- **Groq** — categorize, summarize, vision OCR
- **httpx + BeautifulSoup** — URL metadata scraping

## Endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| GET  | `/health` | — | `{status}` |
| POST | `/save` | `SavePayload` | `ProcessedSave` |
| GET  | `/items` | — | `SavedItem[]` |
| GET  | `/items/{id}` | — | `SavedItem` |
| POST | `/reminder` | `{itemId, scheduledFor, preset?}` | `Reminder` |
| POST | `/ocr` | multipart `image` | `{text}` |
| POST | `/categorize` | `{text}` | `{category}` |
| POST | `/summarize` | `{text}` | `{summary, keyPoints}` |

All routes except `/health` require `Authorization: Bearer <firebase-id-token>`.

## Run locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # mac/linux

pip install -r requirements.txt
cp .env.example .env             # edit .env after copy

uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000  •  Swagger: http://localhost:8000/docs

## Connect the mobile app

1. **Same machine**: in `app.json → expo.extra.apiUrl`, set
   - iOS sim: `http://localhost:8000`
   - Android emulator: `http://10.0.2.2:8000`
   - Physical device: `http://<your-LAN-ip>:8000` (run `ipconfig`)
2. In `constants/env.ts`, set `USE_MOCKS: false`
3. Restart Expo: `npx expo start --clear`

## Configure Firebase (required unless `AUTH_BYPASS=true`)

1. Firebase Console → Project Settings → **Service Accounts** → Generate new private key → JSON downloads
2. Either:
   - Paste entire JSON (one line, escape inner quotes) into `.env`:
     `FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}`
   - OR save file as `firebase-service-account.json` and set:
     `FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json`

Use same Firebase project that powers the client.

## Local dev shortcut (skip Firebase)

```
AUTH_BYPASS=true
```

Every request is treated as user `dev-user`. **Never set in production.**

## Docker

```bash
docker compose up --build
```

## Switch to Postgres

```
DATABASE_URL=postgresql+psycopg2://user:pass@host:5432/intent
```

Tables auto-create on startup. For real migrations later, wire Alembic.

## Env vars

| Var | Required? | Default |
|---|---|---|
| `DATABASE_URL` | no | `sqlite:///./intent.db` |
| `GROQ_API_KEY` | yes (for AI) | — |
| `GROQ_MODEL` | no | `llama-3.1-8b-instant` |
| `GROQ_VISION_MODEL` | no | `meta-llama/llama-4-scout-17b-16e-instruct` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | yes (unless bypass) | — |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | alt to JSON | — |
| `AUTH_BYPASS` | dev only | `false` |
| `ALLOWED_ORIGINS` | no | localhost/expo |
| `PORT` | no | `8000` |

## Deploy

- **Railway**: `railway init` → `railway up` → set env vars in dashboard
- **Fly.io**: `fly launch` → `fly secrets set ...` → `fly deploy`
- **Render**: connect repo → Docker → set env vars

## Project layout

```
backend/
├── app/
│   ├── main.py            FastAPI app + CORS + router mounting
│   ├── config.py          pydantic-settings
│   ├── db.py              SQLModel engine + session
│   ├── models.py          User, Item, Reminder tables
│   ├── schemas.py         Pydantic request/response (matches client types)
│   ├── auth.py            Firebase token verification
│   ├── deps.py            ensure_user dependency
│   ├── routers/           save, items, reminder, ocr, categorize, summarize
│   └── services/          groq_client, scraper, categorizer
├── requirements.txt
├── .env.example
├── Dockerfile
└── docker-compose.yml
```
