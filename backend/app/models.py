from datetime import datetime, timezone
from typing import Optional, Any
from sqlmodel import SQLModel, Field, Column, JSON


def _now() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    uid: str = Field(primary_key=True)
    email: str = Field(index=True)
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: datetime = Field(default_factory=_now)


class Item(SQLModel, table=True):
    id: str = Field(primary_key=True)
    owner_uid: str = Field(index=True, foreign_key="user.uid")
    url: Optional[str] = None
    title: str
    source: str = Field(default="unknown")
    thumbnail: Optional[str] = None
    summary: str = ""
    key_points: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    actions: list[dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    category: str = Field(default="learn", index=True)
    collection: Optional[str] = Field(default=None, index=True)
    tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    notes: Optional[str] = None
    ocr_text: Optional[str] = None
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)
    resurfaced_at: Optional[datetime] = None
    archived: bool = Field(default=False)


class Reminder(SQLModel, table=True):
    id: str = Field(primary_key=True)
    item_id: str = Field(foreign_key="item.id", index=True)
    owner_uid: str = Field(index=True)
    scheduled_for: datetime
    preset: Optional[str] = None
    notification_id: Optional[str] = None
    fired: bool = Field(default=False)
    created_at: datetime = Field(default_factory=_now)
