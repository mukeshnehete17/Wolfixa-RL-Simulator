import type { GridConfig, Position } from '../types';
import { useState } from 'react';

interface GridProps {
  config: GridConfig;
  agentPos: Position;
  isEditMode: boolean;
  onCellAction: (x: number, y: number) => void;
}

const Grid = ({ config, agentPos, isEditMode, onCellAction }: GridProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (x: number, y: number) => {
    if (!isEditMode) return;
    setIsDragging(true);
    onCellAction(x, y);
  };

  const handleMouseEnter = (x: number, y: number) => {
    if (!isEditMode || !isDragging) return;
    onCellAction(x, y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const cells = [];
  for (let y = 0; y < config.size; y++) {
    for (let x = 0; x < config.size; x++) {
      const isAgent = agentPos.x === x && agentPos.y === y;
      const isStart = config.startPos.x === x && config.startPos.y === y;
      const isGoal = config.goalPos.x === x && config.goalPos.y === y;
      const isObstacle = config.obstacles.some(o => o.x === x && o.y === y);
      const rewardVal = config.rewards[`${x},${y}`];
      
      let bgClass = "bg-slate-900 border-slate-800";
      let contentClass = "";

      if (isObstacle) {
        bgClass = "bg-red-500/90 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
      } else if (isGoal) {
        bgClass = "bg-green-500/90 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
      } else if (isStart) {
        bgClass = "bg-indigo-600/50 border-indigo-500";
        contentClass = "text-indigo-200 font-bold flex justify-center items-center h-full";
      }

      // Color-coding explicit custom rewards on empty cells
      if (rewardVal !== undefined && !isObstacle && !isGoal && !isStart) {
         if (rewardVal > 0) bgClass += " bg-green-900/40";
         else if (rewardVal < 0) bgClass += " bg-red-900/40";
      }

      cells.push(
        <div 
          key={`${x}-${y}`}
          onMouseDown={() => handleMouseDown(x, y)}
          onMouseEnter={() => handleMouseEnter(x, y)}
          className={`relative border transition-all duration-200 select-none ${bgClass} ${isEditMode ? 'cursor-pointer hover:brightness-125' : ''}`}
          style={{ width: `${100 / config.size}%`, paddingBottom: `${100 / config.size}%` }}
        >
          {isStart && <div className={`absolute inset-0 ${contentClass}`}>S</div>}
          {isGoal && <div className="absolute inset-0 text-white font-bold text-lg flex justify-center items-center h-full drop-shadow-md">G</div>}
          
          {rewardVal !== undefined && !isObstacle && !isGoal && (
             <div className={`absolute bottom-1 right-1 text-[8px] font-mono opacity-80 px-1 rounded bg-slate-950/80 ${rewardVal > 0 ? 'text-green-400' : 'text-red-400'}`}>{rewardVal > 0 ? '+' : ''}{rewardVal}</div>
          )}
          
          {isAgent && (
            <div className="absolute inset-0 m-auto w-2/3 h-2/3 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)] z-10 transition-all duration-150 pointer-events-none scale-in-center"></div>
          )}
        </div>
      );
    }
  }

  return (
    <div className="w-full aspect-square max-w-2xl bg-black border border-slate-800 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
       <div className={`flex flex-wrap border-t border-l border-slate-800 bg-slate-950/50 h-full w-full ${isEditMode ? 'opacity-90' : ''}`}>
          {cells}
       </div>
    </div>
  );
};

export default Grid;
