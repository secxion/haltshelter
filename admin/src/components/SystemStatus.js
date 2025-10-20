import React, { useState, useEffect } from 'react';

const SystemStatus = () => {
  const [systemStatus, setSystemStatus] = useState({
    server: { status: 'checking...', uptime: 0, memory: { used: 0, total: 0 } },
    database: { status: 'checking...', connected: false },
    mainWebsite: { status: 'checking...', url: 'http://localhost:3001' },
    adminPanel: { status: 'online', url: 'http://localhost:3002' }
  });
  
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSystemStatus = async () => {
    try {
      setError(null);
      const response = await fetch('http://localhost:5000/api/system/status');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSystemStatus(data);
      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      setError(error.message);
      setIsLoading(false);
      
      // Set offline status when fetch fails
      setSystemStatus(prev => ({
        ...prev,
        server: { ...prev.server, status: 'offline' },
        database: { ...prev.database, status: 'offline', connected: false },
        mainWebsite: { ...prev.mainWebsite, status: 'offline' }
      }));
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchSystemStatus();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchSystemStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'offline':
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      case 'connecting':
      case 'checking...':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'connected':
        return '●';
      case 'offline':
      case 'disconnected':
        return '●';
      case 'connecting':
      case 'checking...':
        return '○';
      default:
        return '?';
    }
  };

  const formatUptime = (uptime) => {
    if (!uptime) return 'N/A';
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const StatusCard = ({ title, status, details, url }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          <span className="mr-1">{getStatusIcon(status)}</span>
          {status}
        </span>
      </div>
      {details && (
        <div className="mt-2 text-xs text-gray-500">
          {details}
        </div>
      )}
      {url && (
        <div className="mt-1 text-xs text-blue-600 truncate">
          {url}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchSystemStatus}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          <span className="text-xs text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Main Website"
          status={systemStatus.mainWebsite.status}
          url={systemStatus.mainWebsite.url}
        />
        
        <StatusCard
          title="Database"
          status={systemStatus.database.status}
          details={systemStatus.database.connected ? 'Connected' : 'Disconnected'}
        />
        
        <StatusCard
          title="Server"
          status={systemStatus.server.status}
          details={`Uptime: ${formatUptime(systemStatus.server.uptime)} | Memory: ${systemStatus.server.memory?.used || 0}MB`}
        />
        
        <StatusCard
          title="Admin Panel"
          status={systemStatus.adminPanel.status}
          url={systemStatus.adminPanel.url}
        />
      </div>

      {/* Detailed server info */}
      {systemStatus.server.status === 'online' && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Server Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-500">Uptime:</span>
              <div className="font-medium">{formatUptime(systemStatus.server.uptime)}</div>
            </div>
            <div>
              <span className="text-gray-500">Memory Used:</span>
              <div className="font-medium">{systemStatus.server.memory?.used || 0} MB</div>
            </div>
            <div>
              <span className="text-gray-500">Memory Total:</span>
              <div className="font-medium">{systemStatus.server.memory?.total || 0} MB</div>
            </div>
            <div>
              <span className="text-gray-500">Last Check:</span>
              <div className="font-medium">{new Date(systemStatus.server.lastCheck).toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemStatus;
