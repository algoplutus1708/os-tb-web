import React, { useState, useEffect } from 'react';
import { fetchPredictiveAnalysis } from '../services/api';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Check, 
  Zap, 
  HardDrive, 
  Cpu, 
  RefreshCw,
  Bell,
  ShieldAlert,
  Server,
  MemoryStick,
  TrendingUp
} from 'lucide-react';

const PredictiveAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch predictive analysis data
  const fetchData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const result = await fetchPredictiveAnalysis();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to load predictive analysis. ' + err.message);
      console.error('Error fetching predictive analysis:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Get icon based on severity
  const getSeverityIcon = (severity, size = 18) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle size={size} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={size} className="text-amber-500" />;
      case 'info':
        return <Info size={size} className="text-blue-500" />;
      default:
        return <Check size={size} className="text-green-500" />;
    }
  };

  // Get icon based on issue type
  const getTypeIcon = (type, size = 18) => {
    switch (type) {
      case 'storage':
        return <HardDrive size={size} className="text-blue-500" />;
      case 'performance':
        return <Zap size={size} className="text-amber-500" />;
      case 'hardware':
        return <Server size={size} className="text-purple-500" />;
      case 'drivers':
        return <Cpu size={size} className="text-indigo-500" />;
      case 'maintenance':
        return <RefreshCw size={size} className="text-green-500" />;
      case 'backup':
        return <ShieldAlert size={size} className="text-red-500" />;
      case 'upgrade':
        return <Bell size={size} className="text-blue-400" />;
      default:
        return <MemoryStick size={size} className="text-gray-500" />;
    }
  };

  // Get background color based on risk category
  const getRiskBackground = () => {
    if (!data || !data.riskScore) return 'bg-[#1e2227]';

    switch (data.riskScore.category) {
      case 'Critical':
        return 'bg-red-900/20 border-red-900/30';
      case 'High':
        return 'bg-orange-900/20 border-orange-900/30';
      case 'Moderate':
        return 'bg-amber-900/20 border-amber-900/30';
      case 'Low':
        return 'bg-blue-900/20 border-blue-900/30';
      default:
        return 'bg-green-900/20 border-green-900/30';
    }
  };

  // Get text color based on risk category
  const getRiskTextColor = () => {
    if (!data || !data.riskScore) return 'text-gray-400';

    switch (data.riskScore.category) {
      case 'Critical':
        return 'text-red-400';
      case 'High':
        return 'text-orange-400';
      case 'Moderate':
        return 'text-amber-400';
      case 'Low':
        return 'text-blue-400';
      default:
        return 'text-green-400';
    }
  };

  // Render loading state
  if (loading && !refreshing) {
    return (
      <div className="py-4">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 mr-2 text-[#4a6fa5]" />
          <h2 className="text-xl font-bold text-white">Predictive Analysis</h2>
        </div>
        <div className="bg-[#1e2227] rounded-md border border-gray-800">
          <div className="animate-pulse flex flex-col space-y-4 p-4">
            <div className="h-6 bg-[#202226] rounded w-3/4"></div>
            <div className="h-40 bg-[#202226] rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-[#202226] rounded"></div>
              <div className="h-4 bg-[#202226] rounded w-5/6"></div>
              <div className="h-4 bg-[#202226] rounded w-4/6"></div>
            </div>
            <div className="h-32 bg-[#202226] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !data) {
    return (
      <div className="py-4">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 mr-2 text-[#4a6fa5]" />
          <h2 className="text-xl font-bold text-white">Predictive Analysis</h2>
        </div>
        <div className="bg-[#1e2227] rounded-md border border-gray-800 p-4">
          <div className="flex items-center space-x-2 text-red-500 mb-4">
            <AlertCircle size={20} />
            <h2 className="text-lg font-semibold">Error Loading Predictive Analysis</h2>
          </div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchData} 
            className="px-3 py-1.5 bg-[#4a6fa5] text-white rounded text-sm hover:bg-[#5f83b9] flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-[#4a6fa5]" />
          <h2 className="text-xl font-bold text-white">Predictive Analysis</h2>
        </div>
        <button 
          onClick={fetchData} 
          className={`p-2 rounded-md hover:bg-[#202226] ${refreshing ? 'animate-spin' : ''}`}
          disabled={refreshing}
          aria-label="Refresh data"
        >
          <RefreshCw size={18} className="text-gray-400" />
        </button>
      </div>
      
      <div className="bg-[#1e2227] rounded-md border border-gray-800">
        {/* Risk Summary */}
        {data && data.riskScore && (
          <div className={`p-4 ${getRiskBackground()} mx-4 mt-4 rounded-md border flex items-center`}>
            <div className="mr-4">
              {data.riskScore.category === 'Critical' || data.riskScore.category === 'High' ? (
                <AlertCircle size={24} className="text-red-500" />
              ) : data.riskScore.category === 'Moderate' ? (
                <AlertTriangle size={24} className="text-amber-500" />
              ) : data.riskScore.category === 'Low' ? (
                <Info size={24} className="text-blue-500" />
              ) : (
                <Check size={24} className="text-green-500" />
              )}
            </div>
            <div>
              <h3 className={`text-base font-bold ${getRiskTextColor()}`}>
                {data.riskScore.category} Risk Score: {data.riskScore.score}/100
              </h3>
              <p className="text-gray-300 text-sm">{data.summary}</p>
            </div>
          </div>
        )}
        
        {/* Issues Section */}
        <div className="p-4 border-t border-gray-800 mt-4">
          <h3 className="text-base font-medium text-white mb-3">Potential Issues</h3>
          
          {data && data.predictions && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Performance Issues */}
              {data.predictions.performanceIssues && data.predictions.performanceIssues.length > 0 && (
                <div className="border border-gray-800 rounded-md overflow-hidden">
                  <div className="bg-[#202226] px-3 py-2 border-b border-gray-800">
                    <div className="flex items-center">
                      <Zap size={16} className="text-amber-500 mr-2" />
                      <h4 className="font-medium text-sm">Performance Issues</h4>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-800">
                    {data.predictions.performanceIssues.map((issue, index) => (
                      <div key={index} className="p-3 hover:bg-[#202226]">
                        <div className="flex items-start">
                          <div className="mt-0.5 mr-2">
                            {getSeverityIcon(issue.severity)}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-white">{issue.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{issue.impact}</p>
                            <p className="text-xs text-gray-500 mt-1">Timeframe: {issue.timeframe}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Storage Issues */}
              {data.predictions.storageIssues && data.predictions.storageIssues.length > 0 && (
                <div className="border border-gray-800 rounded-md overflow-hidden">
                  <div className="bg-[#202226] px-3 py-2 border-b border-gray-800">
                    <div className="flex items-center">
                      <HardDrive size={16} className="text-blue-500 mr-2" />
                      <h4 className="font-medium text-sm">Storage Issues</h4>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-800">
                    {data.predictions.storageIssues.map((issue, index) => (
                      <div key={index} className="p-3 hover:bg-[#202226]">
                        <div className="flex items-start">
                          <div className="mt-0.5 mr-2">
                            {getSeverityIcon(issue.severity)}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-white">{issue.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{issue.impact}</p>
                            <p className="text-xs text-gray-500 mt-1">Timeframe: {issue.timeframe}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Hardware Warnings */}
              {data.predictions.hardwareWarnings && data.predictions.hardwareWarnings.length > 0 && (
                <div className="border border-gray-800 rounded-md overflow-hidden">
                  <div className="bg-[#202226] px-3 py-2 border-b border-gray-800">
                    <div className="flex items-center">
                      <Server size={16} className="text-purple-500 mr-2" />
                      <h4 className="font-medium text-sm">Hardware Warnings</h4>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-800">
                    {data.predictions.hardwareWarnings.map((issue, index) => (
                      <div key={index} className="p-3 hover:bg-[#202226]">
                        <div className="flex items-start">
                          <div className="mt-0.5 mr-2">
                            {getSeverityIcon(issue.severity)}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-white">{issue.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{issue.impact}</p>
                            <p className="text-xs text-gray-500 mt-1">Timeframe: {issue.timeframe}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Security Concerns */}
              {data.predictions.securityConcerns && data.predictions.securityConcerns.length > 0 && (
                <div className="border border-gray-800 rounded-md overflow-hidden">
                  <div className="bg-[#202226] px-3 py-2 border-b border-gray-800">
                    <div className="flex items-center">
                      <ShieldAlert size={16} className="text-red-500 mr-2" />
                      <h4 className="font-medium text-sm">Security Concerns</h4>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-800">
                    {data.predictions.securityConcerns.map((issue, index) => (
                      <div key={index} className="p-3 hover:bg-[#202226]">
                        <div className="flex items-start">
                          <div className="mt-0.5 mr-2">
                            {getSeverityIcon(issue.severity)}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-white">{issue.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{issue.impact}</p>
                            <p className="text-xs text-gray-500 mt-1">Timeframe: {issue.timeframe}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* No issues message */}
              {(!data.predictions.performanceIssues || data.predictions.performanceIssues.length === 0) &&
               (!data.predictions.storageIssues || data.predictions.storageIssues.length === 0) &&
               (!data.predictions.hardwareWarnings || data.predictions.hardwareWarnings.length === 0) &&
               (!data.predictions.securityConcerns || data.predictions.securityConcerns.length === 0) && (
                <div className="col-span-1 lg:col-span-2 p-3 bg-green-900/20 rounded-md border border-green-900/30">
                  <div className="flex items-center">
                    <Check size={18} className="text-green-500 mr-2" />
                    <p className="text-green-400 text-sm font-medium">No potential issues detected. Your system appears to be in good health.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Recommendations Section */}
        <div className="p-4 border-t border-gray-800">
          <h3 className="text-base font-medium text-white mb-3">Recommended Actions</h3>
          
          {data && data.predictions && data.predictions.recommendations && (
            <div className="space-y-2">
              {data.predictions.recommendations
                .sort((a, b) => {
                  const priorityOrder = { high: 0, medium: 1, low: 2 };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .map((rec, index) => {
                  // Determine priority badge color
                  let priorityClass = 'bg-gray-800 text-gray-300';
                  if (rec.priority === 'high') {
                    priorityClass = 'bg-red-900/30 text-red-400';
                  } else if (rec.priority === 'medium') {
                    priorityClass = 'bg-amber-900/30 text-amber-400';
                  } else if (rec.priority === 'low') {
                    priorityClass = 'bg-blue-900/30 text-blue-400';
                  }
                  
                  return (
                    <div key={index} className="flex p-3 border border-gray-800 rounded-md hover:bg-[#202226]">
                      <div className="mr-3 mt-1">
                        {getTypeIcon(rec.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityClass}`}>
                            {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                          </span>
                        </div>
                        <p className="font-medium text-sm text-white">{rec.action}</p>
                        <p className="text-xs text-gray-400 mt-1">{rec.benefit}</p>
                      </div>
                    </div>
                  );
                })}
              
              {/* No recommendations message */}
              {data.predictions.recommendations.length === 0 && (
                <div className="p-3 bg-green-900/20 rounded-md border border-green-900/30">
                  <div className="flex items-center">
                    <Check size={18} className="text-green-500 mr-2" />
                    <p className="text-green-400 text-sm font-medium">No specific actions needed at this time. Continue with regular system maintenance.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalysis; 