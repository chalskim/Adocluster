import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProjects, fetchFoldersByProject, createFolder, deleteFolder, updateFolder, FolderData } from '../services/api';
import { Project, ProjectData, mapProjectDataToProject } from '../types/ProjectTypes';
import EditProjectModal from './EditProjectModal';

interface TreeNode {
  id: number;
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
  documentCount?: number;
  folderId?: string; // 실제 폴더 ID 추가
  isEditing?: boolean; // 편집 모드 상태 추가
}

interface Reference {
  id: number;
  title: string;
  url: string;
}

interface HistoryItem {
  id: number;
  user: string;
  date: string;
  action: string;
}

interface Comment {
  id: number;
  author: string;
  date: string;
  content: string;
}

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'reference' | 'history' | 'review'>('info');
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([1, 2, 3]));
  const [comment, setComment] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 3;
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [editingNodeId, setEditingNodeId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);

  // Fetch projects from the database
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const fetchedProjects = await fetchProjects(100); // Fetch more projects to enable pagination
        if (fetchedProjects) {
          // Transform API projects to UI projects using the utility function
          const transformedProjects = fetchedProjects.map((project: ProjectData) => {
            const baseProject = mapProjectDataToProject(project);
            return {
              ...baseProject,
              status: 'in-progress' as const, // Default status, you might want to map this from project data
              startDate: project.start_date ? new Date(project.start_date).toLocaleDateString('ko-KR') : '날짜 정보 없음',
              documents: 0, // This would need to be fetched from a documents API
              members: 1, // This would need to be fetched from a members API
              lastUpdate: project.update_at ? new Date(project.update_at).toLocaleDateString('ko-KR') : '업데이트 정보 없음'
            };
          });
          setProjects(transformedProjects);
          
          // Set the first project as selected by default
          if (transformedProjects.length > 0) {
            setSelectedProject(transformedProjects[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Calculate pagination values
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Handle project selection
  const handleProjectSelect = async (project: Project) => {
    setSelectedProject(project);
    // 선택된 프로젝트의 폴더 목록 가져오기
    if (project.id) {
      const projectFolders = await fetchFoldersByProject(project.id);
      if (projectFolders) {
        setFolders(projectFolders);
        // 폴더 데이터를 트리 구조로 변환
        const tree = generateTreeDataFromFolders(project, projectFolders);
        setTreeData(tree);
      }
    }
  };

  // Generate tree data based on selected project and folders
  const generateTreeDataFromFolders = (project: Project, folderList: FolderData[]): TreeNode[] => {
    if (!project) {
      return [];
    }
    
    // 폴더를 계층 구조로 변환
    const buildFolderTree = (parentId: number | null = null, nodeId: number = 2): TreeNode[] => {
      return folderList
        .filter(folder => folder.parent_id === parentId)
        .map((folder, index) => ({
          id: nodeId + index,
          name: folder.name,
          type: 'folder' as const,
          folderId: folder.id.toString(), // Convert number to string
          children: buildFolderTree(folder.id, nodeId + folderList.length + index * 10)
        }));
    };

    return [
      {
        id: 1,
        name: project.title,
        type: 'folder',
        documentCount: project.documents,
        children: [
          ...buildFolderTree(), // 실제 폴더들
          {
            id: 1000,
            name: '기본 문서',
            type: 'file'
          }
        ]
      }
    ];
  };

  // Generate tree data based on selected project (fallback)
  const generateTreeData = (): TreeNode[] => {
    if (!selectedProject) {
      return treeData; // 기존 트리 데이터 반환
    }
    
    return [
      {
        id: 1,
        name: selectedProject.title,
        type: 'folder',
        documentCount: selectedProject.documents,
        children: [
          {
            id: 2,
            name: '문서',
            type: 'folder',
            documentCount: selectedProject.documents,
            children: [
              {
                id: 3,
                name: '기본 문서',
                type: 'file'
              }
            ]
          },
          {
            id: 4,
            name: '요구사항',
            type: 'file'
          }
        ]
      }
    ];
  };

  // Generate references based on selected project
  const generateReferences = (): Reference[] => {
    if (!selectedProject) {
      return [];
    }
    
    return [
      { id: 1, title: `${selectedProject.title} 연구 프로젝트 가이드`, url: '#' },
      { id: 2, title: '공통 스타일 가이드', url: '#' },
      { id: 3, title: '내부 문서: 연구 프로젝트 설정', url: '#' },
      { id: 4, title: 'UI 컴포넌트 라이브러리', url: '#' }
    ];
  };

  // Generate history based on selected project
  const generateHistory = (): HistoryItem[] => {
    if (!selectedProject) {
      return [];
    }
    
    return [
      { id: 1, user: '시스템', date: selectedProject?.startDate || '', action: `"${selectedProject?.title || ''}" 연구 프로젝트 생성` },
      { id: 2, user: '관리자', date: selectedProject?.lastUpdate || '', action: '연구 프로젝트 설정 업데이트' },
      { id: 3, user: '시스템', date: selectedProject?.lastUpdate || '', action: '문서 구조 초기화' },
      { id: 4, user: '관리자', date: selectedProject?.lastUpdate || '', action: '멤버 추가' }
    ];
  };

  // 폴더 추가 함수
  const handleAddFolder = async (parentNodeId?: number) => {
    if (!selectedProject?.id) return;

    const folderName = prompt('새 폴더 이름을 입력하세요:');
    if (!folderName) return;

    // 부모 폴더 ID 찾기
    let parentFolderId: string | undefined;
    if (parentNodeId && parentNodeId !== 1) {
      const findParentFolder = (nodes: TreeNode[]): string | undefined => {
        for (const node of nodes) {
          if (node.id === parentNodeId && node.folderId) {
            return node.folderId;
          }
          if (node.children) {
            const found = findParentFolder(node.children);
            if (found) return found;
          }
        }
        return undefined;
      };
      parentFolderId = findParentFolder(treeData);
    }

    const newFolder = await createFolder({
      name: folderName,
      project_id: selectedProject.id,
      parent_id: parentFolderId
    });

    if (newFolder) {
      // 폴더 목록 새로고침
      const updatedFolders = await fetchFoldersByProject(selectedProject.id);
      if (updatedFolders) {
        setFolders(updatedFolders);
        const tree = generateTreeDataFromFolders(selectedProject, updatedFolders);
        setTreeData(tree);
      }
    }
  };

  // 폴더 삭제 함수
  const handleDeleteFolder = async (nodeId: number) => {
    const findFolderToDelete = (nodes: TreeNode[]): string | undefined => {
      for (const node of nodes) {
        if (node.id === nodeId && node.folderId) {
          return node.folderId;
        }
        if (node.children) {
          const found = findFolderToDelete(node.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    const folderId = findFolderToDelete(treeData);
    if (!folderId) return;

    if (confirm('이 폴더를 삭제하시겠습니까?')) {
      const success = await deleteFolder(folderId);
      if (success && selectedProject?.id) {
        // 폴더 목록 새로고침
        const updatedFolders = await fetchFoldersByProject(selectedProject.id);
        if (updatedFolders) {
          setFolders(updatedFolders);
          const tree = generateTreeDataFromFolders(selectedProject, updatedFolders);
          setTreeData(tree);
        }
      }
    }
  };

  // 폴더 이름 편집 시작
  const handleStartEdit = (nodeId: number, currentName: string) => {
    setEditingNodeId(nodeId);
    setEditingName(currentName);
  };

  // 폴더 이름 편집 완료
  const handleFinishEdit = async (nodeId: number) => {
    const findFolderToUpdate = (nodes: TreeNode[]): string | undefined => {
      for (const node of nodes) {
        if (node.id === nodeId && node.folderId) {
          return node.folderId;
        }
        if (node.children) {
          const found = findFolderToUpdate(node.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    const folderId = findFolderToUpdate(treeData);
    if (!folderId || !editingName.trim()) {
      setEditingNodeId(null);
      setEditingName('');
      return;
    }

    const updatedFolder = await updateFolder(folderId, { name: editingName.trim() });
    if (updatedFolder && selectedProject?.id) {
      // 폴더 목록 새로고침
      const updatedFolders = await fetchFoldersByProject(selectedProject.id);
      if (updatedFolders) {
        setFolders(updatedFolders);
        const tree = generateTreeDataFromFolders(selectedProject, updatedFolders);
        setTreeData(tree);
      }
    }

    setEditingNodeId(null);
    setEditingName('');
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setEditingNodeId(null);
    setEditingName('');
  };

  const references = generateReferences();
  const history = generateHistory();

  const comments: Comment[] = [
    { id: 1, author: '김개발', date: '2023.11.20 15:30', content: '홈페이지 레이아웃에 대한 피드백 주세요. 특히 네비게이션 영역에 대한 의견이 필요합니다.' },
    { id: 2, author: '이디자인', date: '2023.11.20 14:45', content: '전반적으로 좋아 보입니다. 다만 폰트 크기를 조금 더 키우는 것을 고려해보세요.' },
    { id: 3, author: '박매니저', date: '2023.11.19 17:20', content: '진행 상황 확인했습니다. 기한 내에 완료될 수 있도록 해주세요.' }
  ];

  const toggleNode = (id: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-500';
      case 'in-progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return '계획 중';
      case 'in-progress': return '진행 중';
      case 'completed': return '완료됨';
      default: return status;
    }
  };

  const renderTreeNode = (node: TreeNode, level = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isEditing = editingNodeId === node.id;

    return (
      <div key={node.id} className="tree-item w-full">
        <div 
          className="tree-toggle cursor-pointer py-1.5 w-full group"
          style={{ paddingLeft: `${level * 16}px` }}
        >
          <div className="tree-content flex items-center justify-between w-full">
            <div className="flex items-center flex-1" onClick={() => hasChildren && toggleNode(node.id)}>
              {hasChildren ? (
                <div className={`toggle-icon w-4 text-center mr-1.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                  ▶
                </div>
              ) : (
                <div className="w-4 mr-1.5"></div>
              )}
              <div className="tree-icon w-4 text-center mr-1.5">
                {node.type === 'folder' ? (
                  <i className="fas fa-folder"></i>
                ) : (
                  <i className="far fa-file-alt"></i>
                )}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleFinishEdit(node.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFinishEdit(node.id);
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  className="tree-text flex-1 text-sm border border-blue-300 rounded px-1"
                  autoFocus
                />
              ) : (
                <div className="tree-text flex-1 text-sm">{node.name}</div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <div className="tree-meta text-xs text-gray-500 mr-2">
                {node.type === 'folder' && node.documentCount ? `${node.documentCount} 문서` : ``}
              </div>
              {/* 폴더 관리 버튼들 (폴더이고 루트가 아닐 때만 표시) */}
              {node.type === 'folder' && node.folderId && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddFolder(node.id);
                    }}
                    className="text-green-500 hover:text-green-700 text-xs"
                    title="하위 폴더 추가"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(node.id, node.name);
                    }}
                    className="text-blue-500 hover:text-blue-700 text-xs"
                    title="폴더 이름 수정"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(node.id);
                    }}
                    className="text-red-500 hover:text-red-700 text-xs"
                    title="폴더 삭제"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              )}
              {/* 루트 폴더에는 추가 버튼만 표시 */}
              {node.id === 1 && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddFolder(node.id);
                    }}
                    className="text-green-500 hover:text-green-700 text-xs"
                    title="폴더 추가"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="tree-children">
            {node.children?.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      // In a real app, you would add the comment to the state
      setComment('');
      alert('댓글이 등록되었습니다.');
    }
  };

  // Add this function to handle project updates
  const handleProjectUpdate = (updatedProject: ProjectData) => {
    // Transform the updated project to UI format
    const transformedProject = {
      ...mapProjectDataToProject(updatedProject),
      status: 'in-progress' as const,
      startDate: updatedProject.start_date ? new Date(updatedProject.start_date).toLocaleDateString('ko-KR') : '날짜 정보 없음',
      documents: 0,
      members: 1,
      lastUpdate: updatedProject.update_at ? new Date(updatedProject.update_at).toLocaleDateString('ko-KR') : '업데이트 정보 없음'
    };

    // Update the projects list
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === transformedProject.id ? transformedProject : project
      )
    );

    // If the updated project is the selected project, update it too
    if (selectedProject && selectedProject.id === transformedProject.id) {
      setSelectedProject(transformedProject);
    }
  };

  return (
    <div className="projects-page bg-gray-100 px-1 py-1.5 sm:p-3">
      {/* 페이지 제목과 프로젝트 생성 버튼 */}
      <div className="mb-2 sm:mb-3 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">연구 프로젝트 관리</h1>
        <button 
          className="create-project-btn px-2.5 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm"
          onClick={() => navigate('/project-setting')}
        >
          <i className="fas fa-plus mr-1 sm:mr-1.5"></i> 
          <span className="hidden sm:inline">연구 프로젝트 생성</span>
          <span className="sm:hidden">프로젝트 생성</span>
        </button>
      </div>

      {/* 검색창 */}
      <div className="search-container bg-white p-1.5 sm:p-3 rounded-lg shadow-md mb-2 sm:mb-3">
        <div className="search-box flex gap-1.5">
          <input 
            type="text" 
            className="search-input flex-1 px-2.5 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
            placeholder="연구 프로젝트, 주제, 문서 제목 검색..."
          />
          <button className="search-btn px-2.5 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm">
            <i className="fas fa-search mr-1 sm:mr-1.5"></i> 
            <span className="hidden sm:inline">검색</span>
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="main-content flex flex-col md:flex-row gap-1.5 sm:gap-3 mb-2 sm:mb-3">
        {/* 좌측: 연구 프로젝트 목록 */}
        <div className="projects-left-panel w-full md:flex-1 bg-white rounded-lg shadow-md p-1.5 sm:p-3 lg:h-[700px] overflow-y-auto">
          <div className="panel-header flex justify-between items-center mb-2 sm:mb-3">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">연구 프로젝트 목록</h2>
          </div>
          
          {loading ? (
            <div key="loading" className="text-center py-6">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-1.5 text-gray-600 text-sm">연구 프로젝트를 불러오는 중...</p>
            </div>
          ) : projects.length === 0 ? (
            <div key="no-projects" className="text-center py-6">
              <i className="fas fa-folder-open text-3xl text-gray-300 mb-3"></i>
              <p className="text-gray-600 text-sm">생성된 연구 프로젝트가 없습니다</p>
              <button 
                className="mt-3 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                onClick={() => navigate('/project-setting')}
              >
                새 연구 프로젝트 만들기
              </button>
            </div>
          ) : (
            <React.Fragment>
              <div className="project-list grid grid-cols-1 gap-2">
                {currentProjects.map(project => (
                  <div 
                    key={project.id} 
                    className={`project-card border border-gray-200 rounded-lg p-1.5 sm:p-2 hover:shadow-md transition-shadow flex flex-col w-full ${selectedProject?.id === project.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => handleProjectSelect(project)}
                  >
                    <div className="project-header flex justify-between items-start mb-1.5">
                      <div className="project-title text-sm font-semibold text-gray-800 flex-1 pr-1.5">{project.title}</div>
                      <div className={`status-badge px-1.5 py-0.5 rounded-full text-xs font-medium text-white flex-shrink-0 ${getStatusClass(project.status || 'in-progress')}`}>
                        {getStatusText(project.status || 'in-progress')}
                      </div>
                    </div>
                    <p className="project-desc text-gray-600 text-xs mb-1.5 leading-tight line-clamp-2">{project.description}</p>
                    <div className="project-meta flex justify-between items-center text-gray-500 text-xs mb-1.5">
                      <div className="meta-left flex flex-wrap gap-1.5">
                        <span className="meta-item flex items-center gap-1">
                          <i className="far fa-calendar text-xs"></i>
                          <span className="hidden sm:inline">{project.startDate}</span>
                          <span className="sm:hidden">{project.startDate.split('-')[1]}/{project.startDate.split('-')[2]}</span>
                        </span>
                        <span className="meta-item flex items-center gap-1">
                          <i className="far fa-file text-xs"></i>
                          <span className="hidden sm:inline">문서 {project.documents}개</span>
                          <span className="sm:hidden">{project.documents}</span>
                        </span>
                      </div>
                      <div className="meta-right">
                        <span className="meta-item flex items-center gap-1">
                          <i className="fas fa-users text-xs"></i>
                          <span className="hidden sm:inline">멤버 {project.members}명</span>
                          <span className="sm:hidden">{project.members}</span>
                        </span>
                      </div>
                    </div>
                    <div className="last-update text-xs text-gray-500 mb-1.5 hidden sm:block">마지막 업데이트: {project.lastUpdate}</div>
                    <div className="card-footer mt-auto pt-1.5 border-t border-gray-100 flex justify-between items-center">
                      <a 
                        href={`${window.location.origin}/editor?hideSidebar=false&projectId=${project.id}`}
                        className="shortcut-link text-blue-500 text-xs hover:text-blue-700 flex items-center"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const id = project.id;
                          
                          // Enhanced ID validation with detailed logging
                          console.log('바로가기 버튼 클릭:', {
                            projectTitle: project.title,
                            projectId: id,
                            projectIdType: typeof id,
                            projectIdLength: id ? id.length : 0,
                            fullProject: project
                          });
                          
                          if (!id || id.trim() === '') {
                            console.error('연구 프로젝트 ID가 없거나 비어있습니다:', {
                              project: project,
                              id: id,
                              idType: typeof id
                            });
                            alert(`연구 프로젝트 ID를 확인할 수 없습니다.\n프로젝트: ${project.title}\nID: ${id || '없음'}`);
                            return;
                          }
                          
                          const url = `${window.location.origin}/editor?hideSidebar=false&projectId=${id}`;
                          console.log('에디터 URL 생성:', url);
                          
                          // 팝업 차단 문제를 해결하기 위해 여러 방법 시도
                          try {
                            // 방법 1: 새 탭에서 열기 (Ctrl/Cmd 키 시뮬레이션)
                            const newWindow = window.open(url, '_blank');
                            if (newWindow) {
                              newWindow.focus();
                              console.log('에디터 창이 새 탭에서 성공적으로 열렸습니다.');
                            } else {
                              // 방법 2: 팝업이 차단된 경우 현재 탭에서 열기
                              console.warn('새 탭 열기가 차단되었습니다. 현재 탭에서 이동합니다.');
                              if (confirm('새 탭에서 에디터를 열 수 없습니다. 현재 탭에서 에디터로 이동하시겠습니까?')) {
                                window.location.href = url;
                              }
                            }
                          } catch (error) {
                            console.error('에디터 열기 중 오류 발생:', error);
                            // 방법 3: 오류 발생 시 직접 링크 클릭 방식
                            const link = document.createElement('a');
                            link.href = url;
                            link.target = '_blank';
                            link.rel = 'noopener noreferrer';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                      >
                        <i className="fas fa-external-link-alt mr-1 text-xs"></i>
                        <span className="hidden sm:inline">바로가기</span>
                        <span className="sm:hidden">열기</span>
                      </a>
                      <div className="actions flex gap-1">
                        <button 
                          className="edit-btn text-gray-500 hover:text-gray-700 p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open edit modal with the project data
                            // Convert Project to ProjectData format for the modal
                            const projectData: ProjectData = {
                              prjid: project.id,
                              crtID: project.creatorId,
                              title: project.title,
                              description: project.description,
                              visibility: project.visibility,
                              start_date: project.startDate,
                              end_date: project.endDate || null,
                              created_at: project.createdAt,
                              update_at: project.updatedAt
                            };
                            setEditingProject(projectData);
                          }}
                        >
                          <i className="fas fa-edit text-xs"></i>
                        </button>
                        <button 
                          className="delete-btn text-gray-500 hover:text-red-500 p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add delete logic here when needed
                            console.log(`Delete clicked for project ${project.id}`);
                          }}
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-controls flex justify-center mt-4">
                  <nav className="flex items-center gap-1.5">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-2 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={`page-${pageNumber}`}
                          onClick={() => paginate(pageNumber)}
                          className={`w-8 h-8 rounded-full ${
                            currentPage === pageNumber
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-2 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </nav>
                </div>
              )}
            </React.Fragment>
          )}
        </div>

        {/* 우측: 연구 노트 뷰 */}
        <div className="projects-right-panel w-full md:flex-1 bg-white rounded-lg shadow-md p-1.5 sm:p-3 lg:h-[700px] overflow-y-auto">
          <div className="panel-header flex justify-between items-center mb-2 sm:mb-3">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">연구 노트</h2>
            <a href="/document-management" className="view-all text-blue-500 text-xs hover:text-blue-600">연구 노트 관리</a>
          </div>
          {selectedProject ? (
            <ul className="tree-view list-none w-full" key="tree-view-container">
              {treeData.map(node => (
                <li key={`tree-node-${node.id}`} className="w-full">
                  {renderTreeNode(node)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm" key="tree-placeholder">
              연구 프로젝트를 선택하세요
            </div>
          )}
        </div>
      </div>

      {/* 하단 탭 컨테이너 */}
      <div className="tab-container bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bottom-tabs-container flex flex-wrap">
            <button 
              key="info"
              className={`bottom-tab flex-1 ${
                activeTab === 'info' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('info')}
            >
              <span className="tab-icon">📊</span>
              <span className="hidden sm:inline">연구정보</span>
              <span className="sm:hidden">정보</span>
            </button>
            <button 
              key="reference"
              className={`bottom-tab flex-1 ${
                activeTab === 'reference' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('reference')}
            >
              <span className="tab-icon">📚</span>
              <span className="hidden sm:inline">출처정보</span>
              <span className="sm:hidden">출처</span>
            </button>
            <button 
              key="history"
              className={`bottom-tab flex-1 ${
                activeTab === 'history' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('history')}
            >
              <span className="tab-icon">📝</span>
              <span className="hidden sm:inline">이력</span>
              <span className="sm:hidden">이력</span>
            </button>
            <button 
              key="review"
              className={`bottom-tab flex-1 ${
                activeTab === 'review' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('review')}
            >
              <span className="tab-icon">⭐</span>
              <span className="hidden sm:inline">리뷰/피드백</span>
              <span className="sm:hidden">리뷰</span>
              <span className="notification-badge">3</span>
            </button>
          </div>
        
        <div className="tab-content p-1.5 sm:p-3">
          {activeTab === 'info' && selectedProject && (
            <div className="project-info-grid grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3" key="info-tab-content">
              <div key="title" className="info-item mb-2">
                <div className="info-label font-semibold text-gray-800 mb-1.5 text-sm">연구 프로젝트 이름</div>
                <div className="info-value text-gray-600 text-sm">{selectedProject.title}</div>
              </div>
              <div key="status" className="info-item mb-2">
                <div className="info-label font-semibold text-gray-800 mb-1.5 text-sm">상태</div>
                <div className="info-value">
                  <span className={`status-badge px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full text-xs font-medium text-white ${getStatusClass(selectedProject?.status || 'in-progress')}`}>
                    {getStatusText(selectedProject?.status || 'in-progress')}
                  </span>
                </div>
              </div>
              <div className="info-item mb-3">
                <div className="info-label font-semibold text-gray-800 mb-1.5">설명</div>
                <div className="info-value text-gray-600 text-sm">{selectedProject.description}</div>
              </div>
              <div className="info-item mb-3">
                <div className="info-label font-semibold text-gray-800 mb-1.5">목표</div>
                <div className="info-value text-gray-600">
                  <ul className="list-disc list-inside space-y-1 text-left text-sm">
                    <li>연구 데이터 수집 및 분석 시스템 구축</li>
                    <li>효율적인 프로젝트 관리 도구 개발</li>
                    <li>팀 협업 워크플로우 최적화</li>
                  </ul>
                </div>
              </div>
              <div className="info-item mb-3">
                <div className="info-label font-semibold text-gray-800 mb-1.5">키워드</div>
                <div className="info-value">
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    <span className="keyword-tag px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">데이터 분석</span>
                    <span className="keyword-tag px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">프로젝트 관리</span>
                    <span className="keyword-tag px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">협업 도구</span>
                    <span className="keyword-tag px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">워크플로우</span>
                    <span className="keyword-tag px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">시스템 구축</span>
                  </div>
                </div>
              </div>
              <div className="info-item mb-3">
                <div className="info-label font-semibold text-gray-800 mb-1.5">멤버</div>
                <div className="members flex gap-1.5 mt-1.5 justify-center">
                  {[
                    { id: 1, initial: 'M' },
                    { id: 2, initial: 'K' },
                    { id: 3, initial: 'J' }
                  ].map(member => (
                    <div
                      key={`member-${selectedProject.id}-${member.id}`}
                      className="member-avatar w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm"
                    >
                      {member.initial}
                    </div>
                  ))}
                </div>
              </div>
              <div className="info-item mb-3">
                <div className="info-label font-semibold text-gray-800 mb-1.5">시작일</div>
                <div className="info-value text-gray-600 text-sm">{selectedProject.startDate}</div>
              </div>
              <div className="info-item mb-3">
                <div className="info-label font-semibold text-gray-800 mb-1.5">예상 완료일</div>
                <div className="info-value text-gray-600 text-sm">-</div>
              </div>
            </div>
          )}
          
          {activeTab === 'reference' && (
            <div className="reference-list grid grid-cols-1 md:grid-cols-2 gap-3" key="reference-tab-content">
              {references.map(ref => (
                <div key={`reference-${ref.id}`} className="reference-card border border-gray-200 rounded-lg p-3">
                  <div className="ref-title font-semibold text-gray-800 mb-1.5 text-sm">{ref.title}</div>
                  <div className="ref-url text-blue-500 text-xs break-all">{ref.url}</div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'history' && (
            <div key="history-tab-content">
              <ul className="history-list list-none">
                {history.map(item => (
                  <li key={`history-${item.id}`} className="history-item py-3 border-b border-gray-100">
                    <div className="history-header flex justify-between mb-1.5">
                      <div className="history-user font-semibold text-gray-800 text-sm">{item.user}</div>
                      <div className="history-date text-xs text-gray-500">{item.date}</div>
                    </div>
                    <div className="history-action text-gray-600 text-sm">{item.action}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {activeTab === 'review' && (
            <div className="review-feedback-section" key="review-tab-content">




              {/* 피드백 섹션 */}
              <div className="feedback-section">
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-1.5">💬</span>
                  리뷰/피드백
                </h3>
                


                {/* 기존 피드백 목록 */}
                <div className="feedback-list space-y-3">
                  {[
                    {
                      id: 1,
                      author: "최연구원",
                      type: "improvement",
                      date: "2024-01-14",
                      content: "그래프의 색상 대비를 높이면 가독성이 더 좋아질 것 같습니다. 특히 색맹인 분들도 구분하기 쉽도록 패턴을 추가하는 것은 어떨까요?",
                      status: "pending"
                    },
                    {
                      id: 2,
                      author: "정교수",
                      type: "question",
                      date: "2024-01-13",
                      content: "실험 설계에서 통제 변수 설정 기준이 궁금합니다. 추가 설명을 부탁드립니다.",
                      status: "answered"
                    },
                    {
                      id: 3,
                      author: "한박사",
                      type: "compliment",
                      date: "2024-01-11",
                      content: "통계 분석 방법이 매우 적절하고 결과 해석도 명확합니다. 훌륭한 연구입니다!",
                      status: "acknowledged"
                    }
                  ].map(feedback => (
                    <div key={`feedback-${feedback.id}`} className="feedback-card bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                      <div className="feedback-header flex justify-between items-start mb-2">
                        <div className="feedback-info">
                          <div className="feedback-author font-semibold text-gray-800 text-sm">{feedback.author}</div>
                          <div className="feedback-meta flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span className="feedback-date">{feedback.date}</span>
                            <span className={`feedback-type px-1.5 py-0.5 rounded-full text-xs ${
                              feedback.type === 'improvement' ? 'bg-green-100 text-green-800' :
                              feedback.type === 'question' ? 'bg-yellow-100 text-yellow-800' :
                              feedback.type === 'compliment' ? 'bg-purple-100 text-purple-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {feedback.type === 'improvement' ? '개선 제안' :
                               feedback.type === 'question' ? '질문' :
                               feedback.type === 'compliment' ? '칭찬' : '우려사항'}
                            </span>
                          </div>
                        </div>
                        <span className={`status-badge px-1.5 py-0.5 rounded-full text-xs ${
                          feedback.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          feedback.status === 'answered' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {feedback.status === 'pending' ? '대기중' :
                           feedback.status === 'answered' ? '답변완료' : '확인완료'}
                        </span>
                      </div>
                      <div className="feedback-content text-gray-700 leading-relaxed text-sm">
                        {feedback.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add the EditProjectModal component */}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onUpdate={handleProjectUpdate}
        />
      )}
    </div>
  );
};

export default Projects;