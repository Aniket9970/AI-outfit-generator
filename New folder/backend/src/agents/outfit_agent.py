import sys
import json
import logging
import os
from dotenv import load_dotenv
import numpy as np
from PIL import Image
import requests
from io import BytesIO
import base64
import time
from typing import List, Dict
import cv2
from collections import defaultdict
from sklearn.cluster import KMeans

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class ClothingClassifier:
    def __init__(self):
        self.clothing_categories = {
            'tops': [
                'shirt', 't-shirt', 'blouse', 'top', 'sweater', 'sweatshirt',
                'polo', 'tank', 'tee'
            ],
            'bottoms': [
                'pant', 'jean', 'trouser', 'shorts', 'skirt', 'legging',
                'jogger'
            ],
            'shoes': [
                'shoe', 'sneaker', 'boot', 'sandal', 'footwear'
            ],
            'accessories': [
                'watch', 'belt', 'necklace', 'bracelet', 'ring', 'earring',
                'sunglass', 'hat', 'cap', 'scarf', 'bag'
            ],
            'outerwear': [
                'jacket', 'coat', 'blazer', 'vest', 'hoodie'
            ]
        }

    def analyze_image(self, image_url: str) -> Dict:
        """Analyze image using computer vision"""
        try:
            logger.info(f"Analyzing image: {image_url}")
            
            # Download and process image
            response = requests.get(image_url)
            img = Image.open(BytesIO(response.content))
            img = img.convert('RGB')
            img_array = np.array(img)
            
            # Get image properties
            height, width = img_array.shape[:2]
            aspect_ratio = width / height
            
            # Get dominant colors
            resized = cv2.resize(img_array, (150, 150))
            pixels = resized.reshape(-1, 3)
            kmeans = KMeans(n_clusters=3, n_init=10)
            kmeans.fit(pixels)
            colors = kmeans.cluster_centers_.astype(int)
            
            # Determine category based on filename and aspect ratio
            filename = image_url.lower()
            category = 'others'
            confidence = 0.5

            # Try to classify based on filename
            for cat, keywords in self.clothing_categories.items():
                if any(keyword in filename for keyword in keywords):
                    category = cat
                    confidence = 0.8
                    break

            # If no category found, use aspect ratio
            if category == 'others':
                if aspect_ratio < 0.8:  # Tall
                    category = 'bottoms'
                elif aspect_ratio > 1.5:  # Wide
                    category = 'outerwear'
                else:  # Square-ish
                    category = 'tops'

            logger.info(f"Classified as {category} with confidence {confidence}")
            return {
                'category': category,
                'confidence': confidence,
                'colors': [f'rgb({r},{g},{b})' for r,g,b in colors],
                'size': {'width': width, 'height': height}
            }

        except Exception as e:
            logger.error(f"Error analyzing image: {str(e)}")
            return {
                'category': 'others',
                'confidence': 0.3,
                'colors': ['#000000'],
                'size': {'width': 0, 'height': 0}
            }

def get_outfit_suggestions(prompt: str) -> Dict:
    """Generate outfit suggestions based on prompt"""
    try:
        # Basic suggestion templates
        suggestions = {
            'party': {
                'outfit_description': 'A stylish party outfit that balances comfort and fashion',
                'colors': ['#000000', '#FF0000', '#GOLD'],
                'style_tips': [
                    'Choose comfortable yet stylish shoes',
                    'Add statement accessories',
                    'Layer pieces for versatility'
                ],
                'accessories': ['Statement necklace', 'Clutch bag', 'Elegant watch'],
                'avoid': ['Overly casual items', 'Worn out shoes', 'Excessive accessories']
            },
            'casual': {
                'outfit_description': 'A comfortable casual outfit for everyday wear',
                'colors': ['#BLUE', '#WHITE', '#GRAY'],
                'style_tips': [
                    'Focus on comfort',
                    'Mix and match basics',
                    'Keep it simple'
                ],
                'accessories': ['Simple watch', 'Minimal jewelry', 'Casual bag'],
                'avoid': ['Formal pieces', 'Overly dressy items', 'Complex patterns']
            }
        }
        
        # Choose template based on prompt
        if 'party' in prompt.lower():
            return suggestions['party']
        else:
            return suggestions['casual']
            
    except Exception as e:
        logger.error(f"Error generating suggestions: {str(e)}")
        return {
            'outfit_description': 'Error generating suggestions',
            'colors': [],
            'style_tips': ['Please try again'],
            'accessories': [],
            'avoid': []
        }

def process_request(request_data: dict):
    try:
        # Get prompt and images
        prompt = request_data.get('preferences', {}).get('prompt', '')
        images = request_data.get('images', [])
        
        logger.info(f"Processing request with prompt: {prompt}")
        logger.info(f"Number of images: {len(images)}")
        
        # Initialize classifier
        classifier = ClothingClassifier()
        
        # Process images
        wardrobe = defaultdict(list)
        for image_url in images:
            analysis = classifier.analyze_image(image_url)
            wardrobe[analysis['category']].append({
                'url': image_url,
                'type': analysis['category'],
                'colors': analysis['colors'],
                'confidence': analysis['confidence']
            })
            logger.info(f"Classified {image_url} as {analysis['category']}")
        
        # Get suggestions
        suggestions = get_outfit_suggestions(prompt)
        
        # Create outfit preview
        preview_url = create_outfit_preview(wardrobe) if wardrobe else None
        
        result = [{
            'wardrobe_items': dict(wardrobe),
            'suggestions': suggestions,
            'outfit_preview': preview_url
        }]
        
        logger.info(f"Processed wardrobe items: {dict(wardrobe)}")
        return result

    except Exception as e:
        logger.error(f"Error in process_request: {str(e)}")
        return [{"error": str(e)}]

def create_outfit_preview(wardrobe_items: dict) -> str:
    """Create a visual preview of the outfit combination"""
    try:
        # Create a white canvas
        canvas_height = 1000
        canvas_width = 800
        canvas = np.ones((canvas_height, canvas_width, 3), dtype=np.uint8) * 255

        # Define positions for different clothing types
        positions = {
            'tops': (400, 200),      # Top center
            'bottoms': (400, 500),   # Middle
            'shoes': (400, 800),     # Bottom
            'accessories': (650, 400),# Right side
            'outerwear': (150, 400), # Left side
            'others': (650, 600)     # Bottom right
        }

        # Place each clothing item on the canvas
        for category, items in wardrobe_items.items():
            if not items:
                continue

            position = positions.get(category, positions['others'])
            for idx, item in enumerate(items):
                try:
                    image_url = item.get('url')
                    if not image_url:
                        continue

                    # Download and process image
                    response = requests.get(image_url)
                    img = Image.open(BytesIO(response.content))
                    img = img.convert('RGB')
                    img.thumbnail((300, 300))
                    img_array = np.array(img)

                    # Calculate position
                    h, w = img_array.shape[:2]
                    x, y = position
                    if idx > 0:
                        x += (idx * 50)
                    
                    y1 = max(0, min(y - h//2, canvas_height - h))
                    y2 = y1 + h
                    x1 = max(0, min(x - w//2, canvas_width - w))
                    x2 = x1 + w

                    # Place image on canvas
                    canvas[y1:y2, x1:x2] = img_array

                    # Add label
                    font = cv2.FONT_HERSHEY_SIMPLEX
                    cv2.putText(canvas,
                              category.upper(),
                              (x1, y1-10),
                              font,
                              0.5,
                              (0, 0, 0),
                              2)

                except Exception as e:
                    logger.error(f"Error processing image {image_url}: {str(e)}")
                    continue

        # Save preview
        preview_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads', 'previews')
        os.makedirs(preview_dir, exist_ok=True)
        
        timestamp = int(time.time() * 1000)
        preview_path = os.path.join(preview_dir, f'outfit_preview_{timestamp}.jpg')
        
        cv2.imwrite(preview_path, cv2.cvtColor(canvas, cv2.COLOR_RGB2BGR))

        # Convert to base64
        with open(preview_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            return f"data:image/jpeg;base64,{encoded_string}"

    except Exception as e:
        logger.error(f"Error creating outfit preview: {str(e)}")
        return None

if __name__ == "__main__":
    try:
        if len(sys.argv) > 1:
            input_data = json.loads(sys.argv[1])
            result = process_request(input_data)
            print(json.dumps(result))
        else:
            print(json.dumps([{"error": "No input data provided"}]))
    except Exception as e:
        print(json.dumps([{"error": str(e)}]))