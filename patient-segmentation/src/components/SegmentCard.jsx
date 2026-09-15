import React from 'react';
import { Users, Calendar, Activity, Heart, Eye } from 'lucide-react';

export default function SegmentCard({ segment, onSelectSegment }) {
  const { segmentId, name, patientCount, percentage, averages } = segment;

  const clusterColors = [
    { border: 'border-teal-500/30', badge: 'bg-teal-500/10 text-teal-400 border-teal-500/30', bar: 'bg-teal-500' },
    { border: 'border-cyan-500/30', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', bar: 'bg-cyan-500' },
    { border: 'border-indigo-500/30', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', bar: 'bg-indigo-500' },
    { border: 'border-amber-500/30', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30', bar: 'bg-amber-500' },
    { border: 'border-rose-500/30', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30', bar: 'bg-rose-500' },
    { border: 'border-emerald-500/30', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', bar: 'bg-emerald-500' }
  ];

  const colorTheme = clusterColors[segment.clusterIndex % clusterColors.length];

  return (
    <div className={`bg-slate-900/90 border ${colorTheme.border} rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all`}>
      <div>
        {/* Card Header: Badge & Cohort % */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${colorTheme.badge}`}>
            {segmentId}
          </span>
          <span className="text-xs font-bold text-slate-400">
            {percentage}% of Cohort
          </span>
        </div>

        {/* Segment Name */}
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mb-1">
          {name}
        </h3>

        {/* Patient Count Bar */}
        <div className="mt-2 mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Patient Count</span>
            </span>
            <span className="font-semibold text-slate-200">{patientCount} Patients</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${colorTheme.bar}`} style={{ width: `${percentage}%` }}></div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-slate-800/80 my-3">
          <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60">
            <div className="flex items-center text-[11px] text-slate-400">
              <Calendar className="w-3 h-3 text-teal-400 mr-1" />
              <span>Avg Age</span>
            </div>
            <p className="text-sm font-bold text-slate-100 mt-0.5">{averages.age} yrs</p>
          </div>

          <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60">
            <div className="flex items-center text-[11px] text-slate-400">
              <Activity className="w-3 h-3 text-cyan-400 mr-1" />
              <span>Avg BMI</span>
            </div>
            <p className="text-sm font-bold text-slate-100 mt-0.5">{averages.bmi}</p>
          </div>

          <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60">
            <div className="flex items-center text-[11px] text-slate-400">
              <Eye className="w-3 h-3 text-indigo-400 mr-1" />
              <span>Visit Freq</span>
            </div>
            <p className="text-sm font-bold text-slate-100 mt-0.5">{averages.visitFrequency} / yr</p>
          </div>

          <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60">
            <div className="flex items-center text-[11px] text-slate-400">
              <Heart className="w-3 h-3 text-rose-400 mr-1" />
              <span>Heart Rate</span>
            </div>
            <p className="text-sm font-bold text-slate-100 mt-0.5">{averages.heartRate} bpm</p>
          </div>
        </div>

        {/* Characteristics Profile */}
        <div className="mt-3 text-xs text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-300">Profile Traits: </span>
          Dominant activity level is <span className="text-teal-400 font-medium">{averages.physicalActivity}</span> with an average sleep duration of <span className="text-teal-400 font-medium">{averages.sleepHours} hrs</span>.
        </div>
      </div>

      {/* Action button */}
      {onSelectSegment && (
        <button
          onClick={() => onSelectSegment(segment.clusterIndex)}
          className="mt-4 w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-teal-400 text-xs font-semibold transition-all border border-slate-700/60 cursor-pointer"
        >
          <span>Explore Segment Patients</span>
        </button>
      )}
    </div>
  );
}
