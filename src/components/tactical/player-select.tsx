import { Player } from '@/lib/tactical-data';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User, Crosshair, Shield, Zap, Eye, AlertCircle } from 'lucide-react';

interface PlayerSelectProps {
  players: Player[];
  onSelect: (player: Player) => void;
}

export function PlayerSelect({ players, onSelect }: PlayerSelectProps) {
  const getRoleIcon = (role: Player['role']) => {
    switch (role) {
      case 'Entry': return <Zap className="w-4 h-4" />;
      case 'Support': return <Shield className="w-4 h-4" />;
      case 'Sniper': return <Crosshair className="w-4 h-4" />;
      case 'Lurker': return <Eye className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full max-w-5xl mx-auto text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center border border-white/10">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-widest text-muted-foreground">No Operatives Found</h2>
          <p className="text-sm text-muted-foreground/60 mt-2">Unable to retrieve roster data from the match analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-5xl mx-auto">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold uppercase tracking-widest mb-12 text-center"
      >
        Select <span className="text-primary text-glow">Operative</span>
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {players.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -1, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.98 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('tactical-zoom'));
              setTimeout(() => onSelect(player), 600); // Wait for zoom
            }}
            className="group relative cursor-pointer"
          >
            {/* Card Background with angled corners */}
            <div className="absolute inset-0 bg-card/50 backdrop-blur-sm border border-white/10 skew-x-[-5deg] transition-all duration-300 group-hover:bg-primary/10 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(0,255,255,0.1)]" />
            
            {/* Content */}
            <div className="relative p-6 flex flex-col items-center gap-4 z-10">
              <div className="relative w-24 h-24 rounded-full border-2 border-white/10 overflow-hidden group-hover:border-primary transition-colors">
                <img src={player.avatarUrl} alt={player.handle} className="w-full h-full object-cover" />
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-black uppercase tracking-wider">{player.handle}</h3>
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mt-1 uppercase">
                  {getRoleIcon(player.role)}
                  {player.role}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 w-full mt-4 border-t border-white/5 pt-4">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase">RATING</div>
                  <div className={cn("text-lg font-bold", player.stats.rating >= 1.2 ? "text-primary" : "text-white")}>
                    {player.stats.rating}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase">K/D</div>
                  <div className="text-lg font-bold text-white">{player.stats.kda}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase">HS%</div>
                  <div className="text-lg font-bold text-white">{player.stats.hs}</div>
                </div>
              </div>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
