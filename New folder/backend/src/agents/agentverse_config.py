from uagents import Bureau

# Create a bureau to manage all agents
bureau = Bureau(
    endpoint="http://localhost:8000/submit",
    port=8000
)

# Import your agents
from outfit_agent import outfit_agent, wardrobe_agent, style_agent

# Register agents with the bureau
bureau.add(outfit_agent)
bureau.add(wardrobe_agent)
bureau.add(style_agent)

if __name__ == "__main__":
    # Run the bureau
    bureau.run() 