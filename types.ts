
export interface Player {
  id: string;
  name: string;
  number: string;
  position: { x: number; y: number };
  team: 'home' | 'away';
  available: boolean;
}

export interface Shift {
  period: number;
  players: string[]; // IDs of players on court
}

export interface RotationConfig {
  gameMinutes: number;
  playersOnCourt: number;
  periodLength: number;
  useHalves: boolean;
  startingIds: string[];
}

export interface PlaySnapshot {
  playerId: string;
  playerNumber: string;
  x: number;
  y: number;
}

export interface Play {
  id: string;
  name: string;
  category: 'offence' | 'defence';
  timestamp: number;
  snapshots: PlaySnapshot[];
}
