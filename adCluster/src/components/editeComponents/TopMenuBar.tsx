import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';

interface TopMenuBarProps {
  editor: Editor | null;
  leftPanelVisibleTabs: {
    project: boolean;
    library: boolean;
    references: boolean;
    todos: boolean;
  };
  rightSidebarVisibleTabs: {
    project: boolean;
    referenceInfo: boolean;
    tableOfContents: boolean;
    collaboration: boolean;
  };
  onLeftPanelVisibleTabsChange: (tabs: {
    project: boolean;
    library: boolean;
    references: boolean;
    todos: boolean;
  }) => void;
  onRightSidebarVisibleTabsChange: (tabs: {
    project: boolean;
    referenceInfo: boolean;
    tableOfContents: boolean;
    collaboration: boolean;
  }) => void;
}

const TopMenuBar: React.FC<TopMenuBarProps> = ({ 
  editor, 
  leftPanelVisibleTabs, 
  rightSidebarVisibleTabs,
  onLeftPanelVisibleTabsChange,
  onRightSidebarVisibleTabsChange 
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'ai' | 'view'>('home');
  const [spellcheckEnabled, setSpellcheckEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (editor && (editor as any).view?.dom) {
      const dom = (editor as any).view.dom as HTMLElement;
      setSpellcheckEnabled(dom.getAttribute('spellcheck') !== 'false');
    }
  }, [editor]);

  if (!editor) {
    return <div className="editor-ribbon loading">Loading...</div>;
  }

  const handleTabClick = (tab: 'home' | 'insert' | 'ai' | 'view') => {
    setActiveTab(tab);
  };

  const isActive = (tab: string) => activeTab === tab;

  const exportToPDF = () => {
    alert('PDF 내보내기 기능 - 구현 준비 중입니다.');
  };

  const toggleReadOnly = () => {
    editor.setEditable(!editor.isEditable);
  };

  const toggleSpellcheck = () => {
    const dom = (editor as any).view?.dom as HTMLElement | undefined;
    if (!dom) return;
    const next = !spellcheckEnabled;
    dom.setAttribute('spellcheck', String(next));
    setSpellcheckEnabled(next);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch (e) {
      console.error('Fullscreen toggle failed:', e);
      alert('전체화면 전환을 지원하지 않는 브라우저이거나 권한이 없습니다.');
    }
  };

  return (
    <div className="editor-ribbon">
      {/* Tab Navigation */}
      <div className="ribbon-tabs">
        <button
          className={`ribbon-tab ${isActive('home') ? 'active' : ''}`}
          onClick={() => handleTabClick('home')}
          type="button"
        >
          연구 작업
        </button>
        <button
          className={`ribbon-tab ${isActive('insert') ? 'active' : ''}`}
          onClick={() => handleTabClick('insert')}
          type="button"
        >
          연구 도구
        </button>
        <button
          className={`ribbon-tab ${isActive('ai') ? 'active' : ''}`}
          onClick={() => handleTabClick('ai')}
          type="button"
        >
          AI 연구 지원
        </button>
        <button
          className={`ribbon-tab ${isActive('view') ? 'active' : ''}`}
          onClick={() => handleTabClick('view')}
          type="button"
        >
          연구 환경
        </button>
      </div>

      {/* Tab Content */}
      <div className="ribbon-content">
        {activeTab === 'home' && (
          <div className="ribbon-pane" id="tab-home">
            <div className="ribbon-group">
              <h3>편집 기록</h3>
              <div className="ribbon-buttons">
                <button
                  className="ribbon-button"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  type="button"
                >
                  <span className="ribbon-icon">↶</span>
                  <span className="ribbon-label">실행취소</span>
                </button>
                <button
                  className="ribbon-button"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  type="button"
                >
                  <span className="ribbon-icon">↷</span>
                  <span className="ribbon-label">다시실행</span>
                </button>
              </div>
            </div>

            <div className="ribbon-group">
              <h3>텍스트 서식</h3>
              <div className="ribbon-buttons">
                <button
                  className={`ribbon-button ${editor.isActive('bold') ? 'active' : ''}`}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  type="button"
                >
                  <span className="ribbon-icon">B</span>
                  <span className="ribbon-label">굵게</span>
                </button>
                <button
                  className={`ribbon-button ${editor.isActive('italic') ? 'active' : ''}`}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  type="button"
                >
                  <span className="ribbon-icon">I</span>
                  <span className="ribbon-label">기울임</span>
                </button>
                <button
                  className={`ribbon-button ${editor.isActive('underline') ? 'active' : ''}`}
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  type="button"
                >
                  <span className="ribbon-icon">U</span>
                  <span className="ribbon-label">밑줄</span>
                </button>
                <button
                  className={`ribbon-button ${editor.isActive('strike') ? 'active' : ''}`}
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  type="button"
                >
                  <span className="ribbon-icon">S</span>
                  <span className="ribbon-label">취소선</span>
                </button>
              </div>
            </div>

            <div className="ribbon-group">
              <h3>텍스트 정렬</h3>
              <div className="ribbon-buttons">
                <button
                  className={`ribbon-button ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  type="button"
                >
                  <span className="ribbon-icon">⬅</span>
                  <span className="ribbon-label">왼쪽</span>
                </button>
                <button
                  className={`ribbon-button ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  type="button"
                >
                  <span className="ribbon-icon">⬌</span>
                  <span className="ribbon-label">가운데</span>
                </button>
                <button
                  className={`ribbon-button ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  type="button"
                >
                  <span className="ribbon-icon">➡</span>
                  <span className="ribbon-label">오른쪽</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insert' && (
          <div className="ribbon-pane" id="tab-insert">
            <div className="ribbon-group">
              <h3>연구 데이터 표</h3>
              <div className="ribbon-buttons">
                <button
                  className="ribbon-button"
                  onClick={() => {
                    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                  }}
                  type="button"
                >
                  <span className="ribbon-icon">⊞</span>
                  <span className="ribbon-label">테이블 삽입</span>
                </button>
              </div>
            </div>

            <div className="ribbon-group">
              <h3>연구 참조</h3>
              <div className="ribbon-buttons">
                <button
                  className="ribbon-button"
                  onClick={() => {
                    const url = window.prompt('링크 URL을 입력하세요:');
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                  type="button"
                >
                  <span className="ribbon-icon">🔗</span>
                  <span className="ribbon-label">링크 삽입</span>
                </button>
                <button
                  className="ribbon-button"
                  onClick={() => editor.chain().focus().unsetLink().run()}
                  type="button"
                >
                  <span className="ribbon-icon">🔓</span>
                  <span className="ribbon-label">링크 제거</span>
                </button>
              </div>
            </div>

            <div className="ribbon-group">
              <h3>연구 목록</h3>
              <div className="ribbon-buttons">
                <button
                  className={`ribbon-button ${editor.isActive('bulletList') ? 'active' : ''}`}
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  type="button"
                >
                  <span className="ribbon-icon">•</span>
                  <span className="ribbon-label">글머리 기호</span>
                </button>
                <button
                  className={`ribbon-button ${editor.isActive('orderedList') ? 'active' : ''}`}
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  type="button"
                >
                  <span className="ribbon-icon">1.</span>
                  <span className="ribbon-label">번호 매기기</span>
                </button>
              </div>
            </div>

            <div className="ribbon-group">
              <h3>연구 문서 요소</h3>
              <div className="ribbon-buttons">
                <button
                  className="ribbon-button"
                  onClick={() => editor.chain().focus().setHorizontalRule().run()}
                  type="button"
                >
                  <span className="ribbon-icon">─</span>
                  <span className="ribbon-label">가로줄</span>
                </button>
                <button
                  className="ribbon-button"
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  type="button"
                >
                  <span className="ribbon-icon">{ }</span>
                  <span className="ribbon-label">코드 블록</span>
                </button>
                <button
                  className="ribbon-button"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  type="button"
                >
                  <span className="ribbon-icon">"</span>
                  <span className="ribbon-label">인용구</span>
                </button>
                <button
                  className="ribbon-button"
                  onClick={exportToPDF}
                  type="button"
                >
                  <span className="ribbon-icon">📄</span>
                  <span className="ribbon-label">PDF 내보내기</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="ribbon-pane" id="tab-ai">
            <div className="ribbon-group">
              <h3>AI 연구 도구</h3>
              <div className="ribbon-buttons">
                <button
                  className="ribbon-button"
                  onClick={() => alert('AI 텍스트 요약 기능 - 준비 중입니다.')}
                  type="button"
                >
                  <span className="ribbon-icon">📝</span>
                  <span className="ribbon-label">텍스트 요약</span>
                </button>
                <button
                  className="ribbon-button"
                  onClick={() => alert('AI 번역 기능 - 준비 중입니다.')}
                  type="button"
                >
                  <span className="ribbon-icon">🌐</span>
                  <span className="ribbon-label">번역</span>
                </button>
                <button
                  className="ribbon-button"
                  onClick={() => alert('AI 콘텐츠 재구성 - 준비 중입니다.')}
                  type="button"
                >
                  <span className="ribbon-icon">✨</span>
                  <span className="ribbon-label">콘텐츠 재구성</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'view' && (
          <div className="ribbon-pane" id="tab-view">
            <div className="ribbon-group">
              <h3>연구 패널 관리</h3>
              <div className="ribbon-buttons">
                <button
                  className={`ribbon-button ${Object.values(leftPanelVisibleTabs).every(value => value) ? 'active' : Object.values(leftPanelVisibleTabs).every(value => !value) ? '' : 'partial-active'}`}
                  onClick={() => {
                    const allVisible = Object.values(leftPanelVisibleTabs).every(value => value);
                    onLeftPanelVisibleTabsChange({
                      project: !allVisible,
                      library: !allVisible,
                      references: !allVisible,
                      todos: !allVisible
                    });
                  }}
                  type="button"
                >
                  <span className="ribbon-icon">🔍</span>
                  <span className="ribbon-label">전체 {Object.values(leftPanelVisibleTabs).every(value => value) ? '(표시)' : Object.values(leftPanelVisibleTabs).every(value => !value) ? '(숨김)' : '(일부 표시)'}</span>
                </button>
                <button
                  className={`ribbon-button ${leftPanelVisibleTabs.project ? 'active' : ''}`}
                  onClick={() => onLeftPanelVisibleTabsChange({
                    ...leftPanelVisibleTabs,
                    project: !leftPanelVisibleTabs.project
                  })}
                  type="button"
                >
                  <span className="ribbon-icon">📁</span>
                  <span className="ribbon-label">연구 프로젝트 {leftPanelVisibleTabs.project ? '(표시)' : '(숨김)'}</span>
                </button>
                <button
                  className={`ribbon-button ${leftPanelVisibleTabs.library ? 'active' : ''}`}
                  onClick={() => onLeftPanelVisibleTabsChange({
                    ...leftPanelVisibleTabs,
                    library: !leftPanelVisibleTabs.library
                  })}
                  type="button"
                >
                  <span className="ribbon-icon">📚</span>
                  <span className="ribbon-label">라이브러리 {leftPanelVisibleTabs.library ? '(표시)' : '(숨김)'}</span>
                </button>
                <button
                  className={`ribbon-button ${leftPanelVisibleTabs.references ? 'active' : ''}`}
                  onClick={() => onLeftPanelVisibleTabsChange({
                    ...leftPanelVisibleTabs,
                    references: !leftPanelVisibleTabs.references
                  })}
                  type="button"
                >
                  <span className="ribbon-icon">📖</span>
                  <span className="ribbon-label">참고문헌 {leftPanelVisibleTabs.references ? '(표시)' : '(숨김)'}</span>
                </button>
                <button
                  className={`ribbon-button ${leftPanelVisibleTabs.todos ? 'active' : ''}`}
                  onClick={() => onLeftPanelVisibleTabsChange({
                    ...leftPanelVisibleTabs,
                    todos: !leftPanelVisibleTabs.todos
                  })}
                  type="button"
                >
                  <span className="ribbon-icon">✅</span>
                  <span className="ribbon-label">연구 활동 {leftPanelVisibleTabs.todos ? '(표시)' : '(숨김)'}</span>
                </button>
              </div>
            </div>

            <div className="ribbon-group">
              <h3>연구 정보 패널</h3>
              <div className="ribbon-buttons">
                <button
                  className={`ribbon-button ${Object.values(rightSidebarVisibleTabs).every(value => value) ? 'active' : Object.values(rightSidebarVisibleTabs).every(value => !value) ? '' : 'partial-active'}`}
                  onClick={() => {
                    const allVisible = Object.values(rightSidebarVisibleTabs).every(value => value);
                    onRightSidebarVisibleTabsChange({
                      project: !allVisible,
                      referenceInfo: !allVisible,
                      tableOfContents: !allVisible,
                      collaboration: !allVisible
                    });
                  }}
                  type="button"
                >
                  <span className="ribbon-icon">🔍</span>
                  <span className="ribbon-label">전체 {Object.values(rightSidebarVisibleTabs).every(value => value) ? '(표시)' : Object.values(rightSidebarVisibleTabs).every(value => !value) ? '(숨김)' : '(일부 표시)'}</span>
                </button>
                <button
                  className={`ribbon-button ${rightSidebarVisibleTabs.project ? 'active' : ''}`}
                  onClick={() => {
                    console.log('연구 프로젝트 탭 버튼 클릭, 현재 상태:', rightSidebarVisibleTabs.project);
                    onRightSidebarVisibleTabsChange({
                      ...rightSidebarVisibleTabs,
                      project: !rightSidebarVisibleTabs.project
                    });
                  }}
                  type="button"
                >
                  <span className="ribbon-icon">📋</span>
                  <span className="ribbon-label">연구 프로젝트 {rightSidebarVisibleTabs.project ? '(표시)' : '(숨김)'}</span>
                </button>
                <button
                  className={`ribbon-button ${rightSidebarVisibleTabs.referenceInfo ? 'active' : ''}`}
                  onClick={() => {
                    console.log('참조정보 탭 버튼 클릭, 현재 상태:', rightSidebarVisibleTabs.referenceInfo);
                    onRightSidebarVisibleTabsChange({
                      ...rightSidebarVisibleTabs,
                      referenceInfo: !rightSidebarVisibleTabs.referenceInfo
                    });
                  }}
                  type="button"
                >
                  <span className="ribbon-icon">📊</span>
                  <span className="ribbon-label">참조정보 {rightSidebarVisibleTabs.referenceInfo ? '(표시)' : '(숨김)'}</span>
                </button>
                <button
                  className={`ribbon-button ${rightSidebarVisibleTabs.tableOfContents ? 'active' : ''}`}
                  onClick={() => {
                    console.log('목차 탭 버튼 클릭, 현재 상태:', rightSidebarVisibleTabs.tableOfContents);
                    onRightSidebarVisibleTabsChange({
                      ...rightSidebarVisibleTabs,
                      tableOfContents: !rightSidebarVisibleTabs.tableOfContents
                    });
                  }}
                  type="button"
                >
                  <span className="ribbon-icon">📑</span>
                  <span className="ribbon-label">목차 {rightSidebarVisibleTabs.tableOfContents ? '(표시)' : '(숨김)'}</span>
                </button>
                <button
                  className={`ribbon-button ${rightSidebarVisibleTabs.collaboration ? 'active' : ''}`}
                  onClick={() => {
                    console.log('협업 탭 버튼 클릭, 현재 상태:', rightSidebarVisibleTabs.collaboration);
                    onRightSidebarVisibleTabsChange({
                      ...rightSidebarVisibleTabs,
                      collaboration: !rightSidebarVisibleTabs.collaboration
                    });
                  }}
                  type="button"
                >
                  <span className="ribbon-icon">👥</span>
                  <span className="ribbon-label">협업 {rightSidebarVisibleTabs.collaboration ? '(표시)' : '(숨김)'}</span>
                </button>
              </div>
            </div>

            <div className="ribbon-group">
              <h3>연구 문서 보기</h3>
              <div className="ribbon-buttons">
                <button
                  className={`ribbon-button ${!editor.isEditable ? 'active' : ''}`}
                  onClick={toggleReadOnly}
                  type="button"
                >
                  <span className="ribbon-icon">👁️</span>
                  <span className="ribbon-label">읽기 전용 { !editor.isEditable ? '(켜짐)' : '' }</span>
                </button>
                <button
                  className="ribbon-button"
                  onClick={toggleFullscreen}
                  type="button"
                >
                  <span className="ribbon-icon">⛶</span>
                  <span className="ribbon-label">전체화면 전환</span>
                </button>
              </div>
            </div>

            <div className="ribbon-group">
              <h3>표시</h3>
              <div className="ribbon-buttons">
                <button
                  className={`ribbon-button ${spellcheckEnabled ? 'active' : ''}`}
                  onClick={toggleSpellcheck}
                  type="button"
                >
                  <span className="ribbon-icon">✔️</span>
                  <span className="ribbon-label">맞춤법 검사 { spellcheckEnabled ? '(켜짐)' : '(꺼짐)' }</span>
                </button>
                <button
                  className="ribbon-button"
                  onClick={() => editor.commands.blur()}
                  type="button"
                >
                  <span className="ribbon-icon">✖</span>
                  <span className="ribbon-label">선택 해제</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopMenuBar;