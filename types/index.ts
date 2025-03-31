export interface Player {
  id: string;
  name: string;
  contact: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  basePrice: number;
  currentPrice?: number;
  teamId?: string;
  statistics?: PlayerStatistics;
}

export interface PlayerStatistics {
  matches: number;
  runs: number;
  wickets: number;
  catches: number;
  stumpings: number;
}

export interface Team {
  id: string;
  name: string;
  captainId: string;
  players: string[]; // Array of player IDs
  budget: number;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
}

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  date: Date;
  venue: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  score?: MatchScore;
}

export interface MatchScore {
  team1Score: number;
  team2Score: number;
  team1Wickets: number;
  team2Wickets: number;
  team1Overs: number;
  team2Overs: number;
  currentBatsmen: string[];
  currentBowlers: string[];
  lastUpdated: Date;
}

export interface Auction {
  id: string;
  playerId: string;
  currentBid: number;
  currentTeamId?: string;
  status: 'active' | 'completed' | 'tied';
  bids: Bid[];
  startTime: Date;
  endTime?: Date;
}

export interface Bid {
  teamId: string;
  amount: number;
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'player' | 'spectator';
  phoneNumber: string;
  profileImage?: string;
}

export interface Tournament {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'in-progress' | 'completed';
  teams: string[]; // Array of team IDs
  matches: string[]; // Array of match IDs
  maxBudget: number;
  rules: string[];
} 