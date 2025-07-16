import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, Search, ExternalLink } from 'lucide-react';
import { DesignAnalysis } from './DesignAnalysis';
import { ImageModal } from './ImageModal';
import { LottieLoadingAnimation } from './LottieLoadingAnimation';
import { ParticleText } from './ParticleText';
import { ga } from '../lib/ga';
import PremiumCottonTee from '../assets/premium_cotton_tee.jpg';
import PremiumCottonSweatshirt from '../assets/premium_cotton_sweatshirt.jpg';
import PremiumLightHoodie from '../assets/premium_light_hoodie.jpg';
import PremiumCottonTeeBlack from '../assets/premium_cotton_tee_black.jpg';
import PremiumCottonSweatshirtBlack from '../assets/premium_cotton_sweatshirt_black.jpg';
import PremiumHoodieBlack from '../assets/premium_hoodie_black.jpg';
import BoltBadge from '../assets/bolt_badge.png';

interface Design {
  id: string;
  name: string;
  imageUrl: string;
  prompt?: string;
  revisedPrompt?: string;
}

interface ProductConfig {
  product: string;
  color: string;
  size: string;
  amount: number;
}

interface ProductDisplayProps {
  designs: Design[];
  currentDesignIndex: number;
  onDesignChange: (index: number) => void;
  isGenerating: boolean;
  productConfig: ProductConfig;
  originalPrompt?: string;
  selectedStyle?: string;
  onImageViewLarge?: () => void;
}

const LOADING_MESSAGES = [
  'Doing some magic…',
  'Stitching pixels together…',
  'Reading your vibe…',
  'Consulting the AI muse…',
  'Mocking up the masterpiece…',
  'Wrapping it in drip…',
  'Thinking in cotton…',
  'Sharpening the outlines…',
  'Polishing the pixels…',
  'Locking in the look…',
  'Giving main character energy…',
  'Injecting certified drip…',
  'Manifesting your fit…',
  'Calling in the style gods…',
  'Making it lowkey fire…'
];

export const ProductDisplay: React.FC<ProductDisplayProps> = ({
  designs,
  currentDesignIndex,
  onDesignChange,
  isGenerating,
  productConfig,
  originalPrompt = '',
  selectedStyle = 'realistic',
  onImageViewLarge,
}) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Reset imageLoaded when design changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentDesignIndex, designs]);

  // Rotate loading messages when generating
  useEffect(() => {
    if (isGenerating) {
      // Set initial random message
      const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
      setLoadingMessage(LOADING_MESSAGES[randomIndex]);

      // Change message every 4 seconds
      const interval = setInterval(() => {
        const newIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
        setLoadingMessage(LOADING_MESSAGES[newIndex]);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handlePrevious = () => {
    const newIndex = currentDesignIndex === 0 ? designs.length - 1 : currentDesignIndex - 1;
    onDesignChange(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentDesignIndex === designs.length - 1 ? 0 : currentDesignIndex + 1;
    onDesignChange(newIndex);
  };

  const handleAnalyze = () => {
    ga.trackFeatureClick('analyze');
    setShowAnalysis(true);
  };

  const handleViewLarger = () => {
    if (onImageViewLarge) {
      onImageViewLarge();
    }
    setShowImageModal(true);
  };

  const handleBoltBadgeClick = () => {
    window.open('https://bolt.new', '_blank', 'noopener,noreferrer');
  };

  // Handle clicking on the design image to open modal
  const handleDesignImageClick = () => {
    if (currentDesign && isInteractiveDesign) {
      handleViewLarger();
    }
  };

  const getProductImage = () => {
    const isBlack = productConfig.color === 'Black';
    
    switch (productConfig.product) {
      case 'Premium Cotton Sweatshirt':
        return isBlack ? PremiumCottonSweatshirtBlack : PremiumCottonSweatshirt;
      case 'Premium Lightweight Hoodie':
        return isBlack ? PremiumHoodieBlack : PremiumLightHoodie;
      default:
        return isBlack ? PremiumCottonTeeBlack : PremiumCottonTee;
    }
  };

  const currentDesign = designs[currentDesignIndex];
  const showSlider = designs.length >= 2;
  
  // Always show design if available and not generating
  const shouldShowDesign = currentDesign && !isGenerating && currentDesign.imageUrl;
  
  // Only allow interaction for non-default designs
  const isInteractiveDesign = currentDesign && currentDesign.id !== 'default';

  return (
    <div className="relative bg-white pt-2 lg:pt-2 pb-2 lg:pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Bolt Badge - Positioned at top left corner of content area */}
        <div className="absolute top-1 lg:top-8 left-4 lg:left-8">
          <button
            onClick={handleBoltBadgeClick}
            className="group flex items-center space-x-2 hover:opacity-80 transition-opacity"
            title="Powered by Bolt - Click to visit bolt.new"
          >
            <img
              src={BoltBadge}
              alt="Powered by Bolt"
              className="w-16 h-16 lg:w-20 lg:h-20 rounded-full shadow-sm group-hover:shadow-md transition-shadow"
            />
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-gray-600 font-source-sans">Visit bolt.new</span>
              <ExternalLink className="w-3 h-3 text-gray-600" />
            </div>
          </button>
        </div>

        <div className="flex items-center justify-center gap-8">
          
          {/* Navigation Controls - Only show when 2+ designs */}
          {showSlider && (
            <button
              onClick={handlePrevious}
              className="hidden lg:flex items-center justify-center w-14 h-14 bg-white rounded-full hover:shadow-xl transition-all hover:scale-105 group border border-gray-200 relative overflow-hidden"
            >
              <ChevronLeft className="h-6 w-6" />
              <div className="absolute inset-0 rounded-full bg-vibrant-pink opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>
          )}

          {/* Product Display */}
          <div className="relative">
            <div 
              className="relative bg-white rounded-2xl overflow-hidden h-[360px] lg:h-[560px]"
            >
              {/* Product Base */}
              <div className="w-full h-full bg-white flex items-center justify-center">
                <img
                  src={getProductImage()}
                  alt={`${productConfig.product} - ${productConfig.color}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Design Overlay with spring animation */}
              {shouldShowDesign && (
                <div
                  className={`absolute cursor-pointer transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    animation: imageLoaded ? 'spring 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none',
                  }}
                  onClick={handleDesignImageClick}
                  title={isInteractiveDesign ? "Click to view larger" : undefined}
                >
                  <img
                    src={currentDesign.imageUrl}
                    alt={currentDesign.name}
                    className="object-contain hover:scale-105 transition-transform w-[120px] h-[120px] lg:w-[160px] lg:h-[160px]"
                    draggable={false}
                    onLoad={() => setImageLoaded(true)}
                    onContextMenu={(e) => e.preventDefault()} // Prevent right-click context menu
                  />
                </div>
              )}

              {/* Enhanced Loading Overlay with Lottie Crab Animation */}
              {isGenerating && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    {/* Lottie Crab Animation - Properly centered and sized */}
                    <div className="mb-4 flex items-center justify-center">
                      <div className="w-36 h-36 flex items-center justify-center">
                        <LottieLoadingAnimation size={140} />
                      </div>
                    </div>
                    
                    <ParticleText 
                      text={loadingMessage} 
                      className="text-gray-700 font-semibold font-source-sans text-lg"
                      duration={1200}
                    />
                    <p className="text-gray-500 font-source-sans text-sm mt-2">Using advanced AI • This may take 5 to 20 seconds</p>
                    
                    {/* Animated dots */}
                    <div className="mt-4 flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-vibrant-pink rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-vibrant-pink rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-vibrant-pink rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Design Actions - Only show for interactive designs */}
              {shouldShowDesign && isInteractiveDesign && (
                <div className="absolute top-4 right-4 flex space-x-2">
                  <div className="relative">
                    <button
                      onClick={handleViewLarger}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all border border-gray-200 group hover:scale-110 active:scale-95"
                      title="View larger"
                    >
                      <Search className="h-5 w-5 text-gray-700 group-hover:text-vibrant-pink transition-colors" />
                    </button>
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={handleAnalyze}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all border border-gray-200 group hover:scale-110 active:scale-95"
                      title="Analyze design with AI"
                    >
                      <Eye className="h-5 w-5 text-gray-700 group-hover:text-vibrant-pink transition-colors" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Navigation - Only show when 2+ designs */}
            {showSlider && (
              <div className="flex lg:hidden justify-center mt-4 space-x-4">
                <button
                  onClick={handlePrevious}
                  className="flex items-center justify-center w-12 h-12 bg-white rounded-full hover:shadow-xl transition-all border border-gray-200 hover:scale-105 group relative overflow-hidden"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <div className="absolute inset-0 rounded-full bg-vibrant-pink opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center justify-center w-12 h-12 bg-white rounded-full hover:shadow-xl transition-all border border-gray-200 hover:scale-105 group relative overflow-hidden"
                >
                  <ChevronRight className="h-5 w-5" />
                  <div className="absolute inset-0 rounded-full bg-vibrant-pink opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </button>
              </div>
            )}

            {/* Pagination Dots - Closer to the t-shirt */}
            {showSlider && (
              <div className="flex justify-center mt-2 lg:mt-3 space-x-2">
                {designs.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => onDesignChange(index)}
                    className={`h-3.5 rounded-full transition-all hover:scale-110 active:scale-95 ${
                      index === currentDesignIndex 
                        ? 'bg-vibrant-pink w-6' 
                        : 'bg-inactive-dot hover:bg-gray-400 w-3.5'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Next Button - Only show when 2+ designs */}
          {showSlider && (
            <button
              onClick={handleNext}
              className="hidden lg:flex items-center justify-center w-14 h-14 bg-white rounded-full hover:shadow-xl transition-all hover:scale-105 group border border-gray-200 relative overflow-hidden"
            >
              <ChevronRight className="h-6 w-6" />
              <div className="absolute inset-0 rounded-full bg-vibrant-pink opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>
          )}
        </div>
      </div>

      {/* Image Modal for Larger View */}
      {showImageModal && currentDesign && isInteractiveDesign && (
        <ImageModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          imageUrl={currentDesign.imageUrl}
          designName={currentDesign.name}
        />
      )}

      {/* Design Analysis Modal */}
      {showAnalysis && currentDesign && isInteractiveDesign && (
        <DesignAnalysis
          design={currentDesign}
          originalPrompt={originalPrompt}
          selectedStyle={selectedStyle}
          productColor={productConfig.color}
          onClose={() => setShowAnalysis(false)}
        />
      )}

      <style jsx>{`
        @keyframes spring {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};