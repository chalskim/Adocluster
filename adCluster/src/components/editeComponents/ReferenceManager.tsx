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
  source: 'Google Scholar' | 'PubMed' | 'arXiv' | 'IEEE Xplore' | 'Crossref (ACM)' | 'Crossref' | 'ACM (Crossref)';
}

// Define the structure for Google Scholar API response
interface ScholarSearchResult {
  title: string;
  link?: string;
  snippet?: string;
  authors?: string[];
  publication_info?: string;
  cited_by?: number;
  year?: number;
}

// Define the structure for Crossref API response
interface CrossrefSearchResult {
  id: string;
  title: string;
  authors: string[];
  publisher: string;
  publication_year?: number;
  journal: string;
  abstract?: string;
  doi: string;
  url: string;
  citation_count: number;
  type: string;
}

interface ScholarSearchResponse {
  results: ScholarSearchResult[];
  total_results: number;
  search_time: number;
}

interface CrossrefSearchResponse {
  results: CrossrefSearchResult[];
  total_results: number;
  search_time: number;
}

const ReferenceManager = ({ references, onCiteReference, onAddToProject }: ReferenceManagerProps) => {
  const [activeTab, setActiveTab] = useState<'library' | 'search'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('Google Scholar');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // 페이지당 5개 결과 표시

  // 학술 검색 실행
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      console.log('Search query is empty, returning early');
      return;
    }
    
    console.log('Starting search for:', searchQuery);
    setIsSearching(true);
    
    try {
      // Check if we're doing a citation search
      const isCitationSearch = selectedSource === 'Google Scholar Citations';
      const actualSource = isCitationSearch ? 'Google Scholar' : selectedSource;
      
      // Only Google Scholar is currently implemented
      if (actualSource === 'Google Scholar') {
        console.log('Using Google Scholar search');
        // Get the auth token from localStorage
        const authToken = localStorage.getItem('authToken');
        
        console.log('=== Google Scholar Search Debug Info ===');
        console.log('Search query:', searchQuery);
        console.log('Auth token exists:', !!authToken);
        console.log('Selected source:', selectedSource);
        console.log('Is citation search:', isCitationSearch);
        
        if (!authToken) {
          console.log('ERROR: No auth token found in localStorage');
          throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
        }
        
        // Log token info (first and last 10 characters for security)
        console.log('Token length:', authToken.length);
        console.log('Token preview:', authToken.substring(0, 10) + '...' + authToken.substring(authToken.length - 10));
        
        // Use different endpoint for citation search
        const endpoint = isCitationSearch ? 'citation-search' : 'search';
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${import.meta.env.VITE_GOOGLE_SCHOLAR_ENDPOINT || '/api/google-scholar'}/${endpoint}?query=${encodeURIComponent(searchQuery)}&limit=10`;
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
          // Try to get error details
          let errorText = '';
          try {
            errorText = await response.text();
            console.log('Error response body:', errorText);
          } catch (e) {
            console.log('Could not read error response body');
          }
          
          if (response.status === 401) {
            console.log('ERROR: 401 Unauthorized - Token may be invalid or expired');
            // Remove invalid token and notify user
            localStorage.removeItem('authToken');
            throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
          }
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Search results:', data);
        console.log('Number of results:', data.results?.length || 0);
        
        // Transform the API response to our SearchResult format
        const transformedResults: SearchResult[] = (data.results || []).map((result: any, index: number) => ({
          id: `scholar-${Date.now()}-${index}`,
          title: result.title,
          author: result.authors ? result.authors.join(', ') : 'Unknown',
          year: result.year ? result.year.toString() : 'N.d.',
          publication: result.publication_info || 'Unknown publication',
          abstract: result.snippet,
          url: result.link,
          source: isCitationSearch ? 'Google Scholar Citations' : 'Google Scholar'
        }));
        
        console.log('Transformed results:', transformedResults);
        setSearchResults(transformedResults);
        console.log('=== End Google Scholar Search Debug Info ===');
      } else if (actualSource === 'Crossref' || actualSource === 'ACM (Crossref)' || actualSource === 'Crossref (ACM)') {
        console.log('Using Crossref search');
        // Get the auth token from localStorage
        const authToken = localStorage.getItem('authToken');
        
        console.log('=== Crossref Search Debug Info ===');
        console.log('Search query:', searchQuery);
        console.log('Auth token exists:', !!authToken);
        console.log('Selected source:', selectedSource);
        
        if (!authToken) {
          console.log('ERROR: No auth token found in localStorage');
          throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
        }
        
        // Determine source parameter for Crossref API
        const sourceParam = (actualSource === 'ACM (Crossref)' || actualSource === 'Crossref (ACM)') ? 'acm' : 'all';
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/crossref/search?query=${encodeURIComponent(searchQuery)}&source=${sourceParam}&page_size=10`;
        console.log('Crossref API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        console.log('Crossref API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Crossref API error response:', errorText);
          throw new Error(`Crossref API 요청 실패: ${response.status} ${response.statusText}`);
        }
        
        const data: CrossrefSearchResponse = await response.json();
        console.log('Crossref API response data:', data);
        
        // Transform Crossref results to SearchResult format
        const transformedResults: SearchResult[] = data.results.map((item, index) => ({
          id: item.doi || `crossref-${index}`,
          title: item.title,
          author: item.authors.join(', '),
          year: item.publication_year?.toString() || '',
          publication: item.journal || item.publisher,
          doi: item.doi,
          abstract: item.abstract,
          url: item.url,
          source: (actualSource === 'ACM (Crossref)' || actualSource === 'Crossref (ACM)') ? 'Crossref (ACM)' : 'Crossref'
        }));
        
        console.log('Transformed Crossref results:', transformedResults);
        setSearchResults(transformedResults);
        console.log('=== End Crossref Search Debug Info ===');
      } else {
        // For other sources, show a message that they are not implemented yet
        console.log(`Search requested for ${selectedSource}, but it's not implemented yet`);
        alert(`${selectedSource} 검색은 아직 구현되지 않았습니다. 현재 Google Scholar와 Crossref만 지원됩니다.`);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('학술 검색 중 오류 발생:', error);
      alert(`검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsSearching(false);
    }
  };

  // 검색 결과를 라이브러리에 추가
  const addToLibrary = (result: SearchResult) => {
    const newReference: ReferenceItem = {
      id: result.id,
      title: result.title,
      author: result.author,
      year: parseInt(result.year) || 0,
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

  // Pagination logic for search results
  const totalPages = Math.ceil(searchResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResults = searchResults.slice(startIndex, endIndex);

  // Reset to first page when search results change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchResults]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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
                placeholder="Google Scholar에서 학술 논문 검색..." 
                value={searchQuery}
                onChange={(e) => {
                  console.log('Search query changed to:', e.target.value);
                  setSearchQuery(e.target.value);
                }}
                onKeyPress={(e) => {
                  console.log('Key pressed:', e.key);
                  if (e.key === 'Enter') {
                    console.log('Enter key pressed, triggering search');
                    handleSearch();
                  }
                }}
              />
            </div>
            <div className="search-options">
              <div className="search-source">
                <select 
                  className="search-source-select"
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                >
                  <option value="Google Scholar">Google Scholar (지원됨)</option>
                  <option value="Google Scholar Citations">Google Scholar 인용 검색</option>
                  <option value="Crossref">Crossref (지원됨)</option>
                  <option value="ACM (Crossref)">ACM Digital Library (Crossref)</option>
                  <option value="PubMed">PubMed (준비 중)</option>
                  <option value="arXiv">arXiv (준비 중)</option>
                  <option value="IEEE Xplore">IEEE Xplore (준비 중)</option>
                  <option value="Crossref (ACM)">Crossref (ACM)</option>
                </select>
              </div>
              <button 
                className="btn search-btn" 
                onClick={() => {
                  console.log('Search button clicked');
                  handleSearch();
                }}
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
                  <h3 className="mt-2 mb-1 font-medium text-sm">
                    검색 결과 ({searchResults.length}개) - {selectedSource}
                    {totalPages > 1 && (
                      <span className="text-xs text-gray-500 ml-2">
                        (페이지 {currentPage}/{totalPages})
                      </span>
                    )}
                  </h3>
                  {paginatedResults.map(result => (
                    <div key={result.id} className="ref-card mb-2 p-2">
                      <div className="flex justify-between items-start mb-1">
                        <p className="ref-author text-sm">{result.author} ({result.year})</p>
                        <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                          {result.source}
                        </span>
                      </div>
                      <p className="ref-title font-medium text-sm mb-1">{result.title}</p>
                      <p className="text-xs text-gray-600 mb-1">{result.publication}</p>
                      {result.doi && (
                        <p className="text-xs text-gray-500 mb-1">DOI: {result.doi}</p>
                      )}
                      {result.abstract && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                          {result.abstract}
                        </p>
                      )}
                      <div className="ref-card-actions flex space-x-1">
                        <button 
                          className="btn-icon w-6 h-6" 
                          title="라이브러리에 추가" 
                          onClick={() => addToLibrary(result)}
                        >
                          <span className="material-symbols-outlined text-xs">add</span>
                        </button>
                        {result.url && (
                          <button 
                            className="btn-icon w-6 h-6" 
                            title="원문 보기"
                            onClick={() => window.open(result.url, '_blank')}
                          >
                            <span className="material-symbols-outlined text-xs">open_in_new</span>
                          </button>
                        )}
                        <button className="btn-icon w-6 h-6" title="상세 정보">
                          <span className="material-symbols-outlined text-xs">info</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Pagination Navigation */}
                  {totalPages > 1 && (
                    <div className="pagination-container mt-4 flex items-center justify-center space-x-2">
                      <button 
                        className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        title="이전 페이지"
                      >
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                      </button>
                      
                      <div className="pagination-numbers flex space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button 
                        className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        title="다음 페이지"
                      >
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  )}
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