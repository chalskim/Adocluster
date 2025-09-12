// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { treeData, fileExplorerData } from '../data/mockData';
import type { TreeNodeData, ReferenceItem } from '../data/mockData';
import TreeNode from './TreeNode';
import FileNode from './FileNode';
import TodoList from './TodoList';
import ReferenceManager from './ReferenceManager';

interface SidebarProps {
  selectedNode: TreeNodeData | null;
  onNodeSelect: (node: TreeNodeData) => void;
  // --- [수정 2] App.tsx로부터 받을 props 추가 ---
  allReferences: ReferenceItem[];
  onCiteReference: (reference: ReferenceItem) => void;
}

const Sidebar = ({ selectedNode, onNodeSelect, allReferences, onCiteReference }: SidebarProps) => {

  const [activeTab, setActiveTab] = useState('project');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(treeData[0]?.id || null);

  const tabs = [
    { id: 'project', label: '프로젝트' },
    { id: 'data', label: '자료' },
    { id: 'references', label: '참고문헌' },
    { id: 'todoList', label: 'Todo List' },
  ];

  const handleToggleProject = (projectId: string) => {
    setExpandedProjectId(prevId => (prevId === projectId ? null : projectId));
  };
  const handleAddObject = () => {
    // selectedNode가 있으면 그 이름을, 없으면 "최상위"를 부모 이름으로 사용
    const parentName = selectedNode?.name || "최상위";
    const newName = window.prompt(`'${parentName}' 아래에 추가할 새 Object의 이름을 입력하세요:`);
    if (newName) {
      // TODO: 실제 데이터 추가 로직 연결 (예: onAddNode('object', selectedNode?.id || null, newName))
      alert(`'${parentName}' 아래 '${newName}' Object 추가 로직 실행`);
    }
  };

  const handleAddNote = () => {
    // Note는 반드시 부모(Object 또는 Project)가 있어야 하므로, selectedNode가 있을 때만 실행
    if (!selectedNode) {
        alert("Note를 추가할 상위 Object나 Project를 먼저 선택해주세요.");
        return;
    }
    const parentName = selectedNode.name;
    const newName = window.prompt(`'${parentName}' 아래에 추가할 새 Note의 이름을 입력하세요:`);
    if (newName) {
      // TODO: 실제 데이터 추가 로직 연결 (예: onAddNode('note', selectedNode.id, newName))
      alert(`'${parentName}' 아래 '${newName}' Note 추가 로직 실행`);
    }
  };
  
  // --- [핵심] 버튼 활성화/비활성화 로직 ---
  // Object는 최상위에도 추가할 수 있고, folder나 object 아래에도 추가할 수 있음
  const canAddObject = !selectedNode || selectedNode.type === 'folder' || selectedNode.type === 'object';
  // Note는 folder나 object 아래에만 추가할 수 있음
  const canAddNote = selectedNode?.type === 'folder' || selectedNode?.type === 'object';

  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="sidebar-content">
        <div className={`tab-pane ${activeTab === 'project' ? 'active' : ''}`}>
          <div className="search-bar-container">
            <span className="material-symbols-outlined search-icon">search</span>
            <input type="text" placeholder="검색..." className="search-input" />
          </div>
                    <div className="fixed-actions-bar">
            <button
              className="btn-icon"
              onClick={handleAddObject}
              disabled={!canAddObject}
              title="새 Object 추가"
            >
              <span className="material-symbols-outlined">create_new_folder</span>
            </button>
            <button
              className="btn-icon"
              onClick={handleAddNote}
              disabled={!canAddNote}
              title="새 Note 추가"
            >
              <span className="material-symbols-outlined">note_add</span>
            </button>
          </div>
          <div className="fixed-actions-bar">
            {treeData.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                // --- [핵심 수정] selectedNode에서 id를 추출하여 전달합니다 ---
                selectedNodeId={selectedNode?.id || null}
                onNodeSelect={onNodeSelect}
                expandedProjectId={expandedProjectId}
                onToggleProject={handleToggleProject} 
              />
            ))}
          </div>
        </div>

        {/* --- 자료 탭 --- */}
        <div className={`tab-pane ${activeTab === 'data' ? 'active' : ''}`}>
          <div className="search-bar-container">
            <span className="material-symbols-outlined search-icon">search</span>
            <input type="text" placeholder="검색..." className="search-input" />
          </div>
          <div className="file-explorer-container">
            {fileExplorerData.map(node => (
              <FileNode key={node.id} node={node} />
            ))}
          </div>
        </div>

        {/* --- 참고문헌 탭 (플레이스홀더) --- */}
        <div className={`tab-pane ${activeTab === 'references' ? 'active' : ''}`}>
          <ReferenceManager 
            references={allReferences} 
            onCiteReference={onCiteReference}
          />
        </div>

        {/* --- Todo List 탭 --- */}
        <div className={`tab-pane ${activeTab === 'todoList' ? 'active' : ''}`}>
          <TodoList />
        </div>
      </div>
    </div>
  );
};

// --- 파일 맨 아래에 이 줄을 추가합니다 ---
export default Sidebar;