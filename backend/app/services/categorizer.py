import re

CATEGORY_TO_COLLECTION = {
    "learn": "learn",
    "buy": "buy",
    "watch": "dream",
    "recipe": "eat",
    "fitness": "improve",
    "career": "improve",
    "business": "build",
    "travel": "travel",
    "inspiration": "dream",
}


def fallback_category(text: str) -> str:
    s = text.lower()
    if re.search(r"recipe|cook|miso|pasta|dinner|food", s): return "recipe"
    if re.search(r"amazon|buy|shop|product|wishlist", s): return "buy"
    if re.search(r"youtube|video|reel|watch|tiktok", s): return "watch"
    if re.search(r"lisbon|travel|flight|hotel|trip", s): return "travel"
    if re.search(r"career|salary|interview|role", s): return "career"
    if re.search(r"idea|startup|build|saas", s): return "business"
    if re.search(r"gym|run|stretch|mobility|fitness", s): return "fitness"
    if re.search(r"aesthetic|moodboard|color", s): return "inspiration"
    return "learn"
