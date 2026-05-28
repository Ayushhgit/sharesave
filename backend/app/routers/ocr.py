from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from ..deps import ensure_user
from ..auth import CurrentUser
from ..schemas import OcrOut
from ..services import groq_client

router = APIRouter()


@router.post("/ocr", response_model=OcrOut)
async def ocr(
    image: UploadFile = File(...),
    _: CurrentUser = Depends(ensure_user),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")

    data = await image.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(413, "Image too large (max 10 MB)")

    if not groq_client.is_configured():
        raise HTTPException(503, "OCR unavailable — GROQ_API_KEY not configured")

    try:
        text = groq_client.ocr_image(data, image.content_type)
    except Exception as e:
        raise HTTPException(502, f"OCR failed: {e}")

    return OcrOut(text=text)
