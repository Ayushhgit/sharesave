import json
from typing import Optional
import firebase_admin
from firebase_admin import auth as fb_auth, credentials
from fastapi import Header, HTTPException, status
from .config import get_settings

_settings = get_settings()
_initialized = False


def _init_firebase() -> None:
    global _initialized
    if _initialized or firebase_admin._apps:
        _initialized = True
        return

    cred = None
    if _settings.FIREBASE_SERVICE_ACCOUNT_JSON:
        try:
            data = json.loads(_settings.FIREBASE_SERVICE_ACCOUNT_JSON)
            cred = credentials.Certificate(data)
        except json.JSONDecodeError:
            raise RuntimeError("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON")
    elif _settings.FIREBASE_SERVICE_ACCOUNT_PATH:
        cred = credentials.Certificate(_settings.FIREBASE_SERVICE_ACCOUNT_PATH)

    if cred is None:
        if not _settings.AUTH_BYPASS:
            raise RuntimeError(
                "Firebase credentials not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON "
                "or FIREBASE_SERVICE_ACCOUNT_PATH, or set AUTH_BYPASS=true for local dev."
            )
        return

    firebase_admin.initialize_app(cred)
    _initialized = True


class CurrentUser:
    def __init__(self, uid: str, email: Optional[str] = None, name: Optional[str] = None):
        self.uid = uid
        self.email = email
        self.name = name


async def get_current_user(
    authorization: Optional[str] = Header(default=None),
) -> CurrentUser:
    if _settings.AUTH_BYPASS:
        return CurrentUser(uid="dev-user", email="dev@local", name="Dev User")

    _init_firebase()

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    token = authorization.split(" ", 1)[1].strip()
    try:
        decoded = fb_auth.verify_id_token(token)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(
            "Firebase token verification failed: %s (token prefix: %s...)",
            e, token[:20] if len(token) > 20 else token
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase token: {e}",
        )

    return CurrentUser(
        uid=decoded["uid"],
        email=decoded.get("email"),
        name=decoded.get("name"),
    )
