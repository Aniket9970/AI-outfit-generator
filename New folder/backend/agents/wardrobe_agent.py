from uagents import Agent, Context
from utils.ai_services import AIServicesAgent

class WardrobeAgent(Agent):
    def __init__(self, name: str):
        super().__init__(name=name, seed=name)
        self.ai_services = AIServicesAgent(name=f"{name}_ai")
        self.wardrobe = {}

    async def add_item(self, ctx: Context, item_data: dict):
        try:
            analysis = await self.ai_services.analyze_style(item_data["image_url"])
            return {"status": "success", "analysis": analysis}
        except Exception as e:
            return {"status": "error", "message": str(e)}
