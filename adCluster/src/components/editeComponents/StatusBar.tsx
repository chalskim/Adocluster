// src/components/StatusBar.tsx

import React from 'react';
import { Editor } from '@tiptap/react';

interface StatusBarProps {
  editor: Editor | null;
}

const StatusBar: React.FC<StatusBarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const characters = editor.storage.characterCount.characters();
  const words = editor.storage.characterCount.words();

  return (
    <div className="status-bar">
      <div className="status-item">
        <span className="status-label">문자 수:</span>
        <span className="status-value">{characters}</span>
      </div>
      <div className="status-item">
        <span className="status-label">단어 수:</span>
        <span className="status-value">{words}</span>
      </div>
    </div>
  );
};

export default StatusBar;