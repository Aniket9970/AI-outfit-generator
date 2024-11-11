from fastapi import HTTPException
from typing import Dict, Any

class OutfitSuggesterError(Exception):
    """Base error class for Outfit Suggester"""
    def __init__(self, message: str, details: Dict[str, Any] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

class ImageProcessingError(OutfitSuggesterError):
    """Raised when image processing fails"""
    pass

class WardrobeError(OutfitSuggesterError):
    """Raised when wardrobe operations fail"""
    pass

class SuggestionError(OutfitSuggesterError):
    """Raised when suggestion generation fails"""
    pass

def handle_error(error: Exception) -> HTTPException:
    """Convert application errors to HTTP exceptions"""
    if isinstance(error, OutfitSuggesterError):
        return HTTPException(
            status_code=400,
            detail={
                "message": error.message,
                "details": error.details
            }
        )
    return HTTPException(
        status_code=500,
        detail={"message": "Internal server error"}
    ) 