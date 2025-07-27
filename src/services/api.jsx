const API_BASE_URL = 'http://localhost:5000/api';

export const fetchSystemData = async () => {
  try {
    console.log('Fetching system data from:', `${API_BASE_URL}/system/data`);
    const response = await fetch(`${API_BASE_URL}/system/data`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from server:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('System data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching system data:', error);
    throw error;
  }
};

export const diagnoseIssue = async (userInput, systemData) => {
  try {
    console.log('Sending diagnosis request with input:', userInput);
    const response = await fetch(`${API_BASE_URL}/diagnose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput, systemData }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from diagnosis API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Diagnosis received:', data);
    return data;
  } catch (error) {
    console.error('Error diagnosing issue:', error);
    throw error;
  }
};

// Add new functions for system logs
export const fetchSystemLogs = async () => {
  try {
    console.log('Fetching system logs from:', `${API_BASE_URL}/logs`);
    const response = await fetch(`${API_BASE_URL}/logs`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from server:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('System logs received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching system logs:', error);
    throw error;
  }
};

export const analyzeSystemLogs = async () => {
  try {
    console.log('Fetching system logs analysis from:', `${API_BASE_URL}/logs/analyze`);
    const response = await fetch(`${API_BASE_URL}/logs/analyze`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from logs analysis API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('System logs analysis received:', data);
    return data;
  } catch (error) {
    console.error('Error analyzing system logs:', error);
    throw error;
  }
};

// Add new function for logs diagnosis with AI
export const diagnoseSystemLogs = async (query) => {
  try {
    console.log('Sending logs diagnosis request with query:', query);
    const response = await fetch(`${API_BASE_URL}/logs/diagnose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from logs diagnosis API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Logs diagnosis received:', data);
    return data;
  } catch (error) {
    console.error('Error diagnosing system logs:', error);
    throw error;
  }
};

// Add new function for logs agent training
export const trainLogsAgent = async (query, response, wasHelpful, feedback = '') => {
  try {
    console.log('Sending training feedback to logs agent:', { query, wasHelpful, feedback });
    const apiResponse = await fetch(`${API_BASE_URL}/logs/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query, 
        response, 
        wasHelpful, 
        feedback 
      }),
    });
    
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Error response from logs training API:', errorText);
      throw new Error(`HTTP error! status: ${apiResponse.status}`);
    }
    
    const data = await apiResponse.json();
    console.log('Training feedback response:', data);
    return data;
  } catch (error) {
    console.error('Error sending training feedback:', error);
    throw error;
  }
};

// Add new function for predictive analysis
export const fetchPredictiveAnalysis = async () => {
  try {
    console.log('Fetching predictive analysis from:', `${API_BASE_URL}/predictive`);
    const response = await fetch(`${API_BASE_URL}/predictive`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from predictive analysis API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Predictive analysis received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching predictive analysis:', error);
    throw error;
  }
};

// Add new function for AI-analyzed logs
export const fetchAIAnalyzedLogs = async () => {
  try {
    console.log('Fetching AI-analyzed logs from:', `${API_BASE_URL}/logs-analyzer`);
    const response = await fetch(`${API_BASE_URL}/logs-analyzer`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from logs analyzer API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('AI-analyzed logs received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching AI-analyzed logs:', error);
    throw error;
  }
};

// Add new functions for app diagnostics
export const fetchAppDiagnostics = async (appName) => {
  try {
    console.log(`Fetching diagnostics for application: ${appName}`);
    const response = await fetch(`${API_BASE_URL}/app-diagnostics/${encodeURIComponent(appName)}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from app diagnostics API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Application diagnostics received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching app diagnostics:', error);
    throw error;
  }
};

export const fetchSystemDrivers = async () => {
  try {
    console.log('Fetching system drivers');
    const response = await fetch(`${API_BASE_URL}/app-diagnostics/drivers`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from drivers API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('System drivers received:', data);
    return data.drivers;
  } catch (error) {
    console.error('Error fetching system drivers:', error);
    throw error;
  }
};

// Add new functions for real-time app monitoring
export const fetchRunningApplications = async () => {
  try {
    console.log('Fetching running applications');
    const response = await fetch(`${API_BASE_URL}/app-monitoring/running`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from running apps API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Running applications received:', data);
    return data.applications;
  } catch (error) {
    console.error('Error fetching running applications:', error);
    throw error;
  }
};

export const fetchMonitoredApplications = async () => {
  try {
    console.log('Fetching monitored applications');
    const response = await fetch(`${API_BASE_URL}/app-monitoring/status`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from monitored apps API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Monitored applications received:', data);
    return data.applications;
  } catch (error) {
    console.error('Error fetching monitored applications:', error);
    throw error;
  }
};

export const startMonitoringApplication = async (appName, interval = null) => {
  try {
    console.log(`Starting monitoring for application: ${appName}`);
    const url = new URL(`${API_BASE_URL}/app-monitoring/${encodeURIComponent(appName)}`);
    
    // Add interval if provided
    if (interval) {
      url.searchParams.append('interval', interval);
    }
    
    const response = await fetch(url, {
      method: 'POST'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from monitoring start API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Monitoring started:', data);
    return data;
  } catch (error) {
    console.error('Error starting application monitoring:', error);
    throw error;
  }
};

export const stopMonitoringApplication = async (appName) => {
  try {
    console.log(`Stopping monitoring for application: ${appName}`);
    const response = await fetch(`${API_BASE_URL}/app-monitoring/${encodeURIComponent(appName)}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from monitoring stop API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Monitoring stopped:', data);
    return data;
  } catch (error) {
    console.error('Error stopping application monitoring:', error);
    throw error;
  }
};

// OCR functions
export const getOcrStatus = async () => {
  try {
    console.log('Checking OCR service status');
    
    const response = await fetch(`${API_BASE_URL}/ocr/status`);
    
    if (!response.ok) {
      throw new Error(`Failed to get OCR status: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('OCR status received:', data.status);
    return data.status;
  } catch (error) {
    console.error('Error checking OCR status:', error);
    return {
      tesseractAvailable: false,
      mode: 'error',
      message: 'Could not determine OCR status: ' + error.message
    };
  }
};

export const extractTextFromImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    console.log('Uploading image for OCR processing', imageFile.name, 'size:', imageFile.size);
    
    const response = await fetch(`${API_BASE_URL}/ocr/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OCR Upload Error:', response.status, errorText);
      throw new Error(`OCR extraction failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (data.simulated) {
      console.log('OCR SIMULATION MODE - real OCR not available');
    }
    console.log('OCR result received:', data.success, data.text ? `Text length: ${data.text.length}` : 'No text');
    return data;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
};

export const extractTextFromBase64 = async (base64Data) => {
  try {
    // Log only the beginning of the base64 data for debugging
    const dataPreview = base64Data.substring(0, 50) + '...';
    console.log('Processing base64 image for OCR, data preview:', dataPreview);
    console.log('Base64 data length:', base64Data.length);
    
    const response = await fetch(`${API_BASE_URL}/ocr/base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageData: base64Data }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OCR Base64 Error:', response.status, errorText);
      throw new Error(`OCR base64 extraction failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (data.simulated) {
      console.log('OCR SIMULATION MODE - real OCR not available');
    }
    console.log('OCR result received from base64 image:', data.success, data.text ? `Text length: ${data.text.length}` : 'No text');
    return data;
  } catch (error) {
    console.error('Error extracting text from base64 image:', error);
    throw error;
  }
};

export const extractTextFromUrl = async (imageUrl) => {
  try {
    console.log('Processing image URL for OCR:', imageUrl);
    
    const response = await fetch(`${API_BASE_URL}/ocr/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from OCR URL API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.simulated) {
      console.log('OCR SIMULATION MODE - real OCR not available');
    }
    console.log('OCR URL result received:', data);
    return data;
  } catch (error) {
    console.error('Error extracting text from image URL:', error);
    throw error;
  }
};

// Driver update functions
export const getAllDrivers = async () => {
  try {
    console.log('Fetching all installed drivers');
    
    const response = await fetch(`${API_BASE_URL}/driver-updates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch drivers: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Retrieved ${data.drivers?.length || 0} drivers`);
    return data;
  } catch (error) {
    console.error('Error fetching drivers:', error);
    throw error;
  }
};

export const checkDriverUpdates = async () => {
  try {
    console.log('Checking for driver updates');
    
    const response = await fetch(`${API_BASE_URL}/driver-updates/check`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to check for driver updates: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Driver update check complete. Found ${data.summary?.updatesAvailable || 0} updates available`);
    return data;
  } catch (error) {
    console.error('Error checking for driver updates:', error);
    throw error;
  }
};

export const getDeviceManagerCommand = async (deviceId) => {
  try {
    console.log(`Getting device manager command for device ID: ${deviceId}`);
    
    const response = await fetch(`${API_BASE_URL}/driver-updates/device-manager/${encodeURIComponent(deviceId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get device manager command: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting device manager command:', error);
    throw error;
  }
};

// Fetch driver problems from system logs
export const fetchDriverProblems = async () => {
  try {
    console.log('Fetching driver problems from system logs');
    
    const response = await fetch(`${API_BASE_URL}/driver-updates/problems`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch driver problems: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Retrieved ${data.problems?.length || 0} driver problems from logs`);
    return data;
  } catch (error) {
    console.error('Error fetching driver problems:', error);
    throw error;
  }
};

// Disk Partitioning functions
export const fetchDiskInfo = async () => {
  try {
    console.log('Fetching disk information');
    const response = await fetch(`${API_BASE_URL}/disk/info`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from disk info API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Disk information received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching disk information:', error);
    throw error;
  }
};

export const createPartition = async (diskIndex, partitionParams) => {
  try {
    console.log(`Creating partition on disk ${diskIndex}`);
    const response = await fetch(`${API_BASE_URL}/disk/${diskIndex}/partition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partitionParams),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from create partition API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Partition created:', data);
    return data;
  } catch (error) {
    console.error('Error creating partition:', error);
    throw error;
  }
};

export const deletePartition = async (diskIndex, partitionNumber) => {
  try {
    console.log(`Deleting partition ${partitionNumber} on disk ${diskIndex}`);
    const response = await fetch(`${API_BASE_URL}/disk/${diskIndex}/partition/${partitionNumber}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from delete partition API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Partition deleted:', data);
    return data;
  } catch (error) {
    console.error('Error deleting partition:', error);
    throw error;
  }
};

export const automatePartitioning = async (diskIndex, partitionScript, progressCallback) => {
  try {
    console.log(`Automating partitioning for disk ${diskIndex}`);
    
    // Setup for streaming response
    const response = await fetch(`${API_BASE_URL}/disk/automate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        diskIndex,
        script: partitionScript
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from automate partitioning API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // For streaming responses (if implemented on the server)
    if (response.headers.get('Transfer-Encoding') === 'chunked' || 
        response.headers.get('Content-Type') === 'text/event-stream') {
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          try {
            const message = JSON.parse(line);
            if (progressCallback && typeof progressCallback === 'function') {
              progressCallback(message.message, message.type);
            }
          } catch (e) {
            console.warn('Invalid JSON in stream:', line);
            if (progressCallback && typeof progressCallback === 'function') {
              progressCallback(line, 'info');
            }
          }
        }
      }
      
      return { success: true };
    } else {
      // For non-streaming responses
      const data = await response.json();
      
      if (data.logs && Array.isArray(data.logs) && progressCallback) {
        data.logs.forEach(log => {
          progressCallback(log.message, log.type);
        });
      }
      
      console.log('Partitioning completed:', data);
      return data;
    }
  } catch (error) {
    console.error('Error automating partitioning:', error);
    if (progressCallback) {
      progressCallback(`Error: ${error.message}`, 'error');
    }
    throw error;
  }
};

// Network diagnostics functions
export const runNetworkDiagnostics = async () => {
  try {
    console.log('Running network diagnostics');
    const response = await fetch(`${API_BASE_URL}/network/diagnostics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from network diagnostics API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Network diagnostics received:', data);
    return data;
  } catch (error) {
    console.error('Error running network diagnostics:', error);
    throw error;
  }
};

export const getNetworkIssues = async () => {
  try {
    console.log('Getting network issues history');
    const response = await fetch(`${API_BASE_URL}/network/issues`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from network issues API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Network issues received:', data);
    return data;
  } catch (error) {
    console.error('Error getting network issues:', error);
    throw error;
  }
};

export const fixNetworkIssue = async (issueId, fixType) => {
  try {
    console.log(`Fixing network issue ${issueId} with method: ${fixType}`);
    const response = await fetch(`${API_BASE_URL}/network/fix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ issueId, fixType }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from network fix API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Network fix result received:', data);
    return data;
  } catch (error) {
    console.error('Error fixing network issue:', error);
    throw error;
  }
}; 