import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MinimapProps {
  x: number;
  y: number;
  label?: string;
  isActive?: boolean;
  zoom?: number;
}

export function Minimap({ x, y, label, isActive = false, zoom = 1 }: MinimapProps) {
  // Calculate center offset based on player position to simulate camera pan
  // If zoom is 1, offset is 0. If zoom is > 1, we pan to keep (x,y) centered
  const panX = (50 - x) * (zoom - 1);
  const panY = (50 - y) * (zoom - 1);

  return (
    <div className="relative w-full aspect-square bg-[#0a0a10] border border-white/10 rounded-lg overflow-hidden group">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-20" 
        style={{ 
          backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }} 
      />
      
      {/* Container for zooming/panning */}
      <motion.div
        className="absolute inset-0 w-full h-full transform-gpu"
        animate={{
          scale: zoom,
          x: `${panX}%`,
          y: `${panY}%`
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      >
        {/* Map Geometry (Abstract) */}
        <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] border-2 border-white/5 bg-white/5" />
        <div className="absolute top-[10%] left-[40%] w-[20%] h-[30%] border-2 border-white/5 bg-white/5" /> {/* Mid */}
        <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] border-2 border-white/5 bg-white/5" /> {/* B */}
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] border-2 border-white/5 bg-white/5" /> {/* A */}

        {/* Story Mode Area Glow */}
        <AnimatePresence>
          {zoom > 1.1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.2, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 1 }}
              className="absolute w-32 h-32 -ml-16 -mt-16 rounded-full bg-primary blur-2xl pointer-events-none mix-blend-screen"
              style={{ left: `${x}%`, top: `${y}%` }}
            />
          )}
        </AnimatePresence>

        {/* Player Marker */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: isActive ? [1, 1.5, 1] : 1, 
            opacity: 1 
          }}
          transition={{
            scale: { 
              repeat: isActive ? Infinity : 0, 
              duration: 1,
              ease: "easeInOut"
            }
          }}
          key={`${x}-${y}`}
          className="absolute w-6 h-6 -ml-3 -mt-3 flex items-center justify-center text-primary"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <div className={cn(
            "absolute inset-0 rounded-full animate-ping",
            isActive ? "bg-destructive/50" : "bg-primary/30"
          )} />
          <Crosshair className={cn(
            "w-full h-full",
            isActive ? "text-destructive" : "text-primary"
          )} />
        </motion.div>
      </motion.div>


      {/* Label */}
      {label && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 bg-black/80 backdrop-blur px-3 py-1 text-xs font-mono border-l-2 border-primary"
        >
          LOC: {x.toFixed(0)},{y.toFixed(0)} // {label}
        </motion.div>
      )}
    </div>
  );
}
