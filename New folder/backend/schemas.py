from pydantic import BaseModel
from typing import List, Dict, Optional

class WardrobeItem(BaseModel):
    category: str
    style: str
    image_url: str
    occasion_tags: List[str]
    color: Optional[Dict] = None
    style_tags: Optional[List[str]] = None

class OutfitRequest(BaseModel):
    occasion: str
    user_id: Optional[str] = "default"
    weather: Optional[Dict] = None
    preferences: Optional[Dict] = None

class OutfitSuggestion(BaseModel):
    items: List[WardrobeItem]
    suggested_accessories: List[WardrobeItem]
    confidence_score: float 