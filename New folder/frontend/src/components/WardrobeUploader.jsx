import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Upload, X } from 'lucide-react';
import { useToast } from "../components/ui/use-toast";
import axios from 'axios';

function WardrobeUploader() {
    const [category, setCategory] = useState('tops');
    const [tags, setTags] = useState([]);
    const [style, setStyle] = useState('');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const { toast } = useToast();

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        setPreview(URL.createObjectURL(file));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/*',
        multiple: false
    });

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
        try {
            const formData = new FormData();
            formData.append('image', preview);
            formData.append('category', category);
            formData.append('tags', JSON.stringify(tags));
            formData.append('style', style);

            await axios.post('/api/wardrobe/upload', formData);
            
            setPreview(null);
            setTags([]);
            setStyle('');
            
            toast({
                title: "Success",
                description: "Item uploaded successfully!",
                variant: "success",
            });
        } catch (error) {
            console.error('Upload failed:', error);
            toast({
                title: "Error",
                description: "Failed to upload item. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Add to Your Wardrobe</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpload} className="space-y-6">
                    <div 
                        {...getRootProps()} 
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                            ${isDragActive ? 'border-primary' : 'border-muted'}`}
                    >
                        <input {...getInputProps()} />
                        {preview ? (
                            <div className="relative inline-block">
                                <img 
                                    src={preview} 
                                    alt="Preview" 
                                    className="max-h-64 rounded-lg"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPreview(null);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    {isDragActive 
                                        ? "Drop the image here..." 
                                        : "Drag & drop an image here, or click to select"}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tops">Tops</SelectItem>
                                <SelectItem value="bottoms">Bottoms</SelectItem>
                                <SelectItem value="dresses">Dresses</SelectItem>
                                <SelectItem value="accessories">Accessories</SelectItem>
                                <SelectItem value="shoes">Shoes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="style">Style Description</Label>
                        <Input
                            id="style"
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            placeholder="e.g., Casual, Formal, Party"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2 p-2 border rounded-lg">
                            {tags.map((tag, index) => (
                                <Badge 
                                    key={index} 
                                    variant="secondary"
                                    className="flex items-center gap-1"
                                >
                                    {tag}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0"
                                        onClick={() => removeTag(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ))}
                            <Input
                                className="border-0 focus-visible:ring-0"
                                placeholder="Type and press Enter to add tags"
                                onKeyPress={handleTagInput}
                            />
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={!preview || loading}
                        className="w-full"
                    >
                        {loading ? "Uploading..." : "Upload Item"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default WardrobeUploader; 