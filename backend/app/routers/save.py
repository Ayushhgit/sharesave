import logging
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from ..db import get_session
from ..deps import ensure_user
from ..auth import CurrentUser
from ..schemas import SavePayload, ProcessedSave, serialize_item
from ..models import Item
from ..services import groq_client, scraper, categorizer

log = logging.getLogger(__name__)
router = APIRouter()


def _uid(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}"


def _safe_thumbnail(payload_uri: str | None, og_image: str | None) -> str | None:
    if payload_uri and payload_uri.startswith(("http://", "https://")):
        return payload_uri
    return og_image


@router.post("/save", response_model=ProcessedSave)
async def save(
    payload: SavePayload,
    user: CurrentUser = Depends(ensure_user),
    session: Session = Depends(get_session),
):
    if not (payload.url or payload.note or payload.imageUri):
        raise HTTPException(400, "Provide url, note, or imageUri")

    scraped: str | None = None
    og_title: str | None = None
    og_image: str | None = None
    if payload.url:
        try:
            meta = await scraper.fetch_metadata(payload.url)
            scraped = meta.get("text")
            og_title = meta.get("title")
            og_image = meta.get("image")
            log.info("Scraped %s: title=%r, text_len=%d",
                     payload.url, og_title, len(scraped or ""))
        except Exception as e:
            log.warning("Scrape failed for %s: %s", payload.url, e)

    source = payload.source or scraper.detect_source(payload.url)
    now = datetime.now(timezone.utc)

    analysis = None
    used_groq = False
    if groq_client.is_configured():
        try:
            analysis = groq_client.analyze_save(payload.url, payload.note, scraped)
            used_groq = True
            log.info("Groq analyzed save: category=%s, confidence=%.2f",
                     analysis["category"], analysis["confidence"])
        except Exception as e:
            log.exception("Groq analyze_save failed: %s", e)

    if analysis is None:
        text_blob = f"{payload.url or ''} {payload.note or ''} {scraped or ''}"
        analysis = {
            "title": og_title or (payload.note or "New save").split("\n")[0][:64],
            "summary": (scraped[:240] + "...") if scraped and len(scraped) > 240 else (scraped or "AI summary unavailable. Tap to revisit the source."),
            "keyPoints": [],
            "actions": [],
            "category": categorizer.fallback_category(text_blob),
            "tags": [],
            "confidence": 0.5,
        }

    category = analysis["category"]
    item = Item(
        id=_uid("itm"),
        owner_uid=user.uid,
        url=payload.url,
        title=analysis["title"],
        source=source,
        thumbnail=_safe_thumbnail(payload.imageUri, og_image),
        summary=analysis["summary"],
        key_points=analysis["keyPoints"],
        actions=[
            {"id": _uid("a"), "label": label, "done": False}
            for label in analysis["actions"]
        ],
        category=category,
        collection=categorizer.CATEGORY_TO_COLLECTION.get(category),
        tags=analysis["tags"],
        notes=payload.note,
        created_at=now,
        updated_at=now,
    )
    session.add(item)
    session.commit()
    session.refresh(item)

    log.info("Saved item %s (user=%s, source=%s, groq=%s)",
             item.id, user.uid, source, used_groq)

    return ProcessedSave(
        item=serialize_item(item),
        detectedCategory=category,  # type: ignore[arg-type]
        confidence=float(analysis["confidence"]),
    )
