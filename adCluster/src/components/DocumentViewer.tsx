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

// Add review/feedback interfaces
interface Review {
  id: string;
  documentId: string;
  reviewerId: string;
  reviewerName: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  section?: string;
}

interface Comment {
  id: string;
  reviewId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  section?: string;
}

interface Feedback {
  id: string;
  documentId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'reviewed' | 'implemented';
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
  const [activeTab, setActiveTab] = useState<'references' | 'reviews'>('references');
  const [showReviewPanel, setShowReviewPanel] = useState(false);

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

  // Mock reviews data
  const mockReviews: Review[] = [
    {
      id: 'r1',
      documentId: documentId,
      reviewerId: 'user1',
      reviewerName: '김개발',
      status: 'completed',
      createdAt: '2023-11-20T10:30:00Z',
      updatedAt: '2023-11-21T14:15:00Z',
      comments: [
        {
          id: 'c1',
          reviewId: 'r1',
          content: '기술 아키텍처 부분에서 AWS 서비스 선택 근거를 더 명확히 설명해 주세요.',
          authorId: 'user1',
          authorName: '김개발',
          createdAt: '2023-11-20T10:30:00Z',
          updatedAt: '2023-11-20T10:30:00Z',
          section: '3. 기술 아키텍처'
        },
        {
          id: 'c2',
          reviewId: 'r1',
          content: 'AWS 선택 근거는 비용 효율성과 확장성 때문입니다. 관련 내용을 보충 설명하겠습니다.',
          authorId: 'author1',
          authorName: '논문 저자',
          createdAt: '2023-11-21T14:15:00Z',
          updatedAt: '2023-11-21T14:15:00Z',
          section: '3. 기술 아키텍처'
        }
      ],
      section: '3. 기술 아키텍처'
    },
    {
      id: 'r2',
      documentId: documentId,
      reviewerId: 'user2',
      reviewerName: '이디자인',
      status: 'in-progress',
      createdAt: '2023-11-18T09:15:00Z',
      updatedAt: '2023-11-18T09:15:00Z',
      comments: [
        {
          id: 'c3',
          reviewId: 'r2',
          content: '프로젝트 일정이 다소 낙관적으로 보입니다. 리스크 요소를 추가로 고려해 주세요.',
          authorId: 'user2',
          authorName: '이디자인',
          createdAt: '2023-11-18T09:15:00Z',
          updatedAt: '2023-11-18T09:15:00Z',
          section: '5. 프로젝트 일정'
        }
      ],
      section: '5. 프로젝트 일정'
    }
  ];

  // Mock feedback data
  const mockFeedbacks: Feedback[] = [
    {
      id: 'f1',
      documentId: documentId,
      content: '전반적으로 잘 구성되었으나, 기술 스택 선택 근거를 더 구체적으로 설명해주시면 좋겠습니다.',
      authorId: 'user1',
      authorName: '김개발',
      status: 'implemented',
      createdAt: '2023-11-20T10:30:00Z',
      updatedAt: '2023-11-21T14:15:00Z'
    },
    {
      id: 'f2',
      documentId: documentId,
      content: '사용자 인터뷰 질문지의 구성이 다소 단순합니다. 더 심층적인 질문이 필요해 보입니다.',
      authorId: 'user2',
      authorName: '이디자인',
      status: 'reviewed',
      createdAt: '2023-11-18T09:15:00Z',
      updatedAt: '2023-11-18T09:15:00Z'
    }
  ];

  const allReferences = references.length > 0 ? references : mockReferences;
  const allReviews = mockReviews;
  const allFeedbacks = mockFeedbacks;

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
              {showSidebar && activeTab === 'references' ? '출처 정보' : 
               showSidebar && activeTab === 'reviews' ? '리뷰/피드백' : '정보'}
              ({allReferences.length + allReviews.length})
            </button>
            <button 
              onClick={() => {
                setActiveTab('reviews');
                setShowSidebar(true);
              }}
              className="px-3 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <i className="fas fa-comments mr-2"></i>
              리뷰/피드백
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
            
            {/* Review indicators for sections with reviews */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">
                <i className="fas fa-info-circle mr-2"></i>
                리뷰/피드백 정보
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                이 문서에는 {allReviews.length}개의 리뷰와 {allFeedbacks.length}개의 피드백이 있습니다.
              </p>
              <div className="flex flex-wrap gap-2">
                {allReviews.filter(r => r.section).map(review => (
                  <button
                    key={review.id}
                    className="px-3 py-1 bg-white border border-blue-300 text-blue-700 rounded-full text-xs hover:bg-blue-100 transition-colors"
                    onClick={() => {
                      setActiveTab('reviews');
                      setShowSidebar(true);
                    }}
                  >
                    <i className="fas fa-comment mr-1"></i>
                    {review.section}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reference Sidebar */}
      {showSidebar && (
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {activeTab === 'references' ? '출처 정보' : '리뷰/피드백'}
              </h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="flex mt-2">
              <button
                className={`px-3 py-1 text-sm font-medium rounded-l ${
                  activeTab === 'references'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setActiveTab('references')}
              >
                출처 ({allReferences.length})
              </button>
              <button
                className={`px-3 py-1 text-sm font-medium rounded-r ${
                  activeTab === 'reviews'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                리뷰 ({allReviews.length})
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'references' ? (
              // References content
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
            ) : (
              // Reviews content
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">리뷰 및 피드백</h3>
                  <p className="text-sm text-blue-700">
                    이 문서에 대한 리뷰와 피드백을 확인하고 관리할 수 있습니다.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {allReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{review.reviewerName}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          review.status === 'completed' ? 'bg-green-100 text-green-800' :
                          review.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {review.status === 'completed' ? '완료' :
                           review.status === 'in-progress' ? '진행중' : '대기중'}
                        </span>
                      </div>
                      
                      {review.section && (
                        <div className="text-xs text-blue-600 mb-2">
                          <i className="fas fa-bookmark mr-1"></i>
                          {review.section}
                        </div>
                      )}
                      
                      <div className="space-y-2 mt-3">
                        {review.comments.map((comment) => (
                          <div key={comment.id} className="p-3 bg-gray-50 rounded">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{comment.authorName}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {allFeedbacks.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">피드백 from {feedback.authorName}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          feedback.status === 'implemented' ? 'bg-green-100 text-green-800' :
                          feedback.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {feedback.status === 'implemented' ? '개선 완료' :
                           feedback.status === 'reviewed' ? '검토중' : '대기중'}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mt-2">{feedback.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t bg-gray-50">
            {activeTab === 'references' ? (
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                <i className="fas fa-plus mr-2"></i>
                새 출처 추가
              </button>
            ) : (
              <div className="flex space-x-2">
                <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors">
                  <i className="fas fa-plus mr-2"></i>
                  리뷰 추가
                </button>
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                  <i className="fas fa-comment-dots mr-2"></i>
                  피드백 추가
                </button>
              </div>
            )}
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