import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
}

interface ParticleTextProps {
  text: string;
  className?: string;
  duration?: number;
  onAnimationComplete?: () => void;
}

export const ParticleText: React.FC<ParticleTextProps> = ({
  text,
  className = '',
  duration = 800,
  onAnimationComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayText, setDisplayText] = useState(text);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  const renderText = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size based on text
    ctx.font = 'bold 18px "Source Sans Pro", sans-serif';
    const metrics = ctx.measureText(displayText);
    
    // Add extra padding to prevent cutoff
    const padding = 150;
    const width = metrics.width + padding * 2;
    const height = 60;

    // Set actual canvas size accounting for device pixel ratio
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Scale canvas back down using CSS
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Scale context to match device pixel ratio
    ctx.scale(dpr, dpr);

    // Enable font smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Render text with better quality
    ctx.font = 'bold 18px "Source Sans Pro", sans-serif';
    ctx.fillStyle = '#000000'; // black
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, width / 2, height / 2);
  }, [displayText]);

  const startDissolveAnimation = useCallback((onComplete: () => void) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get device pixel ratio
    const dpr = window.devicePixelRatio || 1;

    // Get logical dimensions
    const width = parseInt(canvas.style.width || '0');
    const height = parseInt(canvas.style.height || '0');

    // Get image data to create particles
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const particles: Particle[] = [];

    // Sample pixels to create particles (adjust sampling based on DPR)
    const step = Math.max(1, Math.floor(dpr));
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        const index = (y * canvas.width + x) * 4;
        const alpha = pixels[index + 3];
        
        if (alpha > 50) { // Lower threshold for more particles
          particles.push({
            x: x / dpr, // Convert to logical coordinates
            y: y / dpr,
            vx: (Math.random() - 0.5) * 2, // Reduced velocity for slower explosion
            vy: (Math.random() - 0.5) * 2 - 0.5, // Slight upward bias
            alpha: alpha / 255,
            color: '#000000', // black
          });
        }
      }
    }

    particlesRef.current = particles;

    // Animate particles
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Create gradient for edge fading
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        // Update position with ease-in-out
        const easedProgress = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const newX = particle.x + particle.vx * easedProgress * 60;
        const newY = particle.y + particle.vy * easedProgress * 60;
        
        // Calculate distance from center for edge fading
        const distFromCenter = Math.sqrt(
          Math.pow(newX - centerX, 2) + Math.pow(newY - centerY, 2)
        );
        
        // Edge fade factor (fade out particles near edges)
        const edgeFade = 1 - Math.pow(Math.max(0, distFromCenter - maxDistance * 0.5) / (maxDistance * 0.5), 2);
        
        // Update alpha with edge fading
        const baseAlpha = particle.alpha * (1 - easedProgress);
        const finalAlpha = baseAlpha * edgeFade;

        // Draw particle with anti-aliasing
        if (finalAlpha > 0.01) {
          ctx.globalAlpha = finalAlpha;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(newX, newY, 0.75, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1;

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        ctx.clearRect(0, 0, width, height);
        if (onComplete) {
          onComplete();
        }
      }
    };

    animate();
  }, [duration]);

  useEffect(() => {
    if (text !== displayText) {
      setIsAnimating(true);
      // Start dissolve animation for old text
      startDissolveAnimation(() => {
        setDisplayText(text);
        setIsAnimating(false);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }
  }, [text, displayText, startDissolveAnimation, onAnimationComplete]);

  useEffect(() => {
    // Initial render
    if (!isAnimating) {
      renderText();
    }
  }, [displayText, isAnimating, renderText]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="block"
        style={{ minHeight: '60px' }}
      />
    </div>
  );
};