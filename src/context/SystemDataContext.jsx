import React, { createContext, useState, useEffect, useCallback } from 'react';
import { fetchSystemData } from '../services/api';

export const SystemDataContext = createContext();

export const SystemDataProvider = ({ children }) => {
  const [systemData, setSystemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const getSystemData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching system data from API...");
      const data = await fetchSystemData();
      console.log("Successfully fetched system data:", data); 
      setSystemData(data);
      setLastUpdated(new Date());
      calculateSystemHealth(data);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching system data:", err);
      setError('Failed to fetch system data. Please check that the server is running.');
      // Don't clear systemData on error to keep displaying the last successful data
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSystemData = useCallback(() => {
    console.log("Manual refresh requested");
    getSystemData();
  }, [getSystemData]);

  useEffect(() => {
    console.log("Initial system data fetch");
    getSystemData();
    
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(() => {
      console.log("Auto-refresh: fetching updated system data");
      getSystemData();
    }, 30000);

    return () => {
      console.log("Cleaning up SystemDataContext");
      clearInterval(interval);
    };
  }, [getSystemData]);

  const calculateSystemHealth = (data) => {
    if (!data) {
      console.log("Cannot calculate system health: No data available");
      return;
    }
    
    console.log("Calculating system health from:", 
      `CPU: ${data.cpuUsage}%, Memory: ${data.memoryUsage}%, Disk: ${JSON.stringify(data.diskUsage)}`);
    
    let cpuScore = 100;
    if (typeof data.cpuUsage === 'number') {
      cpuScore = 100 - Math.min(data.cpuUsage, 100);
    }
    
    let memoryScore = 100;
    if (typeof data.memoryUsage === 'number') {
      memoryScore = 100 - Math.min(data.memoryUsage, 100);
    }
    
    let diskScore = 100;
    if (typeof data.diskUsage === 'number') {
      diskScore = 100 - Math.min(data.diskUsage, 100);
    } else if (Array.isArray(data.diskUsage) && data.diskUsage.length > 0) {
      const mainDrive = data.diskUsage[0];
      if (mainDrive && mainDrive.total && mainDrive.free) {
        const totalGB = parseInt(mainDrive.total) / (1024 * 1024 * 1024);
        const freeGB = parseInt(mainDrive.free) / (1024 * 1024 * 1024);
        const usedPercent = Math.round(((totalGB - freeGB) / totalGB) * 100);
        diskScore = 100 - usedPercent;
      }
    }
    
    const healthScore = Math.round((cpuScore + memoryScore + diskScore) / 3);
    console.log(`Health scores - CPU: ${cpuScore}, Memory: ${memoryScore}, Disk: ${diskScore}, Overall: ${healthScore}`);
    
    let status = 'Good';
    let statusColor = 'text-[#28a745]';
    if (healthScore < 40) {
      status = 'Critical';
      statusColor = 'text-[#dc3545]';
    } else if (healthScore < 70) {
      status = 'Warning';
      statusColor = 'text-[#ffc107]';
    }
    
    setSystemHealth({ score: healthScore, status, statusColor });
  };

  return (
    <SystemDataContext.Provider value={{ 
      systemData, 
      loading, 
      error, 
      systemHealth, 
      refreshSystemData,
      lastUpdated
    }}>
      {children}
    </SystemDataContext.Provider>
  );
}; 