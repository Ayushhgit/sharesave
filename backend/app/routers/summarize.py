from fastapi import APIRouter, Depends, HTTPException
from ..deps import ensure_user
from ..auth import CurrentUser
from ..schemas import SummarizeIn, SummarizeOut
from ..services import groq_client

router = APIRouter()


@router.post("/summarize", response_model=SummarizeOut)
def summarize(
    payload: SummarizeIn,
    _: CurrentUser = Depends(ensure_user),
):
    if not groq_client.is_configured():
        raise HTTPException(503, "Summarize unavailable — GROQ_API_KEY not configured")
    try:
        data = groq_client.summarize_text(payload.text)
    except Exception as e:
        raise HTTPException(502, f"Summarize failed: {e}")
    return SummarizeOut(summary=data["summary"], keyPoints=data["keyPoints"])
