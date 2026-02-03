import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TacticalLayoutProps {
  children: ReactNode;
  className?: string;
}

export function TacticalLayout({ children, className }: TacticalLayoutProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const handleZoom = () => {
      setIsZoomed(true);
      setTimeout(() => setIsZoomed(false), 1000); // Reset after animation
    };

    window.addEventListener('tactical-zoom', handleZoom);
    
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      setMousePosition({
        x: (e.clientX / innerWidth) * 2 - 1, // -1 to 1
        y: (e.clientY / innerHeight) * 2 - 1  // -1 to 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('tactical-zoom', handleZoom);
    };
  }, []);

  return (
    <div className={cn(
      "relative min-h-screen w-full overflow-hidden bg-background font-mono text-foreground perspective-1000 transition-all duration-700",
      isZoomed && "layout-zoom"
    )}>
      {/* Background Grid - Parallax Layer 1 (Slow) */}
      <motion.div 
        className="tactical-grid absolute inset-0 z-0 opacity-50 pointer-events-none"
        animate={{
          x: mousePosition.x * -20,
          y: mousePosition.y * -20,
          rotateX: mousePosition.y * 2,
          rotateY: mousePosition.x * -2
        }}
        transition={{ type: 'tween', ease: 'linear', duration: 0 }}
      />
      
      {/* Scanlines - Static */}
      <div className="tactical-scanline absolute inset-0 z-10 pointer-events-none" />
      
      {/* Vignette - Dynamic */}
      <div className={cn(
        "absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none transition-all duration-700",
        isZoomed && "vignette-intense"
      )} />

      {/* Floating Particles/Dust - Parallax Layer 2 (Fast) */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[url('/noise.png')] mix-blend-overlay"
        animate={{
          x: mousePosition.x * -40,
          y: mousePosition.y * -40
        }}
        transition={{ type: 'tween', ease: 'linear', duration: 0 }}
      />

      {/* Content */}
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn("relative z-20 container mx-auto px-4 py-8 h-screen flex flex-col", className)}
      >
        {children}
      </motion.main>
    </div>
  );
}
