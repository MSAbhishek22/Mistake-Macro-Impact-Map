import { analyzeMatchData } from "@/lib/analysis-engine";
import type { AnalysisResult, MatchData } from "@/lib/analysis-engine";
import { mockMatch } from "@/data/mock-match";

export interface AnalyzeMatchPayload {
  matchId?: string;
  playerId?: string;
  events?: MatchData["events"];
}

export const analyzeMatch = async (
  payload: AnalyzeMatchPayload = {}
): Promise<AnalysisResult> => {
  try {
    // API latency is simulated so consumers can handle async flows.
    await new Promise((resolve) => setTimeout(resolve, 120));
    const match: MatchData = {
      ...mockMatch,
      matchId: payload.matchId ?? mockMatch.matchId,
      events: payload.events ?? mockMatch.events,
    };
    return analyzeMatchData(match, { playerId: payload.playerId });
  } catch (error) {
    console.warn("Analysis failed, falling back to mock data:", error);
    // Fallback to pure mock match to ensure UI doesn't break
    return analyzeMatchData(mockMatch, { playerId: payload.playerId });
  }
};

export const analyzeMockMatch = async (): Promise<AnalysisResult> => {
  return analyzeMatch({});
};
