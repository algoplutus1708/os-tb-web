import React, { useState, useEffect } from 'react';
import { fetchAppDiagnostics, fetchSystemDrivers } from '../services/api';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  RefreshCw,
  HardDrive,
  Cpu,
  Headphones,
  Package,
  Monitor,
  Wifi
} from 'lucide-react';

const AppDiagnostics = () => {
  const [appName, setAppName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [diagnosticsData, setDiagnosticsData] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllDrivers, setShowAllDrivers] = useState(false);
  
  // On mount, fetch drivers
  useEffect(() => {
    fetchDriversData();
  }, []);
  
  const fetchDriversData = async () => {
    try {
      setLoading(true);
      const driversData = await fetchSystemDrivers();
      setDrivers(driversData);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      // Don't set error here since it's not the main functionality
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      setAppName(searchTerm);
      const data = await fetchAppDiagnostics(searchTerm);
      setDiagnosticsData(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze application');
      setDiagnosticsData(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const getCategoryIcon = (category, size = 20) => {
    switch (category?.toLowerCase()) {
      case 'audio':
        return <Headphones size={size} className="text-purple-500" />;
      case 'display':
      case 'video':
        return <Monitor size={size} className="text-blue-500" />;
      case 'network':
        return <Wifi size={size} className="text-green-500" />;
      case 'storage':
        return <HardDrive size={size} className="text-amber-500" />;
      case 'cpu':
      case 'processor':
        return <Cpu size={size} className="text-red-500" />;
      default:
        return <Package size={size} className="text-gray-500" />;
    }
  };
  
  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Calculate age of driver in months
  const getDriverAge = (dateString) => {
    if (!dateString || dateString === 'Unknown') return 'Unknown';
    
    const driverDate = new Date(dateString);
    const now = new Date();
    const months = (now.getFullYear() - driverDate.getFullYear()) * 12 + now.getMonth() - driverDate.getMonth();
    
    if (months < 1) return 'Less than a month';
    if (months === 1) return '1 month';
    if (months < 12) return `${months} months`;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) {
      return years === 1 ? '1 year' : `${years} years`;
    }
    
    return years === 1 
      ? `1 year, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`
      : `${years} years, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
  };
  
  if (loading && !diagnosticsData) {
    return (
      <div className="py-6">
        <h2 className="text-3xl font-bold text-[#166088] mb-6">Application Diagnostics</h2>
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#166088]"></div>
          <p className="mt-4 text-gray-600">Analyzing application compatibility and performance...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <h2 className="text-3xl font-bold text-[#166088] mb-6">Application Diagnostics</h2>
      
      {/* Search Box */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="text-gray-700 mb-4">
          Enter an application name to check for driver compatibility, performance issues, and potential problems.
        </div>
        <div className="flex items-center">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter application name (e.g., VLC, Chrome, Photoshop)"
              className="w-full p-3 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#166088]"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={handleSearch}
            className="ml-4 px-6 py-3 bg-[#166088] text-white rounded-lg hover:bg-[#0d4c6e] transition-colors"
          >
            Diagnose
          </button>
        </div>
        {error && (
          <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
      </div>
      
      {/* Results Section */}
      {diagnosticsData && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Application Info */}
          <div className="md:col-span-12 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-[#166088] mb-4 flex items-center">
              <Package className="mr-3 h-5 w-5" />
              Application Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-b md:border-b-0 md:border-r border-gray-200 pb-3 md:pb-0 md:pr-3">
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{diagnosticsData.application?.name || appName}</p>
              </div>
              <div className="border-b md:border-b-0 md:border-r border-gray-200 pb-3 md:pb-0 md:pr-3">
                <p className="text-sm text-gray-500">Version</p>
                <p className="font-medium">{diagnosticsData.application?.version || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Publisher</p>
                <p className="font-medium">{diagnosticsData.application?.publisher || 'Unknown'}</p>
              </div>
            </div>
          </div>
          
          {/* Driver Status */}
          <div className="md:col-span-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-[#166088] mb-4 flex items-center">
              <HardDrive className="mr-3 h-5 w-5" />
              Driver Status
            </h3>
            
            <div className="flex items-center mb-6">
              <div className="relative mr-4">
                <svg className="w-16 h-16" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    stroke={diagnosticsData.driverStatus?.missing.length > 0 ? "#f59e0b" : "#10b981"} 
                    strokeWidth="4" 
                    strokeDasharray="100" 
                    strokeDashoffset={100 - (diagnosticsData.driverStatus?.available / diagnosticsData.driverStatus?.required) * 100 || 0} 
                    transform="rotate(-90 18 18)" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">
                    {diagnosticsData.driverStatus?.available || 0}/{diagnosticsData.driverStatus?.required || 0}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Required drivers available</p>
                {diagnosticsData.driverStatus?.missing?.length > 0 ? (
                  <div className="flex items-center text-amber-500 mt-1">
                    <AlertTriangle size={16} className="mr-1" />
                    <span>Missing drivers detected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-500 mt-1">
                    <CheckCircle size={16} className="mr-1" />
                    <span>All required drivers available</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Missing Drivers */}
            {diagnosticsData.driverStatus?.missing?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Missing Drivers</h4>
                <div className="space-y-2">
                  {diagnosticsData.driverStatus.missing.map((driver, idx) => (
                    <div key={idx} className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start">
                      <div className="p-1 bg-amber-100 rounded mr-3">
                        {getCategoryIcon(driver.category)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{driver.name}</p>
                        <p className="text-sm text-gray-600">Required for full functionality</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Outdated Drivers */}
            {diagnosticsData.driverStatus?.outdated?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Outdated Drivers</h4>
                <div className="space-y-2">
                  {diagnosticsData.driverStatus.outdated.map((driver, idx) => (
                    <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start">
                      <div className="p-1 bg-blue-100 rounded mr-3">
                        {getCategoryIcon(driver.category)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{driver.name}</p>
                        <p className="text-sm text-gray-600">{driver.installedDrivers}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Performance Issues */}
          <div className="md:col-span-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-[#166088] mb-4 flex items-center">
              <Cpu className="mr-3 h-5 w-5" />
              Performance Issues
            </h3>
            
            {diagnosticsData.performanceIssues?.length > 0 ? (
              <div className="space-y-3">
                {diagnosticsData.performanceIssues.map((issue, idx) => (
                  <div key={idx} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="p-1 bg-amber-100 rounded mr-3 mt-0.5">
                        <AlertTriangle size={16} className="text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{issue.message}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <span className="mr-2">Source: {issue.source}</span>
                          {issue.timestamp && (
                            <span>Date: {new Date(issue.timestamp).toLocaleDateString()}</span>
                          )}
                        </div>
                        {issue.recommendation && (
                          <p className="text-sm text-blue-600 mt-1">{issue.recommendation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <p className="text-green-800">No performance issues detected with this application.</p>
              </div>
            )}
          </div>
          
          {/* Compatibility */}
          <div className="md:col-span-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-[#166088] mb-4 flex items-center">
              <Info className="mr-3 h-5 w-5" />
              Compatibility Status
            </h3>
            
            {diagnosticsData.compatibility?.compatible ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium">Compatible with your system</p>
                  <p className="text-sm text-green-700 mt-1">This application should work properly on your operating system.</p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-medium">Compatibility issues detected</p>
                  <ul className="list-disc list-inside text-sm text-amber-700 mt-1">
                    {diagnosticsData.compatibility?.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* Recommendations */}
          <div className="md:col-span-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-[#166088] mb-4">Recommendations</h3>
            
            {diagnosticsData.recommendations?.length > 0 ? (
              <div className="space-y-3">
                {diagnosticsData.recommendations.map((rec, idx) => (
                  <div key={idx} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      <span className={`text-xs px-2 py-0.5 rounded-full mr-3 mt-0.5 ${getPriorityClass(rec.priority)}`}>
                        {rec.priority}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800">{rec.action}</p>
                        <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-600">No specific recommendations needed.</div>
            )}
          </div>
        </div>
      )}
      
      {/* System Drivers Overview */}
      <div className="mt-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-[#166088]">System Drivers Overview</h3>
            <div className="flex items-center">
              <button
                onClick={() => setShowAllDrivers(!showAllDrivers)}
                className="text-[#166088] hover:text-[#0d4c6e] text-sm mr-4"
              >
                {showAllDrivers ? 'Show Less' : 'Show All'}
              </button>
              <button
                onClick={fetchDriversData}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4 text-[#166088]" />
              </button>
            </div>
          </div>
          
          {drivers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drivers.slice(0, showAllDrivers ? undefined : 5).map((driver, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-1 rounded mr-3">
                            {getCategoryIcon(driver.category)}
                          </div>
                          <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {driver.category || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {driver.version}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          driver.date && driver.date !== 'Unknown' && new Date(driver.date) < new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 2)
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {getDriverAge(driver.date)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {loading ? 'Loading drivers...' : 'No driver information available'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppDiagnostics; 