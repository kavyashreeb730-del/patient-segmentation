import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { generatePatientSegmentationReport } from '../utils/reportGenerator';

export default function ReportButton({ segmentationResult }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleDownload = async () => {
    if (!segmentationResult) {
      alert('Please complete patient segmentation first.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      await generatePatientSegmentationReport(segmentationResult, 'cluster-visualization-chart');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Unable to generate report. Please try again.');
      alert(err.message || 'Unable to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating || !segmentationResult}
      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-teal-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      title="Download Dynamic PDF Report"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="hidden sm:inline">Generating PDF...</span>
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Download Report</span>
        </>
      )}
    </button>
  );
}
