export type RoundResult = "win" | "loss";
export type EconomyTier = "eco" | "light" | "full";
export type SiteControl = "A" | "B" | "Mid" | "None";
export type EventType = "death" | "kill" | "plant" | "defuse" | "round_end";

export interface Player {
  id: string;
  name: string;
  role: string;
  isStar?: boolean;
}

export interface EventData {
  round: number;
  timestamp: number;
  player: string;
  event_type: EventType;
  location: string;
  economy_before: number;
  economy_after: number;
  round_result: RoundResult;
  site_control: SiteControl;
}

export interface MatchData {
  matchId: string;
  map: string;
  date: string;
  teamId: string;
  opponentId: string;
  roster: Player[];
  events: EventData[];
}

export interface CascadeWindow {
  rounds: number[];
  roundsLostAfter: number;
  economyDropTier: number;
  economyDeltaByRound: number[];
  siteControlByRound: SiteControl[];
  siteControlLoss: number;
}

export interface MistakeDetail {
  id: string;
  round: number;
  timestamp: number;
  playerId: string;
  label: string;
  title: string;
  location: string;
  roundResult: RoundResult;
  siteControl: SiteControl;
  economyBefore: number;
  economyAfter: number;
  impactScore: number;
  cascadeWindow: CascadeWindow;
  whatHappened: string;
  whatItCaused: string;
  whyItMattered: string;
  coachingTakeaway: string;
}

export interface AnalysisSummary {
  totalRounds: number;
  totalMistakes: number;
  biggestImpact: string;
}

export interface AnalysisResult {
  matchId: string;
  teamId: string;
  generatedAt: string;
  summary: AnalysisSummary;
  mistakes: MistakeDetail[];
  topMistakes: MistakeDetail[];
  roster: Player[];
}

interface RoundSnapshot {
  round: number;
  economy_before: number;
  economy_after: number;
  opponentEconomy: number | null;
  round_result: RoundResult;
  site_control: SiteControl;
}

const ECONOMY_POWER: Record<EconomyTier, number> = {
  eco: 1,
  light: 2,
  full: 3,
};

const ISOLATED_LOCATIONS = new Set([
  "A Main",
  "B Lobby",
  "A Back",
  "Mid Catwalk",
  "B Alley",
  "A Rafters",
]);

const roundKey = (round: number, playerId: string) => `${round}-${playerId}`;

const getEconomyTier = (value: number): EconomyTier => {
  if (value < 2000) return "eco";
  if (value < 3900) return "light";
  return "full";
};

const parseOpponentEconomy = (location: string) => {
  // Opponent economy is encoded in round_end location to avoid extra fields.
  const match = location.match(/opp:(\d+)/i);
  return match ? Number(match[1]) : null;
};

const getRoundSnapshots = (events: EventData[]) => {
  return events
    .filter(
      (event) => event.event_type === "round_end" && event.player === "system"
    )
    .reduce<Map<number, RoundSnapshot>>((map, event) => {
      if (!map.has(event.round)) {
        const opponentEconomy = parseOpponentEconomy(event.location);
        map.set(event.round, {
          round: event.round,
          economy_before: event.economy_before,
          economy_after: event.economy_after,
          opponentEconomy: opponentEconomy ?? null,
          round_result: event.round_result,
          site_control: event.site_control,
        });
      }
      return map;
    }, new Map());
};

const isUntradedDeath = (
  events: EventData[],
  deathEvent: EventData,
  rosterIds: Set<string>
) => {
  return !events.some((event) => {
    if (event.round !== deathEvent.round) return false;
    if (event.event_type !== "kill") return false;
    if (!rosterIds.has(event.player)) return false;
    if (event.player === deathEvent.player) return false;
    return (
      event.timestamp > deathEvent.timestamp &&
      event.timestamp <= deathEvent.timestamp + 10
    );
  });
};

const computeCascadeWindow = (
  roundSnapshots: Map<number, RoundSnapshot>,
  startRound: number,
  startEconomy: EconomyTier
): CascadeWindow => {
  const windowRounds = [1, 2, 3]
    .map((offset) => startRound + offset)
    .map((round) => roundSnapshots.get(round))
    .filter((round): round is RoundSnapshot => Boolean(round));

  const roundsLostAfter = windowRounds.filter(
    (round) => round.round_result === "loss"
  ).length;

  const startEconomyPower = ECONOMY_POWER[startEconomy];
  const economyDeltaByRound = windowRounds.map((round) => {
    const delta =
      startEconomyPower - ECONOMY_POWER[getEconomyTier(round.economy_before)];
    // Positive delta means the team slipped a tier after the mistake.
    return Math.max(0, delta);
  });
  const economyDropTier = Math.max(0, ...economyDeltaByRound, 0);

  const siteControlByRound = windowRounds.map((round) => round.site_control);
  const siteControlLoss = windowRounds.filter(
    (round) => round.site_control === "None"
  ).length;

  return {
    rounds: windowRounds.map((round) => round.round),
    roundsLostAfter,
    economyDropTier,
    economyDeltaByRound,
    siteControlByRound,
    siteControlLoss,
  };
};

const buildNarrative = (
  event: EventData,
  roster: Player[],
  cascade: CascadeWindow
) => {
  const playerName =
    roster.find((player) => player.id === event.player)?.name ?? "Unknown";

  const economyDrop =
    cascade.economyDropTier > 0
      ? `economy down ${cascade.economyDropTier} tier(s)`
      : "economy stable";
  const siteControlShift =
    cascade.siteControlLoss > 0
      ? `${cascade.siteControlLoss} round(s) lost site control`
      : "site control stable";

  return {
    whatHappened: `Round ${event.round}: ${playerName} died untraded at ${event.location}.`,
    whatItCaused: `Next ${cascade.rounds.length} rounds: ${cascade.roundsLostAfter} losses, ${economyDrop}, ${siteControlShift}.`,
    whyItMattered: "Man-advantage lost before site control.",
    coachingTakeaway: "No trade arrived within the 10s window.",
  };
};

const normalizeScores = (mistakes: MistakeDetail[]) => {
  if (mistakes.length === 0) return mistakes;
  const maxScore = Math.max(...mistakes.map((mistake) => mistake.impactScore));
  const divisor = maxScore > 0 ? maxScore : 1;

  return mistakes.map((mistake) => ({
    ...mistake,
    impactScore: Math.round((mistake.impactScore / divisor) * 100),
  }));
};

const getMistakeLabel = (event: EventData) => {
  const tag =
    event.site_control !== "None"
      ? event.site_control
      : /^A\b/i.test(event.location)
      ? "A"
      : /^B\b/i.test(event.location)
      ? "B"
      : /^Mid\b/i.test(event.location)
      ? "Mid"
      : "None";

  return tag === "None"
    ? "Untraded Death"
    : `Untraded ${tag} Death`;
};

const detectMistakes = (match: MatchData, playerId?: string) => {
  const roundSnapshots = getRoundSnapshots(match.events);
  const rosterIds = new Set(match.roster.map((player) => player.id));
  const mistakes: MistakeDetail[] = [];

  match.events.forEach((event) => {
    if (event.event_type !== "death") return;
    if (playerId && event.player !== playerId) return;

    const wasUntraded = isUntradedDeath(match.events, event, rosterIds);
    if (!wasUntraded) return;

    const roundSnapshot = roundSnapshots.get(event.round);
    const opponentEconomy = roundSnapshot?.opponentEconomy ?? null;
    const occurredBeforeSiteSecured =
      event.site_control === "None" || event.site_control === "Mid";
    const occurredDuringDisadvantage =
      opponentEconomy !== null && event.economy_before < opponentEconomy;
    const occurredWhileIsolated = ISOLATED_LOCATIONS.has(event.location);

    // Mistake rule: untraded death before control, in economic disadvantage, or isolated.
    if (
      !(
        occurredBeforeSiteSecured ||
        occurredDuringDisadvantage ||
        occurredWhileIsolated
      )
    ) {
      return;
    }

    const cascadeWindow = computeCascadeWindow(
      roundSnapshots,
      event.round,
      getEconomyTier(event.economy_before)
    );

    const impactScore =
      2 * cascadeWindow.roundsLostAfter +
      1.5 * cascadeWindow.economyDropTier +
      1 * cascadeWindow.siteControlLoss;

    const narrative = buildNarrative(event, match.roster, cascadeWindow);
    const label = getMistakeLabel(event);

    mistakes.push({
      id: roundKey(event.round, event.player),
      round: event.round,
      timestamp: event.timestamp,
      playerId: event.player,
      label,
      title: label,
      location: event.location,
      roundResult: event.round_result,
      siteControl: event.site_control,
      economyBefore: event.economy_before,
      economyAfter: event.economy_after,
      impactScore,
      cascadeWindow,
      ...narrative,
    });
  });

  return normalizeScores(mistakes);
};

export const analyzeMatchData = (
  match: MatchData,
  options: { playerId?: string } = {}
): AnalysisResult => {
  const mistakes = detectMistakes(match, options.playerId);
  const rankedMistakes = [...mistakes].sort(
    (left, right) => right.impactScore - left.impactScore
  );
  const topMistakes = rankedMistakes.slice(0, 5);
  const biggestImpact = topMistakes[0]?.whatHappened ?? "No critical mistakes detected.";

  return {
    matchId: match.matchId,
    teamId: match.teamId,
    generatedAt: new Date().toISOString(),
    summary: {
      totalRounds: new Set(match.events.map((event) => event.round)).size,
      totalMistakes: mistakes.length,
      biggestImpact,
    },
    mistakes: rankedMistakes,
    topMistakes,
    roster: match.roster,
  };
};
