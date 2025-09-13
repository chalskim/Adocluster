import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProjects, Project as ApiProject } from '../services/api';

interface Project {
  id: string; // Changed from number to string to match API
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed';
  startDate: string;
  documents: number;
  members: number;
  lastUpdate: string;
}

interface TreeNode {
  id: number;
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
  lastModified?: string;
  documentCount?: number;
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
  const [activeTab, setActiveTab] = useState('info');
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([1, 2, 3]));
  const [comment, setComment] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 3;
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch projects from the database
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const fetchedProjects = await fetchProjects(100); // Fetch more projects to enable pagination
        if (fetchedProjects) {
          // Transform API projects to UI projects
          const transformedProjects = fetchedProjects.map((project: ApiProject) => {
            const rawId = (project as any).prjID || (project as any).prjid || (project as any).id;
            return {
              id: rawId ? String(rawId) : '',
              title: project.title,
              description: project.description || '설명이 없습니다',
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
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  // Generate tree data based on selected project
  const generateTreeData = (): TreeNode[] => {
    if (!selectedProject) {
      return [];
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
                type: 'file',
                lastModified: selectedProject.lastUpdate
              }
            ]
          },
          {
            id: 4,
            name: '요구사항',
            type: 'file',
            lastModified: selectedProject.lastUpdate
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
      { id: 1, title: `${selectedProject.title} 프로젝트 가이드`, url: '#' },
      { id: 2, title: '공통 스타일 가이드', url: '#' },
      { id: 3, title: '내부 문서: 프로젝트 설정', url: '#' },
      { id: 4, title: 'UI 컴포넌트 라이브러리', url: '#' }
    ];
  };

  // Generate history based on selected project
  const generateHistory = (): HistoryItem[] => {
    if (!selectedProject) {
      return [];
    }
    
    return [
      { id: 1, user: '시스템', date: selectedProject.startDate, action: `"${selectedProject.title}" 프로젝트 생성` },
      { id: 2, user: '관리자', date: selectedProject.lastUpdate, action: '프로젝트 설정 업데이트' },
      { id: 3, user: '시스템', date: selectedProject.lastUpdate, action: '문서 구조 초기화' },
      { id: 4, user: '관리자', date: selectedProject.lastUpdate, action: '멤버 추가' }
    ];
  };

  const treeData = generateTreeData();
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

    return (
      <div key={node.id} className="tree-item">
        <div 
          className="tree-toggle cursor-pointer py-2"
          style={{ paddingLeft: `${level * 20}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          <div className="tree-content flex items-center">
            {hasChildren ? (
              <div className={`toggle-icon w-5 text-center mr-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                ▶
              </div>
            ) : (
              <div className="w-5 mr-2"></div>
            )}
            <div className="tree-icon w-5 text-center mr-2">
              {node.type === 'folder' ? (
                <i className="fas fa-folder"></i>
              ) : (
                <i className="far fa-file-alt"></i>
              )}
            </div>
            <div className="tree-text">{node.name}</div>
            <div className="tree-meta text-sm text-gray-500 ml-auto">
              {node.type === 'folder' && node.documentCount ? `${node.documentCount} 문서` : `수정: ${node.lastModified}`}
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

  return (
    <div className="projects-page bg-gray-100 p-5">
      {/* 프로젝트 생성 버튼 */}
      <div className="mb-5 text-right">
        <button 
          className="create-project-btn px-5 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
          onClick={() => navigate('/project-setting')}
        >
          <i className="fas fa-plus mr-2"></i> 프로젝트 생성
        </button>
      </div>

      {/* 검색창 */}
      <div className="search-container bg-white p-5 rounded-lg shadow-md mb-5">
        <div className="search-box flex gap-2">
          <input 
            type="text" 
            className="search-input flex-1 px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="프로젝트, 주제, 문서 제목 검색..."
          />
          <button className="search-btn px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <i className="fas fa-search mr-2"></i> 검색
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="main-content flex gap-5 mb-5">
        {/* 좌측: 프로젝트 목록 */}
        <div className="left-panel flex-1 bg-white rounded-lg shadow-md p-5" style={{ height: '760px' }}>
          <div className="panel-header flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-gray-800">프로젝트 목록</h2>
            <a href="#" className="view-all text-blue-500 text-sm hover:text-blue-600">전체 보기</a>
          </div>
          
          {loading ? (
            <div key="loading" className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">프로젝트를 불러오는 중...</p>
            </div>
          ) : projects.length === 0 ? (
            <div key="no-projects" className="text-center py-8">
              <i className="fas fa-folder-open text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">생성된 프로젝트가 없습니다</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                onClick={() => navigate('/project-setting')}
              >
                새 프로젝트 만들기
              </button>
            </div>
          ) : (
            <React.Fragment>
              <div className="project-list flex flex-col gap-3">
                {currentProjects.map(project => (
                  <div 
                    key={project.id} 
                    className={`project-card border border-gray-200 rounded-lg p-2.5 hover:shadow-md transition-shadow flex flex-col ${selectedProject?.id === project.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => handleProjectSelect(project)}
                  >
                    <div className="project-header flex justify-center items-center mb-2">
                      <div className="project-title text-lg font-semibold text-gray-800">{project.title}</div>
                      <div className={`status-badge px-2 py-1 rounded-full text-xs font-medium text-white ml-2 ${getStatusClass(project.status)}`}>
                        {getStatusText(project.status)}
                      </div>
                    </div>
                    <p className="project-desc text-gray-600 text-sm mb-3 leading-tight truncate">{project.description}</p>
                    <div className="project-meta flex flex-wrap justify-center gap-3 text-gray-500 text-sm mb-2">
                      <span className="meta-item flex items-center gap-1">
                        <i className="far fa-calendar text-xs"></i>
                        <span>{project.startDate}</span>
                      </span>
                      <span className="meta-item flex items-center gap-1">
                        <i className="far fa-file text-xs"></i>
                        <span>문서 {project.documents}개</span>
                      </span>
                      <span className="meta-item flex items-center gap-1">
                        <i className="fas fa-users text-xs"></i>
                        <span>멤버 {project.members}명</span>
                      </span>
                    </div>
                    <div className="last-update text-xs text-gray-500 mb-2">마지막 업데이트: {project.lastUpdate}</div>
                    <div className="card-footer mt-auto border-t border-gray-100 flex justify-between items-center">
                      <a 
                        href={`${window.location.origin}/editor?hideSidebar=false&projectId=${project.id}`}
                        className="shortcut-link text-blue-500 text-sm hover:text-blue-700 flex items-center"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const id = project.id;
                          if (!id) {
                            console.error('프로젝트 ID가 없어 에디터를 열 수 없습니다.', project);
                            alert('프로젝트 ID를 확인할 수 없습니다.');
                            return;
                          }
                          const url = `${window.location.origin}/editor?hideSidebar=false&projectId=${id}`;
                          const w = window.open(url, 'adcluster-editor');
                          if (w) w.focus();
                        }}
                      >
                        <i className="fas fa-external-link-alt mr-1 text-xs"></i>
                        바로가기
                      </a>
                      <div className="actions flex gap-1">
                        <button 
                          className="edit-btn text-gray-500 hover:text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add edit logic here when needed
                            console.log(`Edit clicked for project ${project.id}`);
                          }}
                        >
                          <i className="fas fa-edit text-sm"></i>
                        </button>
                        <button 
                          className="delete-btn text-gray-500 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add delete logic here when needed
                            console.log(`Delete clicked for project ${project.id}`);
                          }}
                        >
                          <i className="fas fa-trash text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-controls flex justify-center mt-6">
                  <nav className="flex items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={`page-${pageNumber}`}
                          onClick={() => paginate(pageNumber)}
                          className={`w-10 h-10 rounded-full ${
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
                      className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </nav>
                </div>
              )}
            </React.Fragment>
          )}
        </div>

        {/* 우측: 프로젝트 트리 뷰 */}
        <div className="right-panel flex-1 bg-white rounded-lg shadow-md p-5">
          <div className="panel-header flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-gray-800">프로젝트 트리</h2>
            <a href="#" className="view-all text-blue-500 text-sm hover:text-blue-600">전체 펼치기</a>
          </div>
          {selectedProject ? (
            <ul className="tree-view list-none" key="tree-view-container">
              {treeData.map(node => (
                <li key={`tree-node-${node.id}`}>
                  {renderTreeNode(node)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500" key="tree-placeholder">
              프로젝트를 선택하세요
            </div>
          )}
        </div>
      </div>

      {/* 하단 탭 컨테이너 */}
      <div className="tab-container bg-white rounded-lg shadow-md overflow-hidden">
        <div className="tabs flex border-b border-gray-200">
          <React.Fragment key="tabs-fragment">
            <div 
              key="info"
              className={`tab px-6 py-4 cursor-pointer font-medium ${activeTab === 'info' ? 'text-blue-500 border-b-2 border-blue-500' : 'bg-gray-50 text-gray-600'}`}
              onClick={() => setActiveTab('info')}
            >
              프로젝트 정보
            </div>
            <div 
              key="reference"
              className={`tab px-6 py-4 cursor-pointer font-medium ${activeTab === 'reference' ? 'text-blue-500 border-b-2 border-blue-500' : 'bg-gray-50 text-gray-600'}`}
              onClick={() => setActiveTab('reference')}
            >
              참조
            </div>
            <div 
              key="history"
              className={`tab px-6 py-4 cursor-pointer font-medium ${activeTab === 'history' ? 'text-blue-500 border-b-2 border-blue-500' : 'bg-gray-50 text-gray-600'}`}
              onClick={() => setActiveTab('history')}
            >
              이력관리
            </div>
          </React.Fragment>
        </div>
        
        <div className="tab-content p-5">
          {activeTab === 'info' && selectedProject && (
            <div className="project-info-grid grid grid-cols-1 md:grid-cols-2 gap-5" key="info-tab-content">
              <div key="title" className="info-item mb-4">
                <div className="info-label font-semibold text-gray-800 mb-2">프로젝트 이름</div>
                <div className="info-value text-gray-600">{selectedProject.title}</div>
              </div>
              <div key="status" className="info-item mb-4">
                <div className="info-label font-semibold text-gray-800 mb-2">상태</div>
                <div className="info-value">
                  <span className={`status-badge px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusClass(selectedProject.status)}`}>
                    {getStatusText(selectedProject.status)}
                  </span>
                </div>
              </div>
              <div className="info-item mb-4">
                <div className="info-label font-semibold text-gray-800 mb-2">설명</div>
                <div className="info-value text-gray-600">{selectedProject.description}</div>
              </div>
              <div className="info-item mb-4">
                <div className="info-label font-semibold text-gray-800 mb-2">멤버</div>
                <div className="members flex gap-2 mt-2">
                  {[
                    { id: 1, initial: 'M' },
                    { id: 2, initial: 'K' },
                    { id: 3, initial: 'J' }
                  ].map(member => (
                    <div
                      key={`member-${selectedProject.id}-${member.id}`}
                      className="member-avatar w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold"
                    >
                      {member.initial}
                    </div>
                  ))}
                </div>
              </div>
              <div className="info-item mb-4">
                <div className="info-label font-semibold text-gray-800 mb-2">시작일</div>
                <div className="info-value text-gray-600">{selectedProject.startDate}</div>
              </div>
              <div className="info-item mb-4">
                <div className="info-label font-semibold text-gray-800 mb-2">예상 완료일</div>
                <div className="info-value text-gray-600">-</div>
              </div>
            </div>
          )}
          
          {activeTab === 'reference' && (
            <div className="reference-list grid grid-cols-1 md:grid-cols-2 gap-4" key="reference-tab-content">
              {references.map(ref => (
                <div key={`reference-${ref.id}`} className="reference-card border border-gray-200 rounded-lg p-4">
                  <div className="ref-title font-semibold text-gray-800 mb-2">{ref.title}</div>
                  <div className="ref-url text-blue-500 text-sm break-all">{ref.url}</div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'history' && (
            <div key="history-tab-content">
              <ul className="history-list list-none">
                {history.map(item => (
                  <li key={`history-${item.id}`} className="history-item py-4 border-b border-gray-100">
                    <div className="history-header flex justify-between mb-2">
                      <div className="history-user font-semibold text-gray-800">{item.user}</div>
                      <div className="history-date text-sm text-gray-500">{item.date}</div>
                    </div>
                    <div className="history-action text-gray-600">{item.action}</div>
                  </li>
                ))}
              </ul>
              
              {/* 댓글 섹션 */}
              <div className="comments-section mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">댓글</h3>
                <div className="comment-form flex gap-2 mb-5">
                  <input 
                    type="text" 
                    className="comment-input flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="댓글을 입력하세요..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button 
                    className="comment-btn px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={handleAddComment}
                  >
                    등록
                  </button>
                </div>
                <ul className="comment-list list-none">
                  {comments.map(comment => (
                    <li key={`comment-${comment.id}`} className="comment-item py-4 border-b border-gray-100">
                      <div className="comment-header flex justify-between mb-2">
                        <div className="comment-author font-semibold text-gray-800">{comment.author}</div>
                        <div className="comment-date text-sm text-gray-500">{comment.date}</div>
                      </div>
                      <div className="comment-content text-gray-700 leading-relaxed">{comment.content}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;