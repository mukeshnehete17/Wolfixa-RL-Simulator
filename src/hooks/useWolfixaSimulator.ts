import { useState, useEffect, useCallback } from 'react';
import { ACTIONS } from '../types';
import type { GridConfig, Position, QTable, Action, AlgorithmType, GameMode } from '../types';

const serializePos = (pos: Position) => `${pos.x},${pos.y}`;

const getNextPosition = (pos: Position, action: Action, size: number): Position => {
  let { x, y } = pos;
  if (action === 'UP') y -= 1;
  else if (action === 'DOWN') y += 1;
  else if (action === 'LEFT') x -= 1;
  else if (action === 'RIGHT') x += 1;

  x = Math.max(0, Math.min(x, size - 1));
  y = Math.max(0, Math.min(y, size - 1));
  return { x, y };
};

const getDefaultQValue = () => ({ UP: 0, DOWN: 0, LEFT: 0, RIGHT: 0 });

export const useWolfixaSimulator = (initialConfig: GridConfig) => {
  const [gridConfig, setGridConfig] = useState<GridConfig>(initialConfig);
  const [isRunning, setIsRunning] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('Auto');
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('Q-Learning');
  const [speed, setSpeed] = useState(200);

  const [agentPos, setAgentPos] = useState<Position>(initialConfig.startPos);
  const [qTable, setQTable] = useState<QTable>({});
  
  const [episode, setEpisode] = useState(1);
  const [episodeRewards, setEpisodeRewards] = useState<{episode: number, reward: number}[]>([]);
  const [currentReward, setCurrentReward] = useState(0);

  const alpha = 0.1;
  const gamma = 0.9;
  const epsilon = 0.2;

  const isObstacle = useCallback((pos: Position) => {
    return gridConfig.obstacles.some(o => o.x === pos.x && o.y === pos.y);
  }, [gridConfig.obstacles]);

  const getReward = useCallback((pos: Position) => {
    const key = serializePos(pos);
    if (gridConfig.rewards[key] !== undefined) return gridConfig.rewards[key];
    if (pos.x === gridConfig.goalPos.x && pos.y === gridConfig.goalPos.y) return 100;
    if (isObstacle(pos)) return -100;
    return -1;
  }, [gridConfig, isObstacle]);

  const autoSelectAction = useCallback((stateKey: string): Action => {
    if (algorithm === 'Random' || Math.random() < epsilon) {
      return ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    }
    const qVals = qTable[stateKey] || getDefaultQValue();
    let max = -Infinity;
    let bestActions: Action[] = [];
    ACTIONS.forEach(a => {
      if (qVals[a] > max) {
        max = qVals[a];
        bestActions = [a];
      } else if (qVals[a] === max) {
        bestActions.push(a);
      }
    });
    return bestActions[Math.floor(Math.random() * bestActions.length)];
  }, [algorithm, epsilon, qTable]);

  const executeAction = useCallback((action: Action) => {
    const stateKey = serializePos(agentPos);
    let nextPos = getNextPosition(agentPos, action, gridConfig.size);

    if (isObstacle(nextPos)) {
       nextPos = agentPos; // bounce back
    }

    const reward = getReward(nextPos);
    setCurrentReward(prev => prev + reward);
    
    if (gameMode === 'Auto' && algorithm === 'Q-Learning') {
      const nextStateKey = serializePos(nextPos);
      const nextQVals = qTable[nextStateKey] || getDefaultQValue();
      const maxNextQ = Math.max(...ACTIONS.map(a => nextQVals[a]));
      
      const currentQVals = qTable[stateKey] || getDefaultQValue();
      const newQ = currentQVals[action] + alpha * (reward + gamma * maxNextQ - currentQVals[action]);
      
      setQTable(prev => ({
        ...prev,
        [stateKey]: {
          ...(prev[stateKey] || getDefaultQValue()),
          [action]: newQ
        }
      }));
    }

    setAgentPos(nextPos);

    if (nextPos.x === gridConfig.goalPos.x && nextPos.y === gridConfig.goalPos.y) {
      setEpisodeRewards(prev => [...prev, { episode, reward: currentReward + reward }]);
      setEpisode(ep => ep + 1);
      setAgentPos(gridConfig.startPos);
      setCurrentReward(0);
    }
  }, [agentPos, gridConfig, isObstacle, getReward, currentReward, gameMode, algorithm, qTable, alpha, gamma, episode]);

  // AUTO MODE LOOP
  useEffect(() => {
    if (!isRunning || gameMode !== 'Auto') return;
    const interval = setInterval(() => {
      const stateKey = serializePos(agentPos);
      const action = autoSelectAction(stateKey);
      executeAction(action);
    }, speed);
    return () => clearInterval(interval);
  }, [isRunning, gameMode, speed, agentPos, autoSelectAction, executeAction]);

  // MANUAL MODE INPUT
  useEffect(() => {
    if (!isRunning || gameMode !== 'Manual') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrows
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowUp': executeAction('UP'); break;
        case 'ArrowDown': executeAction('DOWN'); break;
        case 'ArrowLeft': executeAction('LEFT'); break;
        case 'ArrowRight': executeAction('RIGHT'); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, gameMode, executeAction]);

  // Instant reset side effect on gameMode change
  // User rules say switching modes instantly updates behavior. Handled gracefully by the above useEffects.

  const reset = () => {
    setIsRunning(false);
    setAgentPos(gridConfig.startPos);
    setQTable({});
    setEpisode(1);
    setEpisodeRewards([]);
    setCurrentReward(0);
  };

  return {
    gridConfig, setGridConfig,
    agentPos, qTable,
    isRunning, setIsRunning,
    gameMode, setGameMode,
    algorithm, setAlgorithm,
    speed, setSpeed,
    episode, episodeRewards, currentReward,
    reset,
  };
};
