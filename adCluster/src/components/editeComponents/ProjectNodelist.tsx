import React, { useState } from 'react';
import { TreeNodeData } from '../../data/mockData';

interface ProjectNodelistProps {
  treeData: TreeNodeData[];
  onNodeSelect?: (node: TreeNodeData) => void;
  onAddNode?: () => void;
}

const ProjectNodelist: React.FC<ProjectNodelistProps> = ({ treeData, onNodeSelect, onAddNode }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['project-a']));

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const isExpanded = (nodeId: string) => expandedNodes.has(nodeId);

  const handleNodeClick = (node: TreeNodeData) => {
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  };

  const renderTree = (nodes: TreeNodeData[], level = 0) => {
    return (
      <div className="tree-children">
        {nodes.map(node => (
          <div key={node.id} className="tree-node">
            {node.type === 'folder' ? (
              <div className="tree-item" onClick={() => toggleNode(node.id)}>
                <div className="tree-toggle flex items-center">
                  <i className={`fas ${isExpanded(node.id) ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
                  <i className="fas fa-folder-open" style={{ color: '#3b82f6', marginLeft: '8px', marginRight: '8px' }}></i>
                  <span>{node.name}</span>
                </div>
              </div>
            ) : (
              <div 
                className="tree-item" 
                onClick={() => handleNodeClick(node)}
                style={{ cursor: 'pointer' }}
              >
                <div className="tree-toggle flex items-center">
                  <i className="fas fa-file-alt" style={{ color: '#10b981', marginLeft: '24px', marginRight: '8px' }}></i>
                  <span>{node.name}</span>
                </div>
              </div>
            )}
            {node.children && isExpanded(node.id) && renderTree(node.children, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div id="project-content" className="tab-content">
      <div className="section-title">
        <i 
          className="fas fa-plus" 
          style={{ cursor: 'pointer', color: '#64748b' }} 
          onClick={onAddNode}
        ></i>
      </div>
      {renderTree(treeData)}
    </div>
  );
};

export default ProjectNodelist;