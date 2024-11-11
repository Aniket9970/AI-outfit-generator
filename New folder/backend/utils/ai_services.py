from typing import Dict, List, Optional
import os
import asyncio
import google.generativeai as genai
from PIL import Image
import io
import aiohttp
from fastapi import HTTPException
import json

class AIServicesAgent:
    def __init__(self, name: str):
        try:
            gemini_api_key = os.getenv("GEMINI_API_KEY")
            if not gemini_api_key:
                raise ValueError("GEMINI_API_KEY not found")
            genai.configure(api_key=gemini_api_key)
            self.model = genai.GenerativeModel('gemini-pro-vision')
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to initialize AI services: {str(e)}"
            )

    async def analyze_style(self, image_url: str) -> Dict:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(image_url) as response:
                    if response.status != 200:
                        raise HTTPException(status_code=400, detail="Failed to fetch image")
                    image_data = await response.read()
                    image = Image.open(io.BytesIO(image_data))

            prompt = """
            Analyze this clothing item and provide:
            1. Style tags (comma-separated)
            2. Detailed style description
            3. Color palette
            4. Style category
            5. Confidence score (0-100)
            Format the response in clear sections.
            """
            
            response = await self.model.generate_content([prompt, image])
            
            if not response.text:
                raise ValueError("Empty response from Gemini")
            
            sections = response.text.split('\n\n')
            return {
                "style_tags": [tag.strip() for tag in sections[0].split(',')],
                "description": sections[1],
                "color_palette": sections[2].split(','),
                "style_category": sections[3],
                "confidence": float(sections[4].replace('%', '').strip())
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Style analysis failed: {str(e)}"
            )

    async def suggest_outfit(self, occasion: str, wardrobe: Dict) -> Dict:
        try:
            prompt = f"""
            Suggest an outfit for {occasion} using these available items:
            {json.dumps(wardrobe, indent=2)}
            
            Consider:
            1. Occasion appropriateness
            2. Color coordination
            3. Style matching
            4. Weather suitability
            
            Format the response as a JSON with:
            1. Selected items
            2. Styling tips
            3. Confidence score
            """
            
            response = await self.model.generate_content(prompt)
            
            if not response.text:
                raise ValueError("Empty response from Gemini")
                
            return json.loads(response.text)
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Suggestion generation failed: {str(e)}"
            )
