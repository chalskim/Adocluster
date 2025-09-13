import React, { useState } from 'react';
import { TreeNodeData } from '../../data/mockData';
import TodoList from './TodoList';
import ProjectNodelist from './ProjectNodelist';

interface LeftPanelProps {
  onNodeSelect?: (node: TreeNodeData) => void;
  visibleTabs?: {
    project?: boolean;
    library?: boolean;
    references?: boolean;
    tasks?: boolean;
  };
}

const LeftPanel: React.FC<LeftPanelProps> = ({ onNodeSelect, visibleTabs = {} }) => {
  const [activeTab, setActiveTab] = useState('project');

  // props로 전달된 가시성 설정과 기본값 병합
  // 기본값은 모든 탭을 true로 설정하지만, props로 false가 전달되면 false가 우선 적용됨
  const tabVisibility = {
    project: visibleTabs.project !== undefined ? visibleTabs.project : true,
    library: visibleTabs.library !== undefined ? visibleTabs.library : true,
    references: visibleTabs.references !== undefined ? visibleTabs.references : true,
    tasks: visibleTabs.tasks !== undefined ? visibleTabs.tasks : true,
  };

  // 샘플 파일 트리 데이터
  const treeData: TreeNodeData[] = [
    {
      id: 'project-a',
      name: '연구 프로젝트 A',
      type: 'folder',
      children: [
        {
          id: 'note-1',
          name: '1. 서론',
          type: 'note',
        },
        {
          id: 'note-2',
          name: '2. 문헌 리뷰',
          type: 'note',
        },
        {
          id: 'note-3',
          name: '3. 방법론',
          type: 'note',
        },
        {
          id: 'note-4',
          name: '4. 결과 (작성중)',
          type: 'note',
        },
        {
          id: 'note-5',
          name: '5. 결론 (미작성)',
          type: 'note',
        },
      ],
    },
    {
      id: 'project-b',
      name: '연구 프로젝트 B',
      type: 'folder',
      children: [
        {
          id: 'note-6',
          name: '1. 개요',
          type: 'note',
        },
      ],
    },
  ];

  const handleAddNode = () => {
    console.log('Add node clicked');
    // Implement add node functionality here
  };

  return (
    <div className="left-panel">
      <div className="left-tabs">
        <div className="tab-row">
          {tabVisibility.project && (
            <button className={`tab-button ${activeTab === 'project' ? 'active' : ''}`} onClick={() => setActiveTab('project')}>
              <i className="fas fa-folder"></i>
              <span>프로젝트</span>
            </button>
          )}
          {tabVisibility.library && (
            <button className={`tab-button ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>
              <i className="fas fa-upload"></i>
              <span>라이브러리</span>
            </button>
          )}
          {tabVisibility.references && (
            <button className={`tab-button ${activeTab === 'references' ? 'active' : ''}`} onClick={() => setActiveTab('references')}>
              <i className="fas fa-book"></i>
              <span>참고문헌</span>
            </button>
          )}
          {tabVisibility.tasks && (
            <button className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
              <i className="fas fa-check-square"></i>
              <span>할일</span>
            </button>
          )}
        </div>
      </div>

      <div className="left-content">
        {activeTab === 'project' && tabVisibility.project && (
          <ProjectNodelist 
            treeData={treeData} 
            onNodeSelect={onNodeSelect}
            onAddNode={handleAddNode}
          />
        )}
        {activeTab === 'library' && tabVisibility.library && (
          <div id="library-content" className="tab-content">
            <div className="section-title">라이브러리</div>
            <p>라이브러리 기능은 추후 구현 예정입니다.</p>
          </div>
        )}
        {activeTab === 'references' && tabVisibility.references && (
          <div id="references-content" className="tab-content">
            <div className="section-title">참고문헌</div>
            <p>참고문헌 기능은 추후 구현 예정입니다.</p>
          </div>
        )}
        {activeTab === 'tasks' && tabVisibility.tasks && (
          <div id="tasks-content" className="tab-content">
            <TodoList />
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;