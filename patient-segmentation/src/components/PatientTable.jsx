import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export default function PatientTable({
  patients = [],
  segments = [],
  onPatientClick,
  initialSegmentFilter = 'ALL'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState(initialSegmentFilter);
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [activityFilter, setActivityFilter] = useState('ALL');
  const [sortField, setSortField] = useState('patient_id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter & Sort Patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      // Search Patient ID
      if (searchQuery.trim() && !p.patient_id.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
        return false;
      }
      // Segment Filter
      if (segmentFilter !== 'ALL' && p.cluster !== Number(segmentFilter)) {
        return false;
      }
      // Gender Filter
      if (genderFilter !== 'ALL' && p.gender !== genderFilter) {
        return false;
      }
      // Activity Filter
      if (activityFilter !== 'ALL' && p.physical_activity !== activityFilter) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [patients, searchQuery, segmentFilter, genderFilter, activityFilter, sortField, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSegmentName = (clusterIdx) => {
    const seg = segments.find(s => s.clusterIndex === clusterIdx);
    return seg ? seg.name : `Segment ${clusterIdx + 1}`;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col min-w-0">
      {/* Controls Bar: Search, Filters */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Patient ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-900 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 border border-slate-700/80 focus:outline-none focus:border-teal-500 placeholder-slate-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Segment Filter */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={segmentFilter}
              onChange={(e) => {
                setSegmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Segments</option>
              {segments.map((seg) => (
                <option key={seg.clusterIndex} value={seg.clusterIndex} className="bg-slate-900">
                  {seg.segmentId}: {seg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1">
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Genders</option>
              <option value="Female" className="bg-slate-900">Female</option>
              <option value="Male" className="bg-slate-900">Male</option>
            </select>
          </div>

          {/* Physical Activity Filter */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1">
            <select
              value={activityFilter}
              onChange={(e) => {
                setActivityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Activities</option>
              <option value="Low" className="bg-slate-900">Low</option>
              <option value="Moderate" className="bg-slate-900">Moderate</option>
              <option value="High" className="bg-slate-900">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Horizontally Scrollable Table Container */}
      <div className="w-full overflow-x-auto min-w-0">
        <table className="w-full text-left text-xs text-slate-300 min-w-[760px]">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Patient ID</th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('age')}>
                <div className="flex items-center space-x-1">
                  <span>Age</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-4">Gender</th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('bmi')}>
                <div className="flex items-center space-x-1">
                  <span>BMI</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-4">Heart Rate</th>
              <th className="py-3 px-4">Blood Pressure</th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('visit_frequency')}>
                <div className="flex items-center space-x-1">
                  <span>Visit Freq</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-4">Activity</th>
              <th className="py-3 px-4">Assigned Segment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedPatients.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-8 text-center text-slate-500">
                  No matching patient records found.
                </td>
              </tr>
            ) : (
              paginatedPatients.map((patient) => (
                <tr
                  key={patient.patient_id}
                  onClick={() => onPatientClick && onPatientClick(patient)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-teal-400">{patient.patient_id}</td>
                  <td className="py-3 px-4">{patient.age} yrs</td>
                  <td className="py-3 px-4">{patient.gender}</td>
                  <td className="py-3 px-4 font-semibold">{patient.bmi}</td>
                  <td className="py-3 px-4">{patient.resting_heart_rate} bpm</td>
                  <td className="py-3 px-4">{patient.systolic_bp}/{patient.diastolic_bp} mmHg</td>
                  <td className="py-3 px-4 font-semibold text-slate-200">{patient.visit_frequency} / yr</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        patient.physical_activity === 'High'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : patient.physical_activity === 'Moderate'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {patient.physical_activity}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-medium text-[11px] truncate max-w-[140px] inline-block">
                      Segment {patient.cluster + 1}: {getSegmentName(patient.cluster)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing <span className="font-semibold text-slate-200">{filteredPatients.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
          <span className="font-semibold text-slate-200">{Math.min(currentPage * pageSize, filteredPatients.length)}</span> of{' '}
          <span className="font-semibold text-slate-200">{filteredPatients.length}</span> patients
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
