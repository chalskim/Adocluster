// src/components/editeComponents/ReferenceManager.tsx
import React, { useState } from 'react';
import { ReferenceItem } from '../../data/mockData';

interface ReferenceManagerProps {
  references: ReferenceItem[];
  onCiteReference: (reference: ReferenceItem) => void;
  onAddToProject?: (reference: ReferenceItem) => void;
}

interface SearchResult {
  id: string;
  title: string;
  author: string;
  year: string;
  publication: string;
  doi?: string;
  abstract?: string;
  url?: string;
  source: 'Google Scholar' | 'PubMed' | 'arXiv' | 'IEEE Xplore' | 'ACM Digital Library';
}

const ReferenceManager = ({ references, onCiteReference, onAddToProject }: ReferenceManagerProps) => {
  const [activeTab, setActiveTab] = useState<'library' | 'search'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('Google Scholar');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState('');

  // 학술 검색 실행
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // 실제 구현에서는 각 학술 DB API를 호출
    // 현재는 모의 데이터로 구현
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: 'search-1',
          title: `${searchQuery}에 관한 최신 연구 동향`,
          author: 'Kim, J., Lee, S., & Park, H.',
          year: '2024',
          publication: 'Journal of Advanced Research',
          doi: '10.1000/182',
          abstract: `${searchQuery}에 대한 포괄적인 연구를 통해 새로운 접근 방법을 제시합니다...`,
          url: 'https://example.com/paper1',
          source: selectedSource as any
        },
        {
          id: 'search-2',
          title: `${searchQuery} 분야의 혁신적 접근법`,
          author: 'Smith, A., & Johnson, B.',
          year: '2023',
          publication: 'International Conference Proceedings',
          doi: '10.1000/183',
          abstract: `본 연구는 ${searchQuery} 분야에서의 새로운 방법론을 제안합니다...`,
          url: 'https://example.com/paper2',
          source: selectedSource as any
        },
        {
          id: 'search-3',
          title: `${searchQuery}의 실용적 응용`,
          author: 'Chen, L., et al.',
          year: '2023',
          publication: 'Applied Science Review',
          doi: '10.1000/184',
          abstract: `${searchQuery}의 실제 적용 사례와 효과를 분석한 연구입니다...`,
          url: 'https://example.com/paper3',
          source: selectedSource as any
        }
      ];
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1500);
  };

  // 검색 결과를 라이브러리에 추가
  const addToLibrary = (result: SearchResult) => {
    const newReference: ReferenceItem = {
      id: result.id,
      title: result.title,
      author: result.author,
      year: result.year,
      publication: result.publication,
      doi: result.doi,
      url: result.url
    };
    
    if (onAddToProject) {
      onAddToProject(newReference);
    }
    
    alert(`"${result.title}"이(가) 라이브러리에 추가되었습니다.`);
  };

  // 라이브러리 필터링
  const filteredReferences = references.filter(ref => 
    libraryFilter === '' || 
    ref.title.toLowerCase().includes(libraryFilter.toLowerCase()) ||
    ref.author.toLowerCase().includes(libraryFilter.toLowerCase()) ||
    ref.publication.toLowerCase().includes(libraryFilter.toLowerCase())
  );

  // 파일 업로드 처리 (BIB, RIS, XML 지원)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!['bib', 'ris', 'xml', 'txt'].includes(fileExtension || '')) {
      alert('지원되는 파일 형식: .bib, .ris, .xml, .txt');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      // 실제 구현에서는 각 파일 형식에 맞는 파서를 사용
      alert(`${file.name} 파일이 성공적으로 업로드되었습니다.\n파일 형식: ${fileExtension?.toUpperCase()}\n내용 길이: ${content.length}자`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="reference-panel">
      {/* Tab Navigation */}
      <div className="reference-tabs">
        <button 
          className={`reference-tab ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          내 라이브러리
        </button>
        <button 
          className={`reference-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          학술 검색
        </button>
      </div>

      {/* Tab Content */}
      <div className="reference-tab-content">
        {/* Library Tab */}
        {activeTab === 'library' && (
          <>
            <section className="search-filter-section">
              <div className="search-bar-container">
                <span className="material-symbols-outlined search-icon">search</span>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="라이브러리 내 검색..." 
                  value={libraryFilter}
                  onChange={(e) => setLibraryFilter(e.target.value)}
                />
              </div>
              <div className="saved-searches-container">
                <label htmlFor="saved-searches">저장된 검색어:</label>
                <select id="saved-searches" className="saved-searches-select">
                  <option>#인공지능</option>
                  <option>#교육공학</option>
                  <option>#머신러닝</option>
                  <option>#데이터사이언스</option>
                </select>
                <button className="btn-icon" title="현재 검색어 저장">
                  <span className="material-symbols-outlined">bookmark_add</span>
                </button>
              </div>
            </section>

            <section className="content-display-section">
              <h3>내 라이브러리 ({filteredReferences.length})</h3>
              {filteredReferences.map(ref => (
                <div key={ref.id} className="ref-card">
                  <p className="ref-author">{ref.author} ({ref.year})</p>
                  <p className="ref-title">{ref.title}</p>
                  <p>{ref.publication}</p>
                  {ref.doi && <p className="text-xs text-gray-500">DOI: {ref.doi}</p>}
                  <div className="ref-card-actions">
                    <button className="btn-icon" title="인용하기" onClick={() => onCiteReference(ref)}>
                      <span className="material-symbols-outlined">format_quote</span>
                    </button>
                    {onAddToProject && (
                      <button
                        onClick={() => onAddToProject(ref)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        title="연구 프로젝트에 추가"
                      >
                        <i className="fas fa-plus mr-1"></i>
                        연구 프로젝트에 추가
                      </button>
                    )}
                    <button className="btn-icon" title="상세 정보">
                      <span className="material-symbols-outlined">info</span>
                    </button>
                    <button className="btn-icon" title="삭제하기">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </section>

            <section className="import-export-section">
              <input
                type="file"
                id="file-upload"
                accept=".bib,.ris,.xml,.txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button className="btn" onClick={() => document.getElementById('file-upload')?.click()}>
                <span className="material-symbols-outlined">file_upload</span>
                파일 가져오기 (BIB/RIS/XML)
              </button>
              <button className="btn">
                <span className="material-symbols-outlined">file_download</span>
                내보내기
              </button>
            </section>
          </>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <section className="search-content-section">
            <div className="search-bar-container">
              <span className="material-symbols-outlined search-icon">search</span>
              <input 
                type="text" 
                className="search-input" 
                placeholder="학술 논문 검색..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="search-options">
              <div className="search-source">
                <select 
                  className="search-source-select"
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                >
                  <option>Google Scholar</option>
                  <option>PubMed</option>
                  <option>arXiv</option>
                  <option>IEEE Xplore</option>
                  <option>ACM Digital Library</option>
                </select>
              </div>
              <button 
                className="btn search-btn" 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
              >
                <span className="material-symbols-outlined">
                  {isSearching ? 'hourglass_empty' : 'search'}
                </span>
                {isSearching ? '검색 중...' : '검색'}
              </button>
            </div>
            
            <div className="search-results">
              {isSearching && (
                <div className="text-center py-4">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <p className="mt-2 text-gray-600">{selectedSource}에서 검색 중...</p>
                </div>
              )}
              
              {!isSearching && searchResults.length > 0 && (
                <>
                  <h3 className="mt-4 mb-2 font-medium">
                    검색 결과 ({searchResults.length}개) - {selectedSource}
                  </h3>
                  {searchResults.map(result => (
                    <div key={result.id} className="ref-card mb-3">
                      <div className="flex justify-between items-start mb-2">
                        <p className="ref-author">{result.author} ({result.year})</p>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {result.source}
                        </span>
                      </div>
                      <p className="ref-title font-medium">{result.title}</p>
                      <p className="text-sm text-gray-600">{result.publication}</p>
                      {result.doi && (
                        <p className="text-xs text-gray-500 mt-1">DOI: {result.doi}</p>
                      )}
                      {result.abstract && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {result.abstract}
                        </p>
                      )}
                      <div className="ref-card-actions mt-3">
                        <button 
                          className="btn-icon" 
                          title="라이브러리에 추가" 
                          onClick={() => addToLibrary(result)}
                        >
                          <span className="material-symbols-outlined">add</span>
                        </button>
                        {result.url && (
                          <button 
                            className="btn-icon" 
                            title="원문 보기"
                            onClick={() => window.open(result.url, '_blank')}
                          >
                            <span className="material-symbols-outlined">open_in_new</span>
                          </button>
                        )}
                        <button className="btn-icon" title="상세 정보">
                          <span className="material-symbols-outlined">info</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
              
              {!isSearching && searchQuery && searchResults.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
                  <p>검색 결과가 없습니다.</p>
                  <p className="text-sm">다른 검색어나 데이터베이스를 시도해보세요.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ReferenceManager;