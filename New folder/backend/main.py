from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uagents import Bureau
from agents.wardrobe_agent import WardrobeAgent
from agents.suggestion_agent import SuggestionAgent

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Initialize agents
bureau = Bureau()
wardrobe_agent = WardrobeAgent(name="wardrobe_agent")
suggestion_agent = SuggestionAgent(name="suggestion_agent", wardrobe_agent=wardrobe_agent)

# Add agents to bureau
bureau.add(wardrobe_agent)
bureau.add(suggestion_agent)

# Basic routes
@app.post("/api/wardrobe/upload")
async def upload_item(item_data: dict):
    return await wardrobe_agent.add_item(None, item_data)

@app.post("/api/suggest")
async def get_suggestions(occasion: str):
    return await suggestion_agent.suggest_outfit(None, occasion)
