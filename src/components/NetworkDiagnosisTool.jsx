import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  BarChart2, 
  AlertCircle, 
  Loader, 
  CheckCircle,
  RefreshCw,
  Zap,
  Globe,
  Router,
  Signal,
  Download,
  Upload,
  ArrowRight
} from 'lucide-react';
import { runNetworkDiagnostics, getNetworkIssues, fixNetworkIssue } from '../services/api';

const NetworkDiagnosisTool = () => {
  const [loading, setLoading] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState(null);
  const [networkIssues, setNetworkIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('diagnostics');
  const [issueFixes, setIssueFixes] = useState({});
  const [fixInProgress, setFixInProgress] = useState(null);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load network issues when component mounts
    loadNetworkIssues();
  }, []);

  const loadNetworkIssues = async () => {
    try {
      setError(null);
      const data = await getNetworkIssues();
      setNetworkIssues(data.issues || []);
    } catch (err) {
      console.error('Error loading network issues:', err);
      setError('Failed to load network issues. Please try again.');
    }
  };

  const runDiagnostics = async () => {
    try {
      setLoading(true);
      setError(null);
      setDiagnosticsData(null);
      
      const data = await runNetworkDiagnostics();
      setDiagnosticsData(data);
      setLastScanTime(new Date());
      
      // Refresh issues list after diagnostics
      await loadNetworkIssues();
    } catch (err) {
      console.error('Error running network diagnostics:', err);
      setError('Failed to run network diagnostics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFix = async (issueId, fixType) => {
    try {
      setFixInProgress({ issueId, fixType });
      setError(null);
      
      const result = await fixNetworkIssue(issueId, fixType);
      
      if (result.success) {
        setIssueFixes(prev => ({
          ...prev,
          [issueId]: {
            ...result,
            appliedAt: new Date()
          }
        }));
        
        // Refresh issues list after fix
        await loadNetworkIssues();
      } else {
        setError(`Failed to apply fix: ${result.message}`);
      }
    } catch (err) {
      console.error('Error applying network fix:', err);
      setError('Failed to apply network fix. Please try again.');
    } finally {
      setFixInProgress(null);
    }
  };

  // Helper function to format severity with color
  const renderSeverity = (severity) => {
    let color;
    switch(severity.toLowerCase()) {
      case 'critical':
        color = 'text-[#dc3545]';
        break;
      case 'warning':
        color = 'text-[#ffc107]';
        break;
      case 'low':
        color = 'text-[#4cb5ab]';
        break;
      default:
        color = 'text-gray-400';
    }
    
    return <span className={`font-medium ${color}`}>{severity}</span>;
  };

  return (
    <div className="py-4">
      <div className="flex items-center mb-4">
        <Wifi className="h-5 w-5 mr-2 text-[#4a6fa5]" />
        <h2 className="text-xl font-bold text-white">Network Diagnostics</h2>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800/50 rounded-md text-red-100 text-sm">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      <div className="bg-[#1e2227] rounded-md border border-gray-800 p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-medium text-white">Network Scanner</h3>
            <p className="text-xs text-gray-400 mt-1">
              Run a complete diagnostic scan of your network configuration and connectivity
            </p>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="px-4 py-2 bg-[#4a6fa5] text-white rounded text-sm hover:bg-[#5f83b9] transition-colors flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Running Scan...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Scan Network
              </>
            )}
          </button>
        </div>
        
        {lastScanTime && !loading && (
          <div className="text-xs text-gray-400 mb-3">
            Last scan: {lastScanTime.toLocaleString()}
          </div>
        )}
        
        <div className="flex border-b border-gray-700 mb-4">
          <button
            className={`px-4 py-2 text-sm border-b-2 ${
              activeTab === 'diagnostics'
                ? 'border-[#4a6fa5] text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('diagnostics')}
          >
            Diagnostics
          </button>
          <button
            className={`px-4 py-2 text-sm border-b-2 ${
              activeTab === 'issues'
                ? 'border-[#4a6fa5] text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('issues')}
          >
            Issues {networkIssues.filter(i => i.status === 'active').length > 0 && 
              <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#dc3545] text-white text-xs">
                {networkIssues.filter(i => i.status === 'active').length}
              </span>
            }
          </button>
        </div>
        
        {activeTab === 'diagnostics' && (
          <div>
            {loading ? (
              <div className="text-center py-8">
                <Loader className="h-8 w-8 mx-auto animate-spin text-[#4a6fa5] mb-4" />
                <p className="text-white">Running network diagnostics...</p>
                <p className="text-xs text-gray-400 mt-2">This may take up to 30 seconds</p>
              </div>
            ) : diagnosticsData ? (
              <div className="space-y-6">
                {/* Connection Status */}
                <div className="bg-[#111217] rounded-md p-4">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-[#4a6fa5]" />
                    Connection Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400 text-xs">Internet</span>
                        <span className={`text-xs ${diagnosticsData.internetConnection.status === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
                          {diagnosticsData.internetConnection.status === 'connected' ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400 text-xs">Local IP</span>
                        <span className="text-white text-xs font-mono">{diagnosticsData.internetConnection.localIp}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400 text-xs">Gateway</span>
                        <span className="text-white text-xs font-mono">{diagnosticsData.internetConnection.gateway}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400 text-xs">DNS Servers</span>
                        <span className="text-white text-xs font-mono">{diagnosticsData.internetConnection.dns.join(', ')}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400 text-xs">External IP</span>
                        <span className="text-white text-xs font-mono">{diagnosticsData.internetConnection.externalIp}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Speed and Ping Tests */}
                <div className="bg-[#111217] rounded-md p-4">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2 text-[#4cb5ab]" />
                    Speed & Latency
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#1e2227] p-3 rounded-md">
                      <div className="flex items-center mb-1">
                        <Download className="h-3 w-3 mr-1.5 text-[#4a6fa5]" />
                        <span className="text-gray-400 text-xs">Download</span>
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {diagnosticsData.speedTest.download} <span className="text-xs text-gray-400">Mbps</span>
                      </div>
                    </div>
                    <div className="bg-[#1e2227] p-3 rounded-md">
                      <div className="flex items-center mb-1">
                        <Upload className="h-3 w-3 mr-1.5 text-[#4cb5ab]" />
                        <span className="text-gray-400 text-xs">Upload</span>
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {diagnosticsData.speedTest.upload} <span className="text-xs text-gray-400">Mbps</span>
                      </div>
                    </div>
                    <div className="bg-[#1e2227] p-3 rounded-md">
                      <div className="flex items-center mb-1">
                        <Signal className="h-3 w-3 mr-1.5 text-[#e6b144]" />
                        <span className="text-gray-400 text-xs">Latency</span>
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {diagnosticsData.speedTest.latency} <span className="text-xs text-gray-400">ms</span>
                      </div>
                    </div>
                    <div className="bg-[#1e2227] p-3 rounded-md">
                      <div className="flex items-center mb-1">
                        <Router className="h-3 w-3 mr-1.5 text-[#bf63a5]" />
                        <span className="text-gray-400 text-xs">Jitter</span>
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {diagnosticsData.speedTest.jitter} <span className="text-xs text-gray-400">ms</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ping Results */}
                  <div className="mt-4">
                    <h5 className="text-xs font-medium text-gray-400 mb-2">Ping Results</h5>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[#1e2227] p-2 rounded-md">
                        <div className="text-xs text-gray-400 mb-1">Gateway</div>
                        <div className="text-sm text-white">
                          {diagnosticsData.pingResults.gateway.avgTime} ms
                          {' '}
                          <span className={`text-xs ${diagnosticsData.pingResults.gateway.loss === 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ({diagnosticsData.pingResults.gateway.loss}% loss)
                          </span>
                        </div>
                      </div>
                      <div className="bg-[#1e2227] p-2 rounded-md">
                        <div className="text-xs text-gray-400 mb-1">DNS Server</div>
                        <div className="text-sm text-white">
                          {diagnosticsData.pingResults.dns.avgTime} ms
                          {' '}
                          <span className={`text-xs ${diagnosticsData.pingResults.dns.loss === 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ({diagnosticsData.pingResults.dns.loss}% loss)
                          </span>
                        </div>
                      </div>
                      <div className="bg-[#1e2227] p-2 rounded-md">
                        <div className="text-xs text-gray-400 mb-1">Internet</div>
                        <div className="text-sm text-white">
                          {diagnosticsData.pingResults.internet.avgTime} ms
                          {' '}
                          <span className={`text-xs ${diagnosticsData.pingResults.internet.loss <= 5 ? 'text-green-500' : diagnosticsData.pingResults.internet.loss <= 20 ? 'text-yellow-500' : 'text-red-500'}`}>
                            ({diagnosticsData.pingResults.internet.loss}% loss)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Detected Issues */}
                {diagnosticsData.detectedIssues && diagnosticsData.detectedIssues.length > 0 && (
                  <div className="bg-[#111217] rounded-md p-4">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-[#dc3545]" />
                      Detected Issues
                    </h4>
                    <div className="space-y-3">
                      {diagnosticsData.detectedIssues.map(issue => (
                        <div key={issue.id} className="border border-gray-700 rounded-md p-3">
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center">
                              {renderSeverity(issue.severity)}
                              <span className="text-xs text-white ml-2">{issue.type}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-300 mb-2">{issue.description}</p>
                          
                          {issue.possibleCauses && (
                            <div className="mb-2">
                              <span className="text-xs text-gray-400">Possible causes:</span>
                              <ul className="list-disc list-inside text-xs text-gray-300 mt-1 ml-1">
                                {issue.possibleCauses.map((cause, idx) => (
                                  <li key={idx}>{cause}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {issue.recommendations && issue.recommendations.length > 0 && (
                            <div className="mt-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-400">Recommended fixes:</span>
                              </div>
                              <div className="space-y-2">
                                {issue.recommendations.map(rec => (
                                  <div key={rec.id} className="flex justify-between items-center bg-[#1e2227] p-2 rounded">
                                    <span className="text-xs text-white">{rec.description}</span>
                                    <button
                                      onClick={() => applyFix(issue.id, rec.action)}
                                      disabled={fixInProgress && fixInProgress.issueId === issue.id}
                                      className="px-2 py-1 bg-[#4a6fa5] text-white rounded text-xs hover:bg-[#5f83b9] transition-colors flex items-center disabled:opacity-50"
                                    >
                                      {fixInProgress && fixInProgress.issueId === issue.id && fixInProgress.fixType === rec.action ? (
                                        <Loader className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <Zap className="h-3 w-3" />
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <Globe className="h-12 w-12 mx-auto text-[#4a6fa5] opacity-50 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Run a Network Diagnostic</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Scan your network to identify issues and optimize performance
                </p>
                <button
                  onClick={runDiagnostics}
                  disabled={loading}
                  className="px-4 py-2 bg-[#4a6fa5] text-white rounded text-sm hover:bg-[#5f83b9] transition-colors flex items-center mx-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Start Scan
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'issues' && (
          <div>
            {networkIssues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-[#28a745] opacity-70 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Network Issues Detected</h3>
                <p className="text-sm text-gray-400">
                  Your network appears to be functioning properly
                </p>
              </div>
            ) : (
              <div>
                <div className="space-y-4">
                  {/* Active Issues */}
                  {networkIssues.filter(issue => issue.status === 'active').length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-[#dc3545]" />
                        Active Issues
                      </h4>
                      <div className="space-y-3">
                        {networkIssues
                          .filter(issue => issue.status === 'active')
                          .map(issue => (
                            <div key={issue.id} className="border border-gray-700 rounded-md p-3 bg-[#111217]">
                              <div className="flex justify-between mb-2">
                                <div className="flex items-center">
                                  {renderSeverity(issue.severity)}
                                  <span className="text-xs text-white ml-2">{issue.type}</span>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {new Date(issue.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-300 mb-3">{issue.description}</p>
                              
                              {issue.recommendations && issue.recommendations.length > 0 && (
                                <div className="mt-2">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-gray-400">Recommended fixes:</span>
                                  </div>
                                  <div className="space-y-2">
                                    {issue.recommendations.map(rec => {
                                      const fixApplied = issueFixes[issue.id] && issueFixes[issue.id].fixType === rec.action;
                                      
                                      return (
                                        <div key={rec.id} className="flex justify-between items-center bg-[#1e2227] p-2 rounded">
                                          <div>
                                            <span className="text-xs text-white">{rec.description}</span>
                                            <div className="text-[10px] text-gray-400 mt-0.5">Difficulty: {rec.difficulty}</div>
                                          </div>
                                          <button
                                            onClick={() => applyFix(issue.id, rec.action)}
                                            disabled={fixInProgress && fixInProgress.issueId === issue.id || fixApplied}
                                            className={`px-2 py-1 rounded text-xs flex items-center ${
                                              fixApplied
                                                ? 'bg-green-700/30 text-green-500 cursor-default'
                                                : 'bg-[#4a6fa5] text-white hover:bg-[#5f83b9] transition-colors'
                                            } disabled:opacity-50`}
                                          >
                                            {fixInProgress && fixInProgress.issueId === issue.id && fixInProgress.fixType === rec.action ? (
                                              <>
                                                <Loader className="h-3 w-3 mr-1 animate-spin" />
                                                <span>Applying...</span>
                                              </>
                                            ) : fixApplied ? (
                                              <>
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                <span>Applied</span>
                                              </>
                                            ) : (
                                              <>
                                                <Zap className="h-3 w-3 mr-1" />
                                                <span>Apply Fix</span>
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Resolved Issues */}
                  {networkIssues.filter(issue => issue.status === 'resolved').length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-[#28a745]" />
                        Resolved Issues
                      </h4>
                      <div className="space-y-2">
                        {networkIssues
                          .filter(issue => issue.status === 'resolved')
                          .map(issue => (
                            <div key={issue.id} className="border border-gray-700 rounded-md p-3 bg-[#111217]">
                              <div className="flex justify-between mb-1">
                                <div className="flex items-center">
                                  {renderSeverity(issue.severity)}
                                  <span className="text-xs text-white ml-2">{issue.type}</span>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {new Date(issue.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-300 mb-1">{issue.description}</p>
                              {issue.resolutionMethod && (
                                <div className="text-xs mt-2">
                                  <span className="text-gray-400">Resolution: </span>
                                  <span className="text-green-500">{issue.resolutionMethod}</span>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkDiagnosisTool;