import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .config import get_settings
from .db import init_db
from .routers import save, items, reminder, ocr, categorize, summarize
from .services import groq_client

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-7s %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    log.info("=" * 60)
    log.info("Intent API starting")
    log.info("DB: %s", settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else settings.DATABASE_URL)
    log.info("Groq: %s (model=%s)",
             "configured" if groq_client.is_configured() else "MOCK (no key)",
             settings.GROQ_MODEL)
    log.info("Auth: %s", "AUTH_BYPASS (dev)" if settings.AUTH_BYPASS else "Firebase")
    log.info("CORS: %s", settings.cors_origins)
    log.info("=" * 60)
    yield


app = FastAPI(title="Intent API", version="0.2.0", lifespan=lifespan)

_origins = settings.cors_origins
_allow_credentials = "*" not in _origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    try:
        response = await call_next(request)
    except Exception as e:
        log.exception("Unhandled error on %s %s: %s", request.method, request.url.path, e)
        return JSONResponse({"detail": "Internal server error"}, status_code=500)
    duration_ms = (time.time() - start) * 1000
    if request.url.path != "/health":
        log.info("%s %s -> %d (%.0fms)",
                 request.method, request.url.path, response.status_code, duration_ms)
    return response


@app.get("/health")
def health():
    return {
        "status": "ok",
        "groq_configured": groq_client.is_configured(),
        "auth_bypass": settings.AUTH_BYPASS,
    }


app.include_router(save.router, tags=["save"])
app.include_router(items.router, tags=["items"])
app.include_router(reminder.router, tags=["reminder"])
app.include_router(ocr.router, tags=["ocr"])
app.include_router(categorize.router, tags=["categorize"])
app.include_router(summarize.router, tags=["summarize"])
