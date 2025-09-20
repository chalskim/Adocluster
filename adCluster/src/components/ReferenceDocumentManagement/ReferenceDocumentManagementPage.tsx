import React, { useState } from 'react';

interface ReferenceDocument {
  id: number;
  title: string;
  type: 'pdf' | 'doc' | 'docx' | 'hwp' | 'hwpx';
  preview: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  projectId: number;
  projectName: string;
  sourceInfo?: {
    title: string;
    author: string;
    summary: string;
    publishDate: string;
  };
  highlights: string[];
  notes: string[];
}

const ReferenceDocumentManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<ReferenceDocument | null>(null);

  // Mock projects data
  const projects = [
    { id: 'all', name: '전체 프로젝트' },
    { id: '1', name: '웹사이트 리디자인 프로젝트' },
    { id: '2', name: '모바일 앱 개발 프로젝트' },
    { id: '3', name: '데이터 분석 연구 프로젝트' },
  ];

  // Mock reference documents data
  const referenceDocuments: ReferenceDocument[] = [
    {
      id: 1,
      title: '웹사이트 리디자인 연구 프로젝트 계획서.pdf',
      type: 'pdf',
      preview: '본 문서는 웹사이트 리디자인 연구 프로젝트의 전체 계획을 담고 있습니다. 연구 프로젝트 목표, 범위, 일정, 리소스 배분에 대한 상세 내용을 포함하고 있습니다...',
      author: {
        name: '김개발',
        avatar: 'K'
      },
      date: '2023.11.20 14:30',
      projectId: 1,
      projectName: '웹사이트 리디자인 프로젝트',
      sourceInfo: {
        title: '웹사이트 UX 디자인 가이드',
        author: '디자인 연구소',
        summary: '웹사이트 사용자 경험을 향상시키기 위한 디자인 원칙과 가이드라인',
        publishDate: '2023.10.15'
      },
      highlights: ['주요 디자인 원칙', '사용자 테스트 결과'],
      notes: ['2023.11.21: 디자인 변경 필요', '2023.11.22: 팀 회의에서 검토 예정']
    },
    {
      id: 2,
      title: '모바일 UI 컴포넌트 설계 문서.docx',
      type: 'docx',
      preview: '모바일 앱의 주요 UI 컴포넌트 설계 문서입니다. 버튼, 입력 필드, 네비게이션 등 주요 컴포넌트의 디자인과 상호작용 방식이 명시되어 있습니다...',
      author: {
        name: '이디자인',
        avatar: 'L'
      },
      date: '2023.11.18 10:15',
      projectId: 2,
      projectName: '모바일 앱 개발 프로젝트',
      highlights: ['버튼 컴포넌트 설계', '색상 시스템 정의'],
      notes: ['iOS 버전 추가 필요']
    },
    {
      id: 3,
      title: '데이터 분석 방법론.hwp',
      type: 'hwp',
      preview: '데이터 분석 프로젝트에서 사용하는 표준 분석 방법론 문서입니다. 데이터 수집, 전처리, 분석, 시각화까지의 전체 프로세스가 설명되어 있습니다...',
      author: {
        name: '박데이터',
        avatar: 'P'
      },
      date: '2023.11.15 09:45',
      projectId: 3,
      projectName: '데이터 분석 연구 프로젝트',
      sourceInfo: {
        title: '데이터 과학 입문',
        author: '데이터 과학 연구소',
        summary: '데이터 분석의 기본 개념과 방법론을 설명하는 입문서',
        publishDate: '2023.09.20'
      },
      highlights: ['분석 프레임워크', '시각화 기법'],
      notes: ['R 코드 예제 추가 필요']
    }
  ];

  const filteredDocuments = referenceDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProject === 'all' || doc.projectId.toString() === selectedProject;
    return matchesSearch && matchesProject;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    } else {
      return a.projectName.localeCompare(b.projectName);
    }
  });

  const handleSearch = () => {
    // In a real app, this would trigger an API call
    console.log(`Searching for: ${searchTerm}`);
  };

  const handleDocumentClick = (document: ReferenceDocument) => {
    setSelectedDocument(document);
    // In a real app, this would open a preview modal
    alert(`"${document.title}" 문서 미리보기\n(형광펜 및 메모 기능 포함)`);
  };

  const handleDownload = (document: ReferenceDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`"${document.title}" 문서 다운로드 시작`);
  };

  const handleDelete = (document: ReferenceDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`"${document.title}" 문서를 삭제하시겠습니까?`)) {
      alert(`"${document.title}" 문서가 삭제되었습니다.`);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'fas fa-file-pdf text-red-500';
      case 'doc':
      case 'docx':
        return 'fas fa-file-word text-blue-500';
      case 'hwp':
      case 'hwpx':
        return 'fas fa-file-alt text-green-500';
      default:
        return 'fas fa-file text-gray-500';
    }
  };

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">📚 참고문서 관리</h1>
        <p className="text-gray-500">프로젝트별 참고문서를 관리하고 검색하세요</p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-5">
        <div className="flex flex-col md:flex-row gap-4 mb-5">
          <div className="relative flex-grow">
            <input 
              type="text" 
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="문서 제목, 내용으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500"
              onClick={handleSearch}
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
          
          <button 
            className="px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            onClick={() => setShowUploadModal(true)}
          >
            <i className="fas fa-plus"></i>
            문서 등록
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-gray-700 font-medium">프로젝트:</span>
            <select 
              className="px-3 py-2 border border-gray-300 rounded"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">정렬:</span>
            <select 
              className="px-3 py-2 border border-gray-300 rounded"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">최근 등록순</option>
              <option value="title">제목순</option>
              <option value="project">프로젝트순</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-800">참고문서 목록</h2>
          <div className="text-gray-500 text-sm">총 {sortedDocuments.length}개의 문서</div>
        </div>
        
        {sortedDocuments.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <i className="fas fa-file-alt text-4xl mb-3"></i>
            <p>등록된 참고문서가 없습니다.</p>
            <button 
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => setShowUploadModal(true)}
            >
              첫 문서 등록하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedDocuments.map((document) => (
              <div 
                key={document.id}
                className="border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer p-4"
                onClick={() => handleDocumentClick(document)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <i className={`${getFileIcon(document.type)} text-lg`}></i>
                    <span className="font-semibold text-gray-800 truncate">{document.title}</span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      className="p-1 text-gray-500 hover:text-blue-500"
                      onClick={(e) => handleDownload(document, e)}
                      title="다운로드"
                    >
                      <i className="fas fa-download"></i>
                    </button>
                    <button 
                      className="p-1 text-gray-500 hover:text-red-500"
                      onClick={(e) => handleDelete(document, e)}
                      title="삭제"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{document.preview}</p>
                
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-semibold text-xs">
                      {document.author.avatar}
                    </div>
                    <span>{document.author.name}</span>
                  </div>
                  <span>{document.date}</span>
                </div>
                
                <div className="text-xs text-gray-500 mb-2">
                  <i className="fas fa-folder text-blue-400 mr-1"></i>
                  {document.projectName}
                </div>
                
                {document.sourceInfo && (
                  <div className="bg-blue-50 border border-blue-100 rounded p-2 mb-2">
                    <div className="font-medium text-blue-800 text-xs mb-1">출처 정보</div>
                    <div className="text-blue-700 text-xs truncate" title={document.sourceInfo.title}>
                      {document.sourceInfo.title}
                    </div>
                  </div>
                )}
                
                {(document.highlights.length > 0 || document.notes.length > 0) && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded p-2">
                    <div className="flex flex-wrap gap-1">
                      {document.highlights.length > 0 && (
                        <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded">
                          <i className="fas fa-highlighter mr-1"></i>
                          형광펜 {document.highlights.length}
                        </span>
                      )}
                      {document.notes.length > 0 && (
                        <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded">
                          <i className="fas fa-sticky-note mr-1"></i>
                          메모 {document.notes.length}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold">참고문서 등록</h3>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">문서 파일</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500">
                  <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                  <p className="text-gray-600">파일을 여기에 드래그하거나 클릭하여 선택하세요</p>
                  <p className="text-gray-400 text-sm mt-1">지원 형식: PDF, DOC, DOCX, HWP, HWPX</p>
                  <p className="text-blue-500 text-xs mt-2">※ 모든 문서는 PDF로 자동 변환되어 저장됩니다</p>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">프로젝트</label>
                <select className="w-full p-2 border border-gray-300 rounded">
                  {projects.filter(p => p.id !== 'all').map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">출처 정보 (선택)</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="출처 제목"
                />
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded mt-2"
                  placeholder="출처 작성자"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                onClick={() => setShowUploadModal(false)}
              >
                취소
              </button>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => {
                  alert('문서가 등록되었습니다. PDF로 변환 중이며, 완료 후 목록에 표시됩니다.');
                  setShowUploadModal(false);
                }}
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold truncate mr-4">{selectedDocument.title}</h3>
              <div className="flex gap-2">
                <button 
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  onClick={() => alert('형광펜 기능 활성화')}
                >
                  <i className="fas fa-highlighter mr-1"></i>
                  형광펜
                </button>
                <button 
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  onClick={() => alert('메모 추가')}
                >
                  <i className="fas fa-sticky-note mr-1"></i>
                  메모
                </button>
                <button 
                  className="p-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedDocument(null)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-auto p-5">
              <div className="bg-gray-100 border border-gray-300 rounded h-full flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-file-pdf text-5xl text-red-500 mb-3"></i>
                  <p className="text-gray-600 mb-4">PDF 미리보기 영역</p>
                  <p className="text-sm text-gray-500">형광펜과 메모 기능이 포함된 PDF 뷰어</p>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  onClick={() => setSelectedDocument(null)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenceDocumentManagementPage;