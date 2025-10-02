import React from 'react';
import './NodeIcon.css';

const NodeIcon = ({ node, folderView, isExpanded }) => {
  // 폴더 형식이 아닌 경우 기본 아이콘 반환
  if (!folderView) {
    return <span className="node-icon default">📄</span>;
  }

  // 자식 노드가 있는지 확인
  const hasChildren = node.children && node.children.length > 0;

  // 폴더 형식에서의 아이콘 결정
  const getIcon = () => {
    if (hasChildren) {
      // 폴더 아이콘 (확장/축소 상태에 따라)
      return isExpanded ? '📂' : '📁';
    } else {
      // 파일 아이콘 (확장자에 따라 다른 아이콘)
      const name = node.name.toLowerCase();
      
      // 이미지 파일
      if (name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
        return '🖼️';
      }
      // 문서 파일
      if (name.match(/\.(doc|docx|pdf|txt|md)$/)) {
        return '📄';
      }
      // 코드 파일
      if (name.match(/\.(js|jsx|ts|tsx|html|css|scss|json|xml)$/)) {
        return '💻';
      }
      // 압축 파일
      if (name.match(/\.(zip|rar|7z|tar|gz)$/)) {
        return '📦';
      }
      // 비디오 파일
      if (name.match(/\.(mp4|avi|mov|wmv|flv|webm)$/)) {
        return '🎬';
      }
      // 오디오 파일
      if (name.match(/\.(mp3|wav|flac|aac|ogg)$/)) {
        return '🎵';
      }
      // 실행 파일
      if (name.match(/\.(exe|app|deb|rpm|dmg)$/)) {
        return '⚙️';
      }
      
      // 기본 파일 아이콘
      return '📄';
    }
  };

  return (
    <span className={`node-icon folder-view ${hasChildren ? 'folder' : 'file'}`}>
      {getIcon()}
    </span>
  );
};

export default NodeIcon;