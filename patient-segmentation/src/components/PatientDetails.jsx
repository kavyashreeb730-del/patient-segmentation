import React from 'react';
import { X, User, Heart, Activity, Calendar, Moon, Cigarette, ShieldAlert } from 'lucide-react';

export default function PatientDetails({ patient, segments = [], onClose }) {
  if (!patient) return null;

  const assignedSegment = segments.find(s => s.clusterIndex === patient.cluster);

  // Derive Descriptive Classifications (Analytical only, not diagnostic)
  const getAgeGroup = (age) => {
    if (age < 35) return 'Young Adult';
    if (age <= 60) return 'Middle Adult';
    return 'Older Adult';
  };

  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight Range';
    if (bmi <= 24.9) return 'Normal Range';
    if (bmi <= 29.9) return 'Overweight Range';
    return 'Higher BMI Range';
  };

  const getVisitActivity = (freq) => {
    if (freq <= 2) return 'Low Frequency';
    if (freq <= 6) return 'Moderate Frequency';
    return 'High Frequency';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-lg font-mono">
            {patient.patient_id.substring(0, 5)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{patient.patient_id} Profile</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Segment {patient.cluster + 1}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {patient.gender} • {patient.age} years old • {patient.physical_activity} Activity
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-5">
          {/* Section 1: Non-Diagnostic Patient Profile Metrics */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Healthcare Characteristics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-500 block">Height / Weight</span>
                <span className="text-sm font-semibold text-slate-200">{patient.height} cm / {patient.weight} kg</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-500 block">BMI Value</span>
                <span className="text-sm font-semibold text-teal-400">{patient.bmi}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-500 block">Resting Heart Rate</span>
                <span className="text-sm font-semibold text-rose-400">{patient.resting_heart_rate} bpm</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-500 block">Blood Pressure</span>
                <span className="text-sm font-semibold text-indigo-400">{patient.systolic_bp}/{patient.diastolic_bp} mmHg</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-500 block">Visit Frequency</span>
                <span className="text-sm font-semibold text-cyan-400">{patient.visit_frequency} / year</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-500 block">Sleep Duration</span>
                <span className="text-sm font-semibold text-amber-400">{patient.sleep_hours} hrs/night</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-500 block">Physical Activity</span>
                <span className="text-sm font-semibold text-emerald-400">{patient.physical_activity}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-500 block">Smoking Status</span>
                <span className="text-sm font-semibold text-slate-300">{patient.smoking_status}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Analytical Classifications */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Descriptive Analytics Profile
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block">Age Group</span>
                <span className="text-xs font-bold text-teal-300">{getAgeGroup(patient.age)}</span>
              </div>
              <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block">BMI Range</span>
                <span className="text-xs font-bold text-cyan-300">{getBmiCategory(patient.bmi)}</span>
              </div>
              <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block">Activity Level</span>
                <span className="text-xs font-bold text-emerald-300">{patient.physical_activity}</span>
              </div>
              <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block">Healthcare Usage</span>
                <span className="text-xs font-bold text-indigo-300">{getVisitActivity(patient.visit_frequency)}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Segment Comparison */}
          {assignedSegment && (
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-200">
                  Assigned Cluster: {assignedSegment.name}
                </h4>
                <span className="text-xs text-teal-400 font-semibold">{assignedSegment.percentage}% of cohort</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                This patient's metrics align with {assignedSegment.segmentId}. On average, this segment features an age of {assignedSegment.averages.age} years, BMI of {assignedSegment.averages.bmi}, and visit frequency of {assignedSegment.averages.visitFrequency} visits/year.
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-950 p-2.5 rounded-lg">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>These classifications are analytical descriptors only. They do not constitute medical diagnosis.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
