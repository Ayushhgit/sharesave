import base64
import json
import logging
import re
import time
from typing import Optional
from groq import Groq, RateLimitError, APIError
from ..config import get_settings

log = logging.getLogger(__name__)
_settings = get_settings()

VALID_CATEGORIES = [
    "learn", "buy", "watch", "recipe", "fitness",
    "career", "business", "travel", "inspiration",
]


def _client() -> Optional[Groq]:
    if not _settings.GROQ_API_KEY or _settings.GROQ_API_KEY.startswith("gsk_REPLACE"):
        return None
    return Groq(api_key=_settings.GROQ_API_KEY, timeout=20.0)


def is_configured() -> bool:
    return _client() is not None


def _retry(fn, *, attempts: int = 3, base_delay: float = 0.8):
    last_err: Optional[Exception] = None
    for i in range(attempts):
        try:
            return fn()
        except RateLimitError as e:
            last_err = e
            wait = base_delay * (2 ** i)
            log.warning("Groq rate limit, retry %d/%d after %.1fs", i + 1, attempts, wait)
            time.sleep(wait)
        except APIError as e:
            last_err = e
            status = getattr(e, "status_code", None)
            if status and 500 <= status < 600:
                wait = base_delay * (2 ** i)
                log.warning("Groq %s, retry %d/%d after %.1fs", status, i + 1, attempts, wait)
                time.sleep(wait)
                continue
            raise
    assert last_err is not None
    raise last_err


def _parse_json(text: str) -> dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise ValueError(f"No JSON in model response: {text[:200]}")
        return json.loads(match.group(0))


def analyze_save(
    url: Optional[str],
    note: Optional[str],
    scraped: Optional[str] = None,
) -> dict:
    client = _client()
    if client is None:
        raise RuntimeError("GROQ_API_KEY not configured")

    prompt = f"""Analyze this saved content and return a JSON object.

URL: {url or 'none'}
User note: {note or 'none'}
Scraped page content (truncated): {(scraped or '')[:2500]}

Return JSON with these exact keys:
- title: short 5-10 word title
- summary: 2-3 sentence summary written for a future reader who forgot why they saved this
- keyPoints: array of 3-5 short bullet takeaways
- actions: array of 2-3 short actionable next steps
- category: one of [{', '.join(VALID_CATEGORIES)}]
- tags: array of 3-5 lowercase one-word tags
- confidence: number 0.0-1.0 reflecting your certainty

Return ONLY the json object, no prose, no markdown fence."""

    def call() -> dict:
        resp = client.chat.completions.create(
            model=_settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"},
            max_tokens=1024,
        )
        return _parse_json(resp.choices[0].message.content or "{}")

    data = _retry(call)

    if data.get("category") not in VALID_CATEGORIES:
        data["category"] = "learn"

    data.setdefault("title", "New save")
    data.setdefault("summary", "")
    data.setdefault("keyPoints", [])
    data.setdefault("actions", [])
    data.setdefault("tags", [])
    data.setdefault("confidence", 0.8)

    if not isinstance(data["keyPoints"], list):
        data["keyPoints"] = []
    if not isinstance(data["actions"], list):
        data["actions"] = []
    if not isinstance(data["tags"], list):
        data["tags"] = []
    try:
        data["confidence"] = float(data["confidence"])
    except (TypeError, ValueError):
        data["confidence"] = 0.8

    return data


def categorize_text(text: str) -> str:
    client = _client()
    if client is None:
        raise RuntimeError("GROQ_API_KEY not configured")

    def call() -> str:
        resp = client.chat.completions.create(
            model=_settings.GROQ_MODEL,
            messages=[{
                "role": "user",
                "content": (
                    f"Categorize the following text into exactly one of: "
                    f"{', '.join(VALID_CATEGORIES)}. "
                    f"Respond with ONLY the single category word.\n\nText: {text[:1500]}"
                ),
            }],
            temperature=0,
            max_tokens=10,
        )
        return (resp.choices[0].message.content or "").strip().lower()

    out = _retry(call)
    return out if out in VALID_CATEGORIES else "learn"


def summarize_text(text: str) -> dict:
    client = _client()
    if client is None:
        raise RuntimeError("GROQ_API_KEY not configured")

    def call() -> dict:
        resp = client.chat.completions.create(
            model=_settings.GROQ_MODEL,
            messages=[{
                "role": "user",
                "content": (
                    "Summarize the following text. Return a json object with these keys: "
                    '"summary" (2-3 sentences) and "keyPoints" (array of 3-5 short bullets). '
                    f"Return ONLY the json.\n\nText: {text[:5000]}"
                ),
            }],
            temperature=0.3,
            response_format={"type": "json_object"},
            max_tokens=512,
        )
        return _parse_json(resp.choices[0].message.content or "{}")

    data = _retry(call)
    data.setdefault("summary", "")
    data.setdefault("keyPoints", [])
    if not isinstance(data["keyPoints"], list):
        data["keyPoints"] = []
    return data


def ocr_image(image_bytes: bytes, mime: str = "image/jpeg") -> str:
    client = _client()
    if client is None:
        raise RuntimeError("GROQ_API_KEY not configured")

    b64 = base64.b64encode(image_bytes).decode("ascii")
    data_url = f"data:{mime};base64,{b64}"

    def call() -> str:
        resp = client.chat.completions.create(
            model=_settings.GROQ_VISION_MODEL,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": "Extract all visible text from this image verbatim. Return only the raw extracted text with no commentary or formatting."},
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            }],
            temperature=0,
            max_tokens=1024,
        )
        return (resp.choices[0].message.content or "").strip()

    return _retry(call)
