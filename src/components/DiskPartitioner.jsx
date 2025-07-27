import React, { useState, useEffect } from 'react';
import { 
  HardDrive, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Loader, 
  HelpCircle,
  CornerDownRight,
  Play
} from 'lucide-react';
import { fetchDiskInfo, createPartition, deletePartition, automatePartitioning } from '../services/api';

const DiskPartitioner = () => {
  const [disks, setDisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDisk, setSelectedDisk] = useState(null);
  const [taskOutput, setTaskOutput] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [partitionPlan, setPartitionPlan] = useState('');
  const [automationMode, setAutomationMode] = useState('guided'); // guided or advanced

  // Example suggested plans with different configurations
  const suggestedPlans = [
    {
      name: "Basic Two Partition",
      description: "Creates a system partition (C:) and a data partition (D:)",
      plan: `select disk 0
clean
create partition primary size=100000
format quick fs=ntfs label="Windows"
assign letter=C
create partition primary
format quick fs=ntfs label="Data"
assign letter=D`
    },
    {
      name: "SSD Optimization",
      description: "Optimized partitioning for SSD with proper alignment",
      plan: `select disk 0
clean
convert gpt
create partition primary size=500
format quick fs=fat32 label="System"
assign letter=S
create partition primary size=150000
format quick fs=ntfs label="Windows"
assign letter=C
create partition primary
format quick fs=ntfs label="Data"
assign letter=D`
    },
    {
      name: "Multi-Boot Setup",
      description: "Setup for dual-boot systems with shared data partition",
      plan: `select disk 0
clean
convert gpt
create partition efi size=500
format quick fs=fat32 label="System"
assign letter=S
create partition msr size=16
create partition primary size=100000
format quick fs=ntfs label="Windows"
assign letter=C
create partition primary size=100000
format quick fs=ntfs label="Linux"
assign letter=L
create partition primary
format quick fs=ntfs label="Shared"
assign letter=D`
    }
  ];

  useEffect(() => {
    fetchDisks();
  }, []);

  const fetchDisks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDiskInfo();
      setDisks(data.disks || []);
      // Select first disk by default if available
      if (data.disks && data.disks.length > 0) {
        setSelectedDisk(data.disks[0].index);
      }
    } catch (err) {
      console.error('Error fetching disk information:', err);
      setError('Failed to fetch disk information: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDiskSelect = (diskIndex) => {
    setSelectedDisk(diskIndex);
  };

  const handlePlanChange = (e) => {
    setPartitionPlan(e.target.value);
  };

  const handleSuggestedPlan = (plan) => {
    setPartitionPlan(plan);
  };

  const executePartitioning = async () => {
    try {
      setExecuting(true);
      setTaskOutput([]);
      setError(null);

      const addToOutput = (message, type = 'info') => {
        setTaskOutput(prev => [...prev, { message, type, timestamp: new Date() }]);
      };

      addToOutput('Starting partitioning process...', 'info');
      
      // Call the API to execute the partitioning plan
      const result = await automatePartitioning(selectedDisk, partitionPlan, addToOutput);
      
      if (result && result.success) {
        addToOutput('Partitioning completed successfully!', 'success');
        // Refresh disk information after partitioning
        fetchDisks();
      } else {
        addToOutput(`Partitioning failed: ${result.error || 'Unknown error'}`, 'error');
        setError('Partitioning operation failed');
      }
    } catch (err) {
      console.error('Error executing partitioning:', err);
      setError('Failed to execute partitioning: ' + err.message);
      setTaskOutput(prev => [...prev, { 
        message: `Error: ${err.message}`, 
        type: 'error', 
        timestamp: new Date() 
      }]);
    } finally {
      setExecuting(false);
      setShowConfirmation(false);
    }
  };

  const getSelectedDiskInfo = () => {
    if (selectedDisk === null) return null;
    return disks.find(disk => disk.index === selectedDisk);
  };

  // Get a summary of what the partitioning plan will do
  const getPlanSummary = () => {
    if (!partitionPlan) return [];

    const lines = partitionPlan.split('\n');
    const summary = [];

    let currentDisk = null;
    let operationType = null;

    lines.forEach(line => {
      const trimmedLine = line.trim().toLowerCase();
      
      if (trimmedLine.startsWith('select disk')) {
        currentDisk = trimmedLine.replace('select disk', '').trim();
        summary.push({ 
          action: `Select Disk ${currentDisk}`, 
          type: 'info'
        });
      } else if (trimmedLine === 'clean') {
        summary.push({ 
          action: `⚠️ Clean Disk ${currentDisk} (ALL DATA WILL BE ERASED)`, 
          type: 'warning'
        });
      } else if (trimmedLine.startsWith('create partition')) {
        const partitionType = trimmedLine.includes('primary') ? 'Primary' : 
                             trimmedLine.includes('extended') ? 'Extended' :
                             trimmedLine.includes('logical') ? 'Logical' : 
                             trimmedLine.includes('efi') ? 'EFI' : 'Unknown';
        
        const sizeMatch = trimmedLine.match(/size=(\d+)/);
        const size = sizeMatch ? `${parseInt(sizeMatch[1], 10)}MB` : 'Remaining space';
        
        summary.push({ 
          action: `Create ${partitionType} Partition (${size})`, 
          type: 'info'
        });
        operationType = 'create';
      } else if (trimmedLine.startsWith('format')) {
        const fsMatch = trimmedLine.match(/fs=(\w+)/);
        const labelMatch = trimmedLine.match(/label="([^"]+)"/);
        
        const fs = fsMatch ? fsMatch[1].toUpperCase() : 'NTFS';
        const label = labelMatch ? labelMatch[1] : '';
        const quickFormat = trimmedLine.includes('quick') ? ' (Quick)' : '';
        
        summary.push({ 
          action: `Format as ${fs}${label ? ` with label "${label}"` : ''}${quickFormat}`, 
          type: 'info'
        });
      } else if (trimmedLine.startsWith('assign')) {
        const letterMatch = trimmedLine.match(/letter=(\w)/);
        const letter = letterMatch ? letterMatch[1].toUpperCase() : '';
        
        if (letter) {
          summary.push({ 
            action: `Assign Drive Letter ${letter}:`, 
            type: 'info'
          });
        }
      }
    });

    return summary;
  };

  if (loading) {
    return (
      <div className="py-6">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
          <HardDrive className="h-8 w-8 mr-3 text-white" />
          Disk Partitioner
        </h2>
        <div className="bg-[#1e2227] rounded-md border border-gray-800 p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-[#5f83b9] mx-auto mb-4" />
            <p className="text-lg text-gray-300">Loading disk information...</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedDiskInfo = getSelectedDiskInfo();

  return (
    <div className="py-6">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
        <HardDrive className="h-8 w-8 mr-3 text-white" />
        Disk Partitioner
      </h2>

      {/* Warning notice */}
      <div className="bg-red-900/30 border border-red-800 rounded-md p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-400">Warning: Data Loss Risk</h3>
            <p className="text-gray-300 mt-1">
              Disk partitioning is a high-risk operation that can result in permanent data loss. 
              Make sure you have backed up all important data before proceeding. This tool executes 
              actual diskpart commands on your system.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Disk Information Panel */}
        <div className="lg:col-span-5 bg-[#1e2227] rounded-md border border-gray-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Disk Information</h3>
            <button
              onClick={fetchDisks}
              disabled={loading}
              className="px-3 py-1 bg-gray-700 text-white rounded-md flex items-center text-sm hover:bg-gray-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>

          {disks.length === 0 ? (
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <p className="text-gray-300">No disks found. Please check your system or refresh.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {disks.map(disk => (
                <div 
                  key={disk.index}
                  className={`border p-4 rounded-md cursor-pointer transition-colors ${
                    selectedDisk === disk.index 
                      ? 'border-blue-600 bg-blue-900/20' 
                      : 'border-gray-700 hover:bg-gray-800'
                  }`}
                  onClick={() => handleDiskSelect(disk.index)}
                >
                  <div className="flex justify-between">
                    <h4 className="font-medium text-white">Disk {disk.index}: {disk.model || 'Unknown'}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      disk.status === 'Online' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                    }`}>
                      {disk.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">Size:</div>
                    <div className="text-gray-300">{disk.size || 'Unknown'}</div>
                    <div className="text-gray-400">Type:</div>
                    <div className="text-gray-300">{disk.type || 'Unknown'}</div>
                    <div className="text-gray-400">Bus Type:</div>
                    <div className="text-gray-300">{disk.busType || 'Unknown'}</div>
                    <div className="text-gray-400">Partition Style:</div>
                    <div className="text-gray-300">{disk.partitionStyle || 'Unknown'}</div>
                  </div>

                  {/* Show existing partitions */}
                  {disk.partitions && disk.partitions.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-medium text-white text-sm mb-2">Existing Partitions:</h5>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {disk.partitions.map((partition, idx) => (
                          <div key={idx} className="bg-gray-800 p-2 rounded-md text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-300">
                                {partition.letter ? `${partition.letter}:` : 'No Letter'} 
                                {partition.label ? ` (${partition.label})` : ''}
                              </span>
                              <span className="text-gray-400">{partition.size || 'Unknown'}</span>
                            </div>
                            <div className="text-gray-400 mt-1">
                              {partition.type || 'Unknown'} - {partition.filesystem || 'Unknown'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Partitioning Automation Panel */}
        <div className="lg:col-span-7 bg-[#1e2227] rounded-md border border-gray-800 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Disk Partitioning Automation</h3>
          
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="flex-1 flex space-x-4">
                <button
                  className={`px-4 py-2 rounded-md ${
                    automationMode === 'guided' 
                      ? 'bg-[#4a6fa5] text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setAutomationMode('guided')}
                >
                  Guided Mode
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${
                    automationMode === 'advanced' 
                      ? 'bg-[#4a6fa5] text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setAutomationMode('advanced')}
                >
                  Advanced Mode
                </button>
              </div>
              <div className="ml-auto">
                <button 
                  className="text-gray-400 hover:text-white"
                  title="Help with disk partitioning"
                >
                  <HelpCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            {automationMode === 'guided' ? (
              <div>
                <p className="text-gray-300 mb-4">
                  Select a pre-configured partitioning plan for disk {selectedDisk !== null ? selectedDisk : ''}:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {suggestedPlans.map((plan, idx) => (
                    <div 
                      key={idx}
                      className="bg-gray-800 rounded-md p-4 border border-gray-700 cursor-pointer hover:border-blue-600 transition-colors"
                      onClick={() => handleSuggestedPlan(plan.plan)}
                    >
                      <h4 className="font-medium text-white mb-2">{plan.name}</h4>
                      <p className="text-gray-400 text-sm mb-3">{plan.description}</p>
                      <button
                        className="text-[#4a6fa5] hover:text-[#5f83b9] text-sm flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSuggestedPlan(plan.plan);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" /> Use this plan
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="partitionPlan" className="block text-white font-medium">
                  DiskPart Commands:
                </label>
                <div className="text-xs text-gray-400">
                  {automationMode === 'advanced' ? 'Advanced Mode - Be careful!' : 'Guided Mode'}
                </div>
              </div>
              <textarea
                id="partitionPlan"
                value={partitionPlan}
                onChange={handlePlanChange}
                className="w-full h-64 p-3 bg-gray-800 border border-gray-700 rounded-md text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6fa5]"
                placeholder="Enter diskpart commands here...
Example:
select disk 0
clean
create partition primary size=100000
format quick fs=ntfs label=Windows
assign letter=C"
              ></textarea>
            </div>

            {/* Plan Summary */}
            {partitionPlan && (
              <div className="mb-6 bg-gray-800 border border-gray-700 rounded-md p-4">
                <h4 className="font-medium text-white mb-2">Plan Summary:</h4>
                <div className="space-y-1">
                  {getPlanSummary().map((item, idx) => (
                    <div key={idx} className={`flex items-start ${
                      item.type === 'warning' ? 'text-amber-400' :
                      item.type === 'error' ? 'text-red-400' : 
                      'text-gray-300'
                    }`}>
                      <CornerDownRight className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                      <span>{item.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setShowConfirmation(true)}
                disabled={!selectedDisk || !partitionPlan || executing}
                className="px-4 py-2 bg-[#4a6fa5] text-white rounded-md font-medium hover:bg-[#5f83b9] flex items-center disabled:bg-gray-700 disabled:text-gray-500"
              >
                {executing ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Execute Partitioning
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Task Output */}
          {taskOutput.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-white mb-2">Task Output:</h4>
              <div className="bg-gray-900 rounded-md p-3 h-64 overflow-y-auto font-mono text-sm">
                {taskOutput.map((output, idx) => (
                  <div key={idx} className={`mb-1 ${
                    output.type === 'error' ? 'text-red-400' :
                    output.type === 'success' ? 'text-green-400' :
                    output.type === 'warning' ? 'text-amber-400' :
                    'text-gray-300'
                  }`}>
                    [{new Date(output.timestamp).toLocaleTimeString()}] {output.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1e2227] rounded-md border border-gray-700 p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-red-400 mb-4">⚠️ Confirm Disk Partitioning</h3>
            <p className="text-white mb-6">
              You are about to partition disk {selectedDisk}. This will erase all data on the disk
              and create new partitions according to your plan. This operation cannot be undone.
            </p>
            <p className="text-amber-400 mb-6 font-medium">
              Are you sure you want to continue?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={executePartitioning}
                className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600 flex items-center"
              >
                <AlertCircle className="h-5 w-5 mr-2" />
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiskPartitioner; 