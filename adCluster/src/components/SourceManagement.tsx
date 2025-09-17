import React, { useState, useEffect } from 'react';
import { fetchProjects, Project } from '../services/api';

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
  projectId?: string; // 프로젝트 ID 추가
}

interface SourceManagementProps {
  projectId?: string;
  onSourceSelect?: (source: SourceInfo) => void;
}

const SourceManagement: React.FC<SourceManagementProps> = ({ projectId, onSourceSelect }) => {
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'title' | 'year' | 'addedDate' | 'citationCount'>('addedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSource, setEditingSource] = useState<SourceInfo | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'table'>('list');

  // Mock data for demonstration
  useEffect(() => {
    // 프로젝트 목록 로드
    const loadProjects = async () => {
      try {
        const fetchedProjects = await fetchProjects(100);
        if (fetchedProjects) {
          setProjects(fetchedProjects);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };

    loadProjects();

    const mockSources: SourceInfo[] = [
      {
        id: '1',
        title: 'Deep Learning for Natural Language Processing',
        authors: ['John Smith', 'Jane Doe'],
        year: 2023,
        type: 'article',
        journal: 'Journal of AI Research',
        doi: '10.1000/182',
        tags: ['deep learning', 'NLP', 'AI'],
        notes: 'Important paper on transformer architectures',
        addedDate: new Date('2024-01-15'),
        citationCount: 156,
        isBookmarked: true,
        projectId: '1'
      },
      {
        id: '2',
        title: 'Machine Learning: A Probabilistic Perspective',
        authors: ['Kevin Murphy'],
        year: 2012,
        type: 'book',
        publisher: 'MIT Press',
        tags: ['machine learning', 'probability', 'textbook'],
        notes: 'Comprehensive textbook on ML fundamentals',
        addedDate: new Date('2024-01-10'),
        citationCount: 2847,
        isBookmarked: false,
        projectId: '2'
      }
    ];
    setSources(mockSources);
  }, []);

  const filteredSources = sources.filter(source => {
    const matchesSearch = source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         source.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || source.type === selectedType;
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => source.tags.includes(tag));
    const matchesProject = selectedProjectId === 'all' || source.projectId === selectedProjectId;
    
    return matchesSearch && matchesType && matchesTags && matchesProject;
  });

  // 검색어와 필터 상태 변수들 추가
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [setIsBookmarked] = useState(() => (sourceId: string, bookmarked: boolean) => {
    setSources(sources.map(s => 
      s.id === sourceId ? { ...s, isBookmarked: bookmarked } : s
    ));
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
    // Implementation for export functionality
  };

  const handleImportSources = (file: File) => {
    console.log('Importing sources from file:', file.name);
    // Implementation for import functionality
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
      {/* Header */}
      <div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">연구 프로젝트 출처 관리</h1>
          <p className="text-gray-600 mt-1">
            연구 프로젝트별로 출처를 체계적으로 관리하고 정리하세요
          </p>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Source Management Panel */}
        <div className="w-full lg:w-1/2 bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">출처 검색 및 관리</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <i className="fas fa-book" />
              <span>총 {sources.length}개 출처</span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-4 space-y-3">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="text"
                placeholder="Google Scholar, PubMed 등에서 검색..."
                className="flex-1 p-2 border border-gray-300 rounded"
              />
              <select className="p-2 border border-gray-300 rounded sm:w-auto">
                <option>Google Scholar</option>
                <option>PubMed</option>
                <option>IEEE Xplore</option>
                <option>ACM Digital Library</option>
              </select>
              <button 
                type="button"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 sm:w-auto"
              >
                검색
              </button>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 sm:w-auto"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Sources List */}
          <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">
                  검색 결과
                </h3>
                <span className="text-sm text-gray-500">
                  {sortedSources.length}개 출처
                </span>
              </div>
              
              {sortedSources.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {sortedSources.map(source => (
                    <div 
                      key={source.id} 
                      className="source-card p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
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
                                  <span key={index} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              {source.citationCount > 0 && (
                                <span>인용 {source.citationCount}회</span>
                              )}
                              <span>추가일: {source.addedDate.toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // PDF 미리보기 기능 구현
                                  console.log('PDF 미리보기:', source.title);
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                title="PDF 미리보기"
                              >
                                <i className="fas fa-file-pdf text-xs" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // 저장 기능 구현
                                }}
                                className="p-1.5 text-gray-400 hover:text-green-500 rounded-lg transition-colors"
                              >
                                <i className="fas fa-save text-xs" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <i className="fas fa-search text-4xl mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h4>
                  <p className="text-sm">다른 검색어나 필터를 시도해보세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Project Sources Panel */}
        <div className="w-full lg:w-1/2 bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-900">연구 프로젝트별 출처</h2>
              <select 
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">모든 프로젝트</option>
                {projects.map(project => (
                  <option key={project.prjID} value={project.prjID}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-end">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={handleAddSource}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
                >
                  <i className="fas fa-plus text-xs" />
                  <span>출처 추가</span>
                </button>
                <div className="relative">
                  <select
                    onChange={(e) => handleExportSources(e.target.value as any)}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-200 appearance-none pr-6"
                  >
                    <option value="">내보내기</option>
                    <option value="bibtex">BibTeX</option>
                    <option value="ris">RIS</option>
                    <option value="csv">CSV</option>
                  </select>
                  <i className="fas fa-download absolute right-1 top-1.5 text-gray-500 pointer-events-none text-xs" />
                </div>
                <label className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-200 cursor-pointer flex items-center space-x-1">
                  <i className="fas fa-upload text-xs" />
                  <span>가져오기</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".bib,.ris,.csv"
                    onChange={(e) => e.target.files?.[0] && handleImportSources(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
          </div>
          
          {/* Project Statistics */}
          {selectedProjectId !== 'all' && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">프로젝트 출처 통계</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-2 rounded">
                  <div className="text-gray-500">총 출처</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {sortedSources.length}개
                  </div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-gray-500">유형별 분포</div>
                  <div className="text-xs mt-1">
                    {Object.entries(
                      sortedSources.reduce((acc, source) => {
                        acc[source.type] = (acc[source.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <span>{type}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-gray-500">최근 추가</div>
                  <div className="text-sm font-medium">
                    {sortedSources.length > 0 
                      ? Math.max(...sortedSources.map(s => s.addedDate.getTime())) === 
                        Math.max(...sortedSources.map(s => s.addedDate.getTime()))
                        ? new Date(Math.max(...sortedSources.map(s => s.addedDate.getTime()))).toLocaleDateString()
                        : '없음'
                      : '없음'
                    }
                  </div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-gray-500">북마크</div>
                  <div className="text-lg font-semibold text-yellow-600">
                    {sortedSources.filter(s => s.isBookmarked).length}개
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Project Sources List */}
          <div className="flex-1 overflow-auto border border-gray-200 rounded">
            <div className="p-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">
                  {selectedProjectId === 'all' 
                    ? '전체 프로젝트 출처' 
                    : `${projects.find(p => p.id === selectedProjectId)?.title} 출처`
                  }
                </h3>
                <span className="text-sm text-gray-500">
                  ({sortedSources.length}개)
                </span>
              </div>
              
              {sortedSources.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {sortedSources.map(source => (
                    <div key={source.id} className="source-card p-3 border border-gray-200 rounded hover:bg-gray-50">
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

      {/* Add/Edit Source Modal would go here */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingSource ? '출처 편집' : '새 출처 추가'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로젝트 선택 *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  defaultValue={editingSource?.projectId || selectedProjectId !== 'all' ? selectedProjectId : ''}
                >
                  <option value="">프로젝트를 선택하세요</option>
                  {projects.map(project => (
                    <option key={project.prjID} value={project.prjID}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목 *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="출처 제목을 입력하세요"
                  defaultValue={editingSource?.title || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  저자
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="저자명을 쉼표로 구분하여 입력하세요"
                  defaultValue={editingSource?.authors.join(', ') || ''}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    유형
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    defaultValue={editingSource?.type || 'article'}
                  >
                    <option value="article">논문</option>
                    <option value="book">도서</option>
                    <option value="conference">학회</option>
                    <option value="thesis">학위논문</option>
                    <option value="website">웹사이트</option>
                    <option value="other">기타</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    연도
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="발행 연도"
                    defaultValue={editingSource?.year || ''}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  태그
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="태그를 쉼표로 구분하여 입력하세요"
                  defaultValue={editingSource?.tags.join(', ') || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메모
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="출처에 대한 메모를 입력하세요"
                  defaultValue={editingSource?.notes || ''}
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
                onClick={() => setShowAddModal(false)}
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