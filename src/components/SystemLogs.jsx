import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, RefreshCw, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchSystemLogs, analyzeSystemLogs } from '../services/api';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLog, setExpandedLog] = useState(null);
  const [view, setView] = useState('analysis'); // 'logs' or 'analysis'
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setRefreshing(true);
      
      if (view === 'logs') {
        const data = await fetchSystemLogs();
        setLogs(data.logs);
      } else {
        const data = await analyzeSystemLogs();
        setLogs(data.logs);
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Error fetching system logs:', error);
      setError('Failed to fetch system logs. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleToggleExpand = (index) => {
    if (expandedLog === index) {
      setExpandedLog(null);
    } else {
      setExpandedLog(index);
    }
  };

  const toggleView = (newView) => {
    if (newView !== view) {
      setView(newView);
      fetchData();
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading && !refreshing) {
    return (
      <div className="py-6">
        <h2 className="text-3xl font-bold text-[#166088] mb-6 flex items-center">
          <AlertCircle className="h-8 w-8 mr-3 text-[#166088]" />
          System Logs
        </h2>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4a6fa5]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <h2 className="text-3xl font-bold text-[#166088] mb-6 flex items-center">
          <AlertCircle className="h-8 w-8 mr-3 text-[#166088]" />
          System Logs
        </h2>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center py-8">
            <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading System Logs</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-[#4a6fa5] text-white rounded-lg flex items-center mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#166088] flex items-center">
          <AlertCircle className="h-8 w-8 mr-3 text-[#166088]" />
          System Logs
        </h2>
        <button
          onClick={handleRefresh}
          className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ${
            refreshing ? 'animate-spin' : ''
          }`}
          disabled={refreshing}
        >
          <RefreshCw className="h-5 w-5 text-[#166088]" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 px-6 text-center font-medium ${
              view === 'analysis'
                ? 'bg-[#4a6fa5]/10 text-[#166088] border-b-2 border-[#4a6fa5]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => toggleView('analysis')}
          >
            Analysis & Recommendations
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium ${
              view === 'logs'
                ? 'bg-[#4a6fa5]/10 text-[#166088] border-b-2 border-[#4a6fa5]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => toggleView('logs')}
          >
            Raw Logs
          </button>
        </div>

        {/* Assistant tip banner */}
        <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Need help understanding these logs? Ask the <a href="/diagnose" className="font-medium underline hover:text-blue-600">OS Assistant</a> about specific log errors or warnings.
            </p>
          </div>
          <a href="/logs-analyzer" className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
            AI Logs Analyzer
          </a>
        </div>

        {view === 'analysis' ? (
          <div className="p-6">
            {analysis ? (
              <div>
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-[#166088] mb-4">System Health Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800">{analysis.summary}</p>
                  </div>
                </div>

                {analysis.criticalIssues.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-red-600 mb-4">Critical Issues</h3>
                    <div className="space-y-4">
                      {analysis.criticalIssues.map((issue, index) => (
                        <div key={index} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                          <p className="font-medium text-red-800">{issue.issue}</p>
                          <p className="text-red-700 text-sm mt-1">{issue.impact}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.warnings.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-amber-600 mb-4">Warnings</h3>
                    <div className="space-y-4">
                      {analysis.warnings.map((warning, index) => (
                        <div key={index} className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                          <p className="font-medium text-amber-800">{warning.component}</p>
                          <p className="text-amber-700 text-sm mt-1">{warning.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.recommendations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-[#166088] mb-4">Recommendations</h3>
                    <div className="bg-blue-50 p-5 rounded-lg">
                      <ul className="space-y-3">
                        {analysis.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#4a6fa5] text-white mr-3 flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-blue-800">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Recent Relevant Logs */}
                <div>
                  <h3 className="text-xl font-semibold text-[#166088] mb-4">Recent Relevant Logs</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getLevelIcon(log.level)}
                                <span className="ml-2 text-sm font-medium capitalize">
                                  {log.level}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.source}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">
                              {log.message}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatDate(log.timestamp)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No analysis available.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-xl font-semibold text-[#166088] mb-4">System Log Entries</h3>
            {logs.length > 0 ? (
              <div className="space-y-4">
                {logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`border rounded-lg overflow-hidden ${
                      log.level === 'error' 
                        ? 'border-red-200' 
                        : log.level === 'warning' 
                          ? 'border-amber-200' 
                          : 'border-gray-200'
                    }`}
                  >
                    <div 
                      className={`flex justify-between items-center px-4 py-3 cursor-pointer ${
                        log.level === 'error' 
                          ? 'bg-red-50' 
                          : log.level === 'warning' 
                            ? 'bg-amber-50' 
                            : 'bg-gray-50'
                      }`}
                      onClick={() => handleToggleExpand(index)}
                    >
                      <div className="flex items-center">
                        {getLevelIcon(log.level)}
                        <span className={`ml-2 font-medium ${
                          log.level === 'error' 
                            ? 'text-red-800' 
                            : log.level === 'warning' 
                              ? 'text-amber-800' 
                              : 'text-gray-800'
                        }`}>
                          {log.source}
                        </span>
                        <span className="ml-4 text-sm text-gray-600">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      {expandedLog === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    
                    {expandedLog === index && (
                      <div className="px-4 py-3 bg-white">
                        <p className="text-gray-800 mb-3">{log.message}</p>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className="bg-gray-50 p-3 rounded-md text-sm">
                            <h4 className="font-medium text-gray-700 mb-2">Details</h4>
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                              {Object.entries(log.details).map(([key, value]) => (
                                <div key={key} className="col-span-1">
                                  <dt className="text-gray-500">{key}:</dt>
                                  <dd className="text-gray-800">{value}</dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No log entries found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs; 