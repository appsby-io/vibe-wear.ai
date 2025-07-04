import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Mic, Image, AlertCircle, X } from 'lucide-react';
import { validatePrompt } from '../utils/imageGeneration';
import { ga } from '../lib/ga';

interface AIGeneratorProps {
  onGenerate: (prompt: string, styleOverride?: string, referenceImage?: string) => void;
  isGenerating: boolean;
  selectedStyle?: string | null;
  canGenerate: boolean;
  onShowWaitlistModal?: () => void;
}

export const AIGenerator: React.FC<AIGeneratorProps> = ({ 
  onGenerate, 
  isGenerating, 
  selectedStyle, 
  canGenerate,
  onShowWaitlistModal
}) => {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea function
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const minHeight = 48; // Single line height
      const maxHeight = 120; // About 3 lines
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = newHeight + 'px';
    }
  };

  // Adjust height when prompt changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [prompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isGenerating) return;
    
    // Check if user can generate
    if (!canGenerate) {
      if (onShowWaitlistModal) {
        onShowWaitlistModal();
      }
      return;
    }
    
    // Check if prompt is empty
    if (!prompt.trim()) {
      setValidationError('Please enter a description for your design');
      return;
    }
    
    // Validate prompt before generation
    const validation = validatePrompt(prompt.trim());
    if (!validation.valid) {
      setValidationError(validation.error);
      return;
    }
    
    setError(null);
    setValidationError(null);
    
    try {
      // Scroll to top IMMEDIATELY when button is clicked
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Start generation immediately without delay
      await onGenerate(prompt.trim(), selectedStyle || undefined, referenceImage || undefined);
      
    } catch (error) {
      console.error('Generation error:', error);
      setError('Failed to generate design. Please try again.');
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleTooltipClick = (buttonType: string) => {
    ga.trackFeatureClick(buttonType);
    setShowTooltip(buttonType);
    setTimeout(() => setShowTooltip(null), 2000);
  };

  const handleMicClick = () => {
    handleTooltipClick('mic');
  };

  const handleImageClick = () => {
    ga.trackFeatureClick('image_upload');
    fileInputRef.current?.click();
  };

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setReferenceImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeImage = () => {
    setReferenceImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragging to false if we're leaving the container
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);


  const currentError = validationError || error;

  // API key is now handled on the server side
  const isApiKeyAvailable = true;

  return (
    <>
      {/* Desktop Layout - Same as mobile but not sticky */}
      <div className="hidden lg:block bg-white border-b border-gray-100 pt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="w-full lg:w-[640px] mx-auto">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              disabled={isGenerating}
            />
            
            {/* Text input area with buttons inside at bottom - same as mobile */}
            <div 
              ref={inputContainerRef}
              className={`relative bg-white rounded-2xl border-2 transition-all ${
                currentError ? 'border-red-300' : isDragging ? 'border-vibrant-pink bg-pink-50' : 'border-black'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Reference image preview */}
              {referenceImage && (
                <div className="relative m-3 mb-0">
                  <div className="relative inline-block">
                    <img 
                      src={referenceImage} 
                      alt="Reference" 
                      className="h-20 w-auto rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={isGenerating}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-gray-700 hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Enhanced watermark text - only show when empty and no image */}
              {!prompt && !referenceImage && (
                <div className="absolute top-4 left-4 text-gray-400 text-sm font-source-sans pointer-events-none z-10">
                  Try: "Majestic lion wearing a crown with golden mane"
                </div>
              )}
              
              {/* Enhanced text input - auto-sizing with proper padding */}
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={handlePromptChange}
                placeholder=""
                className={`w-full px-4 pb-16 bg-transparent text-base placeholder-gray-500 focus:outline-none resize-none font-source-sans leading-relaxed ${
                  referenceImage ? 'pt-2' : 'pt-4'
                }`}
                disabled={isGenerating}
                rows={1}
                maxLength={1000}
                style={{
                  minHeight: '64px', // Increased to accommodate bottom buttons
                  maxHeight: '136px', // Increased for better text flow
                  overflowY: 'auto'
                }}
              />

              {/* Bottom row with icons and generate button - inside the input field */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                {/* Left side icons */}
                <div className="flex space-x-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleMicClick}
                      className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all relative overflow-hidden group"
                      title="Voice input"
                    >
                      <Mic className="h-4 w-4 text-gray-600 group-hover:text-vibrant-pink transition-colors" />
                      <div className="absolute inset-0 bg-vibrant-pink opacity-0 group-hover:opacity-10 rounded-full transition-opacity"></div>
                    </button>
                    {showTooltip === 'mic' && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg whitespace-nowrap z-50">
                        Coming soon 🦘
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all relative overflow-hidden group"
                    title="Upload reference image"
                  >
                    <Image className="h-4 w-4 text-gray-600 group-hover:text-vibrant-pink transition-colors" />
                    <div className="absolute inset-0 bg-vibrant-pink opacity-0 group-hover:opacity-10 rounded-full transition-opacity"></div>
                  </button>
                </div>

                {/* Generate button - right aligned */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className={`px-4 py-2 rounded-full font-semibold transition-all flex items-center space-x-2 relative overflow-hidden ${
                    !isGenerating
                      ? 'bg-vibrant-pink text-white hover:bg-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-source-sans text-sm">Creating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span className="font-source-sans text-sm">
                        {canGenerate ? 'Generate Design' : 'Join Waitlist'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Enhanced error display */}
            {currentError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 text-sm font-medium font-source-sans">Generation Error</p>
                  <p className="text-red-600 text-sm font-source-sans mt-1">{currentError}</p>
                </div>
              </div>
            )}

            {/* API Key Status Notice */}
            {!isApiKeyAvailable && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-700 text-sm font-medium font-source-sans">Demo Mode</p>
                  <p className="text-yellow-600 text-sm font-source-sans mt-1">
                    AI image generation is currently unavailable. Join our waitlist below to be notified when this feature is ready!
                  </p>
                </div>
              </div>
            )}

            {/* Generation limit notice */}
            {!canGenerate && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-700 text-sm font-medium font-source-sans">Generation Limit Reached</p>
                  <p className="text-blue-600 text-sm font-source-sans mt-1">
                    You've reached the 3 design limit for the beta. Join our waitlist to get early access when we launch!
                  </p>
                </div>
              </div>
            )}

            {/* Quality indicator with beta notice */}
            {selectedStyle && isApiKeyAvailable && canGenerate && (
              <div className="mt-4 flex items-center justify-center">
                <div className="inline-flex items-center px-4 py-2 bg-vibrant-pink/10 rounded-full">
                  <span className="text-vibrant-pink text-sm font-medium font-source-sans">
                    You are using the BETA version. Please join our waiting list.
                  </span>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Mobile Layout - Sticky at bottom, above keyboard */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="px-4 py-3">
          <form onSubmit={handleSubmit}>
            {/* Text input area with buttons inside at bottom */}
            <div 
              className={`relative bg-white rounded-2xl border-2 transition-all ${
                currentError ? 'border-red-300' : isDragging ? 'border-vibrant-pink bg-pink-50' : 'border-black'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Reference image preview */}
              {referenceImage && (
                <div className="relative m-2 mb-0">
                  <div className="relative inline-block">
                    <img 
                      src={referenceImage} 
                      alt="Reference" 
                      className="h-16 w-auto rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={isGenerating}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-gray-700 hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Enhanced watermark text - only show when empty and no image */}
              {!prompt && !referenceImage && (
                <div className="absolute top-3 left-4 text-gray-400 text-sm font-source-sans pointer-events-none">
                  Try: "Majestic lion wearing a crown with golden mane"
                </div>
              )}
              
              {/* Enhanced text input - auto-sizing */}
              <textarea
                value={prompt}
                onChange={handlePromptChange}
                placeholder=""
                className={`w-full px-4 pb-12 bg-transparent text-base placeholder-gray-500 focus:outline-none resize-none font-source-sans ${
                  referenceImage ? 'pt-1' : 'pt-3'
                }`}
                disabled={isGenerating}
                rows={1}
                maxLength={1000}
                style={{
                  minHeight: '48px',
                  maxHeight: '96px', // 2 lines max on mobile
                  overflowY: prompt.split('\n').length > 2 || prompt.length > 80 ? 'auto' : 'hidden'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 96) + 'px';
                }}
              />

              {/* Bottom row with icons and generate button - inside the input field */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                {/* Left side icons */}
                <div className="flex space-x-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleMicClick}
                      className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all relative overflow-hidden group"
                      title="Voice input"
                    >
                      <Mic className="h-4 w-4 text-gray-600 group-hover:text-vibrant-pink transition-colors" />
                      <div className="absolute inset-0 bg-vibrant-pink opacity-0 group-hover:opacity-10 rounded-full transition-opacity"></div>
                    </button>
                    {showTooltip === 'mic' && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg whitespace-nowrap z-50">
                        Coming soon 🦘
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all relative overflow-hidden group"
                    title="Upload reference image"
                  >
                    <Image className="h-4 w-4 text-gray-600 group-hover:text-vibrant-pink transition-colors" />
                    <div className="absolute inset-0 bg-vibrant-pink opacity-0 group-hover:opacity-10 rounded-full transition-opacity"></div>
                  </button>
                </div>

                {/* Generate button - right aligned */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className={`px-3 py-2 rounded-full font-semibold transition-all flex items-center space-x-1 relative overflow-hidden ${
                    !isGenerating
                      ? 'bg-vibrant-pink text-white hover:bg-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-source-sans text-xs">Creating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      <span className="font-source-sans text-xs">
                        {canGenerate ? 'Generate' : 'Join Waitlist'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Enhanced error display */}
            {currentError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 text-sm font-medium font-source-sans">Generation Error</p>
                  <p className="text-red-600 text-sm font-source-sans mt-1">{currentError}</p>
                </div>
              </div>
            )}

            {/* API Key Status Notice */}
            {!isApiKeyAvailable && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-700 text-sm font-medium font-source-sans">Demo Mode</p>
                  <p className="text-yellow-600 text-sm font-source-sans mt-1">
                    AI image generation is currently unavailable. Join our waitlist below to be notified when this feature is ready!
                  </p>
                </div>
              </div>
            )}

            {/* Generation limit notice */}
            {!canGenerate && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-700 text-sm font-medium font-source-sans">Generation Limit Reached</p>
                  <p className="text-blue-600 text-sm font-source-sans mt-1">
                    You've reached the 3 design limit for the beta. Join our waitlist to get early access when we launch!
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};