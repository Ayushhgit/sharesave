from fastapi import APIRouter, Depends
from ..deps import ensure_user
from ..auth import CurrentUser
from ..schemas import CategorizeIn, CategorizeOut
from ..services import groq_client, categorizer

router = APIRouter()


@router.post("/categorize", response_model=CategorizeOut)
def categorize(
    payload: CategorizeIn,
    _: CurrentUser = Depends(ensure_user),
):
    if groq_client.is_configured():
        try:
            cat = groq_client.categorize_text(payload.text)
        except Exception:
            cat = categorizer.fallback_category(payload.text)
    else:
        cat = categorizer.fallback_category(payload.text)
    return CategorizeOut(category=cat)  # type: ignore[arg-type]
