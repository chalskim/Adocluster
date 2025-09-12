// src/components/menu-tabs/InsertTab.tsx
import React from 'react';
import type { Editor } from '@tiptap/core';

interface InsertTabProps {
  editor: Editor;
  onTableClick: () => void;
  onFileAttachmentClick: () => void;
  onImageClick: () => void;
  onGraphClick: () => void;
  onPdfExportClick: () => void;
  // --- [수정 1] 위치 확인 함수를 props로 받도록 추가 ---
  onShowPositionInfoClick: () => void; 

  onSelectTextByPositionClick: () => void;
  onSetCursorByPositionClick: () => void;
  onSetDataTagClick: () => void;
}

const InsertTab = ({ 
  editor, 
  onTableClick,
  onFileAttachmentClick,
  onImageClick,
  onGraphClick,
  onPdfExportClick,
  onShowPositionInfoClick, // props로 받음
  onSelectTextByPositionClick,
  onSetCursorByPositionClick,
  onSetDataTagClick, 
}: InsertTabProps) => {

  const preventButtonBlur = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const handleLinkClick = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL을 입력하세요', previousUrl);
    if (url === null || url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleEquationClick = () => {
    const rawInput = window.prompt('LaTeX 수식을 입력하세요', '');
    if (rawInput === null) return;
    let processedLatex = rawInput.trim();
    if (processedLatex.startsWith('$$') && processedLatex.endsWith('$$')) {
      processedLatex = processedLatex.slice(2, -2).trim();
    }
    if (processedLatex) {
      editor.chain().focus().setEquation({ latex: processedLatex }).run();
    }
  };
  
  const toggleBlockquote = () => {
    const isActive = editor.isActive('blockquote');
    if (isActive) {
      editor.chain().focus().toggleBlockquote().run();
    } else {
      const citation = window.prompt("인용문의 출처를 입력하세요 (선택 사항):");
      if (citation === null) return;
      editor.chain().focus().setBlockquote({ cite: citation || '' }).run();
    }
  };

  return (
    <div id="tab-insert" className="ribbon-pane active">
      <div className="ribbon-group">
        <div className="ribbon-controls-row">
          <button onMouseDown={preventButtonBlur} className="ribbon-button insert-button" onClick={onTableClick}>
            <span className="material-symbols-outlined ribbon-icon">grid_on</span>
            <span className="ribbon-label">표</span>
          </button>
        </div>
      </div>
      <div className="ribbon-group">
         <div className="ribbon-controls-row">
            <button onMouseDown={preventButtonBlur} className="ribbon-button insert-button" onClick={onFileAttachmentClick}>
              <span className="material-symbols-outlined ribbon-icon">attachment</span>
              <span className="ribbon-label">파일</span>
            </button>
            <button onMouseDown={preventButtonBlur} className="ribbon-button insert-button" onClick={onImageClick}>
              <span className="material-symbols-outlined ribbon-icon">image</span>
              <span className="ribbon-label">그림</span>
            </button>
            <button onMouseDown={preventButtonBlur} className="ribbon-button insert-button" onClick={onGraphClick}>
              <span className="material-symbols-outlined ribbon-icon">show_chart</span>
              <span className="ribbon-label">그래프</span>
          </button>
          </div>
      </div>
      <div className="ribbon-group">
        <div className="ribbon-controls-row">
          <button onMouseDown={preventButtonBlur} className={`ribbon-button insert-button ${editor.isActive('link') ? 'is-active' : ''}`} onClick={handleLinkClick}>
            <span className="material-symbols-outlined ribbon-icon">link</span>
            <span className="ribbon-label">링크</span>
          </button>
        </div>
      </div>
      <div className="ribbon-group">
        <div className="ribbon-controls-row">
          <button onMouseDown={preventButtonBlur} className="ribbon-button insert-button" onClick={handleEquationClick}>
            <span className="material-symbols-outlined ribbon-icon">calculate</span>
            <span className="ribbon-label">수식</span>
          </button>
        </div>
      </div>
      <div className="ribbon-group">
        <div className="ribbon-controls-row">
          <button onMouseDown={preventButtonBlur} className="ribbon-button insert-button" onClick={onPdfExportClick}>
            <span className="material-symbols-outlined ribbon-icon">picture_as_pdf</span>
            <span className="ribbon-label">PDF</span>
          </button>
          <button onMouseDown={preventButtonBlur} onClick={toggleBlockquote} className={`ribbon-button ${editor.isActive('blockquote') ? 'is-active' : ''}`} title="인용문">
            <span className="material-symbols-outlined">format_quote</span>
             <span className="ribbon-label">인용</span>
         </button>
          {/* --- [ 여기가 추가된 부분입니다 ] --- */}
          <button
            onMouseDown={preventButtonBlur}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`ribbon-button ${editor.isActive('highlight') ? 'is-active' : ''}`}
            title="텍스트 하이라이트"
          >
            <span className="material-symbols-outlined">ink_highlighter</span>
            <span className="ribbon-label">형광펜</span>
         </button>
          <button
            onMouseDown={preventButtonBlur}
            onClick={onShowPositionInfoClick}
            className="ribbon-button"
            title="선택 영역 위치 정보 확인"
          >
            <span className="material-symbols-outlined ribbon-icon">saved_search</span>
            <span className="ribbon-label">위치 확인</span>
          </button>
          <button
            onMouseDown={preventButtonBlur}
            onClick={onSelectTextByPositionClick}
            className="ribbon-button"
            title="지정한 인덱스 범위의 텍스트를 선택합니다"
          >
            <span className="material-symbols-outlined">select_all</span>
            <span className="ribbon-label">위치로 선택</span>
          </button>
          <button
            onMouseDown={preventButtonBlur}
            onClick={onSetCursorByPositionClick}
            className="ribbon-button"
            title="지정한 인덱스로 커서를 이동합니다"
          >
            <span className="material-symbols-outlined">arrow_range</span>
            <span className="ribbon-label">커서 이동</span>
          </button>
          <button
            onMouseDown={preventButtonBlur}
            onClick={onSetDataTagClick}
            className={`ribbon-button ${editor.isActive('dataTag') ? 'is-active' : ''}`}
            title="선택한 텍스트에 보이지 않는 데이터 태그를 추가합니다"
          >
            <span className="material-symbols-outlined">sell</span>
            <span className="ribbon-label">데이터 태그</span>
          </button>
          {/* --- 여기까지 추가 --- */}
        </div>
      </div>
    </div>
  );
};

export default InsertTab;