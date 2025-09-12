// src/components/FileNode.tsx
import React, { useState } from 'react';
import type { FileNodeData } from '../data/mockData';

interface FileNodeProps {
  node: FileNodeData;
}

const FileNode = ({ node }: FileNodeProps) => {
  // 폴더의 열림/닫힘 상태를 관리
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = node.type === 'folder';

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="file-node">
      <div className="file-item" onClick={handleToggle}>
        <span className="material-symbols-outlined file-icon">
          {isFolder 
            ? (isOpen ? 'folder_open' : 'folder') 
            // fileType을 아이콘 이름으로 직접 사용
            : node.fileType || 'draft' 
          }
        </span>
        <span className="file-name">{node.name}</span>
        {isFolder && (
          <span className="material-symbols-outlined folder-arrow">
            {isOpen ? 'expand_more' : 'chevron_right'}
          </span>
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