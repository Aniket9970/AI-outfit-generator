from typing import Dict, List
from utils.database import Database
from utils.ai_services import AIServicesManager

class WardrobeService:
    def __init__(self):
        self.db = Database()
        self.ai_services = AIServicesManager()
    
    async def add_item(self, item: Dict, user_id: str) -> Dict:
        """Add item to user's wardrobe with AI analysis"""
        try:
            # AI analysis
            style_analysis = await self.ai_services.analyze_style(
                item["image_features"]["processed_path"]
            )
            
            # Enhance item with AI insights
            enhanced_item = {
                **item,
                "style_analysis": style_analysis,
                "recommendations": await self._generate_recommendations(style_analysis)
            }
            
            # Save to database
            await self.db.update_user_wardrobe(user_id, {
                item["category"]: enhanced_item
            })
            
            return enhanced_item
            
        except Exception as e:
            raise Exception(f"Failed to add item: {str(e)}")
    
    async def _generate_recommendations(self, style_analysis: Dict) -> Dict:
        """Generate initial recommendations for the item"""
        return {
            "matching_items": await self.ai_services.get_matching_items(style_analysis),
            "occasions": await self.ai_services.suggest_occasions(style_analysis)
        } 