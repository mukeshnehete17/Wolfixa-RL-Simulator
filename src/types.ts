export type Position = { x: number; y: number };
export type CellType = 'empty' | 'obstacle' | 'start' | 'goal';
export type GameMode = 'Auto' | 'Manual';
export type AlgorithmType = 'Q-Learning' | 'Random';

export const ACTIONS = ['UP', 'DOWN', 'LEFT', 'RIGHT'] as const;
export type Action = typeof ACTIONS[number];

export interface GridConfig {
  size: number;
  startPos: Position;
  goalPos: Position;
  obstacles: Position[];
  rewards: Record<string, number>;
}

export type QTable = Record<string, Record<Action, number>>;
