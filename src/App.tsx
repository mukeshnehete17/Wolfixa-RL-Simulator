import { useState } from 'react';
import { useWolfixaSimulator } from './hooks/useWolfixaSimulator';
import Grid from './components/Grid';
import { Play, Square, RotateCcw, PenTool, Save, Download, Cpu, User } from 'lucide-react';
import type { GridConfig } from './types';
import { EditorToolbar } from './components/EditorToolbar';
import type { EditTool } from './components/EditorToolbar';
import { LiveChart } from './components/LiveChart';

const initialConfig: GridConfig = {
  size: 6,
  startPos: { x: 0, y: 0 },
  goalPos: { x: 5, y: 5 },
  obstacles: [{ x: 3, y: 3 }, { x: 3, y: 4 }, { x: 2, y: 3 }, {x: 4, y: 1}],
  rewards: {},
};

function App() {
  const simulator = useWolfixaSimulator(initialConfig);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTool, setActiveTool] = useState<EditTool>('select');
  const [rewardBrush, setRewardBrush] = useState<number>(-10);

  const handleCellAction = (x: number, y: number) => {
    if (!isEditMode) return;
    const pos = { x, y };
    const serialized = `${x},${y}`;

    simulator.setGridConfig(prev => {
      let newConfig = { ...prev };
      
      if (activeTool === 'start') {
        newConfig.startPos = pos;
      } else if (activeTool === 'goal') {
        newConfig.goalPos = pos;
      } else if (activeTool === 'obstacle') {
        if (!newConfig.obstacles.some(o => o.x === x && o.y === y)) {
          newConfig.obstacles = [...newConfig.obstacles, pos];
        }
      } else if (activeTool === 'reward') {
        newConfig.rewards = { ...newConfig.rewards, [serialized]: rewardBrush };
      } else if (activeTool === 'erase') {
        newConfig.obstacles = newConfig.obstacles.filter(o => o.x !== x || o.y !== y);
        if (newConfig.rewards[serialized] !== undefined) {
          const newRewards = { ...newConfig.rewards };
          delete newRewards[serialized];
          newConfig.rewards = newRewards;
        }
      }
      return newConfig;
    });
  };

  const handleSave = () => {
    localStorage.setItem('wolfixaConfig', JSON.stringify(simulator.gridConfig));
  };
  const handleLoad = () => {
    const data = localStorage.getItem('wolfixaConfig');
    if (data) simulator.setGridConfig(JSON.parse(data));
  };

  return (
    <div className="flex h-screen bg-black text-slate-200 font-sans tracking-wide overflow-hidden">
      
      {/* Sidebar Controls */}
      <div className="w-80 bg-slate-950/80 border-r border-indigo-900/30 p-6 flex flex-col gap-6 overflow-y-auto z-20 shadow-[4px_0_24px_rgba(30,27,75,0.4)] relative backdrop-blur-xl">
        <div className="flex flex-col gap-1 items-start">
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent uppercase tracking-tighter">Wolfixa</h1>
          <p className="text-[10px] text-indigo-300/70 font-semibold tracking-widest uppercase">AI RL Simulator</p>
        </div>

        {/* Game Mode Toggle */}
        <div className="bg-slate-900/80 rounded-xl p-1 border border-slate-800 flex relative mt-2">
           <button 
             onClick={() => simulator.setGameMode('Auto')}
             className={`flex-1 py-1.5 flex items-center justify-center gap-2 text-sm font-semibold transition-all rounded-lg z-10 ${simulator.gameMode === 'Auto' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <Cpu size={16}/> Auto Mode
           </button>
           <button 
             onClick={() => simulator.setGameMode('Manual')}
             className={`flex-1 py-1.5 flex items-center justify-center gap-2 text-sm font-semibold transition-all rounded-lg z-10 ${simulator.gameMode === 'Manual' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <User size={16}/> Manual
           </button>
           {/* Animated Pill Background */}
           <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-indigo-600 rounded-lg transition-transform duration-300 ease-out shadow-[0_0_15px_rgba(79,70,229,0.4)] ${simulator.gameMode === 'Auto' ? 'translate-x-0' : 'translate-x-[calc(100%+4px)]'}`}></div>
        </div>

        <div className="flex gap-3">
           <button 
             onClick={() => simulator.setIsRunning(!simulator.isRunning)}
             disabled={isEditMode}
             className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 border shadow-lg ${simulator.isRunning ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-red-500/20 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/50 shadow-green-500/20 hover:bg-green-500/30'}`}
           >
             {simulator.isRunning ? <><Square size={18} fill="currentColor"/> Stop</> : <><Play size={18} fill="currentColor"/> Start</>}
           </button>
           <button 
             onClick={simulator.reset}
             className="p-3 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center border border-slate-700 transition-colors"
           >
             <RotateCcw size={18}/>
           </button>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 shadow-inner">
           <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-slate-300 flex items-center gap-2 text-sm"><PenTool size={16}/> World Builder Mode</span>
              <button 
                onClick={() => { setIsEditMode(!isEditMode); if(simulator.isRunning) simulator.setIsRunning(false); }}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none shadow-inner ${isEditMode ? 'bg-indigo-500' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isEditMode ? 'translate-x-[22px]' : 'translate-x-1'}`} />
              </button>
           </div>
           
           {isEditMode && activeTool === 'reward' && (
             <div className="mt-4 text-xs animate-in fade-in">
               <label className="text-slate-400 uppercase tracking-wider font-bold">Reward Brush Value</label>
               <input type="number" value={rewardBrush} onChange={(e) => setRewardBrush(Number(e.target.value))} className="w-full mt-2 bg-black border border-slate-700 outline-none focus:border-indigo-500 rounded p-2 text-slate-200 transition-colors" />
             </div>
           )}

           <div className="flex gap-2 mt-5">
             <button onClick={handleSave} className="flex-1 py-1.5 px-2 text-xs rounded-lg bg-slate-800 hover:bg-indigo-900/40 hover:text-indigo-300 transition-colors flex justify-center items-center gap-1.5 border border-slate-700/50"><Save size={14}/> Save</button>
             <button onClick={handleLoad} className="flex-1 py-1.5 px-2 text-xs rounded-lg bg-slate-800 hover:bg-indigo-900/40 hover:text-indigo-300 transition-colors flex justify-center items-center gap-1.5 border border-slate-700/50"><Download size={14}/> Load</button>
           </div>
        </div>

        <div className="space-y-6 flex-1">
          <div>
            <label className="text-xs font-semibold text-slate-400 flex justify-between mb-3 uppercase tracking-wider">
              <span>Grid Configuration</span>
              <span className="text-indigo-400">{simulator.gridConfig.size} x {simulator.gridConfig.size}</span>
            </label>
            <input type="range" min="4" max="10" step="1" disabled={isEditMode} value={simulator.gridConfig.size} onChange={(e)=> {
              simulator.setGridConfig(prev => ({ ...prev, size: Number(e.target.value) }));
            }} className="w-full accent-indigo-500 disabled:opacity-50 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 flex justify-between mb-2 uppercase tracking-wider text-slate-400">Agent Algorithm</label>
            <select 
              value={simulator.algorithm} 
              onChange={(e) => simulator.setAlgorithm(e.target.value as any)}
              disabled={isEditMode || simulator.gameMode === 'Manual'}
              className="w-full bg-slate-900 border border-slate-700 outline-none rounded-lg text-sm text-slate-200 p-2.5 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="Q-Learning">Q-Learning</option>
              <option value="Random">Random Walk</option>
            </select>
          </div>

          <div>
             <label className="text-xs font-semibold text-slate-400 flex justify-between mb-3 uppercase tracking-wider">
                <span>Simulation Speed</span>
                <span className="text-indigo-400">{simulator.speed}ms</span>
             </label>
             <input type="range" min="10" max="1000" step="10" disabled={simulator.gameMode === 'Manual'} value={simulator.speed} onChange={(e)=> simulator.setSpeed(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none accent-indigo-500 disabled:opacity-50" />
          </div>

          <div className="bg-black/50 rounded-xl p-4 border border-indigo-500/20 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
             <div className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase tracking-wider text-slate-400">Episode</span>
                <span className="font-mono text-lg text-indigo-400 font-bold">{simulator.episode}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider text-slate-400">Total Reward</span>
                <span className={`font-mono text-lg font-bold ${simulator.currentReward >= 0 ? 'text-green-400' : 'text-red-400'}`}>{simulator.currentReward}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black relative">
        {isEditMode && <EditorToolbar activeTool={activeTool} setActiveTool={setActiveTool} />}
        
        {/* Top: Grid Container */}
        <div className="flex-1 flex items-center justify-center p-4">
           {simulator.gameMode === 'Manual' && simulator.isRunning && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 text-sm text-yellow-400 font-bold animate-pulse bg-yellow-400/10 px-4 py-2 rounded-full border border-yellow-400/30 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                ⌨ USE ARROW KEYS TO MOVE
              </div>
           )}
           <Grid 
             config={simulator.gridConfig} 
             agentPos={simulator.agentPos} 
             isEditMode={isEditMode}
             onCellAction={handleCellAction}
           />
        </div>
        
        {/* Bottom: Charts Container */}
        <div className="h-64 w-full mt-4">
           <LiveChart data={simulator.episodeRewards} />
        </div>
      </div>

    </div>
  );
}

export default App;
