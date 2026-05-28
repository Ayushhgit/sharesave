from fastapi import Depends
from sqlmodel import Session, select
from .db import get_session
from .auth import get_current_user, CurrentUser
from .models import User


def ensure_user(
    current: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> CurrentUser:
    existing = session.get(User, current.uid)
    if not existing:
        user = User(
            uid=current.uid,
            email=current.email or f"{current.uid}@unknown",
            display_name=current.name,
        )
        session.add(user)
        session.commit()
    return current
