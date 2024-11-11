import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './WardrobeUploader.css';

function WardrobeUploader() {
    const [category, setCategory] = useState('tops');
    const [tags, setTags] = useState([]);
    const [style, setStyle] = useState('');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        setPreview(URL.createObjectURL(file));
        handleFileSelect(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/*',
        multiple: false
    });

    const handleFileSelect = (file) => {
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleTagInput = (e) => {
        if (e.key === 'Enter' && e.target.value) {
            setTags([...tags, e.target.value]);
            e.target.value = '';
        }
    };

    const removeTag = (indexToRemove) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        if (!preview) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', preview);
        formData.append('category', category);
        formData.append('tags', JSON.stringify(tags));
        formData.append('style', style);

        try {
            await axios.post('/api/wardrobe/upload', formData);
            setPreview(null);
            setTags([]);
            setStyle('');
            alert('Item uploaded successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wardrobe-uploader">
            <h2>Add to Your Wardrobe</h2>
            
            <form onSubmit={handleUpload} className="upload-form">
                <div className="dropzone" {...getRootProps()}>
                    <input {...getInputProps()} />
                    {preview ? (
                        <div className="preview-container">
                            <img src={preview} alt="Preview" className="image-preview" />
                            <button 
                                type="button" 
                                className="remove-preview"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPreview(null);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <div className="dropzone-content">
                            {isDragActive ? (
                                <p>Drop the image here...</p>
                            ) : (
                                <p>Drag & drop an image here, or click to select</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Category:</label>
                    <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="category-select"
                    >
                        <option value="tops">Tops</option>
                        <option value="bottoms">Bottoms</option>
                        <option value="dresses">Dresses</option>
                        <option value="accessories">Accessories</option>
                        <option value="shoes">Shoes</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Style Description:</label>
                    <input 
                        type="text"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        placeholder="e.g., Casual, Formal, Party"
                        className="style-input"
                    />
                </div>

                <div className="form-group">
                    <label>Tags:</label>
                    <div className="tags-container">
                        {tags.map((tag, index) => (
                            <span key={index} className="tag">
                                {tag}
                                <button 
                                    type="button"
                                    onClick={() => removeTag(index)}
                                    className="remove-tag"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        <input
                            type="text"
                            onKeyPress={handleTagInput}
                            placeholder="Type and press Enter to add tags"
                            className="tag-input"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={!preview || loading}
                    className="upload-button"
                >
                    {loading ? 'Uploading...' : 'Upload Item'}
                </button>
            </form>
        </div>
    );
}

export default WardrobeUploader;

// ... existing code ... 