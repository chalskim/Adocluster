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

interface DocumentInserterProps {
  document: Document;
  className?: string;
  showMetadata?: boolean;
}

const DocumentInserter: React.FC<DocumentInserterProps> = ({
  document,
  className = '',
  showMetadata = true
}) => {
  const renderCitation = (doc: CitationDocument) => (
    <div className={`citation-block border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 ${className}`}>
      <blockquote className="text-gray-800 italic mb-2">
        "{doc.content}"
      </blockquote>
      {showMetadata && (
        <div className="text-sm text-gray-600">
          <div className="flex flex-wrap gap-2">
            {doc.source && (
              <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                출처: {doc.source}
              </span>
            )}
            {doc.documentInfo && (
              <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                문서: {doc.documentInfo}
              </span>
            )}
            {doc.pageNumber && (
              <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                페이지: {doc.pageNumber}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderImage = (doc: ImageDocument) => (
    <div className={`image-block ${className}`}>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <img
          src={doc.url}
          alt={doc.alt || doc.title}
          className="w-full h-auto"
          style={{
            maxWidth: doc.width ? `${doc.width}px` : '100%',
            maxHeight: doc.height ? `${doc.height}px` : 'auto'
          }}
        />
        {showMetadata && (doc.title || doc.description) && (
          <div className="p-3 bg-gray-50">
            {doc.title && (
              <h4 className="font-medium text-gray-900 mb-1">{doc.title}</h4>
            )}
            {doc.description && (
              <p className="text-sm text-gray-600">{doc.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderTable = (doc: TableDocument) => (
    <div className={`table-block ${className}`}>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          {doc.headers && (
            <thead className="bg-gray-50">
              <tr>
                {doc.headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="bg-white divide-y divide-gray-200">
            {doc.data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showMetadata && (doc.title || doc.description) && (
        <div className="mt-2 text-sm text-gray-600">
          {doc.title && <div className="font-medium">{doc.title}</div>}
          {doc.description && <div>{doc.description}</div>}
        </div>
      )}
    </div>
  );

  const renderFormula = (doc: FormulaDocument) => (
    <div className={`formula-block text-center py-4 ${className}`}>
      <div className="inline-block bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        {doc.rendered ? (
          <div className="text-lg" dangerouslySetInnerHTML={{ __html: doc.rendered }} />
        ) : (
          <code className="text-lg font-mono">{doc.latex}</code>
        )}
      </div>
      {showMetadata && (doc.title || doc.description) && (
        <div className="mt-2 text-sm text-gray-600">
          {doc.title && <div className="font-medium">{doc.title}</div>}
          {doc.description && <div>{doc.description}</div>}
        </div>
      )}
    </div>
  );

  const renderVideo = (doc: VideoDocument) => (
    <div className={`video-block ${className}`}>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <video
          controls
          className="w-full h-auto"
          poster={doc.thumbnail}
        >
          <source src={doc.url} type="video/mp4" />
          브라우저가 비디오를 지원하지 않습니다.
        </video>
        {showMetadata && (doc.title || doc.description) && (
          <div className="p-3 bg-gray-50">
            {doc.title && (
              <h4 className="font-medium text-gray-900 mb-1">{doc.title}</h4>
            )}
            {doc.description && (
              <p className="text-sm text-gray-600">{doc.description}</p>
            )}
            {doc.duration && (
              <p className="text-xs text-gray-500 mt-1">
                재생시간: {Math.floor(doc.duration / 60)}:{(doc.duration % 60).toString().padStart(2, '0')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderAudio = (doc: AudioDocument) => (
    <div className={`audio-block ${className}`}>
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🎵</div>
          <div className="flex-1">
            {showMetadata && doc.title && (
              <h4 className="font-medium text-gray-900 mb-1">{doc.title}</h4>
            )}
            <audio controls className="w-full">
              <source src={doc.url} type="audio/mpeg" />
              브라우저가 오디오를 지원하지 않습니다.
            </audio>
            {showMetadata && doc.description && (
              <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
            )}
            {showMetadata && doc.duration && (
              <p className="text-xs text-gray-500 mt-1">
                재생시간: {Math.floor(doc.duration / 60)}:{(doc.duration % 60).toString().padStart(2, '0')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCode = (doc: CodeDocument) => (
    <div className={`code-block ${className}`}>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-800 text-white px-4 py-2 text-sm flex justify-between items-center">
          <span>{doc.language}</span>
          {doc.framework && (
            <span className="text-gray-300">({doc.framework})</span>
          )}
        </div>
        <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto">
          <code>{doc.code}</code>
        </pre>
        {showMetadata && (doc.title || doc.description) && (
          <div className="p-3 bg-gray-50">
            {doc.title && (
              <h4 className="font-medium text-gray-900 mb-1">{doc.title}</h4>
            )}
            {doc.description && (
              <p className="text-sm text-gray-600">{doc.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderText = (doc: TextDocument) => (
    <div className={`text-block ${className}`}>
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="prose max-w-none">
          {doc.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-2 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
        {showMetadata && (doc.title || doc.description) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            {doc.title && (
              <h4 className="font-medium text-gray-900 mb-1">{doc.title}</h4>
            )}
            {doc.description && (
              <p className="text-sm text-gray-600">{doc.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderDocument = () => {
    switch (document.type) {
      case 'citation':
        return renderCitation(document as CitationDocument);
      case 'image':
        return renderImage(document as ImageDocument);
      case 'table':
        return renderTable(document as TableDocument);
      case 'formula':
        return renderFormula(document as FormulaDocument);
      case 'video':
        return renderVideo(document as VideoDocument);
      case 'audio':
        return renderAudio(document as AudioDocument);
      case 'code':
        return renderCode(document as CodeDocument);
      case 'text':
        return renderText(document as TextDocument);
      default:
        return (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-500">지원하지 않는 문서 유형입니다.</p>
          </div>
        );
    }
  };

  return (
    <div className="document-inserter my-4">
      {renderDocument()}
    </div>
  );
};

export default DocumentInserter;