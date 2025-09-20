import React, { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
}

interface Document {
  id: string;
  name: string;
  projectId: string;
  title: string;
  date: string;
}

interface ReviewItem {
  id: number;
  documentId: string;
  documentTitle: string;
  reviewer: string;
  status: 'pending' | 'in-progress' | 'completed';
  date: string;
  comments: number;
  section?: string; // Document section this review refers to
  version?: string; // Document version
}

interface Comment {
  id: number;
  reviewId: number;
  author: string;
  content: string;
  date: string;
  section?: string;
}

interface Feedback {
  id: number;
  documentId: string;
  documentTitle: string;
  author: string;
  content: string;
  status: 'pending' | 'reviewed' | 'implemented';
  date: string;
  version?: string;
}

const ReviewFeedbackPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'my-reviews' | 'feedback'>('reviews');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedDocument, setSelectedDocument] = useState<string>(''); // Add document selection
  const [searchTerm, setSearchTerm] = useState('');
  const [showReviewDetail, setShowReviewDetail] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null);

  // Mock data for projects
  const projects: Project[] = [
    { id: '1', name: '연구 프로젝트 A' },
    { id: '2', name: '연구 프로젝트 B' },
    { id: '3', name: '연구 프로젝트 C' },
  ];

  // Mock data for documents
  const documents: Document[] = [
    { id: 'd1', name: '웹사이트 리디자인 연구 프로젝트 계획서', projectId: '1', title: '웹사이트 리디자인 연구 프로젝트 계획서', date: '2025-09-13' },
    { id: 'd2', name: '모바일 앱 사용자 경험 분석 보고서', projectId: '1', title: '모바일 앱 사용자 경험 분석 보고서', date: '2025-09-10' },
    { id: 'd3', name: '데이터 분석 방법론 문서', projectId: '2', title: '데이터 분석 방법론 문서', date: '2025-09-12' },
    { id: 'd4', name: 'AI 알고리즘 최적화 연구', projectId: '3', title: 'AI 알고리즘 최적화 연구', date: '2025-09-08' },
  ];

  // Mock data for reviews
  const reviews: ReviewItem[] = [
    {
      id: 1,
      documentId: 'd1',
      documentTitle: '웹사이트 리디자인 연구 프로젝트 계획서',
      reviewer: '김개발',
      status: 'completed',
      date: '2023-11-20',
      comments: 12,
      section: '3. 기술 아키텍처',
      version: 'v1.2'
    },
    {
      id: 2,
      documentId: 'd2',
      documentTitle: '모바일 앱 사용자 경험 분석 보고서',
      reviewer: '이디자인',
      status: 'in-progress',
      date: '2023-11-18',
      comments: 5,
      section: '2. 사용자 조사 결과',
      version: 'v2.0'
    },
    {
      id: 3,
      documentId: 'd3',
      documentTitle: '데이터 분석 방법론 문서',
      reviewer: '박데이터',
      status: 'pending',
      date: '2023-11-15',
      comments: 0,
      version: 'v1.0'
    },
    {
      id: 4,
      documentId: 'd4',
      documentTitle: 'AI 알고리즘 최적화 연구',
      reviewer: '최AI',
      status: 'completed',
      date: '2023-11-22',
      comments: 8,
      section: '4. 실험 결과',
      version: 'v3.1'
    }
  ];

  // Mock data for comments
  const comments: Comment[] = [
    {
      id: 1,
      reviewId: 1,
      author: '김개발',
      content: '기술 아키텍처 부분에서 AWS 서비스 선택 근거를 더 명확히 설명해 주세요.',
      date: '2023-11-20 10:30',
      section: '3. 기술 아키텍처'
    },
    {
      id: 2,
      reviewId: 1,
      author: '논문 저자',
      content: 'AWS 선택 근거는 비용 효율성과 확장성 때문입니다. 관련 내용을 보충 설명하겠습니다.',
      date: '2023-11-21 14:15',
      section: '3. 기술 아키텍처'
    }
  ];

  // Mock data for feedback
  const feedbacks: Feedback[] = [
    {
      id: 1,
      documentId: 'd1',
      documentTitle: '웹사이트 리디자인 연구 프로젝트 계획서',
      author: '김개발',
      content: '전반적으로 잘 구성되었으나, 기술 스택 선택 근거를 더 구체적으로 설명해주시면 좋겠습니다.',
      status: 'implemented',
      date: '2023-11-20',
      version: 'v1.2'
    },
    {
      id: 2,
      documentId: 'd2',
      documentTitle: '모바일 앱 사용자 경험 분석 보고서',
      author: '이디자인',
      content: '사용자 인터뷰 질문지의 구성이 다소 단순합니다. 더 심층적인 질문이 필요해 보입니다.',
      status: 'reviewed',
      date: '2023-11-18',
      version: 'v2.0'
    },
    {
      id: 3,
      documentId: 'd3',
      documentTitle: '데이터 분석 방법론 문서',
      author: '박데이터',
      content: '샘플 크기가 충분하지 않아 결과의 신뢰성이 낮습니다. 추가 데이터 수집을 권장합니다.',
      status: 'pending',
      date: '2023-11-15',
      version: 'v1.0'
    }
  ];

  // Filter documents based on selected project
  const filteredDocuments = selectedProject 
    ? documents.filter(doc => doc.projectId === selectedProject)
    : documents;

  // Filter reviews based on selected project and document
  const filteredReviews = reviews.filter(review => {
    // If a document is selected, only show reviews for that document
    if (selectedDocument) {
      return review.documentTitle.includes(selectedDocument);
    }
    // If a project is selected, only show reviews for documents in that project
    if (selectedProject) {
      const document = documents.find(doc => doc.id === review.documentId);
      return document && document.projectId === selectedProject;
    }
    // Otherwise, filter by search term
    return review.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
           review.reviewer.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filter feedbacks based on selected project and document
  const filteredFeedbacks = feedbacks.filter(feedback => {
    // If a document is selected, only show feedback for that document
    if (selectedDocument) {
      return feedback.documentTitle.includes(selectedDocument);
    }
    // If a project is selected, only show feedback for documents in that project
    if (selectedProject) {
      const document = documents.find(doc => doc.id === feedback.documentId);
      return document && document.projectId === selectedProject;
    }
    // Otherwise, filter by search term
    return feedback.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
           feedback.author.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'implemented': return 'bg-green-100 text-green-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료';
      case 'in-progress': return '진행중';
      case 'pending': return '대기중';
      case 'implemented': return '개선 완료';
      case 'reviewed': return '검토중';
      default: return status;
    }
  };

  const handleViewReview = (reviewId: number) => {
    setShowReviewDetail(reviewId);
  };

  const handleReplyClick = (reviewId: number) => {
    setShowReplyForm(reviewId);
    setReplyContent('');
  };

  const handleSendReply = (reviewId: number) => {
    // In a real app, this would send the reply to the backend
    console.log(`Sending reply to review ${reviewId}: ${replyContent}`);
    setShowReplyForm(null);
    setReplyContent('');
    // Refresh the comment list or update state
  };

  // New function to mark feedback as completed
  const handleMarkFeedbackAsCompleted = (feedbackId: number) => {
    // In a real app, this would update the feedback status on the backend
    console.log(`Marking feedback ${feedbackId} as completed`);
    // For now, we'll just show an alert to indicate the action
    alert(`피드백 #${feedbackId}이(가) 완료 상태로 변경되었습니다.`);
    // In a real implementation, you would update the state to reflect the change
  };

  const handleCloseReviewDetail = () => {
    setShowReviewDetail(null);
  };

  return (
    <div className="p-3 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-md shadow-sm p-3 mb-3">
        <h1 className="text-lg font-bold text-gray-800 mb-1">💬 리뷰/피드백 관리</h1>
        <p className="text-gray-500 text-xs">논문에 대한 리뷰, 코멘트, 피드백을 관리합니다</p>
      </div>

      {/* Project Selection and Search Section */}
      <div className="bg-white rounded-md shadow-sm p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">프로젝트 선택</label>
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setSelectedDocument(''); // Reset document selection when project changes
              }}
              className="w-full p-1.5 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none transition-colors text-xs"
            >
              <option value="">전체 프로젝트</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">문서 선택</label>
            <select
              value={selectedDocument}
              onChange={(e) => setSelectedDocument(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none transition-colors text-xs"
              disabled={!selectedProject}
            >
              <option value="">문서 선택</option>
              {filteredDocuments.map(document => (
                <option key={document.id} value={document.name}>{document.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            className="w-full p-1.5 pr-6 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none transition-colors text-xs"
            placeholder="문서 제목, 리뷰어, 또는 작성자로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!!selectedDocument} // Disable search when document is selected
          />
          <i className="fas fa-search absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
        </div>

        {selectedProject && (
          <div className="mt-2">
            <h3 className="text-xs font-medium text-gray-700 mb-1">선택된 프로젝트의 노트</h3>
            <div className="flex flex-wrap gap-1">
              {filteredDocuments.map(document => (
                <span 
                  key={document.id} 
                  className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
                >
                  {document.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-md shadow-sm overflow-hidden mb-3">
        <div className="flex border-b border-gray-200">
          <div 
            className={`px-3 py-2 cursor-pointer font-medium transition-colors text-xs ${
              activeTab === 'reviews' 
                ? 'bg-white border-b-2 border-blue-500 text-blue-500' 
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            받은 리뷰
          </div>
          <div 
            className={`px-3 py-2 cursor-pointer font-medium transition-colors text-xs ${
              activeTab === 'my-reviews' 
                ? 'bg-white border-b-2 border-blue-500 text-blue-500' 
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('my-reviews')}
          >
            내가 작성한 리뷰
          </div>
          <div 
            className={`px-3 py-2 cursor-pointer font-medium transition-colors text-xs ${
              activeTab === 'feedback' 
                ? 'bg-white border-b-2 border-blue-500 text-blue-500' 
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('feedback')}
          >
            피드백
          </div>
        </div>

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-gray-700 text-xs">
                {selectedDocument 
                  ? `"${selectedDocument}"의 리뷰 (${filteredReviews.length}개)` 
                  : selectedProject 
                    ? `${projects.find(p => p.id === selectedProject)?.name}의 리뷰 (${filteredReviews.length}개)` 
                    : `총 ${filteredReviews.length}개의 리뷰`}
              </div>
            </div>

            <div className="space-y-2">
              {filteredReviews.map(review => (
                <div key={review.id} className="border border-gray-200 rounded-md p-3 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 mb-1">{review.documentTitle}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-user text-xs"></i>
                          {review.reviewer}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="far fa-calendar text-xs"></i>
                          {review.date}
                        </span>
                        {review.section && (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-bookmark text-xs"></i>
                            {review.section}
                          </span>
                        )}
                        {review.version && (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-code-branch text-xs"></i>
                            {review.version}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                        {getStatusText(review.status)}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="flex items-center gap-1 text-gray-500">
                          <i className="far fa-comment text-xs"></i>
                          {review.comments} 코멘트
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1.5">
                    <button 
                      className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs"
                      onClick={() => handleViewReview(review.id)}
                    >
                      <i className="fas fa-eye mr-1 text-xs"></i>
                      리뷰 보기
                    </button>
                    <button 
                      className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-xs"
                      onClick={() => handleReplyClick(review.id)}
                    >
                      <i className="fas fa-reply mr-1 text-xs"></i>
                      답글 작성
                    </button>
                  </div>

                  {/* Reply Form */}
                  {showReplyForm === review.id && (
                    <div className="mt-2 p-2 border border-gray-200 rounded-md bg-gray-50">
                      <textarea
                        className="w-full p-1.5 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none transition-colors text-xs"
                        rows={2}
                        placeholder="답글을 입력하세요..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                      />
                      <div className="flex justify-end gap-1 mt-1.5">
                        <button 
                          className="px-2 py-1 text-gray-600 hover:text-gray-800 text-xs"
                          onClick={() => setShowReplyForm(null)}
                        >
                          취소
                        </button>
                        <button 
                          className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs"
                          onClick={() => handleSendReply(review.id)}
                        >
                          답글 보내기
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Reviews Tab */}
        {activeTab === 'my-reviews' && (
          <div className="p-3">
            <div className="text-center py-6 text-gray-500">
              <i className="fas fa-file-alt text-lg mb-1"></i>
              <p className="text-xs">작성한 리뷰가 없습니다.</p>
              <p className="text-xs mt-1">다른 연구자의 문서를 리뷰해보세요.</p>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-gray-700 text-xs">
                {selectedDocument 
                  ? `"${selectedDocument}"의 피드백 (${filteredFeedbacks.length}개)` 
                  : selectedProject 
                    ? `${projects.find(p => p.id === selectedProject)?.name}의 피드백 (${filteredFeedbacks.length}개)` 
                    : `총 ${filteredFeedbacks.length}개의 피드백`}
              </div>
            </div>

            <div className="space-y-2">
              {filteredFeedbacks.map(feedback => (
                <div key={feedback.id} className="border border-gray-200 rounded-md p-3 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 mb-1">{feedback.documentTitle}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-user text-xs"></i>
                          {feedback.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="far fa-calendar text-xs"></i>
                          {feedback.date}
                        </span>
                        {feedback.version && (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-code-branch text-xs"></i>
                            {feedback.version}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                        {getStatusText(feedback.status)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-xs mb-2">{feedback.content}</p>
                  
                  <div className="flex gap-1.5">
                    <button className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs">
                      <i className="fas fa-history mr-1 text-xs"></i>
                      히스토리 보기
                    </button>
                    <button className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-xs">
                      <i className="fas fa-edit mr-1 text-xs"></i>
                      개선하기
                    </button>
                    {feedback.status === 'reviewed' && (
                      <button 
                        className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-xs"
                        onClick={() => handleMarkFeedbackAsCompleted(feedback.id)}
                      >
                        <i className="fas fa-check mr-1 text-xs"></i>
                        완료하기
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {showReviewDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-md shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-3">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base font-bold text-gray-800">리뷰 상세</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={handleCloseReviewDetail}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="mb-3 p-2 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-800 mb-1">
                  {reviews.find(r => r.id === showReviewDetail)?.documentTitle}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>리뷰어: {reviews.find(r => r.id === showReviewDetail)?.reviewer}</span>
                  <span>날짜: {reviews.find(r => r.id === showReviewDetail)?.date}</span>
                  <span>상태: {getStatusText(reviews.find(r => r.id === showReviewDetail)?.status || '')}</span>
                  <span>버전: {reviews.find(r => r.id === showReviewDetail)?.version}</span>
                </div>
              </div>
              
              <div className="mb-3">
                <h3 className="font-semibold text-gray-800 mb-1.5">리뷰 내용</h3>
                <div className="p-2 border border-gray-200 rounded-md">
                  <p className="text-gray-700 text-xs">
                    전반적으로 잘 구성된 문서입니다. 다만, 몇 가지 개선이 필요한 부분이 있습니다:
                  </p>
                  <ul className="list-disc list-inside mt-1 text-gray-700 text-xs">
                    <li>기술 아키텍처 부분에서 AWS 서비스 선택 근거를 더 명확히 설명해 주세요.</li>
                    <li>프로젝트 일정이 다소 낙관적으로 보입니다. 리스크 요소를 추가로 고려해 주세요.</li>
                    <li>참고문헌의 최신성을 점검해 주시기 바랍니다.</li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1.5">
                  <h3 className="font-semibold text-gray-800">코멘트</h3>
                  <span className="text-xs text-gray-500">
                    {comments.filter(c => c.reviewId === showReviewDetail).length}개의 코멘트
                  </span>
                </div>
                
                <div className="space-y-2">
                  {comments.filter(c => c.reviewId === showReviewDetail).map(comment => (
                    <div key={comment.id} className="p-2 border border-gray-200 rounded-md">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-800 text-xs">{comment.author}</span>
                        <span className="text-xs text-gray-500">{comment.date}</span>
                      </div>
                      <p className="text-gray-700 text-xs">{comment.content}</p>
                      {comment.section && (
                        <div className="mt-1 text-xs text-blue-600">
                          <i className="fas fa-bookmark mr-1 text-xs"></i>
                          {comment.section}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-2">
                <h3 className="font-semibold text-gray-800 mb-1.5">답글 작성</h3>
                <textarea
                  className="w-full p-1.5 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none transition-colors text-xs"
                  rows={2}
                  placeholder="답글을 입력하세요..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />
                <div className="flex justify-end gap-1 mt-1.5">
                  <button 
                    className="px-2 py-1 text-gray-600 hover:text-gray-800 text-xs"
                    onClick={() => setReplyContent('')}
                  >
                    취소
                  </button>
                  <button 
                    className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs"
                    onClick={() => handleSendReply(showReviewDetail)}
                  >
                    답글 보내기
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

export default ReviewFeedbackPage;