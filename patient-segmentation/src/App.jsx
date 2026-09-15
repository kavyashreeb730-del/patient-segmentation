import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import PatientSegments from './pages/PatientSegments';
import HealthcareAnalysis from './pages/HealthcareAnalysis';
import ClusterPerformance from './pages/ClusterPerformance';
import { loadPatientsDataset } from './services/dataset';
import { performPatientSegmentation } from './ml/clustering';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedK, setSelectedK] = useState(4);
  const [patients, setPatients] = useState([]);
  const [segmentationResult, setSegmentationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState(null);

  // 1. Initial Data Loading & Clustering Execution
  useEffect(() => {
    async function initApp() {
      setIsLoading(true);
      setError(null);
      try {
        const loadedPatients = await loadPatientsDataset();
        setPatients(loadedPatients);

        const result = await performPatientSegmentation(loadedPatients, selectedK);
        setSegmentationResult(result);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to initialize patient segmentation app.');
      } finally {
        setIsLoading(false);
      }
    }

    initApp();
  }, []);

  // 2. Dynamic Retraining on K change
  const handleKChange = async (newK) => {
    if (newK === selectedK || !patients || patients.length === 0) return;
    setSelectedK(newK);
    setIsTraining(true);
    try {
      // Short timeout to allow UI loading state render
      await new Promise(r => setTimeout(r, 50));
      const newResult = await performPatientSegmentation(patients, newK);
      setSegmentationResult(newResult);
    } catch (err) {
      console.error('K retrain error:', err);
      alert(`Clustering failed for K=${newK}: ${err.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        <Header
          setMobileOpen={setMobileOpen}
          selectedK={selectedK}
          onKChange={handleKChange}
          isTraining={isTraining}
          totalPatients={patients.length}
          segmentationResult={segmentationResult}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          {/* Error Alert Banner */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-rose-300 text-sm">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Active Tab View Rendering */}
          {activeTab === 'dashboard' && (
            <Dashboard
              segmentationResult={segmentationResult}
              isLoading={isLoading || isTraining}
            />
          )}

          {activeTab === 'segments' && (
            <PatientSegments
              segmentationResult={segmentationResult}
              isLoading={isLoading || isTraining}
            />
          )}

          {activeTab === 'analysis' && (
            <HealthcareAnalysis
              segmentationResult={segmentationResult}
              isLoading={isLoading || isTraining}
            />
          )}

          {activeTab === 'performance' && (
            <ClusterPerformance
              segmentationResult={segmentationResult}
              selectedK={selectedK}
              onKChange={handleKChange}
              isTraining={isTraining || isLoading}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="py-4 px-6 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500">
          Healthcare Analytics Dashboard • Unsupervised ML Patient Segmentation Studio • Educational & Analytical Purpose Only
        </footer>
      </div>
    </div>
  );
}
