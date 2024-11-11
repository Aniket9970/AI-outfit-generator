from uagents import Agent, Context

class SuggestionAgent(Agent):
    def __init__(self, name: str, wardrobe_agent):
        super().__init__(name=name, seed=name)
        self.wardrobe_agent = wardrobe_agent

    async def suggest_outfit(self, ctx: Context, occasion: str):
        try:
            return await self.wardrobe_agent.ai_services.suggest_outfit(
                occasion, 
                self.wardrobe_agent.wardrobe
            )
        except Exception as e:
            return {"status": "error", "message": str(e)}
