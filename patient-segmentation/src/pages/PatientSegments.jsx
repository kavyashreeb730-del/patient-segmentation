import React, { useState } from 'react';
import SegmentCard from '../components/SegmentCard';
import PatientTable from '../components/PatientTable';
import PatientDetails from '../components/PatientDetails';
import { Users, Filter } from 'lucide-react';

export default function PatientSegments({ segmentationResult, isLoading }) {
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState(null);
  const [activePatient, setActivePatient] = useState(null);

  if (isLoading || !segmentationResult) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm font-medium">Loading patient segments...</p>
      </div>
    );
  }

  const { segments, segmentedPatients, k } = segmentationResult;

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Patient Segment Profiles</h2>
          <p className="text-xs text-slate-400 mt-1">
            Identified {k} distinct patient clusters based on demographic and non-diagnostic health features.
          </p>
        </div>
        {selectedSegmentIdx !== null && (
          <button
            onClick={() => setSelectedSegmentIdx(null)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Show All Clusters</span>
          </button>
        )}
      </div>

      {/* Grid of Segment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {segments.map((seg) => (
          <SegmentCard
            key={seg.clusterIndex}
            segment={seg}
            onSelectSegment={(clusterIdx) => setSelectedSegmentIdx(clusterIdx)}
          />
        ))}
      </div>

      {/* Segment Cohort Quick Explorer */}
      <div className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
            <Users className="w-4 h-4 text-teal-400" />
            <span>
              {selectedSegmentIdx !== null
                ? `Segment ${selectedSegmentIdx + 1} Patient Cohort`
                : 'All Segmented Patients'}
            </span>
          </h3>
        </div>

        <PatientTable
          patients={segmentedPatients}
          segments={segments}
          initialSegmentFilter={selectedSegmentIdx !== null ? selectedSegmentIdx.toString() : 'ALL'}
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
