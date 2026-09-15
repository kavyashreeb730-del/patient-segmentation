import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ZAxis } from 'recharts';

export default function ClusterVisualization({ segmentationResult }) {
  const [activeDimension, setActiveDimension] = useState('bmi_vs_visit'); // 'bmi_vs_visit' | 'age_vs_visit'

  if (!segmentationResult || !segmentationResult.segmentedPatients) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        Clustering visualization pending...
      </div>
    );
  }

  const { segmentedPatients, segments } = segmentationResult;

  const clusterColors = ['#2dd4bf', '#22d3ee', '#818cf8', '#fbbf24', '#f43f5e', '#10b981'];

  // Prepare series grouped by cluster
  const seriesByCluster = segments.map((seg, idx) => {
    const pts = segmentedPatients
      .filter((p) => p.cluster === seg.clusterIndex)
      .map((p) => ({
        x: activeDimension === 'bmi_vs_visit' ? p.bmi : p.age,
        y: p.visit_frequency,
        patientId: p.patient_id,
        age: p.age,
        bmi: p.bmi,
        visitFrequency: p.visit_frequency,
        activity: p.physical_activity,
        segmentName: seg.name,
        segmentId: seg.segmentId
      }));

    return {
      segmentId: seg.segmentId,
      name: seg.name,
      color: clusterColors[idx % clusterColors.length],
      data: pts
    };
  });

  // Custom Scatter Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs z-50">
          <p className="font-bold text-teal-400 mb-1">{data.patientId}</p>
          <p className="text-slate-300 font-medium">{data.segmentId}: {data.segmentName}</p>
          <div className="mt-2 space-y-0.5 text-[11px] text-slate-400">
            <p>Age: <span className="text-white font-semibold">{data.age} yrs</span></p>
            <p>BMI: <span className="text-white font-semibold">{data.bmi}</span></p>
            <p>Visit Freq: <span className="text-white font-semibold">{data.visitFrequency} / yr</span></p>
            <p>Activity: <span className="text-white font-semibold">{data.activity}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="cluster-visualization-chart" className="w-full flex flex-col space-y-4">
      {/* Dimension Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="text-xs text-slate-400">
          Viewing 2D Feature Projection: <span className="font-semibold text-slate-200">
            {activeDimension === 'bmi_vs_visit' ? 'BMI vs. Visit Frequency' : 'Age vs. Visit Frequency'}
          </span>
        </div>
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveDimension('bmi_vs_visit')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeDimension === 'bmi_vs_visit'
                ? 'bg-teal-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            BMI vs Visit Freq
          </button>
          <button
            onClick={() => setActiveDimension('age_vs_visit')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeDimension === 'age_vs_visit'
                ? 'bg-teal-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Age vs Visit Freq
          </button>
        </div>
      </div>

      {/* Recharts ScatterPlot */}
      <div className="h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis
              type="number"
              dataKey="x"
              name={activeDimension === 'bmi_vs_visit' ? 'BMI' : 'Age'}
              unit={activeDimension === 'bmi_vs_visit' ? '' : ' yrs'}
              stroke="#94a3b8"
              fontSize={11}
              domain={['auto', 'auto']}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Visit Frequency"
              unit="/yr"
              stroke="#94a3b8"
              fontSize={11}
              domain={['auto', 'auto']}
            />
            <ZAxis type="number" range={[40, 40]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
            />
            {seriesByCluster.map((series) => (
              <Scatter
                key={series.segmentId}
                name={`${series.segmentId}: ${series.name}`}
                data={series.data}
                fill={series.color}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
