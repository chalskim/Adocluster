// src/components/RightSidebar.tsx

import React, { useState } from 'react';
import { DocumentDetailsData, ReferenceItem } from '../../data/mockData';

interface RightSidebarProps {
  details: DocumentDetailsData | null;
  onAddReference: (projectId: string) => void;
  onDeleteReference: (projectId: string, referenceId: string) => void;
  visibleTabs?: {
    info?: boolean;
    references?: boolean;
    settings?: boolean;
    toc?: boolean;
    collaborate?: boolean;
  };
}

const RightSidebar: React.FC<RightSidebarProps> = ({ 
  details, 
  onAddReference, 
  onDeleteReference, 
  visibleTabs = { info: true, references: true, settings: true } 
}) => {
  const [activeTab, setActiveTab] = useState('info');

  if (!details) {
    return (
      <div className="right-sidebar">
        <div className="right-tabs">
          <button className={`right-tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
            <i className="fas fa-info-circle"></i>
            <span>연구 프로젝트</span>
          </button>
          <button className={`right-tab ${activeTab === 'references' ? 'active' : ''}`} onClick={() => setActiveTab('references')}>
            <i className="fas fa-book"></i>
            <span>참조정보</span>
          </button>
          <button className={`right-tab ${activeTab === 'toc' ? 'active' : ''}`} onClick={() => setActiveTab('toc')}>
            <i className="fas fa-list"></i>
            <span>목차</span>
          </button>
          <button className={`right-tab ${activeTab === 'collaborate' ? 'active' : ''}`} onClick={() => setActiveTab('collaborate')}>
            <i className="fas fa-users"></i>
            <span>협업</span>
          </button>
        </div>
        <div className="right-content">
          <div className="placeholder-message">
            <p>연구 프로젝트를 선택해주세요.</p>
          </div>
        </div>
      </div>
    );
  }

  // Generate table of contents from headings in the document
  const generateTOC = () => {
    // This is a placeholder implementation
    // In a real implementation, this would extract headings from the editor content
    return [
      { id: 'heading1', level: 1, text: 'Introduction' },
      { id: 'heading2', level: 2, text: 'Background' },
      { id: 'heading3', level: 2, text: 'Problem Statement' },
      { id: 'heading4', level: 1, text: 'Methodology' },
      { id: 'heading5', level: 2, text: 'Data Collection' },
      { id: 'heading6', level: 2, text: 'Analysis' },
      { id: 'heading7', level: 1, text: 'Results' },
      { id: 'heading8', level: 1, text: 'Conclusion' },
    ];
  };

  const tocItems = generateTOC();

  return (
    <div className="right-sidebar">
      <div className="right-tabs">
        <button className={`right-tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
          <i className="fas fa-info-circle"></i>
          <span>연구 정보</span>
        </button>
        <button className={`right-tab ${activeTab === 'references' ? 'active' : ''}`} onClick={() => setActiveTab('references')}>
          <i className="fas fa-book"></i>
          <span>참조정보</span>
        </button>
        <button className={`right-tab ${activeTab === 'toc' ? 'active' : ''}`} onClick={() => setActiveTab('toc')}>
          <i className="fas fa-list"></i>
          <span>목차</span>
        </button>
        <button className={`right-tab ${activeTab === 'collaborate' ? 'active' : ''}`} onClick={() => setActiveTab('collaborate')}>
          <i className="fas fa-users"></i>
          <span>리뷰/피드백</span>
        </button>
      </div>

      <div className="right-content">
        {activeTab === 'info' && (
          <div id="info-content" className="right-tab-content">
            <div className="section-title">연구 정보</div>
            <div className="info-card">
              <div className="info-label">제목</div>
              <div className="info-value">{details.title}</div>
            </div>
            <div className="info-card">
              <div className="info-label">설명</div>
              <div className="info-value">{details.description}</div>
            </div>
            <div className="info-card">
              <div className="info-label">진행률</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${details.progress}%` }}></div>
              </div>
              <div className="info-value">{details.progress}% 완료</div>
            </div>
            <div className="info-card">
              <div className="info-label">작성자</div>
              <div className="info-value">{details.author}</div>
            </div>
            <div className="info-card">
              <div className="info-label">연구 프로젝트 일정</div>
              <div className="info-value">{details.start_date} ~ {details.end_date} </div>
            </div>
          </div>
        )}

        {activeTab === 'references' && (
          <div id="references-content" className="right-tab-content">
            <div className="section-title">
              참고문헌
              <button 
                className="add-reference-btn" 
                onClick={() => onAddReference(details.id)}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
            <div className="references-list">
              {details.references.map((ref) => (
                <div key={ref.id} className="reference-item">
                  <div className="reference-content">
                    <div className="reference-author">{ref.author} ({ref.year})</div>
                    <div className="reference-title">{ref.title}</div>
                    <div className="reference-publication">{ref.publication}</div>
                  </div>
                  <button 
                    className="delete-reference-btn" 
                    onClick={() => onDeleteReference(details.id, ref.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'toc' && (
          <div id="toc-content" className="right-tab-content">
            <div className="section-title">목차</div>
            <div className="toc-list">
              {tocItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`toc-item level-${item.level}`}
                  style={{ paddingLeft: `${(item.level - 1) * 20}px` }}
                >
                  <a href={`#${item.id}`} className="toc-link">
                    {item.text}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'collaborate' && (
          <div id="collaborate-content" className="right-tab-content">
            <div className="section-title">
              리뷰/피드백
              <button className="add-reference-btn">
                <i className="fas fa-plus"></i>
              </button>
            </div>
            
            {/* Review/Feedback Tabs */}
            <div className="mb-3 border-b border-gray-200">
              <nav className="flex space-x-4">
                <button className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 text-xs font-medium">
                  받은 리뷰
                </button>
                <button className="py-2 px-1 text-gray-500 hover:text-gray-700 text-xs font-medium">
                  내가 작성한 리뷰
                </button>
                <button className="py-2 px-1 text-gray-500 hover:text-gray-700 text-xs font-medium">
                  피드백
                </button>
              </nav>
            </div>
            
            {/* Review/Feedback List */}
            <div className="space-y-3">
              {/* Sample Review Item */}
              <div className="border border-gray-200 rounded-md p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">웹사이트 리디자인 연구 프로젝트 계획서</h4>
                    <p className="text-xs text-gray-500">리뷰어: 김개발</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    진행중
                  </span>
                </div>
                
                <p className="text-gray-700 text-xs mb-2">
                  전반적으로 잘 구성되었으나, 기술 스택 선택 근거를 더 구체적으로 설명해주시면 좋겠습니다.
                </p>
                
                {/* Highlight indicator */}
                <div className="flex items-center text-blue-600 text-xs mb-2">
                  <i className="fas fa-highlighter mr-1"></i>
                  <span>3. 기술 아키텍처</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">2023.11.20</span>
                  <div className="flex gap-1">
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="text-xs text-green-600 hover:text-green-800">
                      <i className="fas fa-reply"></i>
                    </button>
                    <button className="text-xs text-red-600 hover:text-red-800">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Sample Feedback Item */}
              <div className="border border-gray-200 rounded-md p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">모바일 앱 사용자 경험 분석 보고서</h4>
                    <p className="text-xs text-gray-500">작성자: 이디자인</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    완료
                  </span>
                </div>
                
                <p className="text-gray-700 text-xs mb-2">
                  사용자 인터뷰 질문지의 구성이 다소 단순합니다. 더 심층적인 질문이 필요해 보입니다.
                </p>
                
                {/* Highlight indicator */}
                <div className="flex items-center text-blue-600 text-xs mb-2">
                  <i className="fas fa-highlighter mr-1"></i>
                  <span>2. 사용자 조사 결과</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">2023.11.18</span>
                  <div className="flex gap-1">
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="text-xs text-green-600 hover:text-green-800">
                      <i className="fas fa-reply"></i>
                    </button>
                    <button className="text-xs text-red-600 hover:text-red-800">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Sample Reply Item */}
              <div className="border-l-4 border-blue-500 bg-blue-50 p-3 ml-2">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">답글: 웹사이트 리디자인 연구 프로젝트</h4>
                    <p className="text-xs text-gray-500">답변자: 논문 저자</p>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    답글
                  </span>
                </div>
                
                <p className="text-gray-700 text-xs mb-2">
                  AWS 선택 근거는 비용 효율성과 확장성 때문입니다. 관련 내용을 보충 설명하겠습니다.
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">2023.11.21 14:15</span>
                  <div className="flex gap-1">
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      <i className="fas fa-location-arrow"></i>
                    </button>
                    <button className="text-xs text-red-600 hover:text-red-800">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;