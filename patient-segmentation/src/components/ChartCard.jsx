import React from 'react';

export default function ChartCard({ title, subtitle, children, action, className = '' }) {
  return (
    <div className={`bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col ${className}`}>
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>

      <div className="w-full flex-1 min-h-[240px] relative min-w-0">
        {children}
      </div>
    </div>
  );
}
