from typing import Optional
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup

UA = "Mozilla/5.0 (compatible; IntentBot/1.0)"

SOURCE_MAP = {
    "instagram.com": "instagram",
    "youtube.com": "youtube",
    "youtu.be": "youtube",
    "twitter.com": "twitter",
    "x.com": "twitter",
    "tiktok.com": "tiktok",
    "pinterest.com": "pinterest",
    "amazon.com": "amazon",
    "amazon.in": "amazon",
}


def detect_source(url: Optional[str]) -> str:
    if not url:
        return "note"
    try:
        host = urlparse(url).hostname or ""
    except Exception:
        return "unknown"
    host = host.lower().lstrip("www.")
    for key, val in SOURCE_MAP.items():
        if key in host:
            return val
    return "web"


async def fetch_metadata(url: str) -> dict:
    try:
        async with httpx.AsyncClient(
            timeout=10.0, follow_redirects=True, headers={"User-Agent": UA}
        ) as client:
            r = await client.get(url)
            r.raise_for_status()
            html = r.text
    except Exception:
        return {"title": None, "description": None, "image": None, "text": None}

    soup = BeautifulSoup(html, "lxml")

    def meta(prop: str) -> Optional[str]:
        tag = soup.find("meta", property=prop) or soup.find("meta", attrs={"name": prop})
        return tag.get("content") if tag and tag.get("content") else None

    title = meta("og:title") or (soup.title.string if soup.title else None)
    description = meta("og:description") or meta("description")
    image = meta("og:image")

    for s in soup(["script", "style", "nav", "footer", "header"]):
        s.decompose()
    text = " ".join(soup.get_text(" ", strip=True).split())[:3000]

    return {
        "title": title.strip() if title else None,
        "description": description.strip() if description else None,
        "image": image,
        "text": text,
    }
