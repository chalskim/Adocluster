import React from 'react';

const TestTabManagement: React.FC = () => {
  const checkTabStatus = () => {
    const projectId = '66492394-3fd8-45ec-82d3-0740fb96668c';
    const projectTabKey = `project-tab-${projectId}`;
    const existingTabInfo = localStorage.getItem(projectTabKey);
    
    if (existingTabInfo) {
      try {
        const tabInfo = JSON.parse(existingTabInfo);
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - tabInfo.timestamp;
        
        alert(`Tab info found:
        Project ID: ${tabInfo.projectId}
        Tab ID: ${tabInfo.tabId}
        Timestamp: ${tabInfo.timestamp}
        Time since creation: ${Math.floor(timeDiff / 1000)} seconds ago
        Valid: ${timeDiff < 5 * 60 * 1000 ? 'Yes' : 'No (expired)'}`);
      } catch (e) {
        alert('Error parsing tab info: ' + e);
      }
    } else {
      alert('No tab info found for project ' + projectId);
    }
  };

  const clearTabStatus = () => {
    const projectId = '66492394-3fd8-45ec-82d3-0740fb96668c';
    const projectTabKey = `project-tab-${projectId}`;
    localStorage.removeItem(projectTabKey);
    alert('Tab info cleared for project ' + projectId);
  };

  return (
    <div className="p-5">
      <h1>Tab Management Test</h1>
      <button 
        onClick={checkTabStatus}
        className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
      >
        Check Tab Status
      </button>
      <button 
        onClick={clearTabStatus}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Clear Tab Status
      </button>
    </div>
  );
};

export default TestTabManagement;