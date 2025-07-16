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

    // Set canvas size based on text
    ctx.font = 'bold 18px "Source Sans Pro", sans-serif';
    const metrics = ctx.measureText(displayText);
    
    // Add extra padding to prevent cutoff
    const padding = 120;
    canvas.width = metrics.width + padding * 2;
    canvas.height = 100;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render text
    ctx.font = 'bold 18px "Source Sans Pro", sans-serif';
    ctx.fillStyle = '#000000'; // black
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, canvas.width / 2, canvas.height / 2);
  }, [displayText]);

  const startDissolveAnimation = useCallback((onComplete: () => void) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get image data to create particles
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const particles: Particle[] = [];

    // Sample pixels to create particles (every pixel for more particles)
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const index = (y * canvas.width + x) * 4;
        const alpha = pixels[index + 3];
        
        if (alpha > 50) { // Lower threshold for more particles
          particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 2, // Reduced velocity for slower explosion
            vy: (Math.random() - 0.5) * 2 - 0.5, // Slight upward bias
            alpha: 1,
            color: `rgba(0, 0, 0, ${alpha / 255})`, // black with original alpha
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        // Update position with ease-in-out
        const easedProgress = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        particle.x += particle.vx * easedProgress * 2;
        particle.y += particle.vy * easedProgress * 2;
        
        // Update alpha (fade out) more gradually
        particle.alpha = 1 - easedProgress;

        // Draw particle as smaller circle
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        style={{ minHeight: '100px' }}
      />
    </div>
  );
};