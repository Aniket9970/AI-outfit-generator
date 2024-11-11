import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = BASE_DIR / "uploads"

# Create necessary directories
UPLOAD_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

# API configurations
API_CONFIG = {
    "host": "0.0.0.0",
    "port": 8000,
    "debug": True
}

# Agent configurations
AGENT_CONFIG = {
    "wardrobe": {
        "name": "wardrobe_agent",
        "seed": "wardrobe_seed_123"
    },
    "suggestion": {
        "name": "suggestion_agent",
        "seed": "suggestion_seed_456"
    }
}

# Storage configurations
STORAGE_CONFIG = {
    "wardrobe_file": DATA_DIR / "user_wardrobes.json",
    "max_image_size": 5 * 1024 * 1024  # 5MB
}

# Image processing configurations
IMAGE_CONFIG = {
    "thumbnail_size": (300, 300),
    "allowed_extensions": {".jpg", ".jpeg", ".png", ".gif"},
    "max_file_size": 5 * 1024 * 1024  # 5MB
} 