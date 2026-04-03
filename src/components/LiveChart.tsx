import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface LiveChartProps {
  data: { episode: number; reward: number }[];
}

export const LiveChart = ({ data }: LiveChartProps) => {
  return (
    <div className="w-full h-full bg-slate-900 border border-slate-800/80 rounded-xl p-4 shadow-xl flex flex-col">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 tracking-wider flex items-center gap-2">
         <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
         LIVESTREAM METRICS
      </h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="episode" stroke="#475569" fontSize={11} tickMargin={8} />
            <YAxis stroke="#475569" fontSize={11} width={35} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '8px' }}
              itemStyle={{ color: '#6366f1', fontSize: '13px', fontWeight: 'bold' }}
              labelStyle={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}
            />
            <Line type="monotone" dataKey="reward" stroke="#6366f1" strokeWidth={3} dot={!(data.length > 50)} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
