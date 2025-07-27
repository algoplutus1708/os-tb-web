import React, { useContext, useState, useEffect } from 'react';
import { SystemDataContext } from '../context/SystemDataContext';
import {
  BarChart2,
  Cpu,
  MemoryStick as Memory,
  HardDrive,
  Server,
  RefreshCw,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

const SystemMonitor = () => {
  const { systemData, loading, error, refreshSystemData, lastUpdated } = useContext(SystemDataContext);
  const [timeRange, setTimeRange] = useState('1h');
  const [historicalData, setHistoricalData] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (systemData) {
      updateHistoricalData(systemData);
    }
  }, [systemData]);

  // Generate some dummy data for visualization if needed
  useEffect(() => {
    if (historicalData.length === 0) {
      const dummyData = [];
      const now = new Date();
      
      // Generate data points for the last hour
      for (let i = 60; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000);
        dummyData.push({
          timestamp: time.toLocaleTimeString(),
          cpuUsage: Math.floor(Math.random() * 40) + 10, // Random value between 10-50%
          memoryUsage: Math.floor(Math.random() * 30) + 50, // Random value between 50-80%
          diskIO: Math.floor(Math.random() * 20) + 40, // Random value between 40-60%
        });
      }
      
      setHistoricalData(dummyData);
    }
  }, [historicalData.length]);

  // Add current data to historical data
  const updateHistoricalData = (currentData) => {
    const now = new Date();
    const newDataPoint = {
      timestamp: now.toLocaleTimeString(),
      cpuUsage: currentData.cpuUsage || 0,
      memoryUsage: currentData.memoryUsage || 0,
      diskIO: typeof currentData.diskUsage === 'number' ? currentData.diskUsage : 0,
    };
    
    // Limit historical data based on time range
    setHistoricalData(prevData => {
      const newData = [...prevData, newDataPoint];
      if (newData.length > 60) { // Keep max 60 data points
        return newData.slice(-60);
      }
      return newData;
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshSystemData();
    // Reset refreshing state after animation
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Format date for display
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    return lastUpdated.toLocaleTimeString();
  };

  // Handle different formats of diskUsage
  const formatDiskUsage = () => {
    if (!systemData || !systemData.diskUsage) return { text: "Unknown", percent: 0 };
    
    // If diskUsage is an array (like in Windows parsing)
    if (Array.isArray(systemData.diskUsage)) {
      const mainDrive = systemData.diskUsage[0]; // Usually C: drive
      if (mainDrive) {
        try {
          const totalGB = parseInt(mainDrive.total) / (1024 * 1024 * 1024);
          const freeGB = parseInt(mainDrive.free) / (1024 * 1024 * 1024);
          const usedPercent = Math.round(((totalGB - freeGB) / totalGB) * 100);
          return {
            text: `${usedPercent}% (${Math.round(freeGB)} GB free)`,
            percent: usedPercent
          };
        } catch (err) {
          console.error("Error parsing disk usage:", err);
          return { text: "Error parsing", percent: 0 };
        }
      }
    } 
    // If diskUsage is a string with a percentage
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

  // Simplified Chart component similar to the screenshot
  const SimpleChart = ({ data, dataKey, title, color, icon, current }) => {
    // Safe check for data
    if (!data || data.length === 0) {
      return (
        <div className="bg-[#1e2227] text-white rounded-md overflow-hidden border border-gray-800">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <div className="flex items-center">
              {icon}
              <h3 className="ml-2 text-base font-medium">{title}</h3>
            </div>
            <div className="flex items-center">
              <span className="px-2 py-1 bg-[#202226] rounded text-sm font-mono">
                {current}
              </span>
              <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
            </div>
          </div>
          <div className="h-40 flex items-center justify-center">
            <div className="text-gray-500">No data available</div>
          </div>
        </div>
      );
    }

    // Get min and max values for better scaling
    const values = data.map(point => point[dataKey] || 0);
    const maxValue = Math.max(...values, 100); // Include 100 to handle case when all values are low

    return (
      <div className="bg-[#1e2227] text-white rounded-md overflow-hidden border border-gray-800">
        <div className="px-4 py-2 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center">
            {icon}
            <h3 className="ml-2 text-base font-medium">{title}</h3>
          </div>
          <div className="flex items-center">
            <span className="px-2 py-1 bg-[#202226] rounded text-xs font-mono">
              {current}
            </span>
            <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
          </div>
        </div>
        <div className="h-40 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-rows-4 h-full w-full">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="border-t border-gray-800 w-full" 
                style={{ top: `${i * 25}%` }}
              />
            ))}
          </div>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500 z-10 px-2">
            <div>100%</div>
            <div>75%</div>
            <div>50%</div>
            <div>25%</div>
            <div>0%</div>
          </div>
          
          {/* Chart area */}
          <div className="ml-8 h-full">
            {/* Area chart effect */}
            <svg className="h-full w-full" viewBox={`0 0 ${data.length} 100`} preserveAspectRatio="none">
              <defs>
                <linearGradient id={`gradient-${dataKey}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              {/* Line */}
              <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                points={data.map((point, index) => 
                  `${index}, ${100 - Math.min(100, (point[dataKey] || 0) * 100 / maxValue)}`
                ).join(' ')}
              />
              
              {/* Area fill */}
              <polygon
                fill={`url(#gradient-${dataKey})`}
                points={
                  data.map((point, index) => 
                    `${index}, ${100 - Math.min(100, (point[dataKey] || 0) * 100 / maxValue)}`
                  ).join(' ') + 
                  ` ${data.length - 1}, 100 0, 100`
                }
              />
            </svg>
          </div>
        </div>
        
        {/* Time range selector */}
        <div className="bg-[#141619] p-1 flex justify-end space-x-1 border-t border-gray-800">
          {['1h', '6h', '24h', '7d'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2 py-1 text-xs rounded ${
                timeRange === range 
                  ? 'bg-[#4a6fa5] text-white' 
                  : 'bg-[#202226] text-gray-300 hover:bg-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <BarChart2 className="h-6 w-6 mr-2 text-[#4a6fa5]" />
          <h2 className="text-xl font-bold text-white">System Monitor</h2>
        </div>
        
        <div className="flex items-center">
          <span className="text-xs text-gray-400 mr-3">Last updated: {formatLastUpdated()}</span>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-1.5 bg-[#4a6fa5] text-white rounded hover:bg-[#5f83b9] transition-colors flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-100 px-4 py-3 rounded-md flex items-center mb-6">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SimpleChart 
          data={historicalData}
          dataKey="cpuUsage"
          title="CPU Usage"
          color="#4a6fa5"
          icon={<Cpu className="h-5 w-5 text-[#4a6fa5]" />}
          current={`${systemData?.cpuUsage || 0}%`}
        />
        
        <SimpleChart 
          data={historicalData}
          dataKey="memoryUsage"
          title="Memory Usage"
          color="#4cb5ab"
          icon={<Memory className="h-5 w-5 text-[#4cb5ab]" />}
          current={`${systemData?.memoryUsage || 0}%`}
        />
        
        <SimpleChart 
          data={historicalData}
          dataKey="diskIO"
          title="Disk Usage"
          color="#e6b144"
          icon={<HardDrive className="h-5 w-5 text-[#e6b144]" />}
          current={diskInfo.text}
        />
        
        <div className="bg-[#1e2227] text-white rounded-md overflow-hidden border border-gray-800">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center">
            <Server className="h-5 w-5 text-[#bf63a5]" />
            <h3 className="ml-2 text-base font-medium">System Information</h3>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <h4 className="text-xs text-gray-400 mb-1">Operating System</h4>
              <p className="font-mono text-sm text-white">{systemData?.os?.type} {systemData?.os?.release}</p>
            </div>
            <div>
              <h4 className="text-xs text-gray-400 mb-1">Hostname</h4>
              <p className="font-mono text-sm text-white">{systemData?.os?.hostname}</p>
            </div>
            <div>
              <h4 className="text-xs text-gray-400 mb-1">CPU</h4>
              <p className="font-mono text-sm text-white">{systemData?.cpu?.model} ({systemData?.cpu?.cores} cores)</p>
            </div>
            <div>
              <h4 className="text-xs text-gray-400 mb-1">Memory</h4>
              <p className="font-mono text-sm text-white">{systemData?.memory?.total}</p>
            </div>
            <div>
              <h4 className="text-xs text-gray-400 mb-1">Uptime</h4>
              <p className="font-mono text-sm text-white">{systemData?.uptime}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor; 