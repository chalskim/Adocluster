import React from 'react';

type DocumentType = 'citation' | 'image' | 'table' | 'formula' | 'video' | 'audio' | 'code' | 'text';

interface BaseDocument {
  id: string;
  name: string;
  projectId: string;
  folderId: string;
  date: string;
  type: DocumentType;
  title: string;
  description?: string;
  source?: string;
  tags?: string[];
}

interface CitationDocument extends BaseDocument {
  type: 'citation';
  content: string;
  originalText: string;
  documentInfo?: string;
  pageNumber?: number;
}

interface ImageDocument extends BaseDocument {
  type: 'image';
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface TableDocument extends BaseDocument {
  type: 'table';
  data: any[][];
  headers?: string[];
  tableType: 'excel' | 'css';
  styles?: any;
}

interface FormulaDocument extends BaseDocument {
  type: 'formula';
  latex: string;
  rendered?: string;
}

interface VideoDocument extends BaseDocument {
  type: 'video';
  url: string;
  duration?: number;
  thumbnail?: string;
}

interface AudioDocument extends BaseDocument {
  type: 'audio';
  url: string;
  duration?: number;
}

interface CodeDocument extends BaseDocument {
  type: 'code';
  code: string;
  language: string;
  framework?: string;
}

interface TextDocument extends BaseDocument {
  type: 'text';
  content: string;
}

type Document = CitationDocument | ImageDocument | TableDocument | FormulaDocument | VideoDocument | AudioDocument | CodeDocument | TextDocument;

interface DocumentPreviewProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, isOpen, onClose }) => {
  const renderPreview = () => {
    switch (document.type) {
      case 'citation':
        const citationDoc = document as CitationDocument;
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <blockquote className="text-gray-800 italic">
                "{citationDoc.content}"
              </blockquote>
            </div>
            {citationDoc.originalText && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">원본 텍스트:</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded">{citationDoc.originalText}</p>
              </div>
            )}
            {citationDoc.documentInfo && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">문서 정보:</h4>
                <p className="text-gray-600">{citationDoc.documentInfo}</p>
              </div>
            )}
            {citationDoc.pageNumber && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">페이지:</h4>
                <p className="text-gray-600">{citationDoc.pageNumber}페이지</p>
              </div>
            )}
          </div>
        );

      case 'image':
        const imageDoc = document as ImageDocument;
        return (
          <div className="text-center">
            <img
              src={imageDoc.url}
              alt={imageDoc.alt || document.title}
              className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydtOuvuOyngCDroZzrk5zrkJjslYjsnYQ8L3RleHQ+PC9zdmc+';
              }}
            />
            {imageDoc.alt && (
              <p className="text-gray-600 mt-2 text-sm">{imageDoc.alt}</p>
            )}
          </div>
        );

      case 'table':
        const tableDoc = document as TableDocument;
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              {tableDoc.headers && (
                <thead>
                  <tr className="bg-gray-50">
                    {tableDoc.headers.map((header, index) => (
                      <th key={index} className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {tableDoc.data?.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm text-gray-500 mt-2">표 유형: {tableDoc.tableType}</p>
          </div>
        );

      case 'formula':
        const formulaDoc = document as FormulaDocument;
        return (
          <div className="text-center space-y-4">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 inline-block">
              <div className="text-2xl font-mono">
                {formulaDoc.latex}
              </div>
            </div>
            <p className="text-sm text-gray-500">LaTeX 수식</p>
            <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
              실제 환경에서는 MathJax나 KaTeX를 사용하여 수식을 렌더링합니다.
            </div>
          </div>
        );

      case 'video':
        const videoDoc = document as VideoDocument;
        return (
          <div className="space-y-4">
            <div className="relative">
              <video
                controls
                className="w-full max-h-96 rounded-lg"
                poster={videoDoc.thumbnail}
              >
                <source src={videoDoc.url} />
                브라우저가 비디오를 지원하지 않습니다.
              </video>
            </div>
            {videoDoc.duration && (
              <p className="text-sm text-gray-500">재생 시간: {Math.floor(videoDoc.duration / 60)}분 {videoDoc.duration % 60}초</p>
            )}
          </div>
        );

      case 'audio':
        const audioDoc = document as AudioDocument;
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="text-4xl mb-4">🎵</div>
              <audio controls className="w-full">
                <source src={audioDoc.url} />
                브라우저가 오디오를 지원하지 않습니다.
              </audio>
            </div>
            {audioDoc.duration && (
              <p className="text-sm text-gray-500">재생 시간: {Math.floor(audioDoc.duration / 60)}분 {audioDoc.duration % 60}초</p>
            )}
          </div>
        );

      case 'code':
        const codeDoc = document as CodeDocument;
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{codeDoc.language}</span>
              {codeDoc.framework && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{codeDoc.framework}</span>
              )}
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{codeDoc.code}</code>
            </pre>
          </div>
        );

      case 'text':
        const textDoc = document as TextDocument;
        return (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-800">
              {textDoc.content}
            </div>
          </div>
        );

      default:
        return <div className="text-gray-500">미리보기를 사용할 수 없습니다.</div>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">{document.title}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
              <span className="bg-gray-100 px-2 py-1 rounded">{document.type}</span>
              <span>{document.date}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {document.description && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h3 className="font-semibold text-gray-700 mb-1">설명</h3>
            <p className="text-gray-600">{document.description}</p>
          </div>
        )}

        <div className="mb-4">
          {renderPreview()}
        </div>

        {document.source && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <h3 className="font-semibold text-blue-700 mb-1">출처</h3>
            <p className="text-blue-600">{document.source}</p>
          </div>
        )}

        {document.tags && document.tags.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">태그</h3>
            <div className="flex flex-wrap gap-2">
              {document.tags.map((tag, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;