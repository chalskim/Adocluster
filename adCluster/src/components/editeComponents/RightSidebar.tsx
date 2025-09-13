// src/components/RightSidebar.tsx

import React, { useState } from 'react';
import { DocumentDetailsData, ReferenceItem } from '../data/mockData';

interface RightSidebarProps {
  details: DocumentDetailsData | null;
  onAddReference: (projectId: string) => void;
  onDeleteReference: (projectId: string, referenceId: string) => void;
  visibleTabs?: {
    info?: boolean;
    references?: boolean;
    toc?: boolean;
    collaborate?: boolean;
  };
}

const RightSidebar: React.FC<RightSidebarProps> = ({ 
  details, 
  onAddReference, 
  onDeleteReference,
  visibleTabs = {}
}) => {
  const [activeTab, setActiveTab] = useState('info');

  // 기본적으로 모든 탭 표시
  const defaultVisibleTabs = {
    info: true,
    references: true,
    toc: true,
    collaborate: true,
  };

  // props로 전달된 가시성 설정과 기본값 병합
  const tabVisibility = { ...defaultVisibleTabs, ...visibleTabs };

  if (!details) {
    return (
      <div className="right-sidebar">
        <div className="right-tabs">
          {tabVisibility.info && (
            <button className={`right-tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
              <i className="fas fa-info-circle"></i>
              <span>프로젝트</span>
            </button>
          )}
          {tabVisibility.references && (
            <button className={`right-tab ${activeTab === 'references' ? 'active' : ''}`} onClick={() => setActiveTab('references')}>
              <i className="fas fa-book"></i>
              <span>참조정보</span>
            </button>
          )}
          {tabVisibility.toc && (
            <button className={`right-tab ${activeTab === 'toc' ? 'active' : ''}`} onClick={() => setActiveTab('toc')}>
              <i className="fas fa-list"></i>
              <span>목차</span>
            </button>
          )}
          {tabVisibility.collaborate && (
            <button className={`right-tab ${activeTab === 'collaborate' ? 'active' : ''}`} onClick={() => setActiveTab('collaborate')}>
              <i className="fas fa-users"></i>
              <span>협업</span>
            </button>
          )}
        </div>
        <div className="right-content">
          <div className="placeholder-message">
            <p>프로젝트를 선택해주세요.</p>
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
        {tabVisibility.info && (
          <button className={`right-tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
            <i className="fas fa-info-circle"></i>
            <span>프로젝트</span>
          </button>
        )}
        {tabVisibility.references && (
          <button className={`right-tab ${activeTab === 'references' ? 'active' : ''}`} onClick={() => setActiveTab('references')}>
            <i className="fas fa-book"></i>
            <span>참조정보</span>
          </button>
        )}
        {tabVisibility.toc && (
          <button className={`right-tab ${activeTab === 'toc' ? 'active' : ''}`} onClick={() => setActiveTab('toc')}>
            <i className="fas fa-list"></i>
            <span>목차</span>
          </button>
        )}
        {tabVisibility.collaborate && (
          <button className={`right-tab ${activeTab === 'collaborate' ? 'active' : ''}`} onClick={() => setActiveTab('collaborate')}>
            <i className="fas fa-users"></i>
            <span>협업</span>
          </button>
        )}
      </div>

      <div className="right-content">
        {activeTab === 'info' && tabVisibility.info && (
          <div id="info-content" className="right-tab-content">
            <div className="section-title">프로젝트 정보</div>
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
              <div className="info-label">프로젝트 일정</div>
              <div className="info-value">{details.start_date} ~ {details.end_date} </div>
            </div>
          </div>
        )}

        {activeTab === 'references' && tabVisibility.references && (
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

        {activeTab === 'toc' && tabVisibility.toc && (
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

        {activeTab === 'collaborate' && tabVisibility.collaborate && (
          <div id="collaborate-content" className="right-tab-content">
            <div className="section-title">협업</div>
            <div className="collaborate-info">
              <p>협업 기능은 추후 구현 예정입니다.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;