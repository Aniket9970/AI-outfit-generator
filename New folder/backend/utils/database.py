import json
from typing import Dict, Any
from pathlib import Path
from datetime import datetime

class Database:
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self._ensure_file_exists()
        
    def _ensure_file_exists(self):
        """Create database file if it doesn't exist"""
        if not self.file_path.exists():
            self.file_path.parent.mkdir(parents=True, exist_ok=True)
            self.save({
                "users": {"default": {}},
                "metadata": {
                    "version": "1.0",
                    "last_updated": None
                }
            })
    
    def load(self) -> Dict[str, Any]:
        """Load data from JSON file"""
        with open(self.file_path, 'r') as f:
            return json.load(f)
    
    def save(self, data: Dict[str, Any]):
        """Save data to JSON file"""
        data["metadata"]["last_updated"] = datetime.now().isoformat()
        with open(self.file_path, 'w') as f:
            json.dump(data, f, indent=4)
    
    def update_user_wardrobe(self, user_id: str, wardrobe_data: Dict[str, Any]):
        """Update specific user's wardrobe data"""
        data = self.load()
        if user_id not in data["users"]:
            data["users"][user_id] = {}
        data["users"][user_id].update(wardrobe_data)
        self.save(data) 