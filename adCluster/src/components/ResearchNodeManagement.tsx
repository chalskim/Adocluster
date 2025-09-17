import React, { useState, useEffect } from 'react';

interface ResearchNode {
  id: string;
  title: string;
  description: string;
  type: 'concept' | 'data' | 'analysis' | 'reference';
  connections: string[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

const ResearchNodeManagement: React.FC = () => {
  const [nodes, setNodes] = useState<ResearchNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<ResearchNode | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // 샘플 데이터
  useEffect(() => {
    const sampleNodes: ResearchNode[] = [
      {
        id: '1',
        title: '데이터 수집 방법론',
        description: '연구 프로젝트에서 사용할 데이터 수집 방법론에 대한 개념 정리',
        type: 'concept',
        connections: ['2', '3'],
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        tags: ['방법론', '데이터수집', '연구설계']
      },
      {
        id: '2',
        title: '설문조사 데이터',
        description: '사용자 만족도 설문조사 결과 데이터',
        type: 'data',
        connections: ['1', '4'],
        createdAt: '2024-01-18',
        updatedAt: '2024-01-22',
        tags: ['설문조사', '사용자만족도', '정량데이터']
      },
      {
        id: '3',
        title: '통계 분석 결과',
        description: '수집된 데이터에 대한 통계 분석 결과 및 해석',
        type: 'analysis',
        connections: ['1', '2'],
        createdAt: '2024-01-20',
        updatedAt: '2024-01-25',
        tags: ['통계분석', '데이터해석', '결과']
      },
      {
        id: '4',
        title: '관련 논문 참고자료',
        description: '연구 주제와 관련된 기존 논문 및 참고자료 모음',
        type: 'reference',
        connections: ['2'],
        createdAt: '2024-01-12',
        updatedAt: '2024-01-19',
        tags: ['논문', '참고자료', '문헌조사']
      }
    ];
    setNodes(sampleNodes);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'concept': return 'fas fa-lightbulb';
      case 'data': return 'fas fa-database';
      case 'analysis': return 'fas fa-chart-line';
      case 'reference': return 'fas fa-book';
      default: return 'fas fa-circle';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'concept': return 'bg-yellow-500';
      case 'data': return 'bg-blue-500';
      case 'analysis': return 'bg-green-500';
      case 'reference': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || node.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="research-node-management min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">연구노드 관리</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            <i className="fas fa-plus mr-2"></i>
            새 노드 생성
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="노드 제목, 설명, 태그로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">모든 타입</option>
                <option value="concept">개념</option>
                <option value="data">데이터</option>
                <option value="analysis">분석</option>
                <option value="reference">참고자료</option>
              </select>
            </div>
          </div>
        </div>

        {/* 노드 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNodes.map((node) => (
            <div
              key={node.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => setSelectedNode(node)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-full ${getTypeColor(node.type)} text-white flex items-center justify-center`}>
                  <i className={getTypeIcon(node.type)}></i>
                </div>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-blue-600 transition-colors">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="text-gray-400 hover:text-red-600 transition-colors">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">{node.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{node.description}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {node.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {node.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    +{node.tags.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>연결: {node.connections.length}개</span>
                <span>{node.updatedAt}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredNodes.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">검색 조건에 맞는 노드가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchNodeManagement;