import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SystemDataContext } from '../context/SystemDataContext';
import { 
  Cpu, 
  MemoryStick,
  HardDrive, 
  BarChart2, 
  Settings, 
  Search, 
  Server, 
  Clock,
  Home,
  Globe,
  Calendar,
  AlertCircle,
  Thermometer,
  Monitor as MonitorIcon,
  FileSearch,
  TrendingUp,
  Package,
  Activity,
  Save,
  BellRing,
  UserCheck,
  HardDriveDownload,
  Wifi
} from 'lucide-react';

const Dashboard = () => {
  const { systemData, loading, error, systemHealth } = useContext(SystemDataContext);
  
  // State for alert thresholds
  const [thresholds, setThresholds] = useState({
    cpuUsage: 90,
    memoryUsage: 85,
    diskUsage: 90,
    expertiseLevel: 'intermediate' // beginner, intermediate, advanced
  });
  
  // State for showing/hiding thresholds card - set to true by default
  const [showThresholds, setShowThresholds] = useState(true);

  // Load saved thresholds from localStorage on component mount
  useEffect(() => {
    const savedThresholds = localStorage.getItem('alertThresholds');
    if (savedThresholds) {
      try {
        const parsedThresholds = JSON.parse(savedThresholds);
        setThresholds(parsedThresholds);
        console.log('Loaded saved alert thresholds:', parsedThresholds);
      } catch (err) {
        console.error('Error parsing saved thresholds:', err);
      }
    }
  }, []);

  // Handle threshold changes
  const handleThresholdChange = (e) => {
    const { name, value } = e.target;
    setThresholds(prev => ({
      ...prev,
      [name]: name === 'expertiseLevel' ? value : Number(value)
    }));
  };

  // Save thresholds (in a real app, would save to backend/localStorage)
  const saveThresholds = () => {
    // Here you would typically save to backend or localStorage
    localStorage.setItem('alertThresholds', JSON.stringify(thresholds));
    alert('Alert thresholds saved successfully!');
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-lg">Loading system data...</p>
    </div>
  </div>;
  
  if (error) return <div className="p-4 bg-red-900/50 border border-red-700 text-red-100 rounded-md">
    <p className="font-medium">Error:</p>
    <p>{error}</p>
  </div>;
  
  if (!systemData) return <div className="p-4 bg-background-light border border-border-color text-text-secondary rounded-md">
    <p>No system data available. Please check your connection and try again.</p>
  </div>;

  const getHealthColorClass = () => {
    if (!systemHealth) return "text-gray-500";
    if (systemHealth.status === 'Critical') return "text-red-500";
    if (systemHealth.status === 'Warning') return "text-yellow-500";
    return "text-green-500";
  };

  // Format disk usage for display
  const formatDiskUsage = () => {
    if (!systemData.diskUsage) return "Unknown";
    
    // If diskUsage is an array (like in Windows parsing)
    if (Array.isArray(systemData.diskUsage)) {
      const mainDrive = systemData.diskUsage[0]; // Usually C: drive
      if (mainDrive) {
        const totalGB = parseInt(mainDrive.total) / (1024 * 1024 * 1024);
        const freeGB = parseInt(mainDrive.free) / (1024 * 1024 * 1024);
        const usedPercent = Math.round(((totalGB - freeGB) / totalGB) * 100);
        return {
          text: `${usedPercent}% (${Math.round(freeGB)} GB free)`,
          percent: usedPercent
        };
      }
    } 
    // If diskUsage is a string with a percentage (like "75%")
    else if (typeof systemData.diskUsage === 'string' && systemData.diskUsage.includes('%')) {
      const percent = parseInt(systemData.diskUsage);
      return {
        text: systemData.diskUsage,
        percent: isNaN(percent) ? 0 : percent
      };
    }
    // If diskUsage is a number
    else if (typeof systemData.diskUsage === 'number') {
      return {
        text: `${systemData.diskUsage}%`,
        percent: systemData.diskUsage
      };
    }
    
    return { text: "Unknown", percent: 0 };
  };

  const diskInfo = formatDiskUsage();

  return (
    <div className="py-2">
      <div className="flex items-center mb-4">
        <Home className="h-5 w-5 mr-2 text-primary" />
        <h2 className="text-xl font-bold text-text-primary">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* System Health Card */}
        <div className="bg-background-light rounded-md p-4 border border-border-color">
          <h3 className="text-base font-medium text-text-primary mb-3 flex items-center">
            <Server className="h-4 w-4 mr-2 text-primary" />
            System Health
          </h3>
          <div className={`text-4xl font-bold mb-2 ${getHealthColorClass()}`}>
            {systemHealth ? systemHealth.score : '?'}%
          </div>
          <div className={`text-sm mb-3 ${getHealthColorClass()}`}>
            {systemHealth ? systemHealth.status : 'Unknown'}
          </div>
          <Link 
            to="/diagnose" 
            className="inline-block px-4 py-2 bg-secondary text-white rounded text-sm font-medium hover:bg-opacity-80 transition-colors"
          >
            Diagnose & Solve
          </Link>
        </div>

        {/* CPU Usage Card */}
        <div className="bg-background-light rounded-md p-4 border border-border-color">
          <h3 className="text-base font-medium text-text-primary mb-3 flex items-center">
            <Cpu className="h-4 w-4 mr-2 text-primary" />
            CPU Usage
          </h3>
          <div className="flex items-end mb-2">
            <div className="text-2xl font-bold text-text-primary">{systemData.cpuUsage || 0}%</div>
            <div className="text-xs text-text-secondary ml-2 mb-1">{systemData?.cpu?.model}</div>
            {systemData.cpuUsage > thresholds.cpuUsage && (
              <div className="ml-auto flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-500 ml-1">Alert</span>
              </div>
            )}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
                systemData.cpuUsage > thresholds.cpuUsage ? 'bg-red-500' : 'bg-primary'
              }`}
              style={{ width: `${systemData.cpuUsage || 0}%` }}
            ></div>
          </div>
          <div className="mt-3 text-xs text-text-secondary">
            <div>Model: {systemData?.cpu?.model || 'Unknown'}</div>
            <div>Cores: {systemData?.cpu?.cores || 'Unknown'}</div>
          </div>
        </div>

        {/* Memory Usage Card */}
        <div className="bg-background-light rounded-md p-4 border border-border-color">
          <h3 className="text-base font-medium text-text-primary mb-3 flex items-center">
            <MemoryStick className="h-4 w-4 mr-2 text-secondary" />
            Memory Usage
          </h3>
          <div className="flex items-end mb-2">
            <div className="text-2xl font-bold text-text-primary">{systemData.memoryUsage || 0}%</div>
            <div className="text-xs text-text-secondary ml-2 mb-1">{systemData?.memory?.free} free</div>
            {systemData.memoryUsage > thresholds.memoryUsage && (
              <div className="ml-auto flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-500 ml-1">Alert</span>
              </div>
            )}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
                systemData.memoryUsage > thresholds.memoryUsage ? 'bg-red-500' : 'bg-secondary'
              }`}
              style={{ width: `${systemData.memoryUsage || 0}%` }}
            ></div>
          </div>
          <div className="mt-3 text-xs text-text-secondary">
            <div>Total: {systemData?.memory?.total || 'Unknown'}</div>
            <div>Free: {systemData?.memory?.free || 'Unknown'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Disk Usage Card */}
        <div className="bg-background-light rounded-md p-4 border border-border-color">
          <h3 className="text-base font-medium text-text-primary mb-3 flex items-center">
            <HardDrive className="h-4 w-4 mr-2 text-accent" />
            Disk Usage
          </h3>
          <div className="flex items-end mb-2">
            <div className="text-2xl font-bold text-text-primary">{typeof diskInfo === 'object' ? diskInfo.percent : 0}%</div>
            <div className="text-xs text-text-secondary ml-2 mb-1">
              {typeof diskInfo === 'object' && diskInfo.text ? diskInfo.text.split('(')[1]?.replace(')', '') : ''}
            </div>
            {diskInfo.percent > thresholds.diskUsage && (
              <div className="ml-auto flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-500 ml-1">Alert</span>
              </div>
            )}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
                diskInfo.percent > thresholds.diskUsage ? 'bg-red-500' : 'bg-accent'
              }`} 
              style={{ width: `${typeof diskInfo === 'object' ? diskInfo.percent : 0}%` }}
            ></div>
          </div>
          <div className="mt-3">
            {Array.isArray(systemData?.diskUsage) && (
              <div className="space-y-1">
                {systemData.diskUsage.slice(0, 2).map((drive, idx) => (
                  <div key={idx} className="text-xs text-text-secondary">
                    Drive {drive.drive}: {
                      parseInt(drive.free) && parseInt(drive.total) 
                        ? `${(parseInt(drive.free) / (1024 * 1024 * 1024)).toFixed(1)} GB free of ${(parseInt(drive.total) / (1024 * 1024 * 1024)).toFixed(1)} GB`
                        : 'Unknown'
                    }
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Information Card */}
        <div className="bg-background-light rounded-md p-4 border border-border-color">
          <h3 className="text-base font-medium text-text-primary mb-3 flex items-center">
            <Server className="h-4 w-4 mr-2 text-pink-500" />
            System Information
          </h3>
          <div className="space-y-2">
            <div>
              <h4 className="text-xs text-text-secondary mb-1">Operating System</h4>
              <p className="font-mono text-xs text-text-primary">{systemData?.os?.type} {systemData?.os?.release}</p>
            </div>
            <div>
              <h4 className="text-xs text-text-secondary mb-1">Hostname</h4>
              <p className="font-mono text-xs text-text-primary">{systemData?.os?.hostname}</p>
            </div>
            <div>
              <h4 className="text-xs text-text-secondary mb-1">Last Boot</h4>
              <p className="font-mono text-xs text-text-primary">{new Date(systemData?.lastBoot).toLocaleString()}</p>
            </div>
            <div>
              <h4 className="text-xs text-text-secondary mb-1">Uptime</h4>
              <p className="font-mono text-xs text-text-primary">{systemData?.uptime}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-background-light rounded-md p-4 border border-border-color">
          <h3 className="text-base font-medium text-text-primary mb-3 flex items-center">
            <Activity className="h-4 w-4 mr-2 text-secondary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Link 
              to="/monitor" 
              className="flex flex-col items-center justify-center p-3 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
            >
              <BarChart2 className="h-6 w-6 mb-1.5 text-primary" />
              <span className="text-xs text-text-primary">System Monitor</span>
            </Link>
            <Link 
              to="/diagnose" 
              className="flex flex-col items-center justify-center p-3 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
            >
              <FileSearch className="h-6 w-6 mb-1.5 text-secondary" />
              <span className="text-xs text-text-primary">AI Assistant</span>
            </Link>
            <Link 
              to="/logs-analyzer" 
              className="flex flex-col items-center justify-center p-3 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
            >
              <AlertCircle className="h-6 w-6 mb-1.5 text-accent" />
              <span className="text-xs text-text-primary">Logs Analyzer</span>
            </Link>
            <Link 
              to="/driver-updates" 
              className="flex flex-col items-center justify-center p-3 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
            >
              <HardDrive className="h-6 w-6 mb-1.5 text-pink-500" />
              <span className="text-xs text-text-primary">Driver Updates</span>
            </Link>
            <Link 
              to="/disk-partitioner" 
              className="flex flex-col items-center justify-center p-3 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
            >
              <HardDriveDownload className="h-6 w-6 mb-1.5 text-indigo-500" />
              <span className="text-xs text-text-primary">Disk Partitioner</span>
            </Link>
            <Link 
              to="/network-diagnostics" 
              className="flex flex-col items-center justify-center p-3 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
            >
              <Wifi className="h-6 w-6 mb-1.5 text-teal-500" />
              <span className="text-xs text-text-primary">Network Diagnostics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Alert Thresholds Card */}
      <div className="bg-background-light rounded-md p-4 border border-border-color">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-medium text-text-primary flex items-center">
            <BellRing className="h-4 w-4 mr-2 text-primary" />
            Alert Thresholds
          </h3>
          <button 
            className="text-xs text-primary hover:text-indigo-400 bg-transparent border-none p-0"
            onClick={() => setShowThresholds(!showThresholds)}
          >
            {showThresholds ? 'Hide' : 'Show'}
          </button>
        </div>
        
        {showThresholds && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CPU Threshold */}
              <div>
                <label htmlFor="cpuUsage" className=" text-xs font-medium text-text-secondary mb-1.5 flex items-center">
                  <Cpu className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  CPU Usage Threshold
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="cpuUsage"
                    name="cpuUsage"
                    min="50"
                    max="100"
                    value={thresholds.cpuUsage}
                    onChange={handleThresholdChange}
                    className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-xs font-semibold text-text-primary">{thresholds.cpuUsage}%</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Alerts when CPU usage exceeds threshold
                </p>
              </div>
              
              {/* Memory Threshold */}
              <div>
                <label htmlFor="memoryUsage" className=" text-xs font-medium text-text-secondary mb-1.5 flex items-center">
                  <MemoryStick className="h-3.5 w-3.5 mr-1.5 text-secondary" />
                  Memory Usage Threshold
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="memoryUsage"
                    name="memoryUsage"
                    min="50"
                    max="100"
                    value={thresholds.memoryUsage}
                    onChange={handleThresholdChange}
                    className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-xs font-semibold text-text-primary">{thresholds.memoryUsage}%</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Alerts when memory usage exceeds threshold
                </p>
              </div>
              
              {/* Disk Threshold */}
              <div>
                <label htmlFor="diskUsage" className="block text-xs font-medium text-text-secondary mb-1.5 flex items-center">
                  <HardDrive className="h-3.5 w-3.5 mr-1.5 text-accent" />
                  Disk Usage Threshold
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="diskUsage"
                    name="diskUsage"
                    min="50"
                    max="100"
                    value={thresholds.diskUsage}
                    onChange={handleThresholdChange}
                    className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-xs font-semibold text-text-primary">{thresholds.diskUsage}%</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Alerts when disk usage exceeds threshold
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={saveThresholds}
                className="flex items-center px-3 py-1.5 bg-primary text-white text-xs rounded hover:bg-indigo-500 transition-colors"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save Thresholds
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
