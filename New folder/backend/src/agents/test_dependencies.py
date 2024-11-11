import sys
print(f"Python version: {sys.version}")

try:
    from uagents import Agent
    print("uAgents installed successfully")
except ImportError as e:
    print(f"Error importing uAgents: {e}")

try:
    import google.generativeai as genai
    print("Google Generative AI installed successfully")
except ImportError as e:
    print(f"Error importing Google Generative AI: {e}")

try:
    import cv2
    print("OpenCV installed successfully")
except ImportError as e:
    print(f"Error importing OpenCV: {e}")

try:
    from PIL import Image
    print("Pillow installed successfully")
except ImportError as e:
    print(f"Error importing Pillow: {e}") 