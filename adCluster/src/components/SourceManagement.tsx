import React, { useState, useEffect } from 'react';
import { Project, ProjectData, mapProjectDataToProject } from '../types/ProjectTypes';
import { fetchProjects } from '../services/api';

interface SourceInfo {
  id: string;
  title: string;
  authors: string[];
  year: number;
  type: 'article' | 'book' | 'conference' | 'thesis' | 'website' | 'other';
  journal?: string;
  publisher?: string;
  doi?: string;
  url?: string;
  tags: string[];
  notes: string;
  addedDate: Date;
  citationCount: number;
  isBookmarked: boolean;
  projectId?: string;
}

interface ScholarSearchResult {
  title: string;
  link?: string;
  snippet?: string;
  authors?: string[];
  publication_info?: string;
  cited_by?: number;
  year?: number;
}

interface ScholarSearchResponse {
  results: ScholarSearchResult[];
  total_results: number;
  search_time: number;
}

interface PubMedSearchResult {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  publication_date: string;
  doi?: string;
  abstract?: string;
  url: string;
}

interface PubMedSearchResponse {
  results: PubMedSearchResult[];
  total_results: number;
  search_time: number;
}

interface IEEESearchResult {
  id: string;
  title: string;
  authors: string[];
  publication_title: string;
  publication_year: number;
  doi?: string;
  abstract?: string;
  url: string;
  article_number?: string;
}

interface IEEESearchResponse {
  results: IEEESearchResult[];
  total_results: number;
  search_time: number;
}

interface NalibSearchResult {
  id: string;
  title: string;
  authors: string[];
  publisher: string;
  publication_year: number;
  isbn?: string;
  url: string;
  description?: string;
}

interface NalibSearchResponse {
  results: NalibSearchResult[];
  total_results: number;
  search_time: number;
}

interface KciSearchResult {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  publication_year: number;
  doi?: string;
  url: string;
  abstract?: string;
  keywords?: string[];
}

interface KciSearchResponse {
  results: KciSearchResult[];
  total_results: number;
  search_time: number;
}

interface SourceManagementProps {
  projectId?: string;
  onSourceSelect?: (source: SourceInfo) => void;
}

const SourceManagement: React.FC<SourceManagementProps> = ({ projectId, onSourceSelect }) => {
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || 'all');
  const [sortBy, setSortBy] = useState<'title' | 'year' | 'addedDate' | 'citationCount'>('addedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSource, setEditingSource] = useState<SourceInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('국회도서관');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SourceInfo[]>([]);
  
  // 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await fetchProjects();
        if (projectsData) {
          const mappedProjects = projectsData.map(mapProjectDataToProject);
          setProjects(mappedProjects);
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    };
    loadProjects();
  }, []);

  const handleSearch = async (page: number = 1) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // 인증 토큰 확인
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        alert('인증 토큰이 없습니다. 다시 로그인해주세요.');
        return;
      }

      let apiUrl = '';
      let params: URLSearchParams;

      // 선택된 검색 소스에 따라 API URL과 파라미터 결정
      if (selectedSource === 'PubMed') {
        params = new URLSearchParams({
          query: searchQuery,
          limit: itemsPerPage.toString(),
          offset: ((page - 1) * itemsPerPage).toString()
        });
        apiUrl = `/api/pubmed/search?${params}`;
      } else if (selectedSource === 'IEEE Xplore') {
        params = new URLSearchParams({
          query: searchQuery,
          limit: itemsPerPage.toString(),
          offset: ((page - 1) * itemsPerPage).toString()
        });
        apiUrl = `/api/ieee/search?${params}`;
      } else if (selectedSource === '국회도서관') {
        // 국회도서관 API는 query, page, page_size, search_target 파라미터를 사용
        params = new URLSearchParams({
          query: searchQuery,
          page: page.toString(),
          page_size: itemsPerPage.toString()
        });
        
        apiUrl = `/api/nalib/search?${params}`;
      } else if (selectedSource === '한국학술정보(KCI)') {
        // KCI API는 title, page, page_size 파라미터를 사용
        params = new URLSearchParams({
          title: searchQuery,
          page: page.toString(),
          page_size: itemsPerPage.toString()
        });
        apiUrl = `/api/kci/search?${params}`;
      } else {
        params = new URLSearchParams({
          query: searchQuery,
          limit: itemsPerPage.toString(),
          offset: ((page - 1) * itemsPerPage).toString()
        });
        apiUrl = `/api/google-scholar/search?${params}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          alert('인증이 만료되었습니다. 다시 로그인해주세요.');
          return;
        }
        
        let errorMessage = 'Search failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          // JSON 파싱 실패 시 기본 메시지 사용
        }
        
        throw new Error(`API 요청 실패 (${response.status}): ${errorMessage}`);
      }

      let convertedResults: SourceInfo[] = [];

      if (selectedSource === 'PubMed') {
        const data: PubMedSearchResponse = await response.json();
        
        convertedResults = data.results.map((result, index) => ({
          id: `pubmed-${result.pmid}`,
          title: result.title,
          authors: result.authors,
          year: new Date(result.publication_date).getFullYear(),
          type: 'article' as const,
          journal: result.journal,
          doi: result.doi,
          url: result.url,
          tags: ['PubMed'],
          notes: result.abstract || '',
          addedDate: new Date(),
          citationCount: 0,
          isBookmarked: false,
          projectId: selectedProjectId !== 'all' ? selectedProjectId : undefined
        }));

        setTotalResults(data.total_results);
      } else if (selectedSource === '국회도서관') {
        const data = await response.json();
        
        // 백엔드 API 응답 구조에 맞게 수정 (items 배열 사용)
        const items = data.items || [];
        
        convertedResults = items.map((result: any, index: number) => ({
          id: `nalib-${index}`,
          title: result.title || '제목 없음',
          authors: result.author ? [result.author] : [],
          year: result.pub_year ? parseInt(result.pub_year) : new Date().getFullYear(),
          type: 'book' as const,
          publisher: result.publisher || '',
          url: result.url || '',
          tags: ['국회도서관'],
          notes: result.abstract || '',
          addedDate: new Date(),
          citationCount: 0,
          isBookmarked: false,
          projectId: selectedProjectId !== 'all' ? selectedProjectId : undefined
        }));

        setTotalResults(data.total_count || 0);
      } else if (selectedSource === '한국학술정보(KCI)') {
        const data = await response.json();
        
        // 백엔드 API 응답 구조에 맞게 수정 (articles 배열 사용)
        const articles = data.articles || [];
        
        convertedResults = articles.map((result: any, index: number) => ({
          id: `kci-${index}`,
          title: result.title || '제목 없음',
          authors: result.author ? [result.author] : [],
          year: result.year ? parseInt(result.year) : new Date().getFullYear(),
          type: 'article' as const,
          journal: result.journal || '',
          doi: result.doi || '',
          url: result.url || '',
          tags: ['한국학술정보(KCI)'],
          notes: result.abstract || '',
          addedDate: new Date(),
          citationCount: 0,
          isBookmarked: false,
          projectId: selectedProjectId !== 'all' ? selectedProjectId : undefined
        }));

        setTotalResults(data.total_count || 0);
      } else if (selectedSource === 'IEEE Xplore') {
        const data: IEEESearchResponse = await response.json();
        
        convertedResults = data.results.map((result, index) => ({
          id: `ieee-${result.id}`,
          title: result.title,
          authors: result.authors,
          year: result.publication_year,
          type: 'article' as const,
          journal: result.publication_title,
          doi: result.doi,
          url: result.url,
          tags: ['IEEE Xplore'],
          notes: result.abstract || '',
          addedDate: new Date(),
          citationCount: 0,
          isBookmarked: false,
          projectId: selectedProjectId !== 'all' ? selectedProjectId : undefined
        }));

        setTotalResults(data.total_results);
      } else {
        const data: ScholarSearchResponse = await response.json();
        
        convertedResults = data.results.map((result, index) => ({
          id: `scholar-${Date.now()}-${index}`,
          title: result.title,
          authors: result.authors || ['Unknown'],
          year: result.year || new Date().getFullYear(),
          type: 'article' as const,
          journal: result.publication_info,
          url: result.link,
          tags: ['Google Scholar'],
          notes: result.snippet || '',
          addedDate: new Date(),
          citationCount: result.cited_by || 0,
          isBookmarked: false,
          projectId: selectedProjectId !== 'all' ? selectedProjectId : undefined
        }));

        setTotalResults(data.total_results);
      }

      setSearchResults(convertedResults);
      setCurrentPage(page);
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      alert(`검색 중 오류가 발생했습니다: ${errorMessage}`);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredSources = sources.filter(source => {
    const matchesProject = selectedProjectId === 'all' || source.projectId === selectedProjectId;
    const matchesType = selectedType === 'all' || source.type === selectedType;
    return matchesProject && matchesType;
  });

  const sortedSources = [...filteredSources].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'year':
        comparison = a.year - b.year;
        break;
      case 'addedDate':
        comparison = a.addedDate.getTime() - b.addedDate.getTime();
        break;
      case 'citationCount':
        comparison = a.citationCount - b.citationCount;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleAddSource = () => {
    setEditingSource(null);
    setShowAddModal(true);
  };

  const handleEditSource = (source: SourceInfo) => {
    setEditingSource(source);
    setShowAddModal(true);
  };

  const handleDeleteSource = (sourceId: string) => {
    setSources(sources.filter(s => s.id !== sourceId));
  };

  const handleToggleBookmark = (sourceId: string) => {
    setSources(sources.map(s => 
      s.id === sourceId ? { ...s, isBookmarked: !s.isBookmarked } : s
    ));
  };

  const handleExportSources = (format: 'bibtex' | 'ris' | 'csv') => {
    console.log(`Exporting ${filteredSources.length} sources in ${format} format`);
  };

  const handleImportSources = (file: File) => {
    console.log('Importing sources from file:', file.name);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <i className="fas fa-file-alt w-4 h-4" />;
      case 'book': return <i className="fas fa-book w-4 h-4" />;
      case 'website': return <i className="fas fa-external-link-alt w-4 h-4" />;
      default: return <i className="fas fa-file-alt w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'book': return 'bg-green-100 text-green-800';
      case 'conference': return 'bg-purple-100 text-purple-800';
      case 'thesis': return 'bg-orange-100 text-orange-800';
      case 'website': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="sources-management-page p-6">
      <div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">연구 프로젝트 출처 관리</h1>
          <p className="text-gray-600 mt-1">
            연구 프로젝트별로 출처를 체계적으로 관리하고 정리하세요
          </p>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="w-full lg:w-1/2 bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">출처 검색 및 관리</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <i className="fas fa-book" />
              <span>총 {sources.length}개 출처</span>
            </div>
          </div>

          <div className="mb-4 space-y-3">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="text"
                placeholder="국회도서관, 한국학술정보(KCI), Google Scholar, PubMed, IEEE Xplore 등에서 검색..."
                className="flex-1 p-1.5 border border-gray-300 rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select 
                className="p-1.5 border border-gray-300 rounded sm:w-auto"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
              >
                <option>국회도서관</option>
                <option>한국학술정보(KCI)</option>
                <option>Google Scholar</option>
                <option>PubMed</option>
                <option>IEEE Xplore</option>
                <option>ACM Digital Library</option>
              </select>
              <button 
                type="button"
                className="bg-blue-500 text-white py-1.5 px-4 rounded hover:bg-blue-600 sm:w-auto disabled:bg-gray-400"
                onClick={() => handleSearch(1)}
                disabled={isSearching}
              >
                {isSearching ? '검색 중...' : '검색'}
              </button>
            </div>



            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <select
                className="p-1.5 border border-gray-300 rounded sm:w-auto"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">모든 유형</option>
                <option value="article">논문</option>
                <option value="book">도서</option>
                <option value="conference">학회</option>
                <option value="thesis">학위논문</option>
                <option value="website">웹사이트</option>
                <option value="other">기타</option>
              </select>

              <select
                className="p-2 border border-gray-300 rounded sm:w-auto"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="addedDate">추가일</option>
                <option value="title">제목</option>
                <option value="year">연도</option>
                <option value="citationCount">인용수</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 sm:w-auto"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto border border-gray-200 rounded">
            <div className="p-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">
                  {searchResults.length > 0 ? `검색 결과 (${totalResults})` : '출처 목록'}
                </h3>
              </div>
              
              {(searchResults.length > 0 ? searchResults : sortedSources).length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {(searchResults.length > 0 ? searchResults : sortedSources).map(source => (
                    <div 
                      key={source.id} 
                      className="source-card p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onSourceSelect?.(source)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(source.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{source.title}</h4>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <i className="fas fa-user" />
                              <span>{source.authors.join(', ')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <i className="fas fa-calendar" />
                              <span>{source.year}</span>
                            </div>
                            {source.projectId && (
                              <div className="flex items-center space-x-1">
                                <i className="fas fa-folder text-blue-500" />
                                <span>
                                  {projects.find(p => p.id === source.projectId)?.title || '알 수 없는 프로젝트'}
                                </span>
                              </div>
                            )}
                          </div>

                          {source.journal && (
                            <p className="text-xs text-gray-500 italic mb-2">{source.journal}</p>
                          )}

                          {source.tags.length > 0 && (
                            <div className="flex items-center space-x-1 mb-2">
                              <i className="fas fa-tags text-gray-400 text-xs" />
                              <div className="flex flex-wrap gap-1">
                                {source.tags.map((tag, index) => (
                                  <span key={index} className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(source.type)}`}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span className={`px-2 py-0.5 rounded-full ${getTypeColor(source.type)}`}>
                                {source.type}
                              </span>
                              {source.citationCount > 0 && (
                                <span className="text-blue-600">
                                  인용 {source.citationCount}회
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleBookmark(source.id);
                                }}
                                className={`text-xs ${source.isBookmarked ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600`}
                              >
                                <i className="fas fa-star" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSource(source);
                                }}
                                className="text-blue-500 hover:text-blue-700 text-xs"
                              >
                                편집
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-search text-2xl mb-2" />
                  <p>검색 결과가 없습니다.</p>
                </div>
              )}
              
              {/* 페이지네이션 UI */}
              {searchResults.length > 0 && totalResults > itemsPerPage && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSearch(currentPage - 1)}
                      disabled={currentPage <= 1 || isSearching}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      이전
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const totalPages = Math.ceil(totalResults / itemsPerPage);
                        const pages = [];
                        const startPage = Math.max(1, currentPage - 2);
                        const endPage = Math.min(totalPages, currentPage + 2);
                        
                        if (startPage > 1) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => handleSearch(1)}
                              disabled={isSearching}
                              className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                            >
                              1
                            </button>
                          );
                          if (startPage > 2) {
                            pages.push(<span key="ellipsis1" className="px-2 text-gray-400">...</span>);
                          }
                        }
                        
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => handleSearch(i)}
                              disabled={isSearching}
                              className={`px-2 py-1 text-sm border rounded disabled:opacity-50 ${
                                i === currentPage
                                  ? 'bg-blue-500 text-white border-blue-500'
                                  : 'border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                        
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(<span key="ellipsis2" className="px-2 text-gray-400">...</span>);
                          }
                          pages.push(
                            <button
                              key={totalPages}
                              onClick={() => handleSearch(totalPages)}
                              disabled={isSearching}
                              className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                            >
                              {totalPages}
                            </button>
                          );
                        }
                        
                        return pages;
                      })()}
                    </div>
                    
                    <button
                      onClick={() => handleSearch(currentPage + 1)}
                      disabled={currentPage >= Math.ceil(totalResults / itemsPerPage) || isSearching}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">연구 프로젝트별 출처</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddSource}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
              >
                <i className="fas fa-plus text-xs" />
                <span>출처 추가</span>
              </button>
            </div>
          </div>

          {/* 프로젝트 선택 selector를 이곳으로 이동 */}
          <div className="mb-4">
            <select
              className="p-2 border border-gray-300 rounded sm:w-auto w-full"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="all">모든 프로젝트</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-auto border border-gray-200 rounded">
            <div className="p-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedProjectId === 'all' 
                    ? '전체 출처' 
                    : `${projects.find(p => p.id === selectedProjectId)?.title} 출처`
                  }
                </h3>
              </div>

              {sortedSources.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {sortedSources.map(source => (
                    <div key={source.id} className="source-card p-2 border border-gray-200 rounded hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(source.type)}
                          <p className="text-sm font-medium">{source.authors.join(', ')} ({source.year})</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {source.isBookmarked && (
                            <i className="fas fa-star text-yellow-500 text-xs" />
                          )}
                          <button
                            onClick={() => handleEditSource(source)}
                            className="text-blue-500 hover:text-blue-700 text-xs"
                          >
                            편집
                          </button>
                          <button
                            onClick={() => handleDeleteSource(source.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                      <p className="text-sm mt-1">{source.title}</p>
                      {source.journal && (
                        <p className="text-xs text-gray-500 mt-1 italic">{source.journal}</p>
                      )}
                      {source.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {source.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {source.citationCount > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          인용 {source.citationCount}회
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-folder-open text-2xl mb-2" />
                  <p>
                    {selectedProjectId === 'all' 
                      ? '등록된 출처가 없습니다.' 
                      : '이 연구 프로젝트에 추가된 출처가 없습니다.'
                    }
                  </p>
                  <p className="text-sm mt-1">왼쪽에서 출처를 추가하세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingSource ? '출처 편집' : '새 출처 추가'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="출처 제목을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">저자</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="저자명을 쉼표로 구분하여 입력하세요"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">연도</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="발행 연도"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="article">논문</option>
                    <option value="book">도서</option>
                    <option value="conference">학회</option>
                    <option value="thesis">학위논문</option>
                    <option value="website">웹사이트</option>
                    <option value="other">기타</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">저널/출판사</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="저널명 또는 출판사를 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">태그</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="태그를 쉼표로 구분하여 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="출처에 대한 메모를 입력하세요"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceManagement;