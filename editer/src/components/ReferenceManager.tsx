// src/components/ReferenceManager.tsx
// import React from 'react';
import type { ReferenceItem } from '../data/mockData';

interface ReferenceManagerProps {
  references: ReferenceItem[];
  onCiteReference: (reference: ReferenceItem) => void;
}

// 실제 구현 시에는 App.tsx로부터 props로 데이터를 받아야 합니다.
const MOCK_REFERENCES = [
    {
        id: 'ref-1',
        author: '김영희, 이민수, 박철수 (2024)',
        title: '인공지능 기반 개인화 학습 시스템의 효과 분석.',
        publication: '교육공학연구, 40(2), 123-145.'
    },
    {
        id: 'ref-2',
        author: 'Smith, J., & Brown, A. (2023)',
        title: 'Machine Learning Applications in Education.',
        publication: 'Journal of Educational Technology, 15(3), 45-62.'
    }
];

const ReferenceManager = ({ references, onCiteReference }: ReferenceManagerProps) => {
  return (
    <div className="reference-panel">
      {/* 1. 검색 및 필터 영역 */}
      <section className="search-filter-section">
        <div className="search-bar-container">
          <span className="material-symbols-outlined search-icon">search</span>
          <input type="text" className="search-input" placeholder="Google Scholar 등에서 검색..." />
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

      {/* 2. 콘텐츠 표시 영역 */}
       <section className="content-display-section">
        {/* --- [수정 4] MOCK_REFERENCES 대신 props.references 사용 --- */}
        <h3>내 라이브러리 ({references.length})</h3>
        {references.map(ref => (
          <div key={ref.id} className="ref-card">
            <p className="ref-author">{ref.author} ({ref.year})</p>
            <p className="ref-title">{ref.title}</p>
            <p>{ref.publication}</p>
            <div className="ref-card-actions">
              {/* --- [수정 5] onClick 이벤트에 onCiteReference 함수 연결 --- */}
              <button className="btn-icon" title="인용하기" onClick={() => onCiteReference(ref)}>
                <span className="material-symbols-outlined">format_quote</span>
              </button>
              <button className="btn-icon" title="삭제하기">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* 3. 가져오기/내보내기 영역 */}
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
    </div>
  );
};

export default ReferenceManager;