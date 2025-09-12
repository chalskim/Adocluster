import React, { useState } from 'react';
import { Editor } from '@tiptap/react';

interface TopMenuBarProps {
  editor: Editor | null;
}

const TopMenuBar: React.FC<TopMenuBarProps> = ({ editor }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'ai'>('home');

  if (!editor) {
    return <div className="editor-ribbon loading">Loading...</div>;
  }

  const handleTabClick = (tab: 'home' | 'insert' | 'ai') => {
    setActiveTab(tab);
  };

  const isActive = (tab: string) => activeTab === tab;

  const exportToPDF = () => {
    alert('PDF 내보내기 기능 - 구현 준비 중입니다.');
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
          홈
        </button>
        <button
          className={`ribbon-tab ${isActive('insert') ? 'active' : ''}`}
          onClick={() => handleTabClick('insert')}
          type="button"
        >
          삽입
        </button>
        <button
          className={`ribbon-tab ${isActive('ai') ? 'active' : ''}`}
          onClick={() => handleTabClick('ai')}
          type="button"
        >
          AI 도구
        </button>
      </div>

      {/* Tab Content */}
      <div className="ribbon-content">
        {activeTab === 'home' && (
          <div className="ribbon-pane" id="tab-home">
            <div className="ribbon-group">
              <h3>클립보드</h3>
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
              <h3>글꼴</h3>
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
              <h3>정렬</h3>
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
              <h3>테이블</h3>
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
              <h3>링크</h3>
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
              <h3>리스트</h3>
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
              <h3>특수 요소</h3>
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
              <h3>AI 도구</h3>
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
      </div>
    </div>
  );
};

export default TopMenuBar;