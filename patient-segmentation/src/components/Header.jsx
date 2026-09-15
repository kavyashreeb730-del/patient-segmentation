import React from 'react';
import { Menu, Sliders, CheckCircle2, Loader2, Database } from 'lucide-react';
import ReportButton from './ReportButton';

export default function Header({
  setMobileOpen,
  selectedK,
  onKChange,
  isTraining,
  totalPatients,
  segmentationResult,
  onDownloadReport
}) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white truncate tracking-tight">
              Patient Segmentation Dashboard
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              TensorFlow.js Browser ML Clustering Engine
            </p>
          </div>
        </div>

        {/* Right Side: Status Badges, K Selector, Report Button */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Dataset Status */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>{totalPatients ? `${totalPatients} Patients` : 'Loading CSV...'}</span>
          </div>

          {/* Clustering Status */}
          <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-xs">
            {isTraining ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span className="text-amber-300 font-medium">Training K-Means...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Clustering Complete</span>
              </>
            )}
          </div>

          {/* K-Selector */}
          <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700/80 rounded-lg px-2.5 py-1">
            <Sliders className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <label htmlFor="k-select" className="text-xs text-slate-300 font-medium whitespace-nowrap">
              K =
            </label>
            <select
              id="k-select"
              value={selectedK}
              onChange={(e) => onKChange(Number(e.target.value))}
              disabled={isTraining}
              className="bg-slate-900 text-teal-300 text-xs font-semibold rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer disabled:opacity-50"
            >
              {[2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          {/* Download Report Button */}
          <ReportButton
            segmentationResult={segmentationResult}
            onDownloadReport={onDownloadReport}
          />
        </div>
      </div>
    </header>
  );
}
