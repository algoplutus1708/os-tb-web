import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileSearch,
  BarChart2,
  Settings,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Package,
  Activity,
  Cog,
  HardDrive,
  Cpu,
  HardDriveDownload,
  Wifi
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
    { path: '/diagnose', label: 'Assistant', icon: <FileSearch className="h-4 w-4" /> },
    { path: '/monitor', label: 'Monitor', icon: <BarChart2 className="h-4 w-4" /> },
    { path: '/logs-analyzer', label: 'Logs Analyzer', icon: <MessageSquare className="h-4 w-4" /> },
    // { path: '/logs', label: 'System Logs', icon: <AlertCircle className="h-4 w-4" /> },
    // { path: '/app-diagnostics', label: 'App Diagnostics', icon: <Package className="h-4 w-4" /> },
    { path: '/app-monitoring', label: 'Real-Time Monitor', icon: <Activity className="h-4 w-4" /> },
    { path: '/predictive', label: 'Predictive Analysis', icon: <TrendingUp className="h-4 w-4" /> },
    { path: '/driver-updates', label: 'Driver Updates', icon: <HardDrive className="h-4 w-4" /> },
    { path: '/disk-partitioner', label: 'Disk Partitioner', icon: <HardDriveDownload className="h-4 w-4" /> },
    { path: '/network-diagnostics', label: 'Network Diagnostics', icon: <Wifi className="h-4 w-4" /> },
    // { path: '/settings', label: 'Settings', icon: <Cog className="h-4 w-4" /> }
  ];

  return (
    <div className="w-[200px] bg-[#111217] text-white h-screen flex flex-col fixed left-0 top-0 border-r border-gray-800">
      {/* Logo */}
      <div className="p-3 border-b border-gray-800">
        <Link to="/" className="flex items-center">
          <Cpu className="h-6 w-6 text-[#4a6fa5]" />
          <h1 className="text-lg font-bold ml-2 text-white">
            OS Assistant
          </h1>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 mx-2 rounded-sm text-sm transition-colors ${
                  isActive(item.path)
                    ? 'bg-[#1e2227] text-white'
                    : 'text-gray-400 hover:bg-[#1e2227]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Time and battery */}
      <div className="p-3 border-t border-gray-800 text-xs text-gray-400 flex justify-between">
        <div>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        <div>68%</div>
      </div>
    </div>
  );
};

export default Sidebar; 