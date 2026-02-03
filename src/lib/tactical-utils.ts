export type ImpactLevel = 'critical' | 'high' | 'medium' | 'low';

export const getLocationCoordinates = (location: string): { x: number; y: number } => {
  const map: Record<string, { x: number; y: number }> = {
    "A Main": { x: 80, y: 80 },
    "B Lobby": { x: 20, y: 80 },
    "A Back": { x: 90, y: 20 },
    "Mid Catwalk": { x: 50, y: 50 },
    "B Alley": { x: 10, y: 40 },
    "A Rafters": { x: 85, y: 15 },
    "Mid": { x: 50, y: 50 },
    "B Site": { x: 15, y: 20 },
    "A Site": { x: 85, y: 20 },
    "Connector": { x: 60, y: 60 },
    "Jungle": { x: 70, y: 40 },
    "Market": { x: 30, y: 30 },
    "B Apps": { x: 15, y: 70 },
  };

  // Default to center if unknown, or try to hash the string to a consistent random position
  if (!map[location]) {
    // Fallback: simple hash to deterministically place unknown locations
    const hash = location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      x: 20 + (hash % 60),
      y: 20 + ((hash * 13) % 60)
    };
  }

  return map[location];
};

export const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getMistakeLevel = (score: number): ImpactLevel => {
  if (score >= 85) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
};
