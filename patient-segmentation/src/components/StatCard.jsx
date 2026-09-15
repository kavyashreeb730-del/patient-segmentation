import React from 'react';

export default function StatCard({ title, value, unit, icon: Icon, color = 'teal', subtext }) {
  const colorMap = {
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  const activeColor = colorMap[color] || colorMap.teal;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${activeColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline space-x-1.5">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
      </div>

      {subtext && <p className="mt-1 text-[11px] text-slate-500 truncate">{subtext}</p>}
    </div>
  );
}
