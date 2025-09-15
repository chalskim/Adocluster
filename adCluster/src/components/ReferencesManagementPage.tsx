// src/components/ReferencesManagementPage.tsx
import React, { useState } from 'react';
import { ReferenceItem } from '../data/mockData';

const ReferencesManagementPage: React.FC = () => {
  // Sample projects data
  const [projects] = useState([
    { id: 'proj-1', name: '연구 프로젝트 A' },
    { id: 'proj-2', name: '연구 프로젝트 B' },
    { id: 'proj-3', name: '연구 프로젝트 C' },
  ]);

  const [selectedProject, setSelectedProject] = useState('proj-1');
  
  // Sample references data for each project
  const [projectReferences, setProjectReferences] = useState<Record<string, ReferenceItem[]>>({
    'proj-1': [
      {
        id: 'ref-1',
        author: 'Smith, J.',
        year: 2020,
        title: 'AI in Content Creation',
        publication: 'Journal of AI Research, 15(3), 123-145',
      },
      {
        id: 'ref-2',
        author: 'Johnson, A.',
        year: 2019,
        title: 'Collaborative Writing Platforms',
        publication: 'Tech Writing Review, 8(2), 67-89',
      }
    ],
    'proj-2': [
      {
        id: 'ref-3',
        author: 'Brown, T.',
        year: 2021,
        title: 'Modern Data Visualization Techniques',
        publication: 'Visualization Quarterly, 12(1), 45-67',
      }
    ],
    'proj-3': [],
  });

  // Sample search results
  const [searchResults] = useState<ReferenceItem[]>([
    {
      id: 'search-1',
      author: 'Lee, S., & Park, J.',
      year: 2023,
      title: 'Machine Learning Applications in Education',
      publication: 'Journal of Educational Technology, 15(2), 45-60',
    },
    {
      id: 'search-2',
      author: 'Kim, H., et al.',
      year: 2022,
      title: 'Deep Learning for Natural Language Processing',
      publication: 'AI Review, 28(4), 123-140',
    },
    {
      id: 'search-3',
      author: 'Chen, M., & Wang, L.',
      year: 2021,
      title: 'Computer Vision in Healthcare',
      publication: 'Medical AI Journal, 7(3), 89-105',
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReference, setSelectedReference] = useState<ReferenceItem | null>(null);

  const handleCiteReference = (reference: ReferenceItem) => {
    console.log('Cite reference:', reference);
    // Implement citation functionality here
  };

  const handleAddReferenceToProject = (reference: ReferenceItem) => {
    // Check if reference is already in the project
    const isAlreadyAdded = projectReferences[selectedProject]?.some(ref => ref.id === reference.id);
    
    if (!isAlreadyAdded) {
      setProjectReferences(prev => ({
        ...prev,
        [selectedProject]: [...(prev[selectedProject] || []), reference]
      }));
    }
  };

  const handleRemoveReferenceFromProject = (referenceId: string) => {
    setProjectReferences(prev => ({
      ...prev,
      [selectedProject]: (prev[selectedProject] || []).filter(ref => ref.id !== referenceId)
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would call an API
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="references-management-page p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">참고문헌 관리</h1>
        <div className="text-sm text-gray-500">
          프로젝트: {projects.find(p => p.id === selectedProject)?.name}
        </div>
      </div>
      
      <div className="flex gap-6 h-full">
        {/* Search Panel */}
        <div className="w-1/2 bg-white rounded-lg shadow p-4 flex flex-col">
          <div className="section-title mb-4">외부 참고문헌 검색</div>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Google Scholar, PubMed 등에서 검색..."
                className="flex-1 p-2 border border-gray-300 rounded"
              />
              <select className="p-2 border border-gray-300 rounded">
                <option>Google Scholar</option>
                <option>PubMed</option>
                <option>IEEE Xplore</option>
                <option>ACM Digital Library</option>
              </select>
              <button 
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                검색
              </button>
            </div>
          </form>
          
          {/* Search Results */}
          <div className="flex-1 overflow-auto border border-gray-200 rounded">
            <div className="p-3">
              <h3 className="font-medium mb-3">검색 결과 ({searchResults.length}개)</h3>
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map(ref => (
                    <div 
                      key={ref.id} 
                      className={`ref-card p-3 border rounded cursor-pointer transition ${
                        selectedReference?.id === ref.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedReference(ref)}
                    >
                      <div className="flex justify-between">
                        <p className="ref-author text-sm font-medium">{ref.author} ({ref.year})</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddReferenceToProject(ref);
                          }}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          프로젝트에 추가
                        </button>
                      </div>
                      <p className="ref-title text-sm mt-1">{ref.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{ref.publication}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>검색 결과가 없습니다.</p>
                  <p className="text-sm mt-1">검색어를 입력하고 검색 버튼을 클릭하세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Project References Panel */}
        <div className="w-1/2 bg-white rounded-lg shadow p-4 flex flex-col">
          <div className="section-title mb-4 flex justify-between items-center">
            <span>프로젝트별 참고문헌</span>
            <div className="flex gap-2">
              <select 
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="p-1 border border-gray-300 rounded text-sm"
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Project References List */}
          <div className="flex-1 overflow-auto border border-gray-200 rounded">
            <div className="p-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">
                  {projects.find(p => p.id === selectedProject)?.name} 참고문헌
                </h3>
                <span className="text-sm text-gray-500">
                  ({projectReferences[selectedProject]?.length || 0}개)
                </span>
              </div>
              
              {projectReferences[selectedProject]?.length > 0 ? (
                <div className="space-y-3">
                  {projectReferences[selectedProject]?.map(ref => (
                    <div key={ref.id} className="ref-card p-3 border border-gray-200 rounded">
                      <div className="flex justify-between">
                        <p className="ref-author text-sm font-medium">{ref.author} ({ref.year})</p>
                        <button 
                          onClick={() => handleRemoveReferenceFromProject(ref.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          제거
                        </button>
                      </div>
                      <p className="ref-title text-sm mt-1">{ref.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{ref.publication}</p>
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => handleCiteReference(ref)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded"
                        >
                          인용
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>이 프로젝트에 추가된 참고문헌이 없습니다.</p>
                  <p className="text-sm mt-1">왼쪽에서 참고문헌을 검색하고 추가하세요.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Selected Reference Info */}
          {selectedReference && (
            <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
              <h3 className="font-medium mb-2">선택된 참고문헌</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">저자:</span> {selectedReference.author}</p>
                <p><span className="font-medium">년도:</span> {selectedReference.year}</p>
                <p><span className="font-medium">제목:</span> {selectedReference.title}</p>
                <p><span className="font-medium">출판:</span> {selectedReference.publication}</p>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAddReferenceToProject(selectedReference)}
                  className="flex-1 bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-600"
                >
                  프로젝트에 추가
                </button>
                <button
                  onClick={() => setSelectedReference(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-400"
                >
                  닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferencesManagementPage;