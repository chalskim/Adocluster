// src/components/TopMenuBar.tsx

import React, { useState, useRef, useEffect } from 'react';

const TopMenuBar = () => {
  const [activeTab, setActiveTab] = useState('tab-home');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('제목 1');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleStyleItemClick = (styleName: string) => {
    setCurrentStyle(styleName);
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="editor-ribbon">
      <nav className="ribbon-tabs">
        <button className={`ribbon-tab ${activeTab === 'tab-home' ? 'active' : ''}`} onClick={() => setActiveTab('tab-home')}>홈</button>
        <button className={`ribbon-tab ${activeTab === 'tab-insert' ? 'active' : ''}`} onClick={() => setActiveTab('tab-insert')}>삽입</button>
        <button className={`ribbon-tab ${activeTab === 'tab-ai' ? 'active' : ''}`} onClick={() => setActiveTab('tab-ai')}>AI 도구</button>
      </nav>

      <div className="ribbon-content">
        {/* --- 홈 탭 --- */}
        <div id="tab-home" className={`ribbon-pane ${activeTab === 'tab-home' ? 'active' : ''}`}>
          <div className="ribbon-group group-clipboard">
            <button className="ribbon-button paste-button">
              <span className="material-symbols-outlined ribbon-icon">paste</span>
              <span className="ribbon-label">붙여넣기</span>
            </button>
            <div className="clipboard-actions">
              <button className="ribbon-button"><span className="material-symbols-outlined ribbon-icon">content_cut</span><span className="ribbon-label">잘라내기</span></button>
              <button className="ribbon-button"><span className="material-symbols-outlined ribbon-icon">content_copy</span><span className="ribbon-label">복사</span></button>
              <button className="ribbon-button"><span className="material-symbols-outlined ribbon-icon">format_paint</span><span className="ribbon-label">서식 복사</span></button>
            </div>
          </div>
          <div className="ribbon-group" ref={dropdownRef}>
            <div className="style-dropdown-container">
              <button className="style-dropdown-button" onClick={() => setDropdownOpen(!isDropdownOpen)}>
                <span>{currentStyle}</span>
                <span>▼</span>
              </button>
              <div className={`style-dropdown-menu ${isDropdownOpen ? 'active' : ''}`}>
                <div className="style-dropdown-item" onClick={() => handleStyleItemClick('제목 1')}>제목 1</div>
                <div className="style-dropdown-item" onClick={() => handleStyleItemClick('제목 2')}>제목 2</div>
                <hr />
                <div className="style-dropdown-item" onClick={() => handleStyleItemClick('인용')}>인용</div>
                <div className="style-dropdown-item" onClick={() => handleStyleItemClick('코드')}>코드</div>
              </div>
            </div>
            <span className="ribbon-group-title">스타일</span>
          </div>
        </div>

        {/* --- 삽입 탭 --- */}
        <div id="tab-insert" className={`ribbon-pane ${activeTab === 'tab-insert' ? 'active' : ''}`}>
          <div className="ribbon-group">
            <button className="ribbon-button insert-button"><span className="material-symbols-outlined ribbon-icon">grid_on</span><span className="ribbon-label">표</span></button>
            <span className="ribbon-group-title">표</span>
          </div>
          <div className="ribbon-group" style={{ flexDirection: 'row' }}>
            <button className="ribbon-button insert-button"><span className="material-symbols-outlined ribbon-icon">attachment</span><span className="ribbon-label">파일</span></button>
            <button className="ribbon-button insert-button"><span className="material-symbols-outlined ribbon-icon">image</span><span className="ribbon-label">그림</span></button>
            <button className="ribbon-button insert-button"><span className="material-symbols-outlined ribbon-icon">add_a_photo</span><span className="ribbon-label">스크린샷</span></button>
            <span className="ribbon-group-title">개체</span>
          </div>
          <div className="ribbon-group">
            <button className="ribbon-button insert-button"><span className="material-symbols-outlined ribbon-icon">link</span><span className="ribbon-label">링크</span></button>
            <span className="ribbon-group-title">링크</span>
          </div>
          <div className="ribbon-group" style={{ flexDirection: 'row' }}>
            <button className="ribbon-button insert-button"><span className="material-symbols-outlined ribbon-icon">calculate</span><span className="ribbon-label">수식</span></button>
            <button className="ribbon-button insert-button"><span className="material-symbols-outlined ribbon-icon">calendar_month</span><span className="ribbon-label">날짜/시간</span></button>
            <span className="ribbon-group-title">기호</span>
          </div>
          <div className="ribbon-group">
            <button className="ribbon-button insert-button"><span className="material-symbols-outlined ribbon-icon">sentiment_satisfied</span><span className="ribbon-label">스티커</span></button>
            <span className="ribbon-group-title">기타</span>
          </div>
        </div>

        {/* --- AI 도구 탭 --- */}
        <div id="tab-ai" className={`ribbon-pane ${activeTab === 'tab-ai' ? 'active' : ''}`}>
          <div className="ribbon-group" style={{ flexDirection: 'row' }}>
            <button className="ribbon-button insert-button"><span className="material-symbols-outlined ribbon-icon">edit_note</span><span className="ribbon-label">이어쓰기</span></button>
            <button className="ribbon-button insert-button"><span className="material-symbols-outlined ribbon-icon">summarize</span><span className="ribbon-label">요약</span></button>
            <button className="ribbon-button insert-button"><span className="material-symbols-outlined ribbon-icon">translate</span><span className="ribbon-label">번역</span></button>
            <button className="ribbon-button insert-button"><span className="material-symbols-outlined ribbon-icon">recycling</span><span className="ribbon-label">재구성</span></button>
            <span className="ribbon-group-title">텍스트</span>
          </div>
          <div className="ribbon-group">
            <button className="ribbon-button insert-button"><span className="material-symbols-outlined ribbon-icon">auto_awesome</span><span className="ribbon-label">이미지 생성</span></button>
            <span className="ribbon-group-title">이미지</span>
          </div>
          <div className="ribbon-group">
            <button className="ribbon-button insert-button"><span className="material-symbols-outlined ribbon-icon">history_edu</span><span className="ribbon-label">인용 추가</span></button>
            <span className="ribbon-group-title">리서치</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopMenuBar;