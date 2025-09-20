import React, { useState } from 'react';

interface SearchResult {
  id: number;
  title: string;
  type: 'document' | 'project' | 'folder' | 'pdf' | 'image';
  preview: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
}

const ExternalDocumentManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('웹사이트 리디자인');
  const [activeScope, setActiveScope] = useState<string>('내 연구 프로젝트');
  const [activeFilter, setActiveFilter] = useState<string>('전체');
  const [sortBy, setSortBy] = useState<string>('최근 편집일');

  const scopes = ['내 문서', '내 연구 프로젝트', '전체 공개 문서'];
  const filters = ['전체', '문서', '연구 프로젝트', '이미지', 'PDF'];
  const sortOptions = ['최근 편집일', '관련도', '제목', '작성일'];

  const searchResults: SearchResult[] = [
    {
      id: 1,
      title: '웹사이트 리디자인 연구 프로젝트 계획서',
      type: 'document',
      preview: '본 문서는 웹사이트 리디자인 연구 프로젝트의 전체 계획을 담고 있습니다. 연구 프로젝트 목표, 범위, 일정, 리소스 배분에 대한 상세 내용을 포함하고 있습니다. UI/UX 개선 방향과 기술 스택도 명시되어 있습니다...',
      author: {
        name: '김개발',
        avatar: 'K'
      },
      date: '2023.11.20 14:30'
    },
    {
      id: 2,
      title: '웹사이트 리디자인 연구 프로젝트',
      type: 'project',
      preview: '웹사이트 리디자인 연구 프로젝트의 메인 연구 프로젝트 폴더입니다. 하위에 디자인, 개발, 테스트 관련 문서들이 포함되어 있습니다. 현재 진행 상황은 60%이며, 예상 완료일은 2023.12.30입니다.',
      author: {
        name: '박매니저',
        avatar: 'P'
      },
      date: '2023.11.19 16:45'
    },
    {
      id: 3,
      title: '홈페이지 레이아웃 디자인',
      type: 'document',
      preview: '새로운 홈페이지의 레이아웃 디자인안입니다. Figma 파일 링크와 함께 주요 컴포넌트들의 위치, 색상, 타이포그래피 가이드가 포함되어 있습니다. 반응형 디자인 고려사항도 명시되어 있습니다.',
      author: {
        name: '이디자인',
        avatar: 'L'
      },
      date: '2023.11.18 10:15'
    },
    {
      id: 4,
      title: '웹사이트 리디자인 연구 프로젝트 진행 보고서.pdf',
      type: 'pdf',
      preview: '11월 3주차 연구 프로젝트 진행 상황 보고서입니다. 현재까지의 성과, 발생한 이슈, 다음 주 계획이 포함되어 있습니다. 예산 사용 현황과 리스크 관리 계획도 상세히 기술되어 있습니다.',
      author: {
        name: '최분석',
        avatar: 'C'
      },
      date: '2023.11.17 15:30'
    },
    {
      id: 5,
      title: '내부 페이지 디자인 컨셉.png',
      type: 'image',
      preview: '내부 페이지들의 디자인 컨셉 이미지입니다. 메인 페이지와 일관성을 유지하면서도 각 페이지의 특성에 맞는 디자인 요소들을 제안하고 있습니다. 색상 팔레트와 컴포넌트 사용 가이드가 포함되어 있습니다.',
      author: {
        name: '이디자인',
        avatar: 'L'
      },
      date: '2023.11.16 09:20'
    }
  ];

  const handleSearch = () => {
    if (searchTerm) {
      // In a real app, this would trigger an API call
      console.log(`Searching for: ${searchTerm}`);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'document':
        return 'fas fa-file-alt';
      case 'project':
        return 'fas fa-folder';
      case 'pdf':
        return 'fas fa-file-pdf';
      case 'image':
        return 'fas fa-file-image';
      case 'folder':
        return 'fas fa-folder';
      default:
        return 'fas fa-file';
    }
  };

  const handleResultClick = (title: string) => {
    alert(`"${title}" 문서로 이동합니다.\n(실제 구현 시 에디터 화면으로 이동)`);
  };

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      {/* 검색 섹션 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-5">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">🔍 문서 검색</h1>
          <p className="text-gray-500">연구 프로젝트, 문서, 내용을 빠르게 찾아보세요</p>
        </div>
        
        <div className="relative mb-5">
          <input 
            type="text" 
            className="w-full p-4 pr-24 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="검색어를 입력하세요 (예: 연구 프로젝트 계획, API 문서, 디자인 가이드 등)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition-colors"
            onClick={handleSearch}
          >
            검색
          </button>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {scopes.map((scope) => (
            <div 
              key={scope}
              className={`px-5 py-2.5 border-2 rounded-full cursor-pointer transition-all ${
                activeScope === scope 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'border-gray-200 hover:border-blue-500'
              }`}
              onClick={() => setActiveScope(scope)}
            >
              {scope}
            </div>
          ))}
        </div>
      </div>

      {/* 필터 및 정렬 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded ${
                activeFilter === filter
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">정렬:</span>
          <select 
            className="px-3 py-2 border border-gray-300 rounded"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 결과 영역 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-800">검색 결과</h2>
          <div className="text-gray-500 text-sm">총 {searchResults.length}개의 결과</div>
        </div>
        
        <div className="flex flex-col gap-5">
          {searchResults.map((result) => (
            <div 
              key={result.id}
              className="p-5 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleResultClick(result.title)}
            >
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                <i className={`${getResultIcon(result.type)} text-blue-500`}></i>
                <span>{result.title}</span>
              </div>
              <p className="text-gray-600 mb-3 line-clamp-2">{result.preview}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-semibold text-xs">
                    {result.author.avatar}
                  </div>
                  <span>{result.author.name}</span>
                </div>
                <span>{result.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExternalDocumentManagementPage;