/**
 * Reputation (CC-25).
 *
 * See campus_cure_backend/docs/specs/CC-25-reputation.md.
 */

import { api } from "./auth";

export interface ReputationSummary {
  reputation: number;
  rank: string;
  /** Null at the top rank. */
  next: { name: string; needed: number } | null;
  earnedToday: number;
  /** Earning stops here for the day; voting is unaffected. */
  dailyCap: number;
}

export interface ReputationEvent {
  id: string;
  delta: number;
  /** "answer.upvoted", "answer.accepted", ... */
  reason: string;
  sourceType: string;
  sourceId: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  position: number;
  id: string;
  name: string;
  userID: string;
  role: string;
  reputation: number;
  rank: string;
  studentProfile?: { branch: string; semester: number } | null;
}

export const getReputationSummary = async (): Promise<ReputationSummary> => {
  const { data } = await api.get<ReputationSummary>("/reputation/me");
  return data;
};

export const getReputationHistory = async (
  limit = 50,
): Promise<ReputationEvent[]> => {
  const { data } = await api.get<{ events: ReputationEvent[] }>(
    `/reputation/me/history?limit=${limit}`,
  );
  return Array.isArray(data?.events) ? data.events : [];
};

export const getLeaderboard = async (
  limit = 20,
): Promise<LeaderboardEntry[]> => {
  const { data } = await api.get<{ leaderboard: LeaderboardEntry[] }>(
    `/reputation/leaderboard?limit=${limit}`,
  );
  return Array.isArray(data?.leaderboard) ? data.leaderboard : [];
};

/**
 * Human wording for a ledger reason.
 *
 * Mirrors the server's reason strings. An unknown one falls through to the
 * raw value rather than to "Unknown" — a new reason shipped by the backend
 * should look odd, not invisible.
 */
export const REASON_LABELS: Record<string, string> = {
  "answer.accepted": "Your answer was accepted",
  "answer.upvoted": "Your answer was upvoted",
  "answer.approved": "Your answer passed review",
  "doubt.upvoted": "Your doubt was upvoted",
};
