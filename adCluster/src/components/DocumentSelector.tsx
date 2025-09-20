import React, { useState, useEffect } from 'react';

type DocumentType = 'citation' | 'image' | 'table' | 'formula' | 'video' | 'audio' | 'code' | 'text';

interface BaseDocument {
  id: string;
  name: string;
  projectId: string;
  folderId: string;
  date: string;
  type: DocumentType;
  title: string;
  description?: string;
  source?: string;
  tags?: string[];
}

interface CitationDocument extends BaseDocument {
  type: 'citation';
  content: string;
  originalText: string;
  documentInfo?: string;
  pageNumber?: number;
}

interface ImageDocument extends BaseDocument {
  type: 'image';
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface TableDocument extends BaseDocument {
  type: 'table';
  data: any[][];
  headers?: string[];
  tableType: 'excel' | 'css';
  styles?: any;
}

interface FormulaDocument extends BaseDocument {
  type: 'formula';
  latex: string;
  rendered?: string;
}

interface VideoDocument extends BaseDocument {
  type: 'video';
  url: string;
  duration?: number;
  thumbnail?: string;
}

interface AudioDocument extends BaseDocument {
  type: 'audio';
  url: string;
  duration?: number;
}

interface CodeDocument extends BaseDocument {
  type: 'code';
  code: string;
  language: string;
  framework?: string;
}

interface TextDocument extends BaseDocument {
  type: 'text';
  content: string;
}

type Document = CitationDocument | ImageDocument | TableDocument | FormulaDocument | VideoDocument | AudioDocument | CodeDocument | TextDocument;

interface DocumentSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (document: Document) => void;
  allowedTypes?: DocumentType[];
  title?: string;
}

const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  allowedTypes,
  title = "자료 선택"
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<DocumentType | 'all'>('all');

  // Mock data - 실제 환경에서는 API에서 가져옴
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: 'd1',
        name: 'sample_citation.txt',
        projectId: 'p1',
        folderId: 'f1',
        date: '2024-01-15',
        type: 'citation',
        title: '중요한 인용문',
        description: '연구에 필요한 핵심 인용문',
        source: '학술논문 A',
        content: '이것은 중요한 연구 결과입니다.',
        originalText: '원본 텍스트입니다.',
        documentInfo: '논문 제목',
        pageNumber: 15
      },
      {
        id: 'd2',
        name: 'diagram.png',
        projectId: 'p1',
        folderId: 'f1',
        date: '2024-01-16',
        type: 'image',
        title: '시스템 다이어그램',
        description: '전체 시스템 구조도',
        source: '내부 문서',
        url: '/images/diagram.png',
        alt: '시스템 구조도',
        width: 800,
        height: 600
      },
      {
        id: 'd3',
        name: 'formula.tex',
        projectId: 'p1',
        folderId: 'f2',
        date: '2024-01-17',
        type: 'formula',
        title: '핵심 공식',
        description: '계산에 필요한 수학 공식',
        source: '수학 교재',
        latex: 'E = mc^2',
        rendered: 'E = mc²'
      }
    ];
    setDocuments(mockDocuments);
  }, []);

  useEffect(() => {
    let filtered = documents;

    // 허용된 타입으로 필터링
    if (allowedTypes && allowedTypes.length > 0) {
      filtered = filtered.filter(doc => allowedTypes.includes(doc.type));
    }

    // 선택된 타입으로 필터링
    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.type === selectedType);
    }

    // 검색어로 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.name.toLowerCase().includes(query) ||
        (doc.description && doc.description.toLowerCase().includes(query))
      );
    }

    setFilteredDocuments(filtered);
  }, [documents, allowedTypes, selectedType, searchQuery]);

  const getTypeLabel = (type: DocumentType) => {
    const labels = {
      citation: '인용/발취',
      image: '이미지',
      table: '표',
      formula: '수식',
      video: '동영상',
      audio: '음성',
      code: '코드',
      text: '텍스트'
    };
    return labels[type];
  };

  const getTypeIcon = (type: DocumentType) => {
    const icons = {
      citation: '📝',
      image: '🖼️',
      table: '📊',
      formula: '🧮',
      video: '🎥',
      audio: '🎵',
      code: '💻',
      text: '📄'
    };
    return icons[type];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="mb-4 space-y-3">
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="자료 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as DocumentType | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 유형</option>
              {(!allowedTypes || allowedTypes.includes('citation')) && (
                <option value="citation">인용/발취</option>
              )}
              {(!allowedTypes || allowedTypes.includes('image')) && (
                <option value="image">이미지</option>
              )}
              {(!allowedTypes || allowedTypes.includes('table')) && (
                <option value="table">표</option>
              )}
              {(!allowedTypes || allowedTypes.includes('formula')) && (
                <option value="formula">수식</option>
              )}
              {(!allowedTypes || allowedTypes.includes('video')) && (
                <option value="video">동영상</option>
              )}
              {(!allowedTypes || allowedTypes.includes('audio')) && (
                <option value="audio">음성</option>
              )}
              {(!allowedTypes || allowedTypes.includes('code')) && (
                <option value="code">코드</option>
              )}
              {(!allowedTypes || allowedTypes.includes('text')) && (
                <option value="text">텍스트</option>
              )}
            </select>
          </div>
        </div>

        {/* 자료 목록 */}
        <div className="overflow-y-auto max-h-96">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              선택할 수 있는 자료가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredDocuments.map(doc => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSelect(doc)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{getTypeIcon(doc.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {doc.name}
                      </p>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {getTypeLabel(doc.type)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {doc.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentSelector;