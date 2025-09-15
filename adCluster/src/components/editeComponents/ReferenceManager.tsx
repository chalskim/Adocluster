// src/components/editeComponents/ReferenceManager.tsx
import React, { useState } from 'react';
import { ReferenceItem } from '../../data/mockData';

interface ReferenceManagerProps {
  references: ReferenceItem[];
  onCiteReference: (reference: ReferenceItem) => void;
  onAddToProject?: (reference: ReferenceItem) => void;
}

const ReferenceManager = ({ references, onCiteReference, onAddToProject }: ReferenceManagerProps) => {
  const [activeTab, setActiveTab] = useState<'library' | 'search'>('library');

  return (
    <div className="reference-panel">
      {/* Tab Navigation */}
      <div className="reference-tabs">
        <button 
          className={`reference-tab ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          내 라이브러리
        </button>
        <button 
          className={`reference-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          검색
        </button>
      </div>

      {/* Tab Content */}
      <div className="reference-tab-content">
        {/* Library Tab */}
        {activeTab === 'library' && (
          <>
            <section className="search-filter-section">
              <div className="search-bar-container">
                <span className="material-symbols-outlined search-icon">search</span>
                <input type="text" className="search-input" placeholder="라이브러리 내 검색..." />
              </div>
              <div className="saved-searches-container">
                <label htmlFor="saved-searches">저장된 검색어:</label>
                <select id="saved-searches" className="saved-searches-select">
                  <option>#인공지능</option>
                  <option>#교육공학</option>
                </select>
                <button className="btn-icon" title="현재 검색어 저장">
                  <span className="material-symbols-outlined">bookmark_add</span>
                </button>
              </div>
            </section>

            <section className="content-display-section">
              <h3>내 라이브러리 ({references.length})</h3>
              {references.map(ref => (
                <div key={ref.id} className="ref-card">
                  <p className="ref-author">{ref.author} ({ref.year})</p>
                  <p className="ref-title">{ref.title}</p>
                  <p>{ref.publication}</p>
                  <div className="ref-card-actions">
                    <button className="btn-icon" title="인용하기" onClick={() => onCiteReference(ref)}>
                      <span className="material-symbols-outlined">format_quote</span>
                    </button>
                    {onAddToProject && (
                      <button className="btn-icon" title="프로젝트에 추가" onClick={() => onAddToProject(ref)}>
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    )}
                    <button className="btn-icon" title="삭제하기">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </section>

            <section className="import-export-section">
              <button className="btn">
                <span className="material-symbols-outlined">file_upload</span>
                파일 가져오기
              </button>
              <button className="btn">
                <span className="material-symbols-outlined">file_download</span>
                내보내기
              </button>
            </section>
          </>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <section className="search-content-section">
            <div className="search-bar-container">
              <span className="material-symbols-outlined search-icon">search</span>
              <input type="text" className="search-input" placeholder="Google Scholar 등에서 검색..." />
            </div>
            <div className="search-options">
              <div className="search-source">
                <select className="search-source-select">
                  <option>Google Scholar</option>
                  <option>PubMed</option>
                  <option>IEEE Xplore</option>
                  <option>ACM Digital Library</option>
                </select>
              </div>
              <button className="btn search-btn">
                <span className="material-symbols-outlined">search</span>
                검색
              </button>
            </div>
            
            <div className="search-results">
              <h3 className="mt-4 mb-2 font-medium">검색 결과 예시</h3>
              <div className="ref-card mb-2">
                <p className="ref-author">Lee, S., & Park, J. (2023)</p>
                <p className="ref-title">Machine Learning Applications in Education</p>
                <p>Journal of Educational Technology, 15(2), 45-60</p>
                <div className="ref-card-actions">
                  {onAddToProject && (
                    <button className="btn-icon" title="프로젝트에 추가" onClick={() => {
                      // This would be connected to actual search results
                      alert('검색된 참고문헌을 프로젝트에 추가했습니다.');
                    }}>
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="ref-card mb-2">
                <p className="ref-author">Kim, H., et al. (2022)</p>
                <p className="ref-title">Deep Learning for Natural Language Processing</p>
                <p>AI Review, 28(4), 123-140</p>
                <div className="ref-card-actions">
                  {onAddToProject && (
                    <button className="btn-icon" title="프로젝트에 추가" onClick={() => {
                      // This would be connected to actual search results
                      alert('검색된 참고문헌을 프로젝트에 추가했습니다.');
                    }}>
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ReferenceManager;