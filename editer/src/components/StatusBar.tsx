// src/components/StatusBar.tsx
import React from 'react';
import type { Editor } from '@tiptap/core';

// --- [수정] editor prop을 받기 위한 interface 정의 ---
interface StatusBarProps {
  editor: Editor | null;
}

const StatusBar = ({ editor }: StatusBarProps) => {
  if (!editor) {
    return null;
  }

  // CharacterCount 확장 프로그램이 등록되어 있어야 이 값이 존재합니다.
  const charCount = editor.storage.characterCount?.characters() || 0;
  const wordCount = editor.storage.characterCount?.words() || 0;

  return (
    <div className="status-bar">
      <div className="status-text">
        단어: {wordCount}
      </div>
      <div className="status-text">
        문자: {charCount}
      </div>
    </div>
  );
};

export default StatusBar;