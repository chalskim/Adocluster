import React, { useState } from 'react';
import { TreeNodeData, FileNodeData, ReferenceItem } from '../../data/mockData';
import TodoList from './TodoList';
import ProjectNodelist from './ProjectNodelist';
import FileNode from './FileNode';
import ReferenceManager from './ReferenceManager';

interface LeftPanelProps {
  onNodeSelect?: (node: TreeNodeData) => void;
  visibleTabs?: {
    project?: boolean;
    library?: boolean;
    references?: boolean;
    tasks?: boolean;
    // Removed data tab visibility
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
    // Removed data tab
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

  // Sample file explorer data (similar to editer project)
  const fileExplorerData: FileNodeData[] = [
    {
      id: 'folder-docs',
      name: '문서',
      type: 'folder',
      fileType: 'description', 
      children: [
        { id: 'file-1', name: '제목 없는 문서.docx', type: 'file', fileType: 'docx' },
        { id: 'file-2', name: '초록.md', type: 'file', fileType: 'md' },
        { id: 'file-3', name: '결론.docx', type: 'file', fileType: 'docx' },
      ],
    },
    { id: 'folder-images', name: '그림', type: 'folder', fileType: 'image' },
    { id: 'folder-tables', name: '표', type: 'folder' , fileType: 'table_chart' },
    { id: 'data-websites', name: '웹사이트', type: 'folder', fileType: 'link' },
    { id: 'data-equations', name: '수식', type: 'folder', fileType: 'calculate' },
    { id: 'data-videos', name: '동영상', type: 'folder', fileType: 'videocam' },
    { id: 'data-audios', name: '음성', type: 'folder', fileType: 'mic' },
    { id: 'data-code', name: '코드 스니펫', type: 'folder', fileType: 'code' },
    { id: 'data-quotes', name: '인용/발췌', type: 'folder', fileType: 'format_quote' },
  ];

  const handleAddNode = () => {
    console.log('Add node clicked');
    // Implement add node functionality here
  };

  // Sample references data
  const sampleReferences: ReferenceItem[] = [
    {
      id: 'ref-1',
      author: 'Smith, J.',
      year: 2020,
      title: 'AI in Content Creation',
      publication: 'Journal of AI Research, 15(3), 123-145',
    },
    {
      id: 'ref-2',
      author: 'Johnson, A.',
      year: 2019,
      title: 'Collaborative Writing Platforms',
      publication: 'Tech Writing Review, 8(2), 67-89',
    },
    {
      id: 'ref-3',
      author: 'Brown, T.',
      year: 2021,
      title: 'Modern Data Visualization Techniques',
      publication: 'Visualization Quarterly, 12(1), 45-67',
    },
  ];

  const handleCiteReference = (reference: ReferenceItem) => {
    console.log('Cite reference:', reference);
    // Implement citation functionality here
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
              <span>참고자료</span>
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
        )}
        {activeTab === 'references' && tabVisibility.references && (
          <div id="references-content" className="tab-content">
            <ReferenceManager 
              references={sampleReferences} 
              onCiteReference={handleCiteReference} 
            />
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