import React from 'react';
import { User, ShoppingCart } from 'lucide-react';
import Logo from '../assets/logo.svg';
import { ga } from '../lib/ga';

interface HeaderProps {
  cartCount: number;
  onCartClick?: () => void;
  onLogoClick?: () => void;
  onFeatureClick?: (feature: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  cartCount, 
  onCartClick, 
  onLogoClick, 
  onFeatureClick 
}) => {
  const handleCartClick = () => {
    ga.trackFeatureClick('cart');
    if (onFeatureClick) {
      onFeatureClick('cart');
    }
    if (cartCount > 0 && onCartClick) {
      onCartClick();
    }
    // Removed tooltip for empty cart - waitlist modal will handle it
  };

  const handleProfileClick = () => {
    ga.trackFeatureClick('profile');
    if (onFeatureClick) {
      onFeatureClick('profile');
    }
    // Removed tooltip - waitlist modal will handle it
  };

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    }
  };

  return (
    <header className="lg:fixed lg:top-0 lg:left-0 lg:right-0 bg-white z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Clickable */}
          <div className="flex-shrink-0">
            <button 
              onClick={handleLogoClick}
              className="hover:opacity-80 transition-opacity"
            >
              <img src={Logo} alt="VIBE-WEAR" className="h-8" />
            </button>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={handleProfileClick}
              >
                <User className="h-6 w-6" />
              </button>
            </div>
            
            <div className="relative">
              <button 
                className={`p-2 hover:bg-gray-100 rounded-lg transition-colors relative ${
                  cartCount > 0 ? 'cursor-pointer' : ''
                }`}
                onClick={handleCartClick}
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-vibrant-pink text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse" data-testid="cart-badge">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};