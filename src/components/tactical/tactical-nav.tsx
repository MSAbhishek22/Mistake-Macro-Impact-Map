import { motion } from 'framer-motion';
import { MotionButton } from './motion-button';
import { cn } from '@/lib/utils';
import { Home, Users, Activity } from 'lucide-react';

interface TacticalNavProps {
  currentView: 'landing' | 'select' | 'dashboard';
  hasRoster: boolean;
  hasAnalysis: boolean;
  onNavigate: (view: 'landing' | 'select' | 'dashboard') => void;
}

export function TacticalNav({ 
  currentView, 
  hasRoster, 
  hasAnalysis, 
  onNavigate,
}: TacticalNavProps) {
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4"
    >
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-full bg-background/80 backdrop-blur-md border border-white/10 shadow-2xl">
        <MotionButton
          variant={currentView === 'landing' ? 'default' : 'ghost'}
          size="sm"
          className={cn("rounded-full gap-2", currentView === 'landing' && "bg-primary text-primary-foreground")}
          onClick={() => onNavigate('landing')}
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Landing</span>
        </MotionButton>

        <MotionButton
          variant={currentView === 'select' ? 'default' : 'ghost'}
          size="sm"
          disabled={!hasRoster}
          className={cn("rounded-full gap-2", currentView === 'select' && "bg-primary text-primary-foreground")}
          onClick={() => onNavigate('select')}
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Roster</span>
        </MotionButton>

        <MotionButton
          variant={currentView === 'dashboard' ? 'default' : 'ghost'}
          size="sm"
          disabled={!hasAnalysis}
          className={cn("rounded-full gap-2", currentView === 'dashboard' && "bg-primary text-primary-foreground")}
          onClick={() => onNavigate('dashboard')}
        >
          <Activity className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </MotionButton>
      </div>
    </motion.div>
  );
}
