import { Player as AnalysisPlayer } from './analysis-engine';

export type PlayerRole = 'Entry' | 'Support' | 'IGL' | 'Sniper' | 'Lurker';

export interface PlayerStats {
  rating: number;
  kda: string;
  hs: string;
}

export interface Player extends AnalysisPlayer {
  handle: string; // Maps to name
  role: PlayerRole;
  avatarUrl: string;
  stats: PlayerStats;
}

// Helper to enrich analysis player with visual data
export const enrichRoster = (roster: AnalysisPlayer[]): Player[] => {
  const seeds = ['NIGHTFALL', 'SPECTRE', 'PHANTOM', 'VIPER', 'OMEN'];
  const roles: PlayerRole[] = ['Entry', 'Sniper', 'Lurker', 'Support', 'IGL'];
  const ratings = [1.12, 1.06, 1.01, 0.98, 0.94];
  const kdas = ['1.42', '1.31', '1.18', '1.09', '0.97'];
  const hss = ['46%', '41%', '38%', '35%', '32%'];

  return roster.map((p, i) => ({
    ...p,
    handle: p.name,
    role: roles[i % roles.length],
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seeds[i % seeds.length]}&backgroundColor=b6e3f4`,
    stats: {
      rating: ratings[i % ratings.length],
      kda: kdas[i % kdas.length],
      hs: hss[i % hss.length]
    }
  }));
};
