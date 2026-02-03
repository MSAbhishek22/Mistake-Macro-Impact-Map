import { motion } from 'framer-motion';
import { ArrowDown, AlertTriangle } from 'lucide-react';

interface ImpactCascadeProps {
  events: string[];
}

export function ImpactCascade({ events }: ImpactCascadeProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 border-b border-white/10 pb-2">
        Impact Cascade
      </h3>
      
      <div className="relative pl-4 border-l border-dashed border-white/20 space-y-6">
        {events.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className="relative"
          >
            {/* Connector Node */}
            <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${index === 0 ? 'bg-destructive border-destructive' : 'bg-black border-white/50'}`} />
            
            <div className="bg-card/50 border border-white/10 p-3 rounded-sm backdrop-blur-sm">
              <div className="flex items-start gap-3">
                {index === 0 ? (
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <span className={`text-sm ${index === 0 ? 'text-white font-bold' : 'text-muted-foreground'}`}>
                  {event}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
