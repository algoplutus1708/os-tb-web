import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  Bell,
  Moon,
  RefreshCw,
  Database,
  Trash2,
  Save,
  RotateCcw,
  CheckSquare,
  XSquare,
  Languages
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    refreshRate: 30,
    darkMode: true,
    notifications: true,
    autoFix: false,
    language: 'en',
    dataRetention: '30',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, save settings to backend/localStorage
    alert('Settings saved!');
  };

  return (
    <div className="py-4">
      <div className="flex items-center mb-4">
        <SettingsIcon className="h-5 w-5 mr-2 text-[#4a6fa5]" />
        <h2 className="text-xl font-bold text-white">System Settings</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-[#1e2227] rounded-md border border-gray-800 p-4">
          <h3 className="text-base font-medium text-white mb-3 flex items-center">
            <Globe className="h-4 w-4 mr-2 text-[#4a6fa5]" />
            General Settings
          </h3>
          
          <div className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="refreshRate" className="font-medium text-gray-400 mb-2 flex items-center text-sm">
                <RefreshCw className="h-4 w-4 mr-2 text-[#4a6fa5]" />
                Data Refresh Rate (seconds)
              </label>
              <input
                type="number"
                id="refreshRate"
                name="refreshRate"
                value={settings.refreshRate}
                onChange={handleChange}
                min="5"
                max="300"
                className="w-full md:w-64 px-3 py-1.5 border border-gray-700 bg-[#111217] text-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4a6fa5] focus:border-transparent text-sm"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="darkMode"
                name="darkMode"
                checked={settings.darkMode}
                onChange={handleChange}
                className="h-4 w-4 bg-[#111217] border-gray-700 rounded text-[#4a6fa5] focus:ring-[#4a6fa5]"
              />
              <label htmlFor="darkMode" className="ml-2 font-medium text-gray-300 flex items-center text-sm">
                <Moon className="h-4 w-4 ml-1 mr-2 text-[#4cb5ab]" />
                Dark Mode
              </label>
            </div>

            <div className="flex flex-col">
              <label htmlFor="language" className="font-medium text-gray-400 mb-2 flex items-center text-sm">
                <Languages className="h-4 w-4 mr-2 text-[#e6b144]" />
                Language
              </label>
              <select
                id="language"
                name="language"
                value={settings.language}
                onChange={handleChange}
                className="w-full md:w-64 px-3 py-1.5 border border-gray-700 bg-[#111217] text-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4a6fa5] focus:border-transparent text-sm"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[#1e2227] rounded-md border border-gray-800 p-4">
          <h3 className="text-base font-medium text-white mb-3 flex items-center">
            <Bell className="h-4 w-4 mr-2 text-[#4cb5ab]" />
            Notifications
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications"
                name="notifications"
                checked={settings.notifications}
                onChange={handleChange}
                className="h-4 w-4 bg-[#111217] border-gray-700 rounded text-[#4a6fa5] focus:ring-[#4a6fa5]"
              />
              <label htmlFor="notifications" className="ml-2 font-medium text-gray-300 flex items-center text-sm">
                <Bell className="h-4 w-4 ml-1 mr-2 text-[#4a6fa5]" />
                Enable Notifications
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoFix"
                name="autoFix"
                checked={settings.autoFix}
                onChange={handleChange}
                className="h-4 w-4 bg-[#111217] border-gray-700 rounded text-[#4a6fa5] focus:ring-[#4a6fa5]"
              />
              <label htmlFor="autoFix" className="ml-2 font-medium text-gray-300 flex items-center text-sm">
                {settings.autoFix ? (
                  <CheckSquare className="h-4 w-4 ml-1 mr-2 text-[#4cb5ab]" />
                ) : (
                  <XSquare className="h-4 w-4 ml-1 mr-2 text-red-500" />
                )}
                Auto-fix Non-critical Issues
              </label>
            </div>
          </div>
        </div>

        <div className="bg-[#1e2227] rounded-md border border-gray-800 p-4">
          <h3 className="text-base font-medium text-white mb-3 flex items-center">
            <Database className="h-4 w-4 mr-2 text-[#e6b144]" />
            Data Management
          </h3>
          
          <div className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="dataRetention" className="font-medium text-gray-400 mb-2 flex items-center text-sm">
                <Database className="h-4 w-4 mr-2 text-[#4cb5ab]" />
                Data Retention Period
              </label>
              <select
                id="dataRetention"
                name="dataRetention"
                value={settings.dataRetention}
                onChange={handleChange}
                className="w-full md:w-64 px-3 py-1.5 border border-gray-700 bg-[#111217] text-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4a6fa5] focus:border-transparent text-sm"
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
              </select>
            </div>

            <div className="mt-4">
              <button 
                type="button"
                className="px-3 py-1.5 bg-red-900/30 text-red-400 border border-red-800/30 rounded text-sm flex items-center hover:bg-red-900/50 transition-colors"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                    alert('Data cleared!');
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-4">
          <button 
            type="submit" 
            className="px-4 py-2 bg-[#4a6fa5] text-white rounded text-sm flex items-center hover:bg-[#5f83b9] transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-[#202226] text-gray-300 border border-gray-700 rounded text-sm flex items-center hover:bg-[#282c33] transition-colors"
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all settings to default?')) {
                setSettings({
                  refreshRate: 30,
                  darkMode: true,
                  notifications: true,
                  autoFix: false,
                  language: 'en',
                  dataRetention: '30',
                });
              }
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings; 