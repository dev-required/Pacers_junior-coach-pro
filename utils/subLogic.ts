
import { Player, Shift, RotationConfig } from '../types';

export function generateRotation(players: Player[], config: RotationConfig): Shift[] {
  const { gameMinutes, playersOnCourt, periodLength, startingIds } = config;
  
  if (periodLength <= 0 || gameMinutes <= 0 || players.length === 0) {
    return [];
  }

  const totalPeriods = Math.ceil(gameMinutes / periodLength);
  
  if (totalPeriods > 100) {
    return []; 
  }

  // Create an ordered queue: Starting Five first, then everyone else sorted by ID for consistency
  let prioritizedQueue: string[] = [];
  
  // 1. Add valid starting players from the config
  const validStarters = startingIds.filter(id => players.some(p => p.id === id));
  prioritizedQueue.push(...validStarters.slice(0, playersOnCourt));
  
  // 2. Add remaining players not already in the queue
  const remainingPlayers = players
    .filter(p => !prioritizedQueue.includes(p.id))
    .sort((a, b) => a.id.localeCompare(b.id));
  
  prioritizedQueue.push(...remainingPlayers.map(p => p.id));

  // 3. If prioritizedQueue is still too short, pad with first players
  // (though remainingPlayers should cover it if players.length >= playersOnCourt)

  const shifts: Shift[] = [];
  let playerPoolIndex = 0;

  for (let p = 1; p <= totalPeriods; p++) {
    const onCourt: string[] = [];
    for (let i = 0; i < playersOnCourt; i++) {
      onCourt.push(prioritizedQueue[playerPoolIndex % prioritizedQueue.length]);
      playerPoolIndex++;
    }
    shifts.push({
      period: p,
      players: onCourt
    });
  }

  return shifts;
}
