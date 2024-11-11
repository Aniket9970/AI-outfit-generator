import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { Button } from './components/ui/button';
import { useDropzone } from 'react-dropzone';
import { X } from 'lucide-react';
import { Input } from './components/ui/input';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [categorizedItems, setCategorizedItems] = useState({});

  const occasions = [
    { value: 'birthday', label: 'Birthday Party' },
    { value: 'casual', label: 'Casual Day' },
    { value: 'formal', label: 'Formal Event' },
    { value: 'date', label: 'Date Night' },
    { value: 'work', label: 'Work/Office' }
  ];

  const testBackend = async () => {
    try {
      const response = await axios.get('/api/health');
      console.log('Backend connection:', response.data);
      alert('Backend connection successful! Check console for details.');
    } catch (error) {
      console.error('Backend connection failed:', error);
      alert('Backend connection failed. Is the backend server running?');
    }
  };

  const getSuggestions = useCallback(async () => {
    try {
      if (!prompt) {
        alert('Please enter your occasion or style preference');
        return;
      }
      setLoading(true);
      const response = await axios.get(`/api/outfits/suggestions?prompt=${encodeURIComponent(prompt)}`);
      console.log('Raw suggestions response:', response.data);
      
      // Handle the nested response structure
      if (response.data.suggestions && Array.isArray(response.data.suggestions)) {
        const firstSuggestion = response.data.suggestions[0];
        if (firstSuggestion && firstSuggestion.suggestions) {
          setSuggestions([firstSuggestion.suggestions]); // Set as array for consistency
          console.log('Processed suggestions:', [firstSuggestion.suggestions]);
        }
      }
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      alert('Failed to get outfit suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  const onDrop = useCallback(async (acceptedFiles) => {
    try {
      setLoading(true);
      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append('images', file);
      });
      formData.append('prompt', prompt);

      const filesWithPreviews = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setUploadedFiles(prev => [...prev, ...filesWithPreviews]);

      const response = await axios.post('/api/outfits/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Raw upload response:', response.data);

      // Handle wardrobe items and suggestions
      if (response.data.suggestions && Array.isArray(response.data.suggestions)) {
        const firstSuggestion = response.data.suggestions[0];
        if (firstSuggestion) {
          if (firstSuggestion.wardrobe_items) {
            setCategorizedItems(firstSuggestion.wardrobe_items);
          }
          if (firstSuggestion.suggestions) {
            // Include the outfit preview in suggestions
            setSuggestions([{
              ...firstSuggestion.suggestions,
              outfit_preview: firstSuggestion.outfit_preview
            }]);
          }
          console.log('Outfit preview URL:', firstSuggestion.outfit_preview);
        }
      }

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  const renderCategorizedImages = () => {
    if (!categorizedItems || Object.keys(categorizedItems).length === 0) {
      return null;
    }

    return Object.entries(categorizedItems).map(([category, items]) => {
      if (!items || !Array.isArray(items)) {
        return null;
      }

      return (
        <div key={category} className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 capitalize">
            {category.replace('_', ' ')}:
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item, index) => (
              <div key={index} className="relative group">
                <img
                  src={typeof item === 'string' ? item : item.url}
                  alt={`${category} item ${index + 1}`}
                  className="h-40 w-full object-cover rounded-lg shadow-md"
                />
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  const renderUploadedImages = () => {
    if (!uploadedFiles.length) return null;

    return (
      <div className="mt-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Uploaded Images:</h3>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={clearAllImages}
          >
            Clear All
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="relative group">
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Remove image"
              >
                <X size={16} />
              </button>
              <img
                src={file.preview}
                alt={`Upload ${index + 1}`}
                className="h-40 w-full object-cover rounded-lg shadow-md"
                onLoad={() => {
                  // Keep the preview URL for display
                  // URL.revokeObjectURL(file.preview)
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSuggestions = () => {
    console.log('Current suggestions state:', suggestions);
    
    if (!suggestions || !suggestions.length) return null;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900">Outfit Suggestions:</h3>
        <div className="mt-4 grid gap-4">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index} 
              className="bg-white p-4 rounded-lg shadow"
            >
              {/* Display outfit preview if available */}
              {suggestion.outfit_preview && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Outfit Preview:</h4>
                  <div className="w-full max-w-2xl mx-auto">
                    <img 
                      src={suggestion.outfit_preview}
                      alt="Outfit Preview"
                      className="w-full h-auto rounded-lg shadow-md object-contain"
                      onError={(e) => {
                        console.error('Error loading preview:', e);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
              
              {suggestion.outfit_description && (
                <p className="mt-2 text-sm text-gray-600">
                  {suggestion.outfit_description}
                </p>
              )}

              {suggestion.items && Array.isArray(suggestion.items) && (
                <div className="mt-2">
                  <h5 className="font-medium text-gray-900">Items:</h5>
                  <ul className="mt-1 text-sm text-gray-600">
                    {suggestion.items.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {suggestion.colors && Array.isArray(suggestion.colors) && (
                <div className="mt-3">
                  <h5 className="font-medium text-gray-900">Color Palette:</h5>
                  <div className="mt-1 flex gap-2">
                    {suggestion.colors.map((color, idx) => (
                      <div 
                        key={idx}
                        className="w-8 h-8 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {suggestion.accessories && Array.isArray(suggestion.accessories) && (
                <div className="mt-3">
                  <h5 className="font-medium text-gray-900">Accessories:</h5>
                  <ul className="mt-1 text-sm text-gray-600">
                    {suggestion.accessories.map((acc, idx) => (
                      <li key={idx}>• {acc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {suggestion.style_tips && Array.isArray(suggestion.style_tips) && (
                <div className="mt-3">
                  <h5 className="font-medium text-gray-900">Style Tips:</h5>
                  <ul className="mt-1 text-sm text-gray-600">
                    {suggestion.style_tips.map((tip, idx) => (
                      <li key={idx}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {suggestion.avoid && Array.isArray(suggestion.avoid) && (
                <div className="mt-3">
                  <h5 className="font-medium text-gray-900 text-red-600">What to Avoid:</h5>
                  <ul className="mt-1 text-sm text-red-500">
                    {suggestion.avoid.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {suggestion.color_coordination && (
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Color Coordination:</strong> {suggestion.color_coordination}
                </p>
              )}

              {suggestion.confidence && (
                <div className="mt-2 text-xs text-gray-400">
                  Confidence: {(suggestion.confidence * 100).toFixed(1)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  React.useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [uploadedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  });

  // Function to remove a single image
  const removeImage = (indexToRemove) => {
    setUploadedFiles(prev => {
      const newFiles = prev.filter((_, index) => index !== indexToRemove);
      // Revoke the URL of the removed file
      URL.revokeObjectURL(prev[indexToRemove].preview);
      return newFiles;
    });
    // Clear suggestions when removing images
    setSuggestions([]);
  };

  // Function to clear all images
  const clearAllImages = () => {
    // Revoke all object URLs
    uploadedFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setUploadedFiles([]);
    setSuggestions([]); // Clear suggestions when clearing images
    setCategorizedItems({}); // Clear categorized items
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Outfit Suggester</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell me about your occasion
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g., Going to a wedding and want to look stylish"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={getSuggestions}
                  disabled={loading || !prompt}
                >
                  Get Suggestions
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4">
              <Button onClick={testBackend}>Test Backend Connection</Button>
              <div {...getRootProps()} className="cursor-pointer text-center">
                <input {...getInputProps()} />
                <Button disabled={loading}>
                  {isDragActive ? 'Drop the images here' : 'Upload Images'}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  {isDragActive ? 'Drop here...' : 'Click or drag & drop images'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supported formats: JPEG, JPG, PNG, WebP
                </p>
              </div>
            </div>

            {loading && (
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">Processing your images...</p>
              </div>
            )}

            {renderUploadedImages()}

            {Object.keys(categorizedItems || {}).length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Wardrobe</h2>
                {renderCategorizedImages()}
              </div>
            )}

            {renderSuggestions()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

// ... existing code ... 