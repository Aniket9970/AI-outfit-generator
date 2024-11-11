from uagents import Bureau, Agent
from uagents.setup import fund_agent_if_low
from uagents.network import get_network, Networks
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def register_agent_on_fetchai(agent: Agent):
    try:
        # Get the testnet network
        network = get_network(Networks.TESTNET)
        
        # Fund the agent's wallet
        fund_agent_if_low(agent.wallet.address())
        
        # Get agent's address
        agent_address = agent.address
        print(f"Agent address: {agent_address}")
        
        # Register protocols
        protocols = ["outfit_suggestion", "wardrobe_management"]
        for protocol in protocols:
            agent.register_protocol(
                protocol=protocol,
                endpoint=f"http://localhost:{agent.port}/submit"
            )
        
        print(f"Agent {agent.name} registered with address: {agent_address}")
        print(f"Access your agent at: https://agentverse.ai/agent/{agent_address}")
        
        return True
    except Exception as e:
        print(f"Error registering agent: {e}")
        return False

def setup_bureau():
    try:
        # Create a bureau with multiple ports
        bureau = Bureau(
            endpoint=["http://localhost:8000/submit"],
            port=8000
        )
        
        # Get bureau address
        bureau_address = bureau.address
        print(f"Bureau address: {bureau_address}")
        print(f"Access your bureau at: https://agentverse.ai/bureau/{bureau_address}")
        
        return bureau
    except Exception as e:
        print(f"Error setting up bureau: {e}")
        return None

def get_agent_info(agent: Agent):
    """Get detailed agent information"""
    return {
        "name": agent.name,
        "address": agent.address,
        "protocols": agent.protocols,
        "endpoint": agent.endpoint,
        "wallet_address": agent.wallet.address()
    }

if __name__ == "__main__":
    # Test registration
    test_agent = Agent(
        name="test_agent",
        port=8000,
        seed="test_seed"
    )
    
    if register_agent_on_fetchai(test_agent):
        print("Test registration successful!")
        info = get_agent_info(test_agent)
        print("Agent Info:", info)
    else:
        print("Test registration failed!")