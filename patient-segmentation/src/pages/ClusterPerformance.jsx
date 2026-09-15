import React from 'react';
import { Sliders, Cpu, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import ClusterVisualization from '../components/ClusterVisualization';
import { generateDynamicInsights, buildBehaviorMatrix } from '../utils/segmentInsights';

export default function ClusterPerformance({
  segmentationResult,
  selectedK,
  onKChange,
  isTraining
}) {
  if (isTraining || !segmentationResult) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm font-medium">Recalculating TensorFlow.js K-Means centroids & silhouette metrics...</p>
      </div>
    );
  }

  const { totalPatients, k, performance, segments } = segmentationResult;
  const insights = generateDynamicInsights(segmentationResult);
  const behaviorMatrix = buildBehaviorMatrix(segmentationResult);

  return (
    <div className="space-y-6">
      {/* Top Header & K Control Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">K-Means Cluster Performance & Metrics</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Evaluated
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standardized Euclidean Distance K-Means Evaluation (TensorFlow.js Engine)
          </p>
        </div>

        {/* K Selector Widget */}
        <div className="flex items-center space-x-3 bg-slate-950 p-2 rounded-xl border border-slate-800 shrink-0">
          <Sliders className="w-4 h-4 text-teal-400" />
          <span className="text-xs text-slate-300 font-semibold">Selected K:</span>
          <div className="flex space-x-1">
            {[2, 3, 4, 5, 6].map((val) => (
              <button
                key={val}
                onClick={() => onKChange(val)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedK === val
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Cluster Count (K)"
          value={k}
          unit="clusters"
          icon={Sliders}
          color="teal"
          subtext="Hyperparameter value"
        />
        <StatCard
          title="Total Patients"
          value={totalPatients}
          unit="records"
          icon={Cpu}
          color="cyan"
          subtext="Evaluated cohort"
        />
        <StatCard
          title="Inertia (Within-SS)"
          value={performance.inertia}
          unit=""
          icon={Activity}
          color="amber"
          subtext="Sum squared distances"
        />
        <StatCard
          title="Silhouette Score"
          value={performance.silhouetteScore}
          unit=""
          icon={CheckCircle2}
          color="emerald"
          subtext={
            performance.silhouetteScore > 0.5
              ? 'Strong cluster separation'
              : performance.silhouetteScore > 0.35
              ? 'Moderate cluster separation'
              : 'Fair cluster separation'
          }
        />
      </div>

      {/* 2D Cluster Visualization Plot */}
      <ChartCard title="2D Cluster Projection & Patient Scatter" subtitle="Interactive projections of patient feature distributions">
        <ClusterVisualization segmentationResult={segmentationResult} />
      </ChartCard>

      {/* Patient Behavior Comparison Matrix Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight">Patient Behavior Comparison Matrix</h3>
          <span className="text-xs text-slate-400">Actual calculated cluster means</span>
        </div>
        <div className="w-full overflow-x-auto min-w-0">
          <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Patient Segment</th>
                <th className="py-3 px-4">Patients (%)</th>
                <th className="py-3 px-4">Avg Age</th>
                <th className="py-3 px-4">Avg BMI</th>
                <th className="py-3 px-4">Visit Frequency</th>
                <th className="py-3 px-4">Activity Level</th>
                <th className="py-3 px-4">Sleep Duration</th>
                <th className="py-3 px-4">Heart Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {behaviorMatrix.map((row) => (
                <tr key={row.segmentId} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-teal-400">
                    {row.segmentId}: {row.name}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    {row.patientCount} ({row.percentage}%)
                  </td>
                  <td className="py-3 px-4">{row.avgAge} yrs</td>
                  <td className="py-3 px-4 font-semibold">{row.avgBmi}</td>
                  <td className="py-3 px-4 text-cyan-300 font-semibold">{row.visitFrequency} / yr</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      {row.activityLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4">{row.sleepHours} hrs</td>
                  <td className="py-3 px-4 text-rose-300">{row.heartRate} bpm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Insights Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-teal-400" />
          <span>Algorithmic Segment Insights (Generated from K = {k})</span>
        </h3>
        <ul className="space-y-2 text-xs text-slate-300">
          {insights.map((ins, idx) => (
            <li key={idx} className="flex items-start space-x-2 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <span className="leading-relaxed">{ins}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
