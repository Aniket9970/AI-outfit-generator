import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './styles.css';

function WardrobeUploader() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [category, setCategory] = useState('tops');
    const [loading, setLoading] = useState(false);

    const onDrop = useCallback((acceptedFiles) => {
        setSelectedFile(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'image/*',
        multiple: false
    });

    const handleUpload = async () => {
        if (!selectedFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('category', category);

        try {
            await axios.post('http://localhost:8000/api/wardrobe/upload', formData);
            alert('Upload successful!');
            setSelectedFile(null);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wardrobe-uploader">
            <h2>Upload to Wardrobe</h2>
            <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                {selectedFile ? (
                    <p>Selected: {selectedFile.name}</p>
                ) : (
                    <p>Drag & drop an image here, or click to select</p>
                )}
            </div>
            <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="category-select"
            >
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="dresses">Dresses</option>
                <option value="accessories">Accessories</option>
            </select>
            <button 
                onClick={handleUpload} 
                disabled={!selectedFile || loading}
                className="upload-button"
            >
                {loading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
}

export default WardrobeUploader; 