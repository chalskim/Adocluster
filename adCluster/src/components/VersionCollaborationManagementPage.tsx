import React, { useState } from 'react';

interface VersionHistoryItem {
  id: number;
  title: string;
  author: string;
  date: string;
  description: string;
  isBookmarked: boolean;
  comments: number;
}

interface Comment {
  id: number;
  versionId: number;
  author: string;
  content: string;
  date: string;
  mentions: string[];
}

// Add Project interface
interface Project {
  id: string;
  name: string;
}

// Add Document interface
interface Document {
  id: string;
  name: string;
  projectId: string;
  title: string;
  date: string;
}

const VersionCollaborationManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'comparison'>('history');
  const [selectedProject, setSelectedProject] = useState<string>(''); // Add project selection
  const [selectedDocument, setSelectedDocument] = useState<string>(''); // Add document selection
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [compareVersion1, setCompareVersion1] = useState<number | null>(null);
  const [compareVersion2, setCompareVersion2] = useState<number | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedVersionForComment, setSelectedVersionForComment] = useState<number | null>(null);

  // Mock data for projects
  const projects: Project[] = [
    { id: '1', name: '연구 프로젝트 A' },
    { id: '2', name: '연구 프로젝트 B' },
    { id: '3', name: '연구 프로젝트 C' },
  ];

  // Mock data for documents
  const documents: Document[] = [
    { id: 'd1', name: '웹사이트 리디자인 연구 프로젝트 계획서', projectId: '1', title: '웹사이트 리디자인 연구 프로젝트 계획서', date: '2025-09-13' },
    { id: 'd2', name: '모바일 앱 사용자 경험 분석 보고서', projectId: '1', title: '모바일 앱 사용자 경험 분석 보고서', date: '2025-09-10' },
    { id: 'd3', name: '데이터 분석 방법론 문서', projectId: '2', title: '데이터 분석 방법론 문서', date: '2025-09-12' },
    { id: 'd4', name: 'AI 알고리즘 최적화 연구', projectId: '3', title: 'AI 알고리즘 최적화 연구', date: '2025-09-08' },
  ];

  // Mock data for version history
  const versionHistory: VersionHistoryItem[] = [
    {
      id: 10,
      title: '논문 개요 수정',
      author: '김개발',
      date: '2023-11-20 14:30',
      description: '연구 목적과 범위 명확화, 관련 연구 추가',
      isBookmarked: true,
      comments: 3
    },
    {
      id: 9,
      title: '실험 설계 변경',
      author: '박연구원',
      date: '2023-11-19 16:45',
      description: '샘플 크기 증가, 통계 방법 수정',
      isBookmarked: false,
      comments: 1
    },
    {
      id: 8,
      title: '참고문헌 추가',
      author: '이석사',
      date: '2023-11-18 10:15',
      description: '최근 5년간 관련 논문 15개 추가',
      isBookmarked: false,
      comments: 0
    },
    {
      id: 7,
      title: '데이터 분석 결과 업데이트',
      author: '최분석',
      date: '2023-11-17 15:30',
      description: '회귀 분석 결과 재계산, 그래프 수정',
      isBookmarked: true,
      comments: 5
    },
    {
      id: 6,
      title: '서론 부분 개선',
      author: '정박사',
      date: '2023-11-16 09:20',
      description: '문제 정의 명확화, 연구 질문 재구성',
      isBookmarked: false,
      comments: 2
    }
  ];

  // Mock data for comments
  const comments: Comment[] = [
    {
      id: 1,
      versionId: 10,
      author: '박연구원',
      content: '연구 목적 부분이 더 명확해졌네요. 다만 범위가 너무 넓어진 것 같아요.',
      date: '2023-11-20 15:00',
      mentions: ['김개발']
    },
    {
      id: 2,
      versionId: 10,
      author: '김개발',
      content: '@박연구원 범위 조정하겠습니다. @이석사 의견도 주세요.',
      date: '2023-11-20 15:30',
      mentions: ['박연구원', '이석사']
    },
    {
      id: 3,
      versionId: 10,
      author: '이석사',
      content: '범위는 유지하되 각 항목의 설명을 더 구체화하는 방향은 어떨까요?',
      date: '2023-11-20 16:00',
      mentions: []
    }
  ];

  // Filter documents based on selected project
  const filteredDocuments = selectedProject 
    ? documents.filter(doc => doc.projectId === selectedProject)
    : documents;

  // Filter versions based on selected document
  const filteredVersions = versionHistory.filter(version => {
    // If a document is selected, only show versions of that document
    if (selectedDocument) {
      return version.title.includes(selectedDocument);
    }
    // If a project is selected, only show versions of documents in that project
    if (selectedProject) {
      const projectDocs = documents.filter(doc => doc.projectId === selectedProject);
      return projectDocs.some(doc => version.title.includes(doc.name));
    }
    // Otherwise, filter by search term
    return version.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           version.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           version.author.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleBookmark = (id: number) => {
    // In a real app, this would update the backend
    console.log(`Toggled bookmark for version ${id}`);
  };

  const handleRollback = (id: number) => {
    if (window.confirm(`버전 ${id}으로 되돌리시겠습니까?`)) {
      alert(`버전 ${id}으로 되돌리는 중입니다...`);
    }
  };

  const openCommentModal = (versionId: number) => {
    setSelectedVersionForComment(versionId);
    setShowCommentModal(true);
  };

  const handleAddComment = () => {
    if (newComment.trim() && selectedVersionForComment) {
      alert(`댓글이 추가되었습니다: ${newComment}`);
      setNewComment('');
      setShowCommentModal(false);
    }
  };

  const handleCompare = () => {
    if (compareVersion1 && compareVersion2) {
      alert(`버전 ${compareVersion1}과 ${compareVersion2}을 비교합니다.`);
    } else {
      alert('두 버전을 모두 선택해주세요.');
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h1 className="text-xl font-bold text-gray-800 mb-1">🔄 이력관리</h1>
        <p className="text-gray-500 text-sm">프로젝트의 버전 관리와 팀 협업을 위한 리뷰/피드백 기능</p>
      </div>

      {/* Project and Document Selection Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">프로젝트 선택</label>
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setSelectedDocument(''); // Reset document selection when project changes
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm"
            >
              <option value="">전체 프로젝트</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">문서 선택</label>
            <select
              value={selectedDocument}
              onChange={(e) => setSelectedDocument(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm"
              disabled={!selectedProject}
            >
              <option value="">문서 선택</option>
              {filteredDocuments.map(document => (
                <option key={document.id} value={document.name}>{document.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm"
            placeholder="버전 검색 (제목, 설명, 작성자)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!!selectedDocument} // Disable search when document is selected
          />
          <i className="fas fa-search absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
        <div className="flex border-b border-gray-200">
          <div 
            className={`px-4 py-3 cursor-pointer font-medium transition-colors text-sm ${
              activeTab === 'history' 
                ? 'bg-white border-b-2 border-blue-500 text-blue-500' 
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('history')}
          >
            버전 히스토리
          </div>
          <div 
            className={`px-4 py-3 cursor-pointer font-medium transition-colors text-sm ${
              activeTab === 'comparison' 
                ? 'bg-white border-b-2 border-blue-500 text-blue-500' 
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('comparison')}
          >
            버전 비교
          </div>
        </div>

        {/* Version History Tab */}
        {activeTab === 'history' && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-gray-700 text-sm">
                {selectedDocument 
                  ? `"${selectedDocument}"의 버전 히스토리 (${filteredVersions.length}개)` 
                  : selectedProject 
                    ? `${projects.find(p => p.id === selectedProject)?.name}의 버전 히스토리 (${filteredVersions.length}개)` 
                    : `총 ${filteredVersions.length}개의 버전`}
              </div>
              <div className="text-xs text-gray-500">
                <i className="fas fa-info-circle mr-1"></i>
                자동으로 버전 히스토리가 기록됩니다
              </div>
            </div>

            <div className="space-y-3">
              {filteredVersions.map(version => (
                <div key={version.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-800">{version.title}</h3>
                        {version.isBookmarked && (
                          <i className="fas fa-bookmark text-yellow-500 text-sm"></i>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-user text-xs"></i>
                          {version.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="far fa-clock text-xs"></i>
                          {version.date}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{version.description}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => toggleBookmark(version.id)}
                          className={`p-1.5 rounded-full ${version.isBookmarked ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`}
                          title={version.isBookmarked ? "북마크 해제" : "북마크"}
                        >
                          <i className={`fas ${version.isBookmarked ? 'fa-bookmark' : 'fa-bookmark'} text-sm`}></i>
                        </button>
                        <button 
                          onClick={() => handleRollback(version.id)}
                          className="p-1.5 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                          title="이 버전으로 되돌리기"
                        >
                          <i className="fas fa-undo text-sm"></i>
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <button 
                          onClick={() => openCommentModal(version.id)}
                          className="flex items-center gap-1 text-gray-500 hover:text-blue-500"
                        >
                          <i className="far fa-comment text-xs"></i>
                          <span>{version.comments} 댓글</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-green-500">
                          <i className="fas fa-code-branch text-xs"></i>
                          <span>비교</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                      <i className="fas fa-tag mr-1 text-xs"></i>
                      버전 {version.id}
                    </span>
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                      <i className="fas fa-user-edit mr-1 text-xs"></i>
                      {version.author}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Version Comparison Tab */}
        {activeTab === 'comparison' && (
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-800 mb-3">버전 비교하기</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">비교할 버전 1</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                    value={compareVersion1 || ''}
                    onChange={(e) => setCompareVersion1(Number(e.target.value) || null)}
                  >
                    <option value="">버전 선택</option>
                    {versionHistory.map(version => (
                      <option key={version.id} value={version.id}>
                        {version.title} (v{version.id}) - {version.author}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">비교할 버전 2</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                    value={compareVersion2 || ''}
                    onChange={(e) => setCompareVersion2(Number(e.target.value) || null)}
                  >
                    <option value="">버전 선택</option>
                    {versionHistory.map(version => (
                      <option key={version.id} value={version.id}>
                        {version.title} (v{version.id}) - {version.author}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-3 flex justify-end">
                <button 
                  onClick={handleCompare}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <i className="fas fa-exchange-alt mr-1"></i>
                  버전 비교
                </button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">비교 결과</h4>
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-file-code text-2xl mb-2"></i>
                <p className="text-sm">버전을 선택하고 비교 버튼을 눌러주세요</p>
                <p className="text-xs mt-1">변경된 내용을 시각적으로 확인할 수 있습니다</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-base font-semibold">버전에 댓글 달기</h3>
              <button 
                onClick={() => setShowCommentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">댓글 내용</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="@멘션하여 팀원에게 알릴 수 있습니다"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none h-24 resize-y text-sm"
                />
                <div className="mt-1 text-xs text-gray-500">
                  <i className="fas fa-info-circle mr-1"></i>
                  @김개발, @박연구원 형식으로 멘션할 수 있습니다
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">첨부 파일 (선택)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-blue-500">
                  <i className="fas fa-cloud-upload-alt text-lg text-gray-400 mb-1"></i>
                  <p className="text-xs text-gray-600">파일을 드래그하거나 클릭하여 첨부</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button 
                onClick={() => setShowCommentModal(false)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                취소
              </button>
              <button 
                onClick={handleAddComment}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
              >
                댓글 추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionCollaborationManagementPage;