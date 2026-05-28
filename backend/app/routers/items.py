import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, select
from ..db import get_session
from ..deps import ensure_user
from ..auth import CurrentUser
from ..schemas import SavedItemOut, UpdateItemIn, serialize_item
from ..models import Item, Reminder

log = logging.getLogger(__name__)
router = APIRouter()


@router.get("/items", response_model=list[SavedItemOut])
def list_items(
    user: CurrentUser = Depends(ensure_user),
    session: Session = Depends(get_session),
):
    items = session.exec(
        select(Item)
        .where(Item.owner_uid == user.uid)
        .order_by(Item.created_at.desc())
    ).all()
    reminders_by_item = {
        r.item_id: r for r in session.exec(
            select(Reminder).where(Reminder.owner_uid == user.uid)
        ).all()
    }
    return [serialize_item(i, reminders_by_item.get(i.id)) for i in items]


@router.get("/items/{item_id}", response_model=SavedItemOut)
def get_item(
    item_id: str,
    user: CurrentUser = Depends(ensure_user),
    session: Session = Depends(get_session),
):
    item = session.get(Item, item_id)
    if not item or item.owner_uid != user.uid:
        raise HTTPException(404, "Item not found")
    reminder = session.exec(
        select(Reminder).where(Reminder.item_id == item_id).limit(1)
    ).first()
    return serialize_item(item, reminder)


@router.patch("/items/{item_id}", response_model=SavedItemOut)
def update_item(
    item_id: str,
    patch: UpdateItemIn,
    user: CurrentUser = Depends(ensure_user),
    session: Session = Depends(get_session),
):
    item = session.get(Item, item_id)
    if not item or item.owner_uid != user.uid:
        raise HTTPException(404, "Item not found")

    fields = patch.model_dump(exclude_unset=True)
    if "notes" in fields:
        item.notes = fields["notes"]
    if "tags" in fields:
        item.tags = fields["tags"]
    if "actions" in fields:
        item.actions = [a.model_dump() for a in patch.actions]  # type: ignore[union-attr]
    if "category" in fields:
        item.category = fields["category"]
    if "collection" in fields:
        item.collection = fields["collection"]
    if "archived" in fields:
        item.archived = fields["archived"]
    if "resurfacedAt" in fields:
        item.resurfaced_at = (
            datetime.fromisoformat(fields["resurfacedAt"].replace("Z", "+00:00"))
            if fields["resurfacedAt"] else None
        )
    if "ocrText" in fields:
        item.ocr_text = fields["ocrText"]

    item.updated_at = datetime.now(timezone.utc)
    session.add(item)
    session.commit()
    session.refresh(item)

    reminder = session.exec(
        select(Reminder).where(Reminder.item_id == item_id).limit(1)
    ).first()
    log.info("Updated item %s (fields=%s)", item_id, list(fields.keys()))
    return serialize_item(item, reminder)


@router.delete("/items/{item_id}", status_code=204)
def delete_item(
    item_id: str,
    user: CurrentUser = Depends(ensure_user),
    session: Session = Depends(get_session),
):
    item = session.get(Item, item_id)
    if not item or item.owner_uid != user.uid:
        raise HTTPException(404, "Item not found")

    for rem in session.exec(
        select(Reminder).where(Reminder.item_id == item_id)
    ).all():
        session.delete(rem)
    session.flush()

    session.delete(item)
    session.commit()
    log.info("Deleted item %s", item_id)
    return Response(status_code=204)
