import { useState } from 'react';
import { TacticalLayout } from '@/components/tactical/tactical-layout';
import { TacticalNav } from '@/components/tactical/tactical-nav';
import { LandingView } from '@/components/tactical/landing-view';
import { PlayerSelect } from '@/components/tactical/player-select';
import { ImpactDashboard } from '@/components/tactical/impact-dashboard';
import { Player, enrichRoster } from '@/lib/tactical-data';
import { analyzeMatch } from '@/lib/analyze-match';
import { AnalysisResult } from '@/lib/analysis-engine';
import { AnimatePresence, motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

type ViewState = 'landing' | 'select' | 'dashboard';

function TacticalLoader({ isDemoMode }: { isDemoMode: boolean }) {
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full gap-6"
    >
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        {/* Left: List Skeleton */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <Skeleton className="h-5 w-40" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-lg border border-white/5 bg-card/10 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Main Content Skeleton */}
        <div className="w-full lg:w-2/3 bg-card/20 border border-white/5 rounded-xl p-6 flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-16" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
             <Skeleton className="w-full h-full rounded-lg" />
             <div className="flex flex-col gap-4">
               <Skeleton className="h-32 w-full rounded-lg" />
               <Skeleton className="h-32 w-full rounded-lg" />
             </div>
          </div>
        </div>
      </div>
      
      {/* Loading Text Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[2px] z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <div className="text-primary font-mono text-sm animate-pulse uppercase tracking-widest">
            {isDemoMode ? "Booting Simulation..." : "Analyzing Telemetry..."}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [view, setView] = useState<ViewState>('landing');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [roster, setRoster] = useState<Player[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyzeClick = async () => {
    setIsLoading(true);
    try {
      // Analyze match to get roster
      const result = await analyzeMatch({});
      const enrichedRoster = enrichRoster(result.roster);
      setRoster(enrichedRoster);
      setView('select');
    } catch (error) {
      console.error("Failed to analyze match:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoToggle = async (enabled: boolean) => {
    setIsDemoMode(enabled);
    if (enabled) {
      setIsLoading(true);
      try {
        // 1. Get Roster
        const fullResult = await analyzeMatch({});
        const enrichedRoster = enrichRoster(fullResult.roster);
        setRoster(enrichedRoster);

        // 2. Select first player
        const firstPlayer = enrichedRoster[0];
        setSelectedPlayer(firstPlayer);

        // 3. Analyze for first player
        const playerResult = await analyzeMatch({ playerId: firstPlayer.id });
        setAnalysisResult(playerResult);
        
        setView('dashboard');
      } catch (error) {
        console.error("Demo mode failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePlayerSelect = async (player: Player) => {
    setSelectedPlayer(player);
    setIsLoading(true);
    try {
      const result = await analyzeMatch({ playerId: player.id });
      setAnalysisResult(result);
      setView('dashboard');
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setView('landing');
    setSelectedPlayer(null);
    setAnalysisResult(null);
    setIsDemoMode(false);
  };

  return (
    <TacticalLayout>
      <TacticalNav 
        currentView={view}
        hasRoster={roster.length > 0}
        hasAnalysis={!!analysisResult}
        onNavigate={setView}
      />
      <AnimatePresence mode="wait">
        {isLoading ? (
          <TacticalLoader isDemoMode={isDemoMode} />
        ) : (
          <>
            {view === 'landing' && (
              <motion.div 
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <LandingView 
                  onAnalyze={handleAnalyzeClick} 
                  onDemoToggle={handleDemoToggle}
                  isDemoMode={isDemoMode}
                />
              </motion.div>
            )}

            {view === 'select' && (
              <motion.div 
                key="select"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="h-full"
              >
                <PlayerSelect players={roster} onSelect={handlePlayerSelect} />
              </motion.div>
            )}

            {view === 'dashboard' && selectedPlayer && analysisResult && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <ImpactDashboard 
                  player={selectedPlayer} 
                  mistakes={analysisResult.topMistakes}
                  onReset={handleReset} 
                  isDemoMode={isDemoMode}
                />
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </TacticalLayout>
  );
}
