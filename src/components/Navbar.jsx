import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileSearch,
  BarChart2,
  Settings,
  Menu,
  X,
  Cpu,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Package,
  Activity,
  Cog,
  HardDrive
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Cpu className="h-8 w-8 text-[#4a6fa5] mr-3" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4a6fa5] to-[#4cb5ab] bg-clip-text text-transparent">
                OS Assistant
              </h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <ul className="flex space-x-6">
              <li>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md flex items-center transition-colors duration-300 ${
                    isActive('/') 
                      ? 'bg-[#4a6fa5]/20 text-white font-medium' 
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <Home className="h-5 w-5 mr-2" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/diagnose"
                  className={`px-3 py-2 rounded-md flex items-center transition-colors duration-300 ${
                    isActive('/diagnose') 
                      ? 'bg-[#4a6fa5]/20 text-white font-medium' 
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <FileSearch className="h-5 w-5 mr-2" />
                  Assistant
                </Link>
              </li>
              <li>
                <Link
                  to="/monitor"
                  className={`px-3 py-2 rounded-md flex items-center transition-colors duration-300 ${
                    isActive('/monitor') 
                      ? 'bg-[#4a6fa5]/20 text-white font-medium' 
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <BarChart2 className="h-5 w-5 mr-2" />
                  Monitor
                </Link>
              </li>
              <li>
                {/* <Link
                  to="/logs"
                  className={`px-3 py-2 rounded-md flex items-center transition-colors duration-300 ${
                    isActive('/logs') 
                      ? 'bg-[#4a6fa5]/20 text-white font-medium' 
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <AlertCircle className="h-5 w-5 mr-2" />
                  System Logs
                </Link> */}
              </li>
              <li>
                <Link
                  to="/logs-analyzer"
                  className={`px-3 py-2 rounded-md flex items-center transition-colors duration-300 ${
                    isActive('/logs-analyzer') 
                      ? 'bg-[#4a6fa5]/20 text-white font-medium' 
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Logs Analyzer
                </Link>
              </li>
              <li>
                {/* <Link
                  to="/app-diagnostics"
                  className={`px-3 py-2 rounded-md flex items-center transition-colors duration-300 ${
                    isActive('/app-diagnostics') 
                      ? 'bg-[#4a6fa5]/20 text-white font-medium' 
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <Package className="h-5 w-5 mr-2" />
                  App Diagnostics
                </Link> */}
              </li>
              <li>
                {/* <Link
                  to="/app-monitoring"
                  className={`px-3 py-2 rounded-md flex items-center transition-colors duration-300 ${
                    isActive('/app-monitoring') 
                      ? 'bg-[#4a6fa5]/20 text-white font-medium' 
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <Activity className="h-5 w-5 mr-2" />
                  Real-Time Monitor
                </Link> */}
              </li>
              <li>
                <Link
                  to="/predictive"
                  className={`px-3 py-2 rounded-md flex items-center transition-colors duration-300 ${
                    isActive('/predictive') 
                      ? 'bg-[#4a6fa5]/20 text-white font-medium' 
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Predictive Analysis
                </Link>
              </li>
              <li>
                <Link
                  to="/driver-updates"
                  className={`px-3 py-2 rounded-md flex items-center transition-colors duration-300 ${
                    isActive('/driver-updates') 
                      ? 'bg-[#4a6fa5]/20 text-white font-medium' 
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <HardDrive className="h-5 w-5 mr-2" />
                  Driver Updates
                </Link>
              </li>
              <li>
                <Link
                  to="/settings"
                  className={`px-3 py-2 rounded-md flex items-center transition-colors duration-300 ${
                    isActive('/settings') 
                      ? 'bg-[#4a6fa5]/20 text-white font-medium' 
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <Cog className="h-5 w-5 mr-2" />
                  Settings
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMobileMenu}
              className="text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg z-20`}>
            <ul className="px-4 py-2">
              <li className="py-2">
                <Link
                  to="/"
                  className={`flex items-center text-blue-600 font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home size={18} className="mr-2" />
                  Dashboard
                </Link>
              </li>
              <li className="py-2">
                <Link
                  to="/monitor"
                  className={`flex items-center text-blue-600 font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BarChart2 size={18} className="mr-2" />
                  Monitor
                </Link>
              </li>
              <li className="py-2">
                <Link
                  to="/logs"
                  className={`flex items-center text-blue-600 font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <AlertCircle size={18} className="mr-2" />
                  System Logs
                </Link>
              </li>
              <li className="py-2">
                <Link
                  to="/logs-analyzer"
                  className={`flex items-center text-blue-600 font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageSquare size={18} className="mr-2" />
                  Logs Analyzer
                </Link>
              </li>
              <li className="py-2">
                <Link
                  to="/app-diagnostics"
                  className={`flex items-center text-blue-600 font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package size={18} className="mr-2" />
                  App Diagnostics
                </Link>
              </li>
              <li className="py-2">
                <Link
                  to="/driver-updates"
                  className={`flex items-center text-blue-600 font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HardDrive size={18} className="mr-2" />
                  Driver Updates
                </Link>
              </li>
              <li className="py-2">
                <Link
                  to="/settings"
                  className={`flex items-center text-blue-600 font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Cog size={18} className="mr-2" />
                  Settings
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 