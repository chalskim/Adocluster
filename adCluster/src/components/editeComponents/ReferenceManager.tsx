// src/components/editeComponents/ReferenceManager.tsx
import React, { useState } from 'react';
import { ReferenceItem } from '../../data/mockData';

interface ReferenceManagerProps {
  references: ReferenceItem[];
  onCiteReference: (reference: ReferenceItem) => void;
  onAddToProject?: (reference: ReferenceItem) => void;
}

// SourceManagement.tsx의 SourceInfo 인터페이스 추가
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

// SourceManagement.tsx의 모든 검색 인터페이스들 추가
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

interface ArxivSearchResult {
  id: string;
  title: string;
  authors: string[];
  abstract?: string;
  published: string;
  updated?: string;
  doi?: string;
  journal_ref?: string;
  categories: string[];
  pdf_url: string;
  abs_url: string;
}

interface ArxivSearchResponse {
  results: ArxivSearchResult[];
  total_results: number;
  search_time: number;
}

interface WebOfScienceSearchResult {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  publication_year: number;
  doi?: string;
  abstract?: string;
  url: string;
  citation_count?: number;
  keywords?: string[];
}

interface WebOfScienceSearchResponse {
  results: WebOfScienceSearchResult[];
  total_results: number;
  search_time: number;
}

interface ScopusSearchResult {
  id: string;
  title: string;
  author: string;
  year: string;
  publication: string;
  doi?: string;
  abstract?: string;
  url: string;
  citation_count?: number;
  source_type?: string;
  publisher?: string;
}

interface ScopusSearchResponse {
  results: ScopusSearchResult[];
  total_results: number;
  search_time: number;
  query: string;
  start: number;
  count: number;
  note?: string;
}

interface DOAJSearchResult {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  publication_date: string;
  doi?: string;
  abstract?: string;
  url: string;
  keywords?: string[];
  language?: string;
}

interface DOAJSearchResponse {
  results: DOAJSearchResult[];
  total_results: number;
  search_time: number;
}

interface CORESearchResult {
  id: string;
  title: string;
  authors: string[];
  journal?: string;
  publication_date: string;
  doi?: string;
  abstract?: string;
  url: string;
  download_url?: string;
  repository?: string;
}

interface CORESearchResponse {
  results: CORESearchResult[];
  total_results: number;
  search_time: number;
}

interface SemanticScholarSearchResult {
  id: string;
  title: string;
  authors: string[];
  year?: number;
  venue?: string;
  abstract?: string;
  doi?: string;
  url?: string;
  citation_count?: number;
  reference_count?: number;
  fields_of_study?: string[];
  publication_date?: string;
  source: string;
}

interface SemanticScholarSearchResponse {
  results: SemanticScholarSearchResult[];
  total_results: number;
  offset: number;
  limit: number;
  query: string;
}

// 기존 SearchResult 인터페이스는 유지
interface SearchResult {
  id: string;
  title: string;
  author: string;
  year: string;
  publication: string;
  doi?: string;
  abstract?: string;
  url?: string;
  source: 'Google Scholar' | 'PubMed' | 'arXiv' | 'IEEE Xplore' | 'Crossref (ACM)' | 'Crossref' | 'ACM (Crossref)' | 'DOAJ' | 'CORE' | 'Semantic Scholar' | 'Scopus' | 'Web of Science';
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

  // 추가 상태 변수들
  const [totalResults, setTotalResults] = useState(0);

  // 학술 검색 실행 - SourceManagement.tsx의 로직 적용
  const handleSearch = async (page: number = 1) => {
    if (!searchQuery.trim()) {
      console.log('Search query is empty, returning early');
      return;
    }
    
    console.log('Starting search for:', searchQuery, 'page:', page);
    setIsSearching(true);
    setCurrentPage(page);
    if (page === 1) {
      setSearchResults([]);
      setTotalResults(0);
    }

    try {
      // Check if we're doing a citation search
      const isCitationSearch = selectedSource === 'Google Scholar Citations';
      const actualSource = isCitationSearch ? 'Google Scholar' : selectedSource;
      
      // Get the auth token from localStorage
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        console.log('ERROR: No auth token found in localStorage');
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      let apiUrl = '';
      let convertedResults: SearchResult[] = [];

      // 검색 소스별 API URL 및 파라미터 설정
      switch (actualSource) {
        case 'Google Scholar':
          console.log('Using Google Scholar search');
          const endpoint = isCitationSearch ? 'citation-search' : 'search';
          apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${import.meta.env.VITE_GOOGLE_SCHOLAR_ENDPOINT || '/api/google-scholar'}/${endpoint}?query=${encodeURIComponent(searchQuery)}&limit=10`;
          break;

        case 'Crossref':
        case 'ACM (Crossref)':
        case 'Crossref (ACM)':
          console.log('Using Crossref search');
          const sourceParam = (actualSource === 'ACM (Crossref)' || actualSource === 'Crossref (ACM)') ? 'acm' : 'all';
          apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/crossref/search?query=${encodeURIComponent(searchQuery)}&source=${sourceParam}&page_size=10`;
          break;

        case 'PubMed':
          console.log('Using PubMed search');
          apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/pubmed/search?query=${encodeURIComponent(searchQuery)}&max_results=10`;
          break;

        case 'IEEE Xplore':
          console.log('Using IEEE Xplore search');
          apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/ieee/search?query=${encodeURIComponent(searchQuery)}&max_records=10`;
          break;

        case 'ACM Digital Library':
          console.log('Using ACM Digital Library search');
          apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/acm/search?query=${encodeURIComponent(searchQuery)}&records=10`;
          break;

        case 'arXiv':
          console.log('Using arXiv search');
          apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/arxiv/search?search_query=${encodeURIComponent(searchQuery)}&max_results=10`;
          break;

        case '국회도서관':
          console.log('Using 국회도서관 search');
          apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/nalib/search?query=${encodeURIComponent(searchQuery)}&max_results=10`;
          break;

        case '한국학술정보(KCI)':
          console.log('Using KCI search');
          apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/kci/search?query=${encodeURIComponent(searchQuery)}&max_results=10`;
          break;

        // 주석 처리된 검색 소스들 (API 키 준비 후 활성화)
        /*
        case 'DOAJ':
          console.log('Using DOAJ search');
          apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/doaj/search?query=${encodeURIComponent(searchQuery)}&page=1&page_size=10`;
          break;

        case 'CORE':
          console.log('Using CORE search');
          apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/core/search?query=${encodeURIComponent(searchQuery)}&page=1&page_size=10`;
          break;

        case 'Semantic Scholar':
          console.log('Using Semantic Scholar search');
          apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/semantic-scholar/search?query=${encodeURIComponent(searchQuery)}&offset=0&limit=10`;
          break;

        case 'Scopus':
          console.log('Using Scopus search');
          apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/scopus/search?query=${encodeURIComponent(searchQuery)}&count=10&start=0`;
          break;

        case 'Web of Science':
          console.log('Using Web of Science search');
          apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/web-of-science/search?query=${encodeURIComponent(searchQuery)}&limit=10&page=1`;
          break;
        */

        default:
          throw new Error(`지원되지 않는 검색 소스입니다: ${actualSource}`);
      }

      console.log('API URL:', apiUrl);
      
      // API 요청 실행
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
          console.log('Error response body:', errorText);
        } catch (e) {
          console.log('Could not read error response body');
        }
        
        if (response.status === 401) {
          console.log('ERROR: 401 Unauthorized - Token may be invalid or expired');
          localStorage.removeItem('authToken');
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        if (response.status === 429) {
          throw new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
        }
        
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Search results:', data);
      
      // 검색 소스별 응답 처리 및 결과 변환
      switch (actualSource) {
        case 'Google Scholar':
          convertedResults = (data.results || []).map((result: ScholarSearchResult, index: number) => ({
            id: `scholar-${Date.now()}-${index}`,
            title: result.title || 'No title',
            author: result.authors ? result.authors.join(', ') : 'Unknown',
            year: result.year ? result.year.toString() : 'N.d.',
            publication: result.publication_info || 'Unknown publication',
            abstract: result.snippet,
            url: result.link,
            source: isCitationSearch ? 'Google Scholar Citations' : 'Google Scholar'
          }));
          break;

        case 'Crossref':
        case 'ACM (Crossref)':
        case 'Crossref (ACM)':
          convertedResults = (data.results || []).map((result: CrossrefSearchResult, index: number) => ({
            id: result.doi || `crossref-${index}`,
            title: result.title || 'No title',
            author: result.authors ? result.authors.join(', ') : 'Unknown',
            year: result.publication_year?.toString() || 'N.d.',
            publication: result.journal || result.publisher || 'Unknown publication',
            doi: result.doi,
            abstract: result.abstract,
            url: result.url,
            source: (actualSource === 'ACM (Crossref)' || actualSource === 'Crossref (ACM)') ? 'Crossref (ACM)' : 'Crossref'
          }));
          break;

        case 'PubMed':
          convertedResults = (data.results || []).map((result: PubMedSearchResult, index: number) => ({
            id: result.pmid || `pubmed-${index}`,
            title: result.title || 'No title',
            author: result.authors ? result.authors.join(', ') : 'Unknown',
            year: result.publication_date ? new Date(result.publication_date).getFullYear().toString() : 'N.d.',
            publication: result.journal || 'Unknown publication',
            doi: result.doi,
            abstract: result.abstract,
            url: result.url,
            source: 'PubMed'
          }));
          break;

        case 'IEEE Xplore':
          convertedResults = (data.results || []).map((result: IEEESearchResult, index: number) => ({
            id: result.id || `ieee-${index}`,
            title: result.title || 'No title',
            author: result.authors ? result.authors.join(', ') : 'Unknown',
            year: result.publication_year?.toString() || 'N.d.',
            publication: result.publication_title || 'Unknown publication',
            doi: result.doi,
            abstract: result.abstract,
            url: result.url,
            source: 'IEEE Xplore'
          }));
          break;

        case 'ACM Digital Library':
          convertedResults = (data.results || []).map((result: any, index: number) => ({
            id: result.id || `acm-${index}`,
            title: result.title || 'No title',
            author: result.authors ? result.authors.join(', ') : 'Unknown',
            year: result.year?.toString() || 'N.d.',
            publication: result.publication || 'Unknown publication',
            doi: result.doi,
            abstract: result.abstract,
            url: result.url,
            source: 'ACM Digital Library'
          }));
          break;

        case 'arXiv':
          convertedResults = (data.results || []).map((result: ArxivSearchResult, index: number) => ({
            id: result.id || `arxiv-${index}`,
            title: result.title || 'No title',
            author: result.authors ? result.authors.join(', ') : 'Unknown',
            year: result.published ? new Date(result.published).getFullYear().toString() : 'N.d.',
            publication: result.journal_ref || 'arXiv preprint',
            doi: result.doi,
            abstract: result.abstract,
            url: result.abs_url || result.pdf_url,
            source: 'arXiv'
          }));
          break;

        case '국회도서관':
          convertedResults = (data.results || []).map((result: NalibSearchResult, index: number) => ({
            id: result.id || `nalib-${index}`,
            title: result.title || 'No title',
            author: result.authors ? result.authors.join(', ') : 'Unknown',
            year: result.publication_year?.toString() || 'N.d.',
            publication: result.publisher || 'Unknown publication',
            abstract: result.description,
            url: result.url,
            source: '국회도서관'
          }));
          break;

        case '한국학술정보(KCI)':
          convertedResults = (data.results || []).map((result: KciSearchResult, index: number) => ({
            id: result.id || `kci-${index}`,
            title: result.title || 'No title',
            author: result.authors ? result.authors.join(', ') : 'Unknown',
            year: result.publication_year?.toString() || 'N.d.',
            publication: result.journal || 'Unknown publication',
            doi: result.doi,
            abstract: result.abstract,
            url: result.url,
            source: '한국학술정보(KCI)'
          }));
          break;

        // 주석 처리된 검색 소스들의 응답 처리 (API 키 준비 후 활성화)
        /*
        case 'DOAJ':
          convertedResults = (data.results || []).map((result: DOAJSearchResult, index: number) => ({
            id: result.id || `doaj-${index}`,
            title: result.title || 'No title',
            author: result.authors ? result.authors.join(', ') : 'Unknown',
            year: result.publication_date ? new Date(result.publication_date).getFullYear().toString() : 'N.d.',
            publication: result.journal || 'Unknown publication',
            doi: result.doi,
            abstract: result.abstract,
            url: result.url,
            source: 'DOAJ'
          }));
          break;

        case 'CORE':
          convertedResults = (data.results || []).map((result: CORESearchResult, index: number) => ({
            id: result.id || `core-${index}`,
            title: result.title || 'No title',
            author: result.authors ? result.authors.join(', ') : 'Unknown',
            year: result.publication_date ? new Date(result.publication_date).getFullYear().toString() : 'N.d.',
            publication: result.journal || result.repository || 'Unknown publication',
            doi: result.doi,
            abstract: result.abstract,
            url: result.url || result.download_url,
            source: 'CORE'
          }));
          break;

        case 'Semantic Scholar':
          convertedResults = (data.results || []).map((result: SemanticScholarSearchResult, index: number) => ({
            id: result.id || `semantic-${index}`,
            title: result.title || 'No title',
            author: result.authors ? result.authors.join(', ') : 'Unknown',
            year: result.year?.toString() || 'N.d.',
            publication: result.venue || 'Unknown publication',
            doi: result.doi,
            abstract: result.abstract,
            url: result.url,
            source: 'Semantic Scholar'
          }));
          break;

        case 'Scopus':
          convertedResults = (data.results || []).map((result: ScopusSearchResult, index: number) => ({
            id: result.id || `scopus-${index}`,
            title: result.title || 'No title',
            author: result.author || 'Unknown',
            year: result.year || 'N.d.',
            publication: result.publication || 'Unknown publication',
            doi: result.doi,
            abstract: result.abstract,
            url: result.url,
            source: 'Scopus'
          }));
          break;

        case 'Web of Science':
          convertedResults = (data.results || []).map((result: WebOfScienceSearchResult, index: number) => ({
            id: result.id || `wos-${index}`,
            title: result.title || 'No title',
            author: result.authors ? result.authors.join(', ') : 'Unknown',
            year: result.publication_year?.toString() || 'N.d.',
            publication: result.journal || 'Unknown publication',
            doi: result.doi,
            abstract: result.abstract,
            url: result.url,
            source: 'Web of Science'
          }));
          break;
        */

        default:
          console.warn(`Unknown search source: ${actualSource}`);
          convertedResults = [];
      }

      console.log('Converted results:', convertedResults);
      setSearchResults(convertedResults);
      setTotalResults(data.total_results || convertedResults.length);
      setCurrentPage(1); // 검색 후 첫 페이지로 리셋
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setTotalResults(0);
      
      // 사용자에게 에러 메시지 표시 (실제 구현에서는 toast나 alert 사용)
      if (error instanceof Error) {
        alert(`검색 중 오류가 발생했습니다: ${error.message}`);
      } else {
        alert('검색 중 알 수 없는 오류가 발생했습니다.');
      }
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
                  <option value="국회도서관">국회도서관</option>
                  <option value="한국학술정보(KCI)">한국학술정보(KCI)</option>
                  <option value="Google Scholar">Google Scholar</option>
                  <option value="PubMed">PubMed</option>
                  <option value="IEEE Xplore">IEEE Xplore</option>
                  <option value="ACM Digital Library">ACM Digital Library </option>
                  <option value="Crossref">Crossref</option>
                  <option value="arXiv">arXiv</option>
                  {/* API 키가 준비되지 않은 검색 소스들 - 임시 숨김 */}
                  {/* <option value="DOAJ">DOAJ (지원됨)</option> */}
                  {/* <option value="CORE">CORE (지원됨)</option> */}
                  {/* <option value="Semantic Scholar">Semantic Scholar (지원됨)</option> */}
                  {/* <option value="Scopus">Scopus (지원됨)</option> */}
                  {/* <option value="Web of Science">Web of Science (지원됨)</option> */}
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