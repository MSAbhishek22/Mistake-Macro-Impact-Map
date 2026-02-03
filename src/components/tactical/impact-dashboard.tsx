import { useState, useEffect } from 'react';
import { Player } from '@/lib/tactical-data';
import { MistakeDetail } from '@/lib/analysis-engine';
import { Minimap } from './minimap';
import { ImpactCascade } from './impact-cascade';
import { StoryMode, STORY_STEPS } from './story-mode';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertCircle, RotateCcw, TrendingDown, XCircle, Play, Pause, SkipForward, CheckCircle2 } from 'lucide-react';
import { MotionButton } from '@/components/tactical/motion-button';
import { getLocationCoordinates, formatTimestamp, getMistakeLevel } from '@/lib/tactical-utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ImpactDashboardProps {
  player: Player;
  mistakes: MistakeDetail[];
  onReset: () => void;
  isDemoMode?: boolean;
}

function WhyThisMatters({ impactScore }: { impactScore: number }) {
  const lowImpactThreshold = 15;
  const comparisonCount = 6;
  const comparisonTotal = lowImpactThreshold * comparisonCount; // 90
  const maxVal = Math.max(impactScore, comparisonTotal) * 1.1; // Scale max

  return (
    <div className="bg-card border border-white/10 p-4 rounded-lg shadow-lg">
      <h4 className="text-xs font-black uppercase text-secondary mb-3 flex items-center gap-2 tracking-wider">
        <AlertCircle className="w-3 h-3 text-secondary" /> Why This Matters
      </h4>
      
      <p className="text-sm text-white mb-5 font-medium leading-relaxed">
        This single mistake caused more damage than <span className="text-destructive font-bold">6 low-impact deaths</span> combined.
      </p>

      <div className="space-y-3">
        {/* Comparison Bars */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] uppercase text-muted-foreground font-mono font-bold">
            <span>This Mistake</span>
            <span className="text-white">{impactScore} Impact</span>
          </div>
          <div className="h-3 w-full bg-black/40 rounded-sm overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(impactScore / maxVal) * 100}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-destructive"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] uppercase text-muted-foreground font-mono font-bold">
            <span>6 x Low-Impact Deaths</span>
            <span>{comparisonTotal} Impact</span>
          </div>
          <div className="h-3 w-full bg-black/40 rounded-sm overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(comparisonTotal / maxVal) * 100}%` }}
              transition={{ duration: 1, delay: 0.4 }}
              className="h-full bg-white/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ImpactDashboard({ player, mistakes, onReset, isDemoMode = false }: ImpactDashboardProps) {
  const [selectedMistakeId, setSelectedMistakeId] = useState<string | null>(null);
  const [isInteractionLocked, setIsInteractionLocked] = useState(false);
  
  // Story Mode State
  const [storyStatus, setStoryStatus] = useState<'idle' | 'playing' | 'paused' | 'finished'>('idle');
  const [storyStepIndex, setStoryStepIndex] = useState(0);

  // Handle Interaction Lock (Spam Prevention)
  useEffect(() => {
    const handleZoom = () => {
      setIsInteractionLocked(true);
      setTimeout(() => setIsInteractionLocked(false), 1000); // 1s lock for zoom
    };
    window.addEventListener('tactical-zoom', handleZoom);
    return () => window.removeEventListener('tactical-zoom', handleZoom);
  }, []);

  // Auto-select first mistake on load
  useEffect(() => {
    if (mistakes.length > 0) {
      setSelectedMistakeId(mistakes[0].id);
    }
  }, [mistakes]);

  const selectedMistake = mistakes.find(m => m.id === selectedMistakeId);

  // Reset/Init Story Mode when mistake changes
  useEffect(() => {
    if (selectedMistake) {
      if (isDemoMode) {
        setStoryStatus('playing');
        setStoryStepIndex(0);
      } else {
        setStoryStatus('idle');
        setStoryStepIndex(0);
      }
      
      // Trigger cinematic zoom on selection change
      window.dispatchEvent(new CustomEvent('tactical-zoom'));
    }
  }, [selectedMistake?.id, isDemoMode]);

  // Story Timer Logic
  useEffect(() => {
    if (storyStatus !== 'playing') return;

    const currentStepDurations = [2500, 2500, 2500, 5000]; // Adjusted for readability
    const duration = currentStepDurations[storyStepIndex];

    const timer = setTimeout(() => {
      if (storyStepIndex < STORY_STEPS.length - 1) {
        setStoryStepIndex(prev => prev + 1);
      } else {
        // End of story sequence
        setStoryStatus('idle');
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [storyStatus, storyStepIndex]);

  const handlePlayPause = () => {
    if (isInteractionLocked) return;
    if (storyStatus === 'playing') {
      setStoryStatus('paused');
    } else {
      if (storyStatus === 'finished' || storyStatus === 'idle') {
        setStoryStepIndex(0);
      }
      setStoryStatus('playing');
    }
  };

  const handleReplay = () => {
    if (isInteractionLocked) return;
    setStoryStepIndex(0);
    setStoryStatus('playing');
  };

  const handleSkip = () => {
    if (isInteractionLocked) return;
    setStoryStatus('idle');
    setStoryStepIndex(0);
  };

  const isStoryActive = storyStatus === 'playing' || storyStatus === 'paused';
  
  // Determine zoom level for minimap based on story step
  const getZoomLevel = () => {
    if (!isStoryActive) return 1;
    switch(storyStepIndex) {
      case 0: return 1.6; // Mistake: Tight zoom
      case 1: return 1.3; // Consequence: Pull back slightly
      case 2: return 1.1; // Cascade: Wider view
      case 3: return 1.2; // Takeaway: Balanced
      default: return 1;
    }
  };

  return (
    <div className={cn("flex flex-col h-full gap-6 transition-opacity duration-300", isInteractionLocked && "pointer-events-none")}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20">
            <img src={player.avatarUrl} alt={player.handle} className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider">{player.handle}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-primary">MATCH ANALYSIS</span>
              <span>•</span>
              <span>DE_MIRAGE</span>
              <span>•</span>
              <span>16-14 WIN</span>
            </div>
          </div>
        </div>
        {!isDemoMode ? (
          <MotionButton variant="outline" size="sm" onClick={onReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            NEW ANALYSIS
          </MotionButton>
        ) : (
          <div className="flex items-center gap-2 bg-muted/20 px-3 py-1.5 rounded text-xs text-muted-foreground border border-white/5 opacity-75 cursor-not-allowed">
             <RotateCcw className="w-4 h-4" />
             NEW ANALYSIS (LOCKED)
          </div>
        )}
      </div>

      {mistakes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center max-w-md gap-6 p-8 rounded-2xl bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/20"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-green-500 mb-2">Clean Record</h2>
              <p className="text-muted-foreground">
                No critical tactical errors detected in this match. Your macro positioning and decision making were optimal.
              </p>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
          {/* Left: Timeline List */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Key Mistakes ({mistakes.length})
            </h3>
            
            <div className="space-y-3">
              <TooltipProvider>
                {mistakes.map((mistake, index) => {
                  const level = getMistakeLevel(mistake.impactScore);
                  const isSelected = selectedMistakeId === mistake.id;
                  
                  return (
                    <Tooltip key={mistake.id} delayDuration={300}>
                      <TooltipTrigger asChild>
                        <motion.div
                          layoutId={`card-${mistake.id}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ 
                            opacity: isSelected ? 1 : 0.5, // Dim unselected more
                            x: 0,
                            scale: isSelected ? 1.02 : 0.95, // Expand selected, compress unselected
                            height: isSelected ? 'auto' : '80px' // Visually compress height
                          }}
                          transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 30 }}
                          onClick={() => {
                            if (!isInteractionLocked && !isSelected) {
                              if (isDemoMode) {
                                // In demo mode, only allow selection if not playing story? 
                                // Or just allow it and it resets story.
                                setSelectedMistakeId(mistake.id);
                              } else {
                                setSelectedMistakeId(mistake.id);
                              }
                            }
                          }}
                          whileHover={!isInteractionLocked ? { 
                            y: -2, 
                            scale: isSelected ? 1.02 : 0.98,
                            opacity: isSelected ? 1 : 0.8,
                            boxShadow: "0 0 12px var(--primary)", 
                            transition: { duration: 0.15 } 
                          } : {}}
                          whileTap={!isInteractionLocked ? { scale: 0.98 } : {}}
                          className={cn(
                            "relative p-4 rounded-lg border transition-all overflow-hidden",
                            !isInteractionLocked && "cursor-pointer",
                            isSelected 
                              ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(0,255,255,0.1)] z-10" 
                              : "bg-card/30 border-white/5 grayscale-[0.5]",
                            !isSelected && "hover:bg-white/5 hover:border-white/10 hover:grayscale-0"
                          )}
                        >
                          {/* Active Indicator */}
                          {isSelected && (
                            <motion.div 
                              layoutId="active-indicator"
                              className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                            />
                          )}

                          <div className="flex justify-between items-start mb-2">
                            <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {formatTimestamp(mistake.timestamp)}
                            </span>
                            <span className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded",
                              level === 'critical' ? "bg-destructive/20 text-destructive" :
                              level === 'high' ? "bg-orange-500/20 text-orange-500" :
                              "bg-blue-500/20 text-blue-500"
                            )}>
                              IMPACT: {mistake.impactScore}
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{mistake.title}</h4>
                          <p className={cn("text-xs text-muted-foreground", isSelected ? "line-clamp-2" : "line-clamp-1")}>
                            {mistake.whatHappened}
                          </p>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[200px]">
                        <p className="font-bold text-xs mb-1">Preview</p>
                        <p className="text-xs text-muted-foreground">{mistake.whatHappened.substring(0, 80)}...</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </div>
          </div>

          {/* Right: Detail View */}
          <div className="w-full lg:w-2/3 bg-card/20 border border-white/5 rounded-xl p-6 relative overflow-hidden flex flex-col">
            {/* Story Mode Overlay */}
            {selectedMistake && (
              <StoryMode 
                mistake={selectedMistake} 
                step={STORY_STEPS[storyStepIndex]}
                stepIndex={storyStepIndex}
                isVisible={isStoryActive} 
              />
            )}

            <AnimatePresence mode="wait">
              {selectedMistake ? (
                <motion.div
                  key={selectedMistake.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col h-full gap-6"
                >
                  {/* Detail Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black tracking-wider text-primary border border-primary/30 bg-primary/10 px-1.5 py-0.5 rounded uppercase">
                          {selectedMistake.label}
                        </span>
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">{selectedMistake.title}</h2>
                      </div>
                      <p className="text-base text-muted-foreground leading-snug">{selectedMistake.whatHappened}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      {/* Control Bar */}
                      <div className={cn(
                        "flex items-center gap-0.5 bg-black/40 backdrop-blur-md rounded-lg p-1 border border-white/10 relative z-50",
                        isDemoMode && "opacity-50 pointer-events-none grayscale"
                      )}>
                        <MotionButton size="icon" variant="ghost" className="w-7 h-7 hover:bg-white/10" onClick={handlePlayPause}>
                          {storyStatus === 'playing' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </MotionButton>
                        <MotionButton size="icon" variant="ghost" className="w-7 h-7 hover:bg-white/10" onClick={handleReplay}>
                          <RotateCcw className="w-3.5 h-3.5" />
                        </MotionButton>
                        <MotionButton size="icon" variant="ghost" className="w-7 h-7 hover:bg-white/10" onClick={handleSkip}>
                          <SkipForward className="w-3.5 h-3.5" />
                        </MotionButton>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Impact Score</div>
                        <div className="text-5xl font-black text-white leading-none tracking-tighter drop-shadow-[0_0_15px_rgba(var(--destructive),0.5)]">
                          {selectedMistake.impactScore}
                        </div>
                      </div>
                    </div>
                  </div>

                    {/* Grid Layout for Map & Cascade */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                      {/* Map & Stats */}
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2 perspective-1000">
                          <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Tactical Map</div>
                          <div className="animate-float-rotate preserve-3d border border-white/10 rounded-lg overflow-hidden bg-black/20">
                            <Minimap 
                              x={getLocationCoordinates(selectedMistake.location).x} 
                              y={getLocationCoordinates(selectedMistake.location).y} 
                              label={selectedMistake.label}
                              isActive={isStoryActive}
                              zoom={getZoomLevel()}
                            />
                          </div>

                          {/* Stats Summary */}
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div className="bg-destructive/10 border border-destructive/20 p-2 rounded flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-destructive" />
                              <div>
                                <div className="text-[10px] text-destructive uppercase font-bold">Rounds Lost</div>
                                <div className="text-lg font-black leading-none text-white">{selectedMistake.cascadeWindow.roundsLostAfter}</div>
                              </div>
                            </div>
                            <div className="bg-orange-500/10 border border-orange-500/20 p-2 rounded flex items-center gap-2">
                              <TrendingDown className="w-4 h-4 text-orange-500" />
                              <div>
                                <div className="text-[10px] text-orange-500 uppercase font-bold">Econ Drop</div>
                                <div className="text-lg font-black leading-none text-white">-{selectedMistake.cascadeWindow.economyDropTier} Tier</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Why This Matters Panel */}
                        <WhyThisMatters impactScore={selectedMistake.impactScore} />
                      </div>

                      {/* Cascade */}
                      <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                       <ImpactCascade events={[
                         selectedMistake.whatHappened,
                         selectedMistake.whatItCaused,
                         selectedMistake.whyItMattered
                       ]} />
                       
                       {/* Correction Box */}
                       <div className="mt-4 bg-primary/5 border border-primary/20 p-4 rounded-lg">
                          <h4 className="text-primary text-xs font-black uppercase mb-2 flex items-center gap-2 tracking-wider">
                            <RotateCcw className="w-3 h-3" /> Tactical Correction
                          </h4>
                          <p className="text-sm text-primary-foreground/90 font-medium">{selectedMistake.coachingTakeaway}</p>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a mistake to analyze
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
