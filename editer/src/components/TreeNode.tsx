// src/components/TreeNode.tsx
import React from 'react';
import type { TreeNodeData } from '../data/mockData';

interface TreeNodeProps {
  node: TreeNodeData;
  selectedNodeId: string | null;
  onNodeSelect: (node: TreeNodeData) => void;
  expandedProjectId: string | null;
  onToggleProject: (projectId: string) => void;
  // 부모가 펼쳐져 있는지 여부를 전달받을 prop 추가
  isParentExpanded?: boolean; 
}

const ICONS: Record<TreeNodeData['type'], string> = {
  folder: 'folder',
  object: 'edit_document',
  note: 'article',
};

const TreeNode = ({ node, selectedNodeId, onNodeSelect, expandedProjectId, onToggleProject, isParentExpanded = false }: TreeNodeProps) => {
  const isSelected = node.id === selectedNodeId;
  const isProject = node.type === 'folder';

  // [핵심 수정] 노드가 펼쳐져야 할 조건 변경:
  // 1. 최상위 프로젝트인 경우: expandedProjectId와 자신의 ID가 일치해야 함
  // 2. 하위 노드인 경우 (object, note): 부모가 펼쳐져 있어야 함
  const isExpanded = isProject ? expandedProjectId === node.id : isParentExpanded;
  
  const handleNodeClick = () => {
    onNodeSelect(node);
    if (isProject) {
      onToggleProject(node.id);
    }
  };

  return (
    <div className={!isProject ? "pl-4" : ""}>
      <div
        onClick={handleNodeClick}
        className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700
         ${isSelected ? 'bg-blue-600 text-white' : ''}
         ${isProject ? 'font-semibold' : ''}`}
      >
        <span className="material-symbols-outlined text-lg">{ICONS[node.type]}</span>
        <span>{node.name}</span>
      </div>
      
      {/* isExpanded 조건에 따라 자식을 렌더링 */}
      {isExpanded && node.children && (
        <div className="children-container">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedNodeId={selectedNodeId}
              onNodeSelect={onNodeSelect}
              expandedProjectId={expandedProjectId}
              onToggleProject={onToggleProject}
              // 자식에게 "너의 부모는 펼쳐져 있다"고 알려줌
              isParentExpanded={true} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;