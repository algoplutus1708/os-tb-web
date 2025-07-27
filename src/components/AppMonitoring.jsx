import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchRunningApplications, 
  fetchMonitoredApplications,
  startMonitoringApplication,
  stopMonitoringApplication
} from '../services/api';
import { 
  Play, 
  StopCircle, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  Layers,
  Search,
  Info,
  AlertCircle,
  Clock
} from 'lucide-react';

const AppMonitoring = () => {
  const [runningApps, setRunningApps] = useState([]);
  const [monitoredApps, setMonitoredApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState('');
  const [pollingInterval, setPollingInterval] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  
  // Load initial data
  useEffect(() => {
    fetchData();
    
    // Set up polling for monitored apps every 5 seconds
    const intervalId = setInterval(() => {
      fetchMonitoredAppsData();
    }, 5000);
    
    // Clear interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Fetch both running and monitored apps
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchRunningAppsData(),
        fetchMonitoredAppsData()
      ]);
    } catch (err) {
      setError(err.message || 'Failed to load application data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch only running apps
  const fetchRunningAppsData = async () => {
    try {
      const data = await fetchRunningApplications();
      setRunningApps(data || []);
    } catch (err) {
      console.error('Error fetching running apps:', err);
    }
  };
  
  // Fetch only monitored apps
  const fetchMonitoredAppsData = async () => {
    try {
      const data = await fetchMonitoredApplications();
      
      // Compare with previous data to check for new issues
      const oldMonitoredMap = new Map(monitoredApps.map(app => [app.appName, app]));
      
      if (data) {
        // Check for new issues in each app
        data.forEach(app => {
          const oldApp = oldMonitoredMap.get(app.appName);
          if (oldApp && app.data?.issues?.length > 0) {
            // If this is a new update with issues
            if (oldApp.lastUpdate !== app.lastUpdate && app.data.issues.length > 0) {
              // Add notification for each new issue
              app.data.issues.forEach(issue => {
                addNotification({
                  type: 'warning',
                  title: `Issue detected in ${app.appName}`,
                  message: issue.message,
                  recommendation: issue.recommendation
                });
              });
            }
          }
        });
        
        setMonitoredApps(data);
      }
    } catch (err) {
      console.error('Error fetching monitored apps:', err);
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData().finally(() => {
      setTimeout(() => setRefreshing(false), 500);
    });
  };
  
  // Start monitoring an application
  const handleStartMonitoring = async () => {
    if (!selectedApp) {
      setError('Please select an application to monitor');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await startMonitoringApplication(selectedApp, pollingInterval * 1000);
      await fetchMonitoredAppsData();
      addNotification({
        type: 'success',
        title: 'Monitoring Started',
        message: `Now monitoring ${selectedApp} in real-time`
      });
      setSelectedApp('');
    } catch (err) {
      setError(err.message || 'Failed to start monitoring');
    } finally {
      setLoading(false);
    }
  };
  
  // Stop monitoring an application
  const handleStopMonitoring = async (appName) => {
    if (!appName) return;
    
    try {
      await stopMonitoringApplication(appName);
      await fetchMonitoredAppsData();
      addNotification({
        type: 'info',
        title: 'Monitoring Stopped',
        message: `Stopped monitoring ${appName}`
      });
    } catch (err) {
      setError(err.message || 'Failed to stop monitoring');
    }
  };
  
  // Add a notification to the list
  const addNotification = useCallback((notification) => {
    const id = Date.now();
    setNotifications(prev => [
      { id, timestamp: new Date(), ...notification },
      ...prev
    ]);
    
    // Auto-remove notification after 10 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 10000);
  }, []);
  
  // Clear a specific notification
  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  // Filter running apps based on search term
  const filteredRunningApps = runningApps.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format date/time for display
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };
  
  // Format time ago for notifications
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const seconds = Math.floor((new Date() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };
  
  // Get status indicator color
  const getStatusColor = (app) => {
    if (!app.data) return 'bg-gray-500';
    if (app.data.issues && app.data.issues.length > 0) return 'bg-amber-500';
    if (app.data.performanceData && app.data.performanceData.cpu > 50) return 'bg-orange-500';
    return 'bg-green-500';
  };
  
  if (loading && !runningApps.length && !monitoredApps.length) {
    return (
      <div className="py-4">
        <div className="flex items-center mb-4">
          <Activity className="h-5 w-5 mr-2 text-[#4a6fa5]" />
          <h2 className="text-xl font-bold text-white">Real-Time Application Monitoring</h2>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-gray-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4a6fa5]"></div>
          <p className="mt-4">Loading application data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-4">
      <div className="flex items-center mb-4">
        <Activity className="h-5 w-5 mr-2 text-[#4a6fa5]" />
        <h2 className="text-xl font-bold text-white">Real-Time Application Monitoring</h2>
      </div>
      
      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div className="mb-4">
          <h3 className="text-base font-medium text-white mb-3 flex items-center">
            <AlertCircle className="mr-2 h-4 w-4 text-[#4a6fa5]" />
            Notifications
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {notifications.map(notification => (
              <div 
                key={notification.id}
                className={`p-3 rounded-md flex items-start relative pr-8 border ${
                  notification.type === 'warning' ? 'bg-amber-900/20 border-amber-900/30 text-amber-400' :
                  notification.type === 'error' ? 'bg-red-900/20 border-red-900/30 text-red-400' :
                  notification.type === 'success' ? 'bg-green-900/20 border-green-900/30 text-green-400' :
                  'bg-blue-900/20 border-blue-900/30 text-blue-400'
                }`}
              >
                <div className={`p-1 rounded mr-3 flex-shrink-0 ${
                  notification.type === 'warning' ? 'bg-amber-900/30' :
                  notification.type === 'error' ? 'bg-red-900/30' :
                  notification.type === 'success' ? 'bg-green-900/30' :
                  'bg-blue-900/30'
                }`}>
                  {notification.type === 'warning' && <AlertTriangle size={16} className="text-amber-400" />}
                  {notification.type === 'error' && <AlertCircle size={16} className="text-red-400" />}
                  {notification.type === 'success' && <CheckCircle size={16} className="text-green-400" />}
                  {notification.type === 'info' && <Info size={16} className="text-blue-400" />}
                </div>
                <div className="flex-grow pr-4">
                  <div className="flex items-center">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <span className="ml-2 text-xs text-gray-500">{formatTimeAgo(notification.timestamp)}</span>
                  </div>
                  <p className="text-xs opacity-80">{notification.message}</p>
                  {notification.recommendation && (
                    <p className="text-xs text-blue-400 mt-1">{notification.recommendation}</p>
                  )}
                </div>
                <button 
                  onClick={() => clearNotification(notification.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 bg-red-900/20 border-l-4 border-red-500 text-red-400 p-3 rounded-md">
          <p className="font-bold text-sm">Error</p>
          <p className="text-xs">{error}</p>
        </div>
      )}
      
      {/* Start Monitoring Section */}
      <div className="bg-[#1e2227] rounded-md border border-gray-800 p-4 mb-4">
        <h3 className="text-base font-medium text-white mb-3 flex items-center">
          <Activity className="mr-2 h-4 w-4 text-[#4a6fa5]" />
          Start Monitoring Application
        </h3>
        
        <div className="mb-4">
          <div className="flex items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for an application..."
                className="w-full p-2 pl-8 pr-3 rounded-md border border-gray-700 bg-[#111217] text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#4a6fa5] text-sm"
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            </div>
            <button
              onClick={handleRefresh}
              className={`ml-3 p-2 text-gray-400 rounded-md hover:bg-[#202226] transition-colors ${refreshing ? 'animate-spin' : ''}`}
              disabled={loading}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4 max-h-64 overflow-y-auto">
          {filteredRunningApps.length > 0 ? (
            filteredRunningApps.map((app, index) => (
              <div 
                key={index}
                onClick={() => setSelectedApp(app.name)}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedApp === app.name 
                    ? 'border-[#4a6fa5] bg-[#4a6fa5]/10' 
                    : 'border-gray-700 bg-[#202226] hover:border-gray-600'
                }`}
              >
                <div className="text-sm font-medium text-white">{app.name}</div>
                <div className="text-xs text-gray-400 truncate" title={app.title}>{app.title}</div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center p-4 text-gray-400">
              {loading ? 'Loading applications...' : 'No running applications found'}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-1/3">
            <label className="block text-xs font-medium text-gray-400 mb-1">Selected Application</label>
            <div className="p-2 border border-gray-700 rounded-md bg-[#111217] min-h-[36px] text-sm text-gray-300">
              {selectedApp || <span className="text-gray-600">None selected</span>}
            </div>
          </div>
          
          <div className="w-1/3">
            <label className="block text-xs font-medium text-gray-400 mb-1">Polling Interval (seconds)</label>
            <input
              type="number"
              min="5"
              max="60"
              value={pollingInterval}
              onChange={(e) => setPollingInterval(Number(e.target.value))}
              className="w-full p-2 border border-gray-700 rounded-md bg-[#111217] text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#4a6fa5] text-sm"
            />
          </div>
          
          <div className="w-1/3 flex items-end">
            <button
              onClick={handleStartMonitoring}
              disabled={!selectedApp || loading}
              className="px-3 py-2 bg-[#4a6fa5] text-white rounded-md hover:bg-[#5f83b9] transition-colors flex items-center text-sm disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              <Play size={14} className="mr-2" />
              Start Monitoring
            </button>
          </div>
        </div>
      </div>
      
      {/* Monitored Applications */}
      <div className="bg-[#1e2227] rounded-md border border-gray-800 p-4">
        <h3 className="text-base font-medium text-white mb-3 flex items-center">
          <Activity className="mr-2 h-4 w-4 text-[#4a6fa5]" />
          Monitored Applications
          <span className="ml-2 bg-[#4a6fa5] text-white text-xs px-2 py-0.5 rounded-full">
            {monitoredApps.length}
          </span>
          <button
            onClick={fetchMonitoredAppsData}
            className={`ml-auto p-1.5 text-gray-400 rounded-md hover:bg-[#202226] transition-colors ${loading ? 'animate-spin' : ''}`}
            disabled={loading}
          >
            <RefreshCw size={14} />
          </button>
        </h3>
        
        {monitoredApps.length > 0 ? (
          <div className="space-y-4">
            {monitoredApps.map((app, index) => (
              <div key={index} className="border border-gray-800 rounded-md overflow-hidden bg-[#202226]">
                <div className="bg-[#1e2227] p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-2.5 w-2.5 rounded-full mr-2 ${getStatusColor(app)}`}></div>
                    <h4 className="font-medium text-sm text-white">{app.appName}</h4>
                    <div className="ml-3 text-xs text-gray-500 flex items-center">
                      <Clock size={11} className="mr-1" />
                      Last updated: {formatDateTime(app.lastUpdate)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleStopMonitoring(app.appName)}
                    className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs hover:bg-red-900/50 transition-colors flex items-center border border-red-900/30"
                  >
                    <StopCircle size={12} className="mr-1" />
                    Stop
                  </button>
                </div>
                
                {app.data && (
                  <div className="p-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                      <div className="bg-[#4a6fa5]/10 p-2 rounded-md flex items-center border border-[#4a6fa5]/20">
                        <div className="p-1.5 rounded-full bg-[#4a6fa5]/20 mr-2">
                          <Cpu size={14} className="text-[#4a6fa5]" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">CPU Usage</div>
                          <div className="font-medium text-sm text-white">{app.data.performanceData?.cpu || 0}%</div>
                        </div>
                      </div>
                      
                      <div className="bg-[#4cb5ab]/10 p-2 rounded-md flex items-center border border-[#4cb5ab]/20">
                        <div className="p-1.5 rounded-full bg-[#4cb5ab]/20 mr-2">
                          <MemoryStick size={14} className="text-[#4cb5ab]" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Memory</div>
                          <div className="font-medium text-sm text-white">{app.data.performanceData?.memory || 0} MB</div>
                        </div>
                      </div>
                      
  
                      

                    </div>
                    
                    {/* Issues Section */}
                    {app.data.issues && app.data.issues.length > 0 ? (
                      <div className="bg-amber-900/20 border border-amber-900/30 rounded-md p-3">
                        <h5 className="text-xs font-medium text-amber-400 mb-2 flex items-center">
                          <AlertTriangle size={14} className="mr-2" />
                          Detected Issues
                        </h5>
                        <ul className="space-y-2">
                          {app.data.issues.map((issue, idx) => (
                            <li key={idx} className="text-sm">
                              <div className="font-medium text-white text-xs">{issue.message}</div>
                              {issue.recommendation && (
                                <div className="text-xs text-blue-400">{issue.recommendation}</div>
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                Source: {issue.source}
                                {issue.timestamp && (
                                  <span className="ml-2">Time: {new Date(issue.timestamp).toLocaleTimeString()}</span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-green-900/20 border border-green-900/30 rounded-md p-2 flex items-center">
                        <CheckCircle size={14} className="text-green-500 mr-2" />
                        <span className="text-xs text-green-400">No issues detected</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 text-sm">
            No applications are currently being monitored
          </div>
        )}
      </div>
    </div>
  );
};

export default AppMonitoring; 