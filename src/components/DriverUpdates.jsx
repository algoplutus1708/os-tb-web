import React, { useState, useEffect } from 'react';
import { 
  HardDrive, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Download, 
  Loader, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  X, 
  ExternalLink,
  Filter,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { getAllDrivers, checkDriverUpdates, getDeviceManagerCommand, fetchDriverProblems } from '../services/api';

const DriverUpdates = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDriver, setExpandedDriver] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, updates, critical, notupdated
  const [sortBy, setSortBy] = useState('category'); // category, name, updateStatus
  const [currentPage, setCurrentPage] = useState(1);
  const [driversPerPage, setDriversPerPage] = useState(10);
  const [driverProblems, setDriverProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [problemsVisible, setProblemsVisible] = useState(false);
  
  useEffect(() => {
    // Fetch drivers when component mounts
    fetchDrivers();
  }, []);

  // Reset to first page when search query or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllDrivers();
      
      if (result && result.success && result.drivers) {
        setDrivers(result.drivers);
      } else {
        setError('Failed to retrieve driver information');
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Failed to fetch driver information: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckForUpdates = async () => {
    try {
      setChecking(true);
      setError(null);

      const result = await checkDriverUpdates();
      
      if (result && result.success && result.drivers) {
        setDrivers(result.drivers);
        setSummary(result.summary);
      } else {
        setError('Failed to check for driver updates');
      }
    } catch (err) {
      console.error('Error checking for driver updates:', err);
      setError('Failed to check for driver updates: ' + err.message);
    } finally {
      setChecking(false);
    }
  };

  const getDriverProblems = async () => {
    try {
      setLoadingProblems(true);
      setError(null);

      const result = await fetchDriverProblems();
      
      if (result && result.success && result.problems) {
        setDriverProblems(result.problems);
        setProblemsVisible(true);
      } else {
        setError('Failed to fetch driver problems from logs');
      }
    } catch (err) {
      console.error('Error fetching driver problems:', err);
      setError('Failed to fetch driver problems: ' + err.message);
    } finally {
      setLoadingProblems(false);
    }
  };

  // Function to generate and download a driver update report
  const exportReport = () => {
    try {
      // Create the report content
      let reportContent = "DRIVER UPDATE REPORT\n";
      reportContent += "===================\n\n";
      reportContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      // Summary
      if (summary) {
        reportContent += "SUMMARY\n";
        reportContent += "-------\n";
        reportContent += `Total Drivers: ${summary.total}\n`;
        reportContent += `Updates Available: ${summary.updatesAvailable}\n`;
        reportContent += `Critical Updates: ${summary.critical}\n`;
        reportContent += `Medium Priority Updates: ${summary.medium}\n`;
        reportContent += `Low Priority Updates: ${summary.low}\n\n`;
      }
      
      // Driver Problems from Logs
      if (driverProblems.length > 0) {
        reportContent += "DRIVER PROBLEMS FROM SYSTEM LOGS\n";
        reportContent += "--------------------------------\n";
        driverProblems.forEach(problem => {
          reportContent += `[${problem.level}] ${problem.deviceName}\n`;
          reportContent += `Time: ${new Date(problem.time).toLocaleString()}\n`;
          reportContent += `Category: ${problem.category}\n`;
          reportContent += `Message: ${problem.message}\n\n`;
        });
        reportContent += "\n";
      }
      
      // Drivers that need updates
      const driversNeedingUpdate = drivers.filter(driver => driver.updateAvailable);
      if (driversNeedingUpdate.length > 0) {
        reportContent += "DRIVERS NEEDING UPDATES\n";
        reportContent += "----------------------\n";
        
        // Group by importance
        const criticalDrivers = driversNeedingUpdate.filter(d => d.importance === 'critical');
        const mediumDrivers = driversNeedingUpdate.filter(d => d.importance === 'medium');
        const lowDrivers = driversNeedingUpdate.filter(d => d.importance === 'low');
        
        if (criticalDrivers.length > 0) {
          reportContent += "CRITICAL:\n";
          criticalDrivers.forEach(driver => {
            reportContent += `- ${driver.name} (${driver.manufacturer})\n`;
            reportContent += `  Version: ${driver.version}, Date: ${driver.date}\n`;
            reportContent += `  Category: ${driver.category}\n`;
            if (driver.updateUrl) {
              reportContent += `  Update URL: ${driver.updateUrl}\n`;
            }
            reportContent += "\n";
          });
        }
        
        if (mediumDrivers.length > 0) {
          reportContent += "MEDIUM PRIORITY:\n";
          mediumDrivers.forEach(driver => {
            reportContent += `- ${driver.name} (${driver.manufacturer})\n`;
            reportContent += `  Version: ${driver.version}, Date: ${driver.date}\n`;
            reportContent += `  Category: ${driver.category}\n`;
            if (driver.updateUrl) {
              reportContent += `  Update URL: ${driver.updateUrl}\n`;
            }
            reportContent += "\n";
          });
        }
        
        if (lowDrivers.length > 0) {
          reportContent += "LOW PRIORITY:\n";
          lowDrivers.forEach(driver => {
            reportContent += `- ${driver.name} (${driver.manufacturer})\n`;
            reportContent += `  Version: ${driver.version}, Date: ${driver.date}\n`;
            reportContent += `  Category: ${driver.category}\n`;
            if (driver.updateUrl) {
              reportContent += `  Update URL: ${driver.updateUrl}\n`;
            }
            reportContent += "\n";
          });
        }
      }
      
      // Create a blob and download
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'driver_update_report.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting report:', err);
      alert('Failed to generate report: ' + err.message);
    }
  };

  const openDeviceManager = async (deviceId) => {
    try {
      const result = await getDeviceManagerCommand(deviceId);
      
      if (result && result.success && result.command) {
        // In a real implementation, you might use electron or some other mechanism
        // to execute the command. For the web app, we'll just open Device Manager
        window.open('ms-settings:windowsupdate', '_blank');
      } else {
        alert('Failed to get Device Manager command');
      }
    } catch (err) {
      console.error('Error opening Device Manager:', err);
      alert('Failed to open Device Manager: ' + err.message);
    }
  };

  const openUpdateUrl = (driver) => {
    if (driver.updateUrl) {
      window.open(driver.updateUrl, '_blank');
    } else {
      // Fallback to a general search if no URL is provided
      const searchQuery = `${driver.manufacturer} ${driver.name} driver update`;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  const toggleExpandDriver = (driverId) => {
    if (expandedDriver === driverId) {
      setExpandedDriver(null);
    } else {
      setExpandedDriver(driverId);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'critical':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-500';
      case 'low':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getImportanceIcon = (importance) => {
    switch (importance) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'low':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  // Filter drivers based on search query and filter type
  const filteredDrivers = drivers.filter(driver => {
    // First apply the search filter
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Then apply the type filter
    let matchesType = true;
    if (filterType === 'updates') {
      matchesType = driver.updateAvailable === true;
    } else if (filterType === 'critical') {
      matchesType = driver.importance === 'critical';
    } else if (filterType === 'notupdated') {
      matchesType = driver.updateAvailable === false;
    }
    
    return matchesSearch && matchesType;
  });

  // Sort the filtered drivers
  const sortedDrivers = [...filteredDrivers].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'updateStatus') {
      // Sort by update status (updateAvailable: true first)
      if (a.updateAvailable && !b.updateAvailable) return -1;
      if (!a.updateAvailable && b.updateAvailable) return 1;
      
      // If update status is the same, sort by importance
      if (a.importance !== b.importance) {
        const importanceOrder = { critical: 0, medium: 1, low: 2, unknown: 3 };
        return importanceOrder[a.importance] - importanceOrder[b.importance];
      }
      
      // If importance is the same, sort by name
      return a.name.localeCompare(b.name);
    } else {
      // Default sort by category
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    }
  });

  // Group drivers by category for better display
  const driversByCategory = sortedDrivers.reduce((acc, driver) => {
    const category = driver.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(driver);
    return acc;
  }, {});

  // Create a paged version of the drivers when in category view
  const getPagedCategoryDrivers = () => {
    // If not category view, just return empty object since we use sortedDrivers directly
    if (sortBy !== 'category') return {};
    
    const allCategories = Object.keys(driversByCategory).sort();
    const driversPerPageInCategory = {};
    
    // Calculate page range
    const startIndex = (currentPage - 1) * driversPerPage;
    let endIndex = currentPage * driversPerPage;
    let currentIndex = 0;
    let totalProcessed = 0;
    
    // Go through categories and extract only drivers for current page
    for (const category of allCategories) {
      const categoryDrivers = driversByCategory[category];
      const categoryStartIndex = currentIndex;
      const categoryEndIndex = categoryStartIndex + categoryDrivers.length;
      
      // Check if this category has drivers in the current page range
      if (categoryEndIndex > startIndex && categoryStartIndex < endIndex) {
        // Calculate which drivers to include from this category
        const driversStartIndex = Math.max(0, startIndex - categoryStartIndex);
        const driversEndIndex = Math.min(categoryDrivers.length, endIndex - categoryStartIndex);
        
        // Only include drivers that are within the page range
        if (driversStartIndex < categoryDrivers.length) {
          driversPerPageInCategory[category] = categoryDrivers.slice(driversStartIndex, driversEndIndex);
          totalProcessed += driversPerPageInCategory[category].length;
          
          // Stop if we've filled the page
          if (totalProcessed >= driversPerPage) break;
        }
      }
      
      currentIndex += categoryDrivers.length;
    }
    
    return driversPerPageInCategory;
  };
  
  // Get paged category drivers
  const pagedCategoryDrivers = getPagedCategoryDrivers();

  // Calculate total pages based on the view type
  const calculateTotalPages = () => {
    if (sortBy === 'category') {
      // For category view, we need to count all drivers across all categories
      const totalDrivers = Object.values(driversByCategory).reduce(
        (total, drivers) => total + drivers.length, 0
      );
      return Math.ceil(totalDrivers / driversPerPage);
    } else {
      // For non-category views, we can just count the sorted drivers
      return Math.ceil(sortedDrivers.length / driversPerPage);
    }
  };
  
  const totalPages = calculateTotalPages();

  // Return a message if loading or no results
  if (loading) {
    return (
      <div className="py-6">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
          <HardDrive className="h-8 w-8 mr-3 text-white" />
          Driver Updates
        </h2>
        <div className="bg-[#1e2227] rounded-md border border-gray-800 p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-[#5f83b9] mx-auto mb-4" />
            <p className="text-lg text-gray-300">Loading driver information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
          <HardDrive className="h-8 w-8 mr-3 text-white" />
          Driver Updates
        </h2>
        <div className="bg-[#1e2227] rounded-md border border-gray-800 p-6">
          <div className="text-center p-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-400 mb-2">Error</h3>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={fetchDrivers}
              className="px-4 py-2 bg-[#4a6fa5] text-white rounded-lg font-medium hover:bg-[#5f83b9] flex items-center mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
        <HardDrive className="h-8 w-8 mr-3 text-white" />
        Driver Updates
      </h2>

      {/* Summary panel */}
      <div className="bg-[#1e2227] rounded-md border border-gray-800 p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">System Drivers</h3>
            <p className="text-gray-300">
              {summary ? (
                <>
                  {summary.total} drivers found, {summary.updatesAvailable} updates available
                  {summary.critical > 0 && <span className="text-red-400"> ({summary.critical} critical)</span>}
                </>
              ) : (
                <>
                  {drivers.length} drivers found. Click "Check for Updates" to see which ones need updating.
                </>
              )}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button
              onClick={handleCheckForUpdates}
              disabled={checking}
              className="px-4 py-2 bg-[#4a6fa5] text-white rounded-md font-medium hover:bg-[#5f83b9] flex items-center disabled:bg-gray-700 disabled:text-gray-400 transition-colors"
            >
              {checking ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Check for Updates
                </>
              )}
            </button>
            
            <button
              onClick={getDriverProblems}
              disabled={loadingProblems}
              className="px-4 py-2 bg-amber-700 text-white rounded-md font-medium hover:bg-amber-600 flex items-center disabled:bg-gray-700 disabled:text-gray-400 transition-colors"
            >
              {loadingProblems ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Check Driver Problems
                </>
              )}
            </button>
            
            <button
              onClick={exportReport}
              className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 flex items-center"
            >
              <FileText className="h-5 w-5 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Summary boxes */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-900/30 border border-red-800 rounded-md p-4">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <h4 className="text-lg font-semibold text-red-400">Critical Updates</h4>
                  <p className="text-red-300">{summary.critical} drivers need immediate attention</p>
                </div>
              </div>
            </div>
            <div className="bg-amber-900/30 border border-amber-800 rounded-md p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-amber-500 mr-3" />
                <div>
                  <h4 className="text-lg font-semibold text-amber-400">Recommended Updates</h4>
                  <p className="text-amber-300">{summary.medium} drivers should be updated soon</p>
                </div>
              </div>
            </div>
            <div className="bg-green-900/30 border border-green-800 rounded-md p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <h4 className="text-lg font-semibold text-green-400">Up to Date</h4>
                  <p className="text-green-300">{summary.total - summary.updatesAvailable} drivers are up to date</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and filter tools */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a6fa5] text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-300" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a6fa5] text-white"
              >
                <option value="all">All Drivers</option>
                <option value="updates">Needs Update</option>
                <option value="critical">Critical Updates</option>
                <option value="notupdated">Up to Date</option>
              </select>
              <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a6fa5] text-white"
              >
                <option value="category">Sort by Category</option>
                <option value="name">Sort by Name</option>
                <option value="updateStatus">Sort by Update Status</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Driver list */}
      <div className="bg-[#1e2227] rounded-md border border-gray-800 overflow-hidden">
        {/* Driver Problems Section */}
        {problemsVisible && (
          <div className="border-b border-gray-700">
            <div className="bg-amber-900/30 p-4 flex justify-between items-center">
              <h3 className="font-semibold text-amber-300 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                Driver Problems from System Logs
              </h3>
              <button 
                onClick={() => setProblemsVisible(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              {driverProblems.length > 0 ? (
                <div className="divide-y divide-gray-700">
                  {driverProblems.map(problem => (
                    <div key={problem.id} className="py-3">
                      <div className="flex items-start">
                        {problem.level === 'Error' ? (
                          <AlertCircle className="h-5 w-5 mt-1 mr-2 text-red-500 flex-shrink-0" />
                        ) : problem.level === 'Warning' ? (
                          <AlertTriangle className="h-5 w-5 mt-1 mr-2 text-amber-500 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-5 w-5 mt-1 mr-2 text-blue-500 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-white">
                            {problem.deviceName}
                            <span className="font-normal text-sm text-gray-400 ml-2">
                              {new Date(problem.time).toLocaleString()}
                            </span>
                          </p>
                          <p className="text-sm text-gray-300 mt-1">{problem.message}</p>
                          <div className="mt-1 flex items-center">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 mr-2">
                              {problem.category}
                            </span>
                            <span className="text-xs text-gray-400">
                              Source: {problem.source}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-300">No driver problems found in system logs.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {sortBy === 'category' ? (
          // Grouped by category with pagination
          Object.entries(pagedCategoryDrivers).length > 0 ? (
            Object.entries(pagedCategoryDrivers).map(([category, categoryDrivers]) => (
              <div key={category} className="border-b border-gray-700 last:border-b-0">
                <h3 className="bg-gray-800 px-6 py-3 font-semibold text-white">
                  {category}
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({driversByCategory[category].length} drivers)
                  </span>
                </h3>
                <div className="divide-y divide-gray-700">
                  {categoryDrivers.map((driver) => renderDriverRow(driver))}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No drivers on this page. Navigate to another page or change filters.</p>
            </div>
          )
        ) : (
          // Not grouped, just a plain list with pagination
          <div className="divide-y divide-gray-700">
            {sortedDrivers
              .slice((currentPage - 1) * driversPerPage, currentPage * driversPerPage)
              .map((driver) => renderDriverRow(driver))}
          </div>
        )}

        {sortedDrivers.length === 0 && (
          <div className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No drivers match your search or filter criteria.</p>
          </div>
        )}
        
        {/* Pagination Controls */}
        {sortedDrivers.length > driversPerPage && (
          <div className="px-6 py-3 bg-gray-800 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              {sortBy === 'category' ? (
                `Page ${currentPage} of ${totalPages}`
              ) : (
                `Showing ${Math.min((currentPage - 1) * driversPerPage + 1, sortedDrivers.length)} to ${Math.min(currentPage * driversPerPage, sortedDrivers.length)} of ${sortedDrivers.length} drivers`
              )}
            </div>
            
            <div className="flex">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-600 rounded-l-md disabled:bg-gray-800 disabled:text-gray-600 hover:bg-gray-700 text-gray-300"
              >
                Prev
              </button>
              <div className="flex border-t border-b border-gray-600">
                {/* Page number buttons - show up to 5 pages */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Calculate which page numbers to show
                  let pageNum;
                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all pages
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // If near the start, show first 5 pages
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // If near the end, show last 5 pages
                    pageNum = totalPages - 4 + i;
                  } else {
                    // Otherwise show current page and 2 pages on either side
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 text-center ${
                        currentPage === pageNum
                          ? 'bg-[#4a6fa5] text-white'
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 border border-gray-600 rounded-r-md disabled:bg-gray-800 disabled:text-gray-600 hover:bg-gray-700 text-gray-300"
              >
                Next
              </button>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-400 mr-2">Drivers per page:</span>
              <select 
                value={driversPerPage} 
                onChange={(e) => {
                  setDriversPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-800 border border-gray-600 rounded p-1 text-gray-300"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function renderDriverRow(driver) {
    const isExpanded = expandedDriver === driver.id;
    
    return (
      <div key={driver.id} className="hover:bg-gray-800 transition-colors">
        <div 
          className="px-6 py-4 flex justify-between items-center cursor-pointer"
          onClick={() => toggleExpandDriver(driver.id)}
        >
          <div className="flex items-center">
            {driver.updateAvailable ? getImportanceIcon(driver.importance) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            <div className="ml-3">
              <h4 className="font-medium text-white">{driver.name}</h4>
              <p className="text-sm text-gray-400">
                {driver.manufacturer} • Version {driver.version}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            {driver.updateAvailable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openUpdateUrl(driver);
                }}
                className="mr-4 px-3 py-1 bg-[#4a6fa5] text-white rounded-md flex items-center text-sm hover:bg-[#5f83b9]"
              >
                <Download className="h-4 w-4 mr-1" />
                Update
              </button>
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
        
        {isExpanded && (
          <div className="px-6 py-4 bg-gray-800 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-300 mb-2">Driver Details</h5>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 text-gray-400 pr-4">Category:</td>
                      <td className="py-1 text-gray-300">{driver.category}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-400 pr-4">Provider:</td>
                      <td className="py-1 text-gray-300">{driver.provider}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-400 pr-4">Version:</td>
                      <td className="py-1 text-gray-300">{driver.version}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-400 pr-4">Date:</td>
                      <td className="py-1 text-gray-300">{driver.date}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h5 className="font-medium text-gray-300 mb-2">Update Status</h5>
                <div className="mb-4">
                  {driver.updateAvailable ? (
                    <div className={`flex items-center ${getImportanceColor(driver.importance)}`}>
                      {getImportanceIcon(driver.importance)}
                      <span className="ml-2">
                        {driver.importance === 'critical' 
                          ? 'Update recommended (Critical)' 
                          : driver.importance === 'medium'
                            ? 'Update recommended (Medium priority)'
                            : 'Update available (Low priority)'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-green-500">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span>Up to date</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  {driver.updateAvailable && (
                    <button
                      onClick={() => openUpdateUrl(driver)}
                      className="px-4 py-2 bg-[#4a6fa5] text-white rounded-md flex items-center text-sm hover:bg-[#5f83b9]"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Update
                    </button>
                  )}
                  <button
                    onClick={() => openDeviceManager(driver.id)}
                    className="px-4 py-2 border border-gray-600 rounded-md flex items-center text-sm hover:bg-gray-700 text-gray-300"
                  >
                    <ExternalLink className="h-4 w-4 mr-2 text-gray-400" />
                    Open in Device Manager
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default DriverUpdates; 