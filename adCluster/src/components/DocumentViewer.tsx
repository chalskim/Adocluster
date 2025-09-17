import React, { useState } from 'react';

interface ReferenceInfo {
  id: string;
  title: string;
  authors: string[];
  journal?: string;
  year: number;
  doi?: string;
  url?: string;
  type: 'article' | 'book' | 'website' | 'conference';
  abstract?: string;
  keywords?: string[];
  citationCount?: number;
}

interface DocumentViewerProps {
  documentId: string;
  documentTitle: string;
  documentContent: string;
  references?: ReferenceInfo[];
  onClose?: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentId,
  documentTitle,
  documentContent,
  references = [],
  onClose
}) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedReference, setSelectedReference] = useState<ReferenceInfo | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  // Mock references data
  const mockReferences: ReferenceInfo[] = [
    {
      id: 'ref1',
      title: 'Modern Web Design Principles and Best Practices',
      authors: ['Smith, J.', 'Johnson, A.'],
      journal: 'Journal of Web Development',
      year: 2023,
      doi: '10.1234/jwd.2023.001',
      type: 'article',
      abstract: 'This paper explores the fundamental principles of modern web design, focusing on user experience, accessibility, and responsive design patterns.',
      keywords: ['web design', 'UX', 'responsive design'],
      citationCount: 45
    },
    {
      id: 'ref2',
      title: 'User Interface Design Patterns',
      authors: ['Brown, M.', 'Davis, K.', 'Wilson, L.'],
      year: 2022,
      type: 'book',
      abstract: 'A comprehensive guide to UI design patterns used in modern applications.',
      keywords: ['UI patterns', 'design systems', 'interface design'],
      citationCount: 128
    },
    {
      id: 'ref3',
      title: 'Accessibility in Digital Design',
      authors: ['Taylor, R.'],
      journal: 'Accessibility Today',
      year: 2023,
      url: 'https://example.com/accessibility-design',
      type: 'website',
      abstract: 'Guidelines and best practices for creating accessible digital experiences.',
      keywords: ['accessibility', 'WCAG', 'inclusive design'],
      citationCount: 67
    }
  ];

  const allReferences = references.length > 0 ? references : mockReferences;

  const handleReferenceClick = (reference: ReferenceInfo) => {
    setSelectedReference(reference);
    setShowOverlay(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return 'fas fa-newspaper';
      case 'book': return 'fas fa-book';
      case 'website': return 'fas fa-globe';
      case 'conference': return 'fas fa-users';
      default: return 'fas fa-file-alt';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'text-blue-600';
      case 'book': return 'text-green-600';
      case 'website': return 'text-purple-600';
      case 'conference': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
      {/* Main Document Viewer */}
      <div className={`flex-1 bg-white transition-all duration-300 ${showSidebar ? 'mr-96' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">{documentTitle}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                showSidebar 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <i className="fas fa-bookmark mr-2"></i>
              출처 정보 ({allReferences.length})
            </button>
            <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">
              <i className="fas fa-download mr-2"></i>
              다운로드
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-6 overflow-y-auto h-full">
          <div className="max-w-4xl mx-auto">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: documentContent }}
            />
          </div>
        </div>
      </div>

      {/* Reference Sidebar */}
      {showSidebar && (
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">출처 정보</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              총 {allReferences.length}개의 참고문헌
            </p>
          </div>

          {/* Reference List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {allReferences.map((reference) => (
                <div
                  key={reference.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleReferenceClick(reference)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 ${getTypeColor(reference.type)}`}>
                      <i className={getTypeIcon(reference.type)}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm leading-tight">
                        {reference.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {reference.authors.join(', ')} ({reference.year})
                      </p>
                      {reference.journal && (
                        <p className="text-xs text-gray-500 mt-1">
                          <i className="fas fa-journal-whills mr-1"></i>
                          {reference.journal}
                        </p>
                      )}
                      {reference.citationCount && (
                        <p className="text-xs text-gray-500 mt-1">
                          <i className="fas fa-quote-right mr-1"></i>
                          인용 {reference.citationCount}회
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {reference.keywords?.slice(0, 2).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t bg-gray-50">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              <i className="fas fa-plus mr-2"></i>
              새 출처 추가
            </button>
          </div>
        </div>
      )}

      {/* Reference Detail Overlay */}
      {showOverlay && selectedReference && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Overlay Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`${getTypeColor(selectedReference.type)}`}>
                    <i className={`${getTypeIcon(selectedReference.type)} text-xl`}></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedReference.title}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {selectedReference.authors.join(', ')} ({selectedReference.year})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOverlay(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            {/* Overlay Content */}
            <div className="p-6">
              {selectedReference.journal && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">출판 정보</h3>
                  <p className="text-gray-700">{selectedReference.journal}</p>
                </div>
              )}

              {selectedReference.abstract && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">초록</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedReference.abstract}</p>
                </div>
              )}

              {selectedReference.keywords && selectedReference.keywords.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">키워드</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReference.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {selectedReference.citationCount && (
                    <span>
                      <i className="fas fa-quote-right mr-1"></i>
                      인용 {selectedReference.citationCount}회
                    </span>
                  )}
                  {selectedReference.doi && (
                    <span>
                      <i className="fas fa-link mr-1"></i>
                      DOI: {selectedReference.doi}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  {selectedReference.url && (
                    <a
                      href={selectedReference.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <i className="fas fa-external-link-alt mr-2"></i>
                      원문 보기
                    </a>
                  )}
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">
                    <i className="fas fa-copy mr-2"></i>
                    인용 복사
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;