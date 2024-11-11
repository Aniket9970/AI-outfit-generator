from PIL import Image
import cv2
import numpy as np
from typing import Tuple, Dict
import os
import time
import uuid

def process_image(image_path: str) -> Dict:
    """Process uploaded image and extract features"""
    # Load image
    img = Image.open(image_path)
    
    # Resize for consistent processing
    img = img.resize((300, 300))
    
    # Convert to numpy array for OpenCV processing
    img_array = np.array(img)
    
    # Extract dominant color
    dominant_color = get_dominant_color(img_array)
    
    # Get image features
    features = {
        "dominant_color": dominant_color,
        "brightness": calculate_brightness(img_array),
        "processed_path": save_processed_image(img)
    }
    
    return features

def get_dominant_color(img_array: np.ndarray) -> Tuple[int, int, int]:
    """Extract the dominant color from an image"""
    pixels = img_array.reshape(-1, 3)
    from sklearn.cluster import KMeans
    kmeans = KMeans(n_clusters=1)
    kmeans.fit(pixels)
    dominant_color = kmeans.cluster_centers_[0]
    return tuple(map(int, dominant_color))

def calculate_brightness(img_array: np.ndarray) -> float:
    """Calculate the average brightness of an image"""
    hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
    return hsv[:, :, 2].mean()

def save_processed_image(img: Image) -> str:
    """Save processed image and return path"""
    # Create uploads directory if it doesn't exist
    upload_dir = "backend/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    filename = f"{int(time.time())}_{uuid.uuid4().hex[:8]}.jpg"
    processed_path = os.path.join(upload_dir, filename)
    
    img.save(processed_path)
    return processed_path

# ... existing code ... 