const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-render-app-name.onrender.com'
  : 'http://localhost:8000';

export const uploadImages = async (formData) => {
  const response = await fetch(`${API_URL}/api/outfits/upload`, {
    method: 'POST',
    body: formData
  });
  return response.json();
}; 