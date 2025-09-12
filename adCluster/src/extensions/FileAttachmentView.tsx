// src/extensions/FileAttachmentView.tsx

import { NodeViewWrapper } from '@tiptap/react';

export const FileAttachmentView = ({ node }: { node: any }) => {
  const { fileName, fileSize, fileType } = node.attrs;
  
  // 파일 크기를 읽기 쉬운 형식으로 변환
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 파일 타입에 따른 아이콘 결정
  const getFileIcon = (fileType: string): string => {
    if (fileType.includes('image')) return 'fas fa-file-image';
    if (fileType.includes('pdf')) return 'fas fa-file-pdf';
    if (fileType.includes('word')) return 'fas fa-file-word';
    if (fileType.includes('excel')) return 'fas fa-file-excel';
    if (fileType.includes('powerpoint')) return 'fas fa-file-powerpoint';
    if (fileType.includes('audio')) return 'fas fa-file-audio';
    if (fileType.includes('video')) return 'fas fa-file-video';
    if (fileType.includes('zip') || fileType.includes('compressed')) return 'fas fa-file-archive';
    return 'fas fa-file';
  };

  return (
    <NodeViewWrapper className="file-attachment-wrapper">
      <div className="file-attachment">
        <div className="file-icon">
          <i className={getFileIcon(fileType)}></i>
        </div>
        <div className="file-info">
          <div className="file-name">{fileName}</div>
          <div className="file-meta">{formatFileSize(fileSize)} • {fileType}</div>
        </div>
        <div className="file-actions">
          <button className="download-btn">
            <i className="fas fa-download"></i> 다운로드
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
};