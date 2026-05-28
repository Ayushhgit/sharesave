import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..db import get_session
from ..deps import ensure_user
from ..auth import CurrentUser
from ..schemas import ReminderIn, ReminderOut
from ..models import Item, Reminder

router = APIRouter()


@router.post("/reminder", response_model=ReminderOut)
def set_reminder(
    payload: ReminderIn,
    user: CurrentUser = Depends(ensure_user),
    session: Session = Depends(get_session),
):
    item = session.get(Item, payload.itemId)
    if not item or item.owner_uid != user.uid:
        raise HTTPException(404, "Item not found")

    try:
        scheduled_dt = datetime.fromisoformat(payload.scheduledFor.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(400, "scheduledFor must be ISO 8601")

    existing = session.exec(
        select(Reminder).where(Reminder.item_id == payload.itemId)
    ).first()
    if existing:
        existing.scheduled_for = scheduled_dt
        existing.preset = payload.preset
        existing.fired = False
        session.add(existing)
        session.commit()
        session.refresh(existing)
        rem = existing
    else:
        rem = Reminder(
            id=f"rem_{uuid.uuid4().hex[:10]}",
            item_id=payload.itemId,
            owner_uid=user.uid,
            scheduled_for=scheduled_dt,
            preset=payload.preset,
        )
        session.add(rem)
        session.commit()
        session.refresh(rem)

    return ReminderOut(
        id=rem.id,
        itemId=rem.item_id,
        scheduledFor=rem.scheduled_for.isoformat(),
        preset=rem.preset,  # type: ignore[arg-type]
        notificationId=rem.notification_id,
        fired=rem.fired,
    )
