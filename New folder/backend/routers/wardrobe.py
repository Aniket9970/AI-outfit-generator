from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Dict
from utils.ai_services import AIServicesManager
from agents.wardrobe_agent import WardrobeAgent

router = APIRouter(prefix="/api/wardrobe")
ai_services = AIServicesManager()

@router.post("/upload")
async def upload_item(
    image: UploadFile = File(...),
    category: str = Form(...),
    style: str = Form(...),
    tags: str = Form(...),
    user_id: str = Form("default")
):
    try:
        # Process image and get AI analysis
        image_features = await ai_services.analyze_style(image.file)
        
        # Create wardrobe item
        item = {
            "category": category,
            "style": style,
            "tags": tags,
            "image_features": image_features
        }
        
        # Add to wardrobe through agent
        response = await WardrobeAgent.add_item(item, user_id)
        return response
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/items/{user_id}")
async def get_wardrobe_items(user_id: str):
    try:
        items = await WardrobeAgent.get_items(user_id)
        return {"items": items}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 