// src/components/editeComponents/FileNode.tsx
import React, { useState } from 'react';
import { FileNodeData } from '../../data/mockData';
import Icon from './Icon';

interface FileNodeProps {
  node: FileNodeData;
}

const FileNode: React.FC<FileNodeProps> = ({ node }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === 'folder';

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    }
  };

  // Map file types to appropriate icons
  const getIconForFileType = (fileType: string | undefined) => {
    if (!fileType) return 'draft';
    
    // Map specific file types to icons
    const iconMap: Record<string, string> = {
      'description': 'description',
      'docx': 'description',
      'md': 'description',
      'image': 'image',
      'table_chart': 'table_chart',
      'table': 'table_chart',
      'link': 'link',
      'calculate': 'calculate',
      'videocam': 'videocam',
      'mic': 'mic',
      'code': 'code',
      'format_quote': 'format_quote'
    };
    
    return iconMap[fileType] || 'draft';
  };

  return (
    <div className="file-node">
      <div className="file-item" onClick={handleToggle}>
        <Icon 
          name={isFolder 
            ? (isOpen ? 'folder_open' : 'folder') 
            : getIconForFileType(node.fileType)
          }
          className="file-icon"
        />
        <span className="file-name">{node.name}</span>
        {isFolder && (
          <Icon 
            name={isOpen ? 'expand_more' : 'chevron_right'}
            className="folder-arrow"
          />
        )}
      </div>
      {isFolder && isOpen && node.children && (
        <div className="file-children">
          {node.children.map(child => <FileNode key={child.id} node={child} />)}
        </div>
      )}
    </div>
  );
};

export default FileNode;