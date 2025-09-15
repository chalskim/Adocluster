import React, { useState, useEffect } from 'react';
import { useWebSocketConnection } from '../hooks/useWebSocketConnection';

const DocumentMnagement: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { isConnected, userId } = useWebSocketConnection(); // Use WebSocket connection hook

  // Mock data for projects
  const mockProjects = [
    { id: '1', name: '프로젝트 A' },
    { id: '2', name: '프로젝트 B' },
    { id: '3', name: '프로젝트 C' },
  ];

  // Mock data for folders and documents
  const mockFolders = [
    { id: 'f1', name: '회의록', projectId: '1' },
    { id: 'f2', name: '기획서', projectId: '1' },
    { id: 'f3', name: '디자인', projectId: '1' },
  ];

  const mockDocuments = [
    { id: 'd1', name: '2025년 9월 회의록', projectId: '1', folderId: 'f1', date: '2025-09-13' },
    { id: 'd2', name: '프로젝트 기획서 v1', projectId: '1', folderId: 'f2', date: '2025-09-10' },
    { id: 'd3', name: 'UI 디자인 초안', projectId: '1', folderId: 'f3', date: '2025-09-08' },
    { id: 'd4', name: '기술 요구사항 명세', projectId: '1', folderId: 'f2', date: '2025-09-05' },
  ];

  // Filter documents based on selected project and search query
  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesProject = !selectedProject || doc.projectId === selectedProject;
    const matchesSearch = !searchQuery || doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesSearch;
  });

  // Log WebSocket connection status for debugging
  useEffect(() => {
    console.log('WebSocket connection status:', isConnected ? 'Connected' : 'Disconnected');
    if (userId) {
      console.log('User ID for WebSocket connection:', userId);
    }
  }, [isConnected, userId]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">문서 관리</h1>
        <p className="text-gray-500 mt-1">프로젝트 내 문서를 추가 및 삭제 가능합니다.</p>
        {/* Show WebSocket connection status */}
        <div className="mt-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <span className={`mr-1.5 h-2 w-2 rounded-full ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`}></span>
            WebSocket: {isConnected ? '연결됨' : '연결되지 않음'}
          </span>
          {userId && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Client ID: {userId}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
        {/* 2-column grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Project selector and folder/document tree */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">프로젝트 선택</label>
              <select 
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">모든 프로젝트</option>
                {mockProjects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div className="border rounded-lg p-4 mt-4">
              <h3 className="font-medium text-gray-800 mb-3">프로젝트 구조</h3>
              <div className="space-y-2">
                {mockFolders.map(folder => (
                  <div key={folder.id} className="ml-2">
                    <div className="flex items-center py-1">
                      <i className="fas fa-folder text-yellow-500 mr-2"></i>
                      <span className="text-sm">{folder.name}</span>
                    </div>
                    <div className="ml-6 space-y-1">
                      {mockDocuments
                        .filter(doc => doc.folderId === folder.id)
                        .map(doc => (
                          <div key={doc.id} className="flex items-center py-1 text-sm text-gray-600">
                            <i className="fas fa-file-alt text-gray-400 mr-2"></i>
                            <span>{doc.name}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Document search and list */}
          <div>
            <div className="mb-4">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="문서 제목, 내용, 태그 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredDocuments.map(doc => (
                <div key={doc.id} className="border rounded-lg p-4 hover:shadow transition bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{doc.name}</h3>
                    <span className="text-xs text-gray-400">{doc.date}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <i className="fas fa-folder text-gray-400"></i>
                      <span>
                        {mockProjects.find(p => p.id === doc.projectId)?.name || '프로젝트'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        열기
                      </button>
                      <button className="text-gray-500 hover:text-gray-700 text-sm">
                        더보기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentMnagement;