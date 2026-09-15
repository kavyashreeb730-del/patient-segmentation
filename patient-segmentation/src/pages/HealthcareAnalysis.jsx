import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import PatientTable from '../components/PatientTable';
import PatientDetails from '../components/PatientDetails';
import { Calendar, Activity, Heart, Eye, Moon, Stethoscope, Dumbbell } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts';

export default function HealthcareAnalysis({ segmentationResult, isLoading }) {
  const [activePatient, setActivePatient] = useState(null);

  if (isLoading || !segmentationResult) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm font-medium">Analyzing healthcare dataset parameters...</p>
      </div>
    );
  }

  const { overallAverages, segmentedPatients, segments } = segmentationResult;

  // BMI Distribution Bins
  const bmiBins = [
    { range: '<18.5 (Underweight)', count: 0 },
    { range: '18.5-24.9 (Normal)', count: 0 },
    { range: '25.0-29.9 (Overweight)', count: 0 },
    { range: '30.0+ (Higher BMI)', count: 0 }
  ];

  // Visit Frequency Distribution Bins
  const visitBins = [
    { range: '1-2 visits', count: 0 },
    { range: '3-5 visits', count: 0 },
    { range: '6-9 visits', count: 0 },
    { range: '10+ visits', count: 0 }
  ];

  // Activity Distribution
  const activityCounts = { Low: 0, Moderate: 0, High: 0 };

  segmentedPatients.forEach((p) => {
    // BMI
    if (p.bmi < 18.5) bmiBins[0].count++;
    else if (p.bmi <= 24.9) bmiBins[1].count++;
    else if (p.bmi <= 29.9) bmiBins[2].count++;
    else bmiBins[3].count++;

    // Visit Freq
    if (p.visit_frequency <= 2) visitBins[0].count++;
    else if (p.visit_frequency <= 5) visitBins[1].count++;
    else if (p.visit_frequency <= 9) visitBins[2].count++;
    else visitBins[3].count++;

    // Activity
    if (activityCounts[p.physical_activity] !== undefined) {
      activityCounts[p.physical_activity]++;
    }
  });

  const activityData = [
    { name: 'Low Activity', value: activityCounts.Low, color: '#f43f5e' },
    { name: 'Moderate Activity', value: activityCounts.Moderate, color: '#22d3ee' },
    { name: 'High Activity', value: activityCounts.High, color: '#2dd4bf' }
  ];

  // Segment Charts Data
  const bmiBySeg = segments.map((s) => ({ name: s.segmentId, bmi: s.averages.bmi }));
  const visitBySeg = segments.map((s) => ({ name: s.segmentId, visitFrequency: s.averages.visitFrequency }));

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight mb-1">Healthcare Measurement Analysis</h2>
        <p className="text-xs text-slate-400 mb-4">
          Non-diagnostic cohort statistics across age, body mass, vital metrics, and healthcare utilization.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <StatCard title="Mean Age" value={overallAverages.age} unit="yrs" icon={Calendar} color="teal" />
          <StatCard title="Median Age" value={overallAverages.medianAge} unit="yrs" icon={Calendar} color="cyan" />
          <StatCard title="Average BMI" value={overallAverages.bmi} unit="" icon={Activity} color="amber" />
          <StatCard title="Heart Rate" value={overallAverages.resting_heart_rate} unit="bpm" icon={Heart} color="rose" />
          <StatCard title="Systolic BP" value={overallAverages.systolic_bp} unit="mmHg" icon={Stethoscope} color="indigo" />
          <StatCard title="Diastolic BP" value={overallAverages.diastolic_bp} unit="mmHg" icon={Stethoscope} color="indigo" />
          <StatCard title="Visit Freq" value={overallAverages.visit_frequency} unit="/ yr" icon={Eye} color="emerald" />
          <StatCard title="Sleep Duration" value={overallAverages.sleep_hours} unit="hrs" icon={Moon} color="amber" />
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* BMI Distribution */}
        <ChartCard title="BMI Distribution" subtitle="Patient cohort categorized by BMI range">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={bmiBins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="range" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                formatter={(val) => [`${val} patients`, 'Count']}
              />
              <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Visit Frequency Distribution */}
        <ChartCard title="Visit Frequency Distribution" subtitle="Annual healthcare visits distribution">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={visitBins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="range" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                formatter={(val) => [`${val} patients`, 'Count']}
              />
              <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Physical Activity Distribution */}
        <ChartCard title="Physical Activity Breakdown" subtitle="Proportion of low, moderate, and high activity">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={activityData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {activityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                formatter={(val, name) => [`${val} patients`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Average BMI by Segment */}
        <ChartCard title="Average BMI by Segment" subtitle="Body mass index comparison across clusters">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={bmiBySeg} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                formatter={(val) => [val, 'Avg BMI']}
              />
              <Bar dataKey="bmi" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Average Visit Frequency by Segment */}
        <ChartCard title="Average Visit Frequency by Segment" subtitle="Annual visits comparison across clusters" className="md:col-span-2">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={visitBySeg} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                formatter={(val) => [`${val} visits/yr`, 'Avg Visits']}
              />
              <Bar dataKey="visitFrequency" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Patient Explorer Table */}
      <div className="pt-4 space-y-3">
        <h3 className="text-base font-bold text-white tracking-tight">Searchable Patient Explorer</h3>
        <PatientTable
          patients={segmentedPatients}
          segments={segments}
          onPatientClick={(p) => setActivePatient(p)}
        />
      </div>

      {/* Patient Detail Modal */}
      {activePatient && (
        <PatientDetails
          patient={activePatient}
          segments={segments}
          onClose={() => setActivePatient(null)}
        />
      )}
    </div>
  );
}
