import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DiagnosisTool from './components/DiagnosisTool';
import SystemMonitor from './components/SystemMonitor';
import Settings from './components/Settings';
import SystemLogs from './components/SystemLogs';
import LogsAnalyzer from './components/LogsAnalyzer';
import AppDiagnostics from './components/AppDiagnostics';
import Sidebar from './components/Sidebar';
import { SystemDataProvider } from './context/SystemDataContext';
import AppMonitoring from './components/AppMonitoring';
import PredictiveAnalysis from './components/PredictiveAnalysis';
import DriverUpdates from './components/DriverUpdates';
import DiskPartitioner from './components/DiskPartitioner';
import NetworkDiagnosisTool from './components/NetworkDiagnosisTool';
function App() {
  return (
    <SystemDataProvider>
      <Router>
        <div className="flex h-screen bg-[#111217] overflow-hidden">
          <Sidebar />
          <div className="flex-1 ml-[200px] flex flex-col overflow-auto">
            <main className="px-6 py-3 h-full">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/diagnose" element={<DiagnosisTool />} />
                <Route path="/monitor" element={<SystemMonitor />} />
                <Route path="/logs" element={<SystemLogs />} />
                <Route path="/logs-analyzer" element={<LogsAnalyzer />} />
                <Route path="/app-diagnostics" element={<AppDiagnostics />} />
                <Route path="/app-monitoring" element={<AppMonitoring />} />
                <Route path="/predictive" element={<PredictiveAnalysis />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/driver-updates" element={<DriverUpdates />} />
                <Route path="/disk-partitioner" element={<DiskPartitioner />} />
                <Route path="/network-diagnostics" element={<NetworkDiagnosisTool />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </SystemDataProvider>
  );
}

export default App; 