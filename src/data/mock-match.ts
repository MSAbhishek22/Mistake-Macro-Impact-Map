import type { MatchData } from "@/lib/analysis-engine";

/**
 * Sample match consumed by `analyzeMatch` (src/lib/analyze-match.ts).
 *
 * One full 12-round match for Team Nova vs Team Onyx on Ascent.
 * Event conventions follow src/lib/analysis-engine.ts:
 * - `round_end` events use player "system"; the opponent's economy for the
 *   round is encoded in the location string as `opp:<amount>`.
 * - A "death" only becomes a detected mistake when it is untraded (no
 *   teammate kill within 10s) AND it happened before site control, during
 *   an economy disadvantage, or at an isolated location.
 * - Traded deaths and deaths after a site was secured are included on
 *   purpose: the engine correctly ignores them.
 */
export const mockMatch: MatchData = {
  matchId: "match-2026-11-14-nova-vs-onyx",
  map: "Ascent",
  date: "2026-11-14",
  teamId: "team-nova",
  opponentId: "team-onyx",
  roster: [
    { id: "p1", name: "Vortex", role: "Entry", isStar: true },
    { id: "p2", name: "Sable", role: "Sniper" },
    { id: "p3", name: "Mirage", role: "Lurker" },
    { id: "p4", name: "Anchor", role: "Support" },
    { id: "p5", name: "Cipher", role: "IGL" },
  ],
  events: [
    // Round 1 — win, A take. Clean opener, no deaths on Nova.
    { round: 1, timestamp: 24, player: "p1", event_type: "kill", location: "A Main", economy_before: 800, economy_after: 800, round_result: "win", site_control: "A" },
    { round: 1, timestamp: 61, player: "p5", event_type: "plant", location: "A Site", economy_before: 800, economy_after: 800, round_result: "win", site_control: "A" },
    { round: 1, timestamp: 100, player: "system", event_type: "round_end", location: "opp:800", economy_before: 800, economy_after: 2400, round_result: "win", site_control: "A" },

    // Round 2 — win. Anchor dies at A Main but Vortex trades within 6s: not a mistake.
    { round: 2, timestamp: 38, player: "p2", event_type: "kill", location: "Mid Catwalk", economy_before: 2400, economy_after: 2400, round_result: "win", site_control: "Mid" },
    { round: 2, timestamp: 50, player: "p4", event_type: "death", location: "A Main", economy_before: 2400, economy_after: 3900, round_result: "win", site_control: "A" },
    { round: 2, timestamp: 56, player: "p1", event_type: "kill", location: "A Main", economy_before: 2400, economy_after: 2400, round_result: "win", site_control: "A" },
    { round: 2, timestamp: 100, player: "system", event_type: "round_end", location: "opp:1900", economy_before: 2400, economy_after: 3900, round_result: "win", site_control: "A" },

    // Round 3 — loss. Vortex (star) dies untraded at A Main before any site
    // control, against a richer opponent buy. The trade arrives 36s too late.
    // This is the match's biggest mistake: rounds 4-5 bleed out afterwards.
    { round: 3, timestamp: 34, player: "p1", event_type: "death", location: "A Main", economy_before: 3900, economy_after: 1500, round_result: "loss", site_control: "None" },
    { round: 3, timestamp: 70, player: "p3", event_type: "kill", location: "B Lobby", economy_before: 3900, economy_after: 3900, round_result: "loss", site_control: "None" },
    { round: 3, timestamp: 100, player: "system", event_type: "round_end", location: "opp:4200", economy_before: 3900, economy_after: 1500, round_result: "loss", site_control: "None" },

    // Round 4 — loss. Cipher dies untraded, isolated at B Lobby on an eco round.
    { round: 4, timestamp: 29, player: "p5", event_type: "death", location: "B Lobby", economy_before: 1500, economy_after: 900, round_result: "loss", site_control: "None" },
    { round: 4, timestamp: 63, player: "p2", event_type: "kill", location: "B Alley", economy_before: 1500, economy_after: 1500, round_result: "loss", site_control: "None" },
    { round: 4, timestamp: 100, player: "system", event_type: "round_end", location: "opp:4500", economy_before: 1500, economy_after: 900, round_result: "loss", site_control: "None" },

    // Round 5 — loss. Anchor dies on B but Vortex trades in 5s: not a mistake.
    { round: 5, timestamp: 44, player: "p3", event_type: "kill", location: "B Alley", economy_before: 900, economy_after: 900, round_result: "loss", site_control: "B" },
    { round: 5, timestamp: 58, player: "p4", event_type: "death", location: "B Site", economy_before: 900, economy_after: 2450, round_result: "loss", site_control: "B" },
    { round: 5, timestamp: 63, player: "p1", event_type: "kill", location: "B Site", economy_before: 900, economy_after: 900, round_result: "loss", site_control: "B" },
    { round: 5, timestamp: 100, player: "system", event_type: "round_end", location: "opp:3900", economy_before: 900, economy_after: 2450, round_result: "loss", site_control: "B" },

    // Round 6 — win. Sable dies on Catwalk but Cipher trades in 6s: not a mistake.
    { round: 6, timestamp: 31, player: "p2", event_type: "death", location: "Mid Catwalk", economy_before: 2450, economy_after: 4100, round_result: "win", site_control: "B" },
    { round: 6, timestamp: 37, player: "p5", event_type: "kill", location: "Mid Catwalk", economy_before: 2450, economy_after: 2450, round_result: "win", site_control: "B" },
    { round: 6, timestamp: 72, player: "p5", event_type: "plant", location: "B Site", economy_before: 2450, economy_after: 2450, round_result: "win", site_control: "B" },
    { round: 6, timestamp: 100, player: "system", event_type: "round_end", location: "opp:2100", economy_before: 2450, economy_after: 4100, round_result: "win", site_control: "B" },

    // Round 7 — loss. Mirage dies untraded, isolated on Mid Catwalk while the
    // team only holds Mid. Economy collapses across rounds 8-9 afterwards.
    { round: 7, timestamp: 47, player: "p3", event_type: "death", location: "Mid Catwalk", economy_before: 4100, economy_after: 1700, round_result: "loss", site_control: "Mid" },
    { round: 7, timestamp: 80, player: "p4", event_type: "kill", location: "A Back", economy_before: 4100, economy_after: 4100, round_result: "loss", site_control: "None" },
    { round: 7, timestamp: 100, player: "system", event_type: "round_end", location: "opp:4400", economy_before: 4100, economy_after: 1700, round_result: "loss", site_control: "None" },

    // Round 8 — loss. Anchor dies untraded, isolated at A Back: the bleed continues.
    { round: 8, timestamp: 40, player: "p1", event_type: "kill", location: "A Main", economy_before: 1700, economy_after: 1700, round_result: "loss", site_control: "None" },
    { round: 8, timestamp: 66, player: "p4", event_type: "death", location: "A Back", economy_before: 1700, economy_after: 1000, round_result: "loss", site_control: "None" },
    { round: 8, timestamp: 100, player: "system", event_type: "round_end", location: "opp:4600", economy_before: 1700, economy_after: 1000, round_result: "loss", site_control: "None" },

    // Round 9 — win. Vortex dies on Catwalk but Sable trades in 5s: not a mistake.
    { round: 9, timestamp: 36, player: "p1", event_type: "death", location: "Mid Catwalk", economy_before: 1000, economy_after: 3400, round_result: "win", site_control: "Mid" },
    { round: 9, timestamp: 41, player: "p2", event_type: "kill", location: "Mid Catwalk", economy_before: 1000, economy_after: 1000, round_result: "win", site_control: "Mid" },
    { round: 9, timestamp: 100, player: "system", event_type: "round_end", location: "opp:2000", economy_before: 1000, economy_after: 3400, round_result: "win", site_control: "Mid" },

    // Round 10 — win. Clean A round, no Nova deaths.
    { round: 10, timestamp: 28, player: "p3", event_type: "kill", location: "A Rafters", economy_before: 3400, economy_after: 3400, round_result: "win", site_control: "A" },
    { round: 10, timestamp: 69, player: "p5", event_type: "plant", location: "A Site", economy_before: 3400, economy_after: 3400, round_result: "win", site_control: "A" },
    { round: 10, timestamp: 100, player: "system", event_type: "round_end", location: "opp:2300", economy_before: 3400, economy_after: 4600, round_result: "win", site_control: "A" },

    // Round 11 — loss. Sable dies untraded, but A was already secured and Nova
    // had the economy advantage: the engine correctly does NOT flag this one.
    { round: 11, timestamp: 52, player: "p2", event_type: "death", location: "A Site", economy_before: 4600, economy_after: 2900, round_result: "loss", site_control: "A" },
    { round: 11, timestamp: 100, player: "system", event_type: "round_end", location: "opp:3800", economy_before: 4600, economy_after: 2900, round_result: "loss", site_control: "None" },

    // Round 12 — win. Clean B close to end the match.
    { round: 12, timestamp: 33, player: "p1", event_type: "kill", location: "B Lobby", economy_before: 2900, economy_after: 2900, round_result: "win", site_control: "B" },
    { round: 12, timestamp: 58, player: "p4", event_type: "kill", location: "B Site", economy_before: 2900, economy_after: 2900, round_result: "win", site_control: "B" },
    { round: 12, timestamp: 74, player: "p3", event_type: "plant", location: "B Site", economy_before: 2900, economy_after: 2900, round_result: "win", site_control: "B" },
    { round: 12, timestamp: 100, player: "system", event_type: "round_end", location: "opp:2500", economy_before: 2900, economy_after: 4300, round_result: "win", site_control: "B" },
  ],
};
