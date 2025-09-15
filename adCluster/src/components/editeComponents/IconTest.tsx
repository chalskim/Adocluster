// src/components/editeComponents/IconTest.tsx
import React from 'react';
import Icon from './Icon';

const IconTest: React.FC = () => {
  const testIcons = [
    'folder',
    'folder_open',
    'expand_more',
    'chevron_right',
    'draft',
    'description',
    'image',
    'table_chart',
    'link',
    'calculate',
    'videocam',
    'mic',
    'code',
    'format_quote'
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Icon Test</h1>
      <p>This page tests the local SVG icons vs Material Symbols fallback.</p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {testIcons.map(icon => (
          <div key={icon} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: '10px', 
            border: '1px solid #ccc', 
            borderRadius: '4px' 
          }}>
            <Icon name={icon} style={{ width: '24px', height: '24px' }} />
            <span style={{ marginTop: '5px', fontSize: '12px' }}>{icon}</span>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>File Explorer Test</h2>
        <p>Testing file explorer with local icons:</p>
        <div className="file-explorer-container">
          <div className="file-node">
            <div className="file-item">
              <Icon name="folder" className="file-icon" />
              <span className="file-name">Documents</span>
              <Icon name="expand_more" className="folder-arrow" />
            </div>
            <div className="file-children">
              <div className="file-node">
                <div className="file-item">
                  <Icon name="description" className="file-icon" />
                  <span className="file-name">report.docx</span>
                </div>
              </div>
              <div className="file-node">
                <div className="file-item">
                  <Icon name="description" className="file-icon" />
                  <span className="file-name">notes.md</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconTest;