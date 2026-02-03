import { motion, AnimatePresence } from 'framer-motion';
import { MistakeDetail } from '@/lib/analysis-engine';
import { AlertTriangle, ArrowDown, XCircle, BrainCircuit, Target } from 'lucide-react';

export type StoryStep = 'mistake' | 'consequence' | 'cascade' | 'takeaway';

export const STORY_STEPS: StoryStep[] = ['mistake', 'consequence', 'cascade', 'takeaway'];

interface StoryModeProps {
  mistake: MistakeDetail;
  step: StoryStep;
  stepIndex: number;
  isVisible: boolean;
}

export function StoryMode({ mistake, step, stepIndex, isVisible }: StoryModeProps) {
  if (!isVisible) return null;

  return (
    <motion.div 
      className="absolute inset-0 z-40 pointer-events-auto flex flex-col items-center justify-center p-6 bg-background/20 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        backgroundColor: step === 'mistake' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0,0,0,0.4)',
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Progress Indicator */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <div className="flex gap-1">
          {STORY_STEPS.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${
                idx <= stepIndex ? 'bg-primary' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-mono font-bold text-muted-foreground ml-2">
          STEP {stepIndex + 1}/{STORY_STEPS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        
        {/* Step 1: Mistake Identified */}
        {step === 'mistake' && (
          <motion.div
            key="step-mistake"
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-destructive/95 text-white p-8 rounded-xl border-2 border-white/20 shadow-[0_0_50px_rgba(239,68,68,0.5)] flex flex-col items-center text-center max-w-md"
          >
            <motion.div 
              animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <AlertTriangle className="w-16 h-16 mb-6" />
            </motion.div>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-3">Mistake Identified</h2>
            <p className="text-lg font-medium leading-snug line-clamp-3">{mistake.whatHappened}</p>
          </motion.div>
        )}

        {/* Step 2: Immediate Consequence */}
        {step === 'consequence' && (
          <motion.div
            key="step-consequence"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ ease: "easeOut", duration: 0.4 }}
            className="bg-orange-500/95 text-white p-8 rounded-xl border-2 border-white/20 shadow-[0_0_50px_rgba(249,115,22,0.5)] flex flex-col items-center text-center max-w-md"
          >
            <Target className="w-12 h-12 mb-6" />
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-3">Immediate Effect</h2>
            <p className="text-lg font-medium leading-snug line-clamp-3">{mistake.whatItCaused}</p>
          </motion.div>
        )}

        {/* Step 3: Cascade Damage */}
        {step === 'cascade' && (
          <motion.div
            key="step-cascade"
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ ease: "easeOut", duration: 0.4 }}
            className="bg-black/90 text-white p-8 rounded-xl border-2 border-destructive/50 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center text-center max-w-md"
          >
            <div className="flex gap-8 mb-6">
              <div className="flex flex-col items-center">
                <motion.div 
                  animate={{ y: [0, 5, 0] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="bg-destructive/20 p-3 rounded-full mb-2"
                >
                  <XCircle className="w-8 h-8 text-destructive" />
                </motion.div>
                <span className="text-3xl font-black text-destructive">{mistake.cascadeWindow.roundsLostAfter}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Rounds Lost</span>
              </div>
              <div className="flex flex-col items-center">
                <motion.div 
                  animate={{ y: [0, 5, 0] }} 
                  transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}
                  className="bg-orange-500/20 p-3 rounded-full mb-2"
                >
                  <ArrowDown className="w-8 h-8 text-orange-500" />
                </motion.div>
                <span className="text-3xl font-black text-orange-500">-{mistake.cascadeWindow.economyDropTier}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Econ Tier</span>
              </div>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Cascade Damage</h2>
            <p className="text-sm text-muted-foreground">The impact rippled through subsequent rounds</p>
          </motion.div>
        )}

        {/* Step 4: Coaching Takeaway */}
        {step === 'takeaway' && (
          <motion.div
            key="step-takeaway"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ease: "easeOut", duration: 0.4 }}
            className="bg-primary/95 text-primary-foreground p-8 rounded-xl border-2 border-white/20 shadow-[0_0_50px_rgba(var(--primary),0.5)] flex flex-col items-center text-center max-w-lg"
          >
            <BrainCircuit className="w-16 h-16 mb-6 animate-pulse" />
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Tactical Fix</h2>
            <p className="text-xl font-medium leading-relaxed line-clamp-4">"{mistake.coachingTakeaway}"</p>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
