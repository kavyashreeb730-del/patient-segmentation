import React from 'react';
import { Users, PieChart as PieIcon, Activity, Heart, Calendar, Eye, Sparkles } from 'lucide-react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts';
import { generateDashboardSummary } from '../utils/segmentInsights';

export default function Dashboard({ segmentationResult, isLoading }) {
  if (isLoading || !segmentationResult) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm font-medium">Processing dataset & training TensorFlow.js K-Means...</p>
      </div>
    );
  }

  const { totalPatients, k, segments, overallAverages } = segmentationResult;
  const summaryText = generateDashboardSummary(segmentationResult);

  const colors = ['#2dd4bf', '#22d3ee', '#818cf8', '#fbbf24', '#f43f5e', '#10b981'];

  // Data for Chart 1: Segment Distribution
  const pieData = segments.map((seg, idx) => ({
    name: `${seg.segmentId}`,
    fullName: seg.name,
    value: seg.patientCount,
    percentage: seg.percentage,
    color: colors[idx % colors.length]
  }));

  // Data for Chart 2: Average Age by Segment
  const ageBySegmentData = segments.map((seg) => ({
    name: seg.segmentId,
    age: seg.averages.age
  }));

  // Data for Chart 3: Average BMI by Segment
  const bmiBySegmentData = segments.map((seg) => ({
    name: seg.segmentId,
    bmi: seg.averages.bmi
  }));

  // Data for Chart 4: Average Visit Frequency by Segment
  const visitBySegmentData = segments.map((seg) => ({
    name: seg.segmentId,
    visitFrequency: seg.averages.visitFrequency
  }));

  // Data for Chart 5: Overall Patient Age Distribution
  const ageBins = [
    { range: '18-30', count: 0 },
    { range: '31-45', count: 0 },
    { range: '46-60', count: 0 },
    { range: '61-75', count: 0 },
    { range: '76+', count: 0 }
  ];

  segmentationResult.segmentedPatients.forEach((p) => {
    if (p.age <= 30) ageBins[0].count++;
    else if (p.age <= 45) ageBins[1].count++;
    else if (p.age <= 60) ageBins[2].count++;
    else if (p.age <= 75) ageBins[3].count++;
    else ageBins[4].count++;
  });

  return (
    <div className="space-y-6">
      {/* Dynamic Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-teal-500/20 rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-start space-x-3 relative z-10">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Cluster Insights Executive Summary (K = {k})
            </h2>
            <p className="text-sm text-slate-200 mt-1 leading-relaxed">
              {summaryText}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Patients"
          value={totalPatients}
          unit="records"
          icon={Users}
          color="teal"
          subtext="Full dataset cohort"
        />
        <StatCard
          title="Total Segments"
          value={k}
          unit="clusters"
          icon={PieIcon}
          color="emerald"
          subtext={`K = ${k} active`}
        />
        <StatCard
          title="Average Age"
          value={overallAverages.age}
          unit="years"
          icon={Calendar}
          color="cyan"
          subtext="Cohort mean"
        />
        <StatCard
          title="Average BMI"
          value={overallAverages.bmi}
          unit=""
          icon={Activity}
          color="amber"
          subtext="Body Mass Index"
        />
        <StatCard
          title="Visit Frequency"
          value={overallAverages.visit_frequency}
          unit="/ year"
          icon={Eye}
          color="indigo"
          subtext="Healthcare usage"
        />
        <StatCard
          title="Resting HR"
          value={overallAverages.resting_heart_rate}
          unit="bpm"
          icon={Heart}
          color="rose"
          subtext="Average heart rate"
        />
      </div>

      {/* Grid of 5 Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Chart 1: Patient Segment Distribution */}
        <ChartCard title="Patient Segment Distribution" subtitle="Cohort proportion by cluster">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs">
                        <p className="font-bold text-teal-400">{data.name}: {data.fullName}</p>
                        <p className="text-slate-300 font-semibold mt-1">
                          {data.value} patients ({data.percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Average Age by Segment */}
        <ChartCard title="Average Age by Segment" subtitle="Comparative mean age per cluster">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ageBySegmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                formatter={(val) => [`${val} years`, 'Average Age']}
              />
              <Bar dataKey="age" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3: Average BMI by Segment */}
        <ChartCard title="Average BMI by Segment" subtitle="Comparative body mass index">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bmiBySegmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                formatter={(val) => [val, 'Average BMI']}
              />
              <Bar dataKey="bmi" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 4: Average Visit Frequency by Segment */}
        <ChartCard title="Average Visit Frequency by Segment" subtitle="Annual healthcare visits per segment">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={visitBySegmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                formatter={(val) => [`${val} visits/yr`, 'Visit Frequency']}
              />
              <Bar dataKey="visitFrequency" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 5: Patient Age Distribution */}
        <ChartCard title="Patient Age Distribution" subtitle="Full dataset age bin breakdown" className="md:col-span-2 lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ageBins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                formatter={(val) => [`${val} patients`, 'Patient Count']}
              />
              <Bar dataKey="count" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
