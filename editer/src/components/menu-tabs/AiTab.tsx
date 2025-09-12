// src/components/menu-tabs/AiTab.tsx
import React from 'react';
import type { Editor } from '@tiptap/core';

interface AiTabProps {
  editor: Editor;
}

const AiTab = ({ editor }: AiTabProps) => {
  const preventButtonBlur = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  return (
    <div id="tab-ai" className="ribbon-pane active">
      <div className="ribbon-controls-row">
          <button onMouseDown={preventButtonBlur} className="ribbon-button insert-button">
              <span className="material-symbols-outlined ribbon-icon">edit_note</span>
              <span className="ribbon-label">이어쓰기</span>
          </button>
          <button onMouseDown={preventButtonBlur} className="ribbon-button insert-button">
              <span className="material-symbols-outlined ribbon-icon">summarize</span>
              <span className="ribbon-label">요약</span>
          </button>
          <button onMouseDown={preventButtonBlur} className="ribbon-button insert-button">
              <span className="material-symbols-outlined ribbon-icon">translate</span>
              <span className="ribbon-label">번역</span>
          </button>
          <button onMouseDown={preventButtonBlur} className="ribbon-button insert-button">
              <span className="material-symbols-outlined ribbon-icon">recycling</span>
              <span className="ribbon-label">재구성</span>
          </button>
      </div>
    </div>
  );
};

export default AiTab;