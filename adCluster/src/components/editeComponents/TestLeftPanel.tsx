// TestLeftPanel.tsx
import React from 'react';
import LeftPanel from './LeftPanel';

const TestLeftPanel: React.FC = () => {
  const handleNodeSelect = (node: any) => {
    console.log('Selected node:', node);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <LeftPanel 
        onNodeSelect={handleNodeSelect}
        visibleTabs={{
          project: true,
          library: true,
          references: true,
          tasks: true
        }}
      />
      <div style={{ flex: 1, padding: '20px' }}>
        <h1>Test Page for LeftPanel with Library Tab</h1>
        <p>Check the console when clicking on nodes in the project tab.</p>
        <p>Switch to the Library tab to see the file explorer functionality.</p>
      </div>
    </div>
  );
};

export default TestLeftPanel;