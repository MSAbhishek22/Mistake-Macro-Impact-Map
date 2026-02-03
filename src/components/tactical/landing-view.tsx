import { useState } from 'react';
import { MotionButton } from '@/components/tactical/motion-button';
import { motion } from 'framer-motion';
import { Crosshair, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface LandingViewProps {
  onAnalyze: () => void;
  onDemoToggle: (enabled: boolean) => void;
  isDemoMode: boolean;
}

export function LandingView({ onAnalyze, onDemoToggle, isDemoMode }: LandingViewProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleAnalyze = () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    
    // Trigger cinematic zoom
    window.dispatchEvent(new CustomEvent('tactical-zoom'));
    
    // Delay actual navigation to allow for zoom effect
    setTimeout(() => {
      onAnalyze();
      setIsAnalyzing(false);
    }, 600);
  };

  const handleDemoToggle = (enabled: boolean) => {
    if (isToggling || isAnalyzing) return;
    setIsToggling(true);
    onDemoToggle(enabled);
    setTimeout(() => setIsToggling(false), 500); // 500ms debounce
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-12 relative">
      {/* Hero Graphic */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-64 h-64 md:w-96 md:h-96"
      >
        <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute inset-4 border border-secondary/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
        
        {/* Floating Map Placeholder */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-48 h-48 bg-primary/10 backdrop-blur-md border border-primary/50 rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.2)]">
            <Crosshair className="w-16 h-16 text-primary animate-pulse" />
          </div>
        </motion.div>
      </motion.div>

      {/* Text Content */}
      <div className="text-center space-y-4 max-w-2xl">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 uppercase"
        >
          Mistake → <span className="text-primary text-glow drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">Macro Impact</span> Map
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-lg tracking-widest font-medium"
        >
          See how your micro-errors cause round losses.
        </motion.p>
      </div>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col items-center gap-6"
      >
        <MotionButton 
          size="lg" 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          pulse={true}
          className="h-16 px-12 text-xl bg-primary text-primary-foreground border-none uppercase font-black tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] transition-shadow duration-300"
        >
          <Activity className={`mr-2 w-6 h-6 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'INITIALIZING...' : 'Analyze Match'}
        </MotionButton>

        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm p-2 rounded-full border border-white/10 shadow-lg">
          <span className={isDemoMode ? "text-muted-foreground text-xs font-bold" : "text-primary text-xs font-black tracking-wider"}>UPLOAD</span>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div 
                  onClick={() => handleDemoToggle(!isDemoMode)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 cursor-pointer transition-colors",
                    isDemoMode ? 'bg-primary' : 'bg-muted',
                    (isAnalyzing || isToggling) && 'pointer-events-none opacity-50'
                  )}
                >
                  <motion.div 
                    layout
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{ x: isDemoMode ? 24 : 0 }}
                  />
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle to see sample data without uploading</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className={isDemoMode ? "text-primary text-xs font-black tracking-wider" : "text-muted-foreground text-xs font-bold"}>DEMO MODE</span>
        </div>
      </motion.div>
    </div>
  );
}
