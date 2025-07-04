import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ReferenceImageUploadProps {
  onImageSelect: (image: string | null) => void;
  isGenerating: boolean;
}

export const ReferenceImageUpload: React.FC<ReferenceImageUploadProps> = ({
  onImageSelect,
  isGenerating
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        onImageSelect(base64String);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (selectedImage) {
    return (
      <div className="relative inline-block">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-300">
          <img 
            src={selectedImage} 
            alt="Reference" 
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            disabled={isGenerating}
            className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-bl-lg flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            <X className="h-3 w-3 text-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={isGenerating}
      />
      
      {/* Drag and drop zone for desktop */}
      <div className="hidden lg:block">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-4 transition-all cursor-pointer ${
            isDragging 
              ? 'border-vibrant-pink bg-pink-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={openFileDialog}
        >
          <div className="flex flex-col items-center text-center">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 font-source-sans">
              Drop reference image here or click to upload
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Optional: Use as style guide or motif
            </p>
          </div>
        </div>
      </div>

      {/* Compact button for mobile */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={openFileDialog}
          disabled={isGenerating}
          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all relative overflow-hidden group disabled:opacity-50"
          title="Upload reference image"
        >
          <ImageIcon className="h-4 w-4 text-gray-600 group-hover:text-vibrant-pink transition-colors" />
          <div className="absolute inset-0 bg-vibrant-pink opacity-0 group-hover:opacity-10 rounded-full transition-opacity"></div>
        </button>
      </div>
    </>
  );
};