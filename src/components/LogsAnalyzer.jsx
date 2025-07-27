import React, { useState, useEffect } from 'react';
import { fetchAIAnalyzedLogs } from '../services/api';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Check, 
  RefreshCw, 
  Shield, 
  Zap,
  HardDrive,
  Cpu,
  Wifi,
  LineChart
} from 'lucide-react';

const LogsAnalyzer = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllLogs, setShowAllLogs] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAIAnalyzedLogs();
      setAnalysis(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze logs');
    } finally {
      setLoading(false);
    }
  };
  
  const getSeverityIcon = (severity, size = 20) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <AlertCircle size={size} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={size} className="text-amber-500" />;
      case 'informational':
      case 'info':
        return <Info size={size} className="text-blue-400" />;
      case 'stable':
      case 'healthy':
        return <Check size={size} className="text-green-500" />;
      default:
        return <Info size={size} className="text-gray-400" />;
    }
  };
  
  const getAreaIcon = (area, size = 20) => {
    switch (area.toLowerCase()) {
      case 'memory':
        return <Zap size={size} className="text-purple-500" />;
      case 'disk':
      case 'storage':
        return <HardDrive size={size} className="text-blue-500" />;
      case 'cpu':
      case 'processor':
        return <Cpu size={size} className="text-orange-500" />;
      case 'network':
        return <Wifi size={size} className="text-green-500" />;
      case 'performance':
        return <LineChart size={size} className="text-indigo-500" />;
      case 'security':
        return <Shield size={size} className="text-red-500" />;
      default:
        return <Info size={size} className="text-gray-500" />;
    }
  };
  
  const getLevelClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'error':
        return 'bg-red-900/50 text-red-100 border-red-800';
      case 'warning':
        return 'bg-amber-900/50 text-amber-100 border-amber-800';
      case 'info':
      case 'information':
        return 'bg-blue-900/50 text-blue-100 border-blue-800';
      default:
        return 'bg-gray-800 text-gray-200 border-gray-700';
    }
  };
  
  const getSystemStateClass = (state) => {
    switch (state?.toLowerCase()) {
      case 'critical':
        return 'bg-red-900/50 border-red-800 text-red-100';
      case 'warning':
        return 'bg-amber-900/50 border-amber-800 text-amber-100';
      case 'stable':
        return 'bg-blue-900/50 border-blue-800 text-blue-100';
      case 'healthy':
        return 'bg-green-900/50 border-green-800 text-green-100';
      default:
        return 'bg-gray-800 border-gray-700 text-gray-300';
    }
  };
  
  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-900/50 text-red-100';
      case 'warning':
        return 'bg-amber-900/50 text-amber-100';
      case 'informational':
      case 'info':
        return 'bg-blue-900/50 text-blue-100';
      default:
        return 'bg-gray-800 text-gray-200';
    }
  };
  
  if (loading) {
    return (
      <div className="py-6">
        <h2 className="text-3xl font-bold text-white mb-6">System Logs Analyzer</h2>
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
          <p className="mt-4 text-gray-300">Analyzing your system logs...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-6">
        <h2 className="text-3xl font-bold text-white mb-6">System Logs Analyzer</h2>
        <div className="bg-red-900/50 border border-red-800 text-red-100 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={fetchData} 
            className="absolute top-0 right-0 mt-3 mr-4"
          >
            <RefreshCw size={18} />
          </button>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-[#4a6fa5] text-white rounded hover:bg-[#5f83b9] transition-colors flex items-center"
        >
          <RefreshCw size={18} className="mr-2" /> Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">System Logs Analyzer</h2>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-[#4a6fa5] text-white rounded hover:bg-[#5f83b9] transition-colors flex items-center"
        >
          <RefreshCw size={18} className="mr-2" /> Refresh
        </button>
      </div>
      
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Summary and Status Panel */}
          <div className="md:col-span-12 bg-[#1e2227] rounded-md p-6 mb-4 border border-gray-800">
            <div className="flex items-start">
              <div className="mr-4">
                {getSeverityIcon(analysis.systemState, 32)}
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <h3 className="text-xl font-semibold mb-2 md:mb-0 text-white">System Status: 
                    <span className={`ml-2 inline-block px-3 py-1 rounded-full text-sm font-semibold ${getSystemStateClass(analysis.systemState)}`}>
                      {analysis.systemState}
                    </span>
                  </h3>
                  <div className="flex space-x-3 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-900/50 text-red-100">
                      <AlertCircle size={14} className="mr-1" /> {analysis.stats?.errorCount || 0} Errors
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-900/50 text-amber-100">
                      <AlertTriangle size={14} className="mr-1" /> {analysis.stats?.warningCount || 0} Warnings
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-900/50 text-blue-100">
                      <Info size={14} className="mr-1" /> {analysis.stats?.infoCount || 0} Info
                    </span>
                  </div>
                </div>
                <p className="text-lg text-gray-300">{analysis.summary}</p>
              </div>
            </div>
          </div>
          
          {/* Recommendations Panel */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="md:col-span-6 bg-[#1e2227] rounded-md p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-4 text-white">Recommended Actions</h3>
              <div className="space-y-4">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="border-b border-gray-700 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="mr-3">
                        {getSeverityIcon(rec.priority, 20)}
                      </div>
                      <div>
                        <div className="flex items-center mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${getPriorityClass(rec.priority)}`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="font-medium text-white">{rec.action}</p>
                        <p className="text-sm text-gray-400 mt-1">{rec.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Potential Issues Panel */}
          {analysis.potentialIssues && analysis.potentialIssues.length > 0 && (
            <div className="md:col-span-6 bg-[#1e2227] rounded-md p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-4 text-white">Detected Issues</h3>
              <div className="space-y-4">
                {analysis.potentialIssues.map((issue, index) => (
                  <div key={index} className="border-b border-gray-700 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="mr-3">
                        {getAreaIcon(issue.area, 20)}
                      </div>
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="text-sm font-medium text-white mr-2">{issue.area}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${getPriorityClass(issue.severity)}`}>
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-gray-300">{issue.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Recent Logs Panel */}
          {analysis.recentLogs && analysis.recentLogs.length > 0 && (
            <div className="md:col-span-12 bg-[#1e2227] rounded-md p-6 border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Recent Logs</h3>
                <button
                  onClick={() => setShowAllLogs(!showAllLogs)}
                  className="text-[#4a6fa5] hover:text-[#5f83b9] text-sm"
                >
                  {showAllLogs ? 'Show Less' : 'Show All'}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Source</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Message</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#1e2227] divide-y divide-gray-700">
                    {analysis.recentLogs.slice(0, showAllLogs ? undefined : 5).map((log, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelClass(log.level)}`}>
                            {log.level?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {log.source}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-200 max-w-md break-words">
                          {log.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LogsAnalyzer; 