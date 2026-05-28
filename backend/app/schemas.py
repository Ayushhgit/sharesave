from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict

IntentCategoryId = Literal[
    "learn", "buy", "watch", "recipe", "fitness",
    "career", "business", "travel", "inspiration",
]
CollectionId = Literal["learn", "build", "buy", "eat", "travel", "improve", "dream"]
SourcePlatform = Literal[
    "instagram", "youtube", "twitter", "tiktok", "web",
    "pinterest", "amazon", "screenshot", "note", "unknown",
]
ReminderPreset = Literal["tonight", "weekend", "next-month", "payday", "someday"]


class ActionItemOut(BaseModel):
    id: str
    label: str
    done: bool


class ReminderOut(BaseModel):
    id: str
    itemId: str
    scheduledFor: str
    preset: Optional[ReminderPreset] = None
    notificationId: Optional[str] = None
    fired: Optional[bool] = None


class SavedItemOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    url: Optional[str] = None
    title: str
    source: SourcePlatform
    thumbnail: Optional[str] = None
    summary: str
    keyPoints: list[str] = Field(default_factory=list)
    actions: list[ActionItemOut] = Field(default_factory=list)
    category: IntentCategoryId
    collection: Optional[CollectionId] = None
    tags: list[str] = Field(default_factory=list)
    notes: Optional[str] = None
    reminder: Optional[ReminderOut] = None
    createdAt: str
    updatedAt: str
    resurfacedAt: Optional[str] = None
    archived: Optional[bool] = None
    ocrText: Optional[str] = None


class SavePayload(BaseModel):
    url: Optional[str] = None
    note: Optional[str] = None
    imageUri: Optional[str] = None
    source: Optional[SourcePlatform] = None


class ProcessedSave(BaseModel):
    item: SavedItemOut
    detectedCategory: IntentCategoryId
    confidence: float


class CategorizeIn(BaseModel):
    text: str


class CategorizeOut(BaseModel):
    category: IntentCategoryId


class SummarizeIn(BaseModel):
    text: str


class SummarizeOut(BaseModel):
    summary: str
    keyPoints: list[str]


class OcrOut(BaseModel):
    text: str


class ReminderIn(BaseModel):
    itemId: str
    scheduledFor: str
    preset: Optional[ReminderPreset] = None


class ActionItemIn(BaseModel):
    id: str
    label: str
    done: bool


class UpdateItemIn(BaseModel):
    notes: Optional[str] = None
    tags: Optional[list[str]] = None
    actions: Optional[list[ActionItemIn]] = None
    category: Optional[IntentCategoryId] = None
    collection: Optional[CollectionId] = None
    archived: Optional[bool] = None
    resurfacedAt: Optional[str] = None
    ocrText: Optional[str] = None


def serialize_item(model, reminder=None) -> SavedItemOut:
    return SavedItemOut(
        id=model.id,
        url=model.url,
        title=model.title,
        source=model.source,  # type: ignore[arg-type]
        thumbnail=model.thumbnail,
        summary=model.summary,
        keyPoints=model.key_points or [],
        actions=[ActionItemOut(**a) for a in (model.actions or [])],
        category=model.category,  # type: ignore[arg-type]
        collection=model.collection,  # type: ignore[arg-type]
        tags=model.tags or [],
        notes=model.notes,
        reminder=ReminderOut(
            id=reminder.id,
            itemId=reminder.item_id,
            scheduledFor=reminder.scheduled_for.isoformat(),
            preset=reminder.preset,  # type: ignore[arg-type]
            notificationId=reminder.notification_id,
            fired=reminder.fired,
        ) if reminder else None,
        createdAt=model.created_at.isoformat(),
        updatedAt=model.updated_at.isoformat(),
        resurfacedAt=model.resurfaced_at.isoformat() if model.resurfaced_at else None,
        archived=model.archived,
        ocrText=model.ocr_text,
    )
