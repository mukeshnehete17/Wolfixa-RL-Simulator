import { MousePointer2, Flag, Target, SquareDashedBottomCode, HandCoins, Eraser } from 'lucide-react';

export type EditTool = 'select' | 'start' | 'goal' | 'obstacle' | 'reward' | 'erase';

interface EditorToolbarProps {
  activeTool: EditTool;
  setActiveTool: (tool: EditTool) => void;
}

const TOOLS: { id: EditTool; icon: any; label: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'start', icon: Flag, label: 'Set Start' },
  { id: 'goal', icon: Target, label: 'Set Goal' },
  { id: 'obstacle', icon: SquareDashedBottomCode, label: 'Add Obstacle' },
  { id: 'reward', icon: HandCoins, label: 'Reward Editor' },
  { id: 'erase', icon: Eraser, label: 'Eraser' },
];

export const EditorToolbar = ({ activeTool, setActiveTool }: EditorToolbarProps) => {
  return (
    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-700/80 shadow-[0_0_15px_rgba(0,0,0,0.5)] rounded-2xl flex items-center p-2 gap-2 z-50 animate-in slide-in-from-top-4">
      {TOOLS.map(t => {
        const Icon = t.icon;
        const isActive = activeTool === t.id;
        return (
          <button
            key={t.id}
            title={t.label}
            onClick={() => setActiveTool(t.id)}
            className={`p-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          </button>
        );
      })}
    </div>
  );
};
