from fastapi import APIRouter, HTTPException
from typing import Dict
from utils.ai_services import AIServicesManager
from agents.suggestion_agent import SuggestionAgent

router = APIRouter(prefix="/api/suggestions")
ai_services = AIServicesManager()

@router.post("/outfit")
async def get_outfit_suggestion(
    occasion: str,
    user_id: str = "default",
    weather: Dict = None,
    preferences: Dict = None
):
    try:
        # Get suggestions through agent
        suggestions = await SuggestionAgent.suggest_outfit(
            occasion=occasion,
            user_id=user_id,
            weather=weather,
            preferences=preferences
        )
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/trends")
async def get_fashion_trends():
    try:
        trends = await ai_services.get_current_trends()
        return {"trends": trends}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 