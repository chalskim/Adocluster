import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import DocumentSelector from './DocumentSelector';
import DocumentInserter from './DocumentInserter';

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

interface NoteIntegrationProps {
  editor: Editor | null;
}

const NoteIntegration: React.FC<NoteIntegrationProps> = ({ editor }) => {
  const [showDocumentSelector, setShowDocumentSelector] = useState<boolean>(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);

  const handleDocumentSelect = (document: Document) => {
    // 선택된 자료를 노트에 추가
    setSelectedDocuments(prev => [...prev, document]);
    
    // 에디터에 자료 참조 삽입
    if (editor) {
      const content = generateDocumentReference(document);
      editor.chain().focus().insertContent(content).run();
    }
    
    setShowDocumentSelector(false);
  };

  const generateDocumentReference = (document: Document): string => {
    switch (document.type) {
      case 'citation':
        return `<div class="document-reference citation" data-id="${document.id}">
          <span class="reference-marker">[인용]</span>
          <span class="reference-title">${document.title}</span>
          ${document.source ? `<span class="reference-source">(${document.source})</span>` : ''}
        </div>`;
      
      case 'image':
        return `<div class="document-reference image" data-id="${document.id}">
          <span class="reference-marker">[이미지]</span>
          <span class="reference-title">${document.title}</span>
        </div>`;
      
      case 'table':
        return `<div class="document-reference table" data-id="${document.id}">
          <span class="reference-marker">[표]</span>
          <span class="reference-title">${document.title}</span>
        </div>`;
      
      case 'formula':
        return `<div class="document-reference formula" data-id="${document.id}">
          <span class="reference-marker">[수식]</span>
          <span class="reference-title">${document.title}</span>
        </div>`;
      
      case 'video':
        return `<div class="document-reference video" data-id="${document.id}">
          <span class="reference-marker">[동영상]</span>
          <span class="reference-title">${document.title}</span>
        </div>`;
      
      case 'audio':
        return `<div class="document-reference audio" data-id="${document.id}">
          <span class="reference-marker">[오디오]</span>
          <span class="reference-title">${document.title}</span>
        </div>`;
      
      case 'code':
        return `<div class="document-reference code" data-id="${document.id}">
          <span class="reference-marker">[코드]</span>
          <span class="reference-title">${document.title}</span>
        </div>`;
      
      case 'text':
        return `<div class="document-reference text" data-id="${document.id}">
          <span class="reference-marker">[텍스트]</span>
          <span class="reference-title">${document.title}</span>
        </div>`;
      
      default:
        // TypeScript exhaustive check
        const _exhaustiveCheck: never = document;
        throw new Error(`Unhandled document type: ${JSON.stringify(_exhaustiveCheck)}`);
    }
  };

  const removeDocumentFromNote = (documentId: string) => {
    setSelectedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    
    // 에디터에서 해당 자료 참조 제거
    if (editor) {
      const dom = editor.view.dom;
      const referenceElement = dom.querySelector(`[data-id="${documentId}"]`);
      if (referenceElement) {
        referenceElement.remove();
      }
    }
  };

  return (
    <div className="note-integration">
      <div className="note-toolbar">
        <button
          className="btn btn-primary"
          onClick={() => setShowDocumentSelector(true)}
          type="button"
        >
          📚 자료 삽입
        </button>
        
        {selectedDocuments.length > 0 && (
          <span className="document-count">
            {selectedDocuments.length}개 자료 연결됨
          </span>
        )}
      </div>

      {selectedDocuments.length > 0 && (
        <div className="selected-documents">
          <h4>연결된 자료</h4>
          <div className="document-list">
            {selectedDocuments.map((document) => (
              <div key={document.id} className="document-item">
                <DocumentInserter document={document} />
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => removeDocumentFromNote(document.id)}
                  type="button"
                >
                  제거
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showDocumentSelector && (
        <DocumentSelector
          isOpen={showDocumentSelector}
          onClose={() => setShowDocumentSelector(false)}
          onSelect={handleDocumentSelect}
          title="노트에 삽입할 자료 선택"
        />
      )}

      <style>{`
        .note-integration {
          padding: 1rem;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          background: #f8f9fa;
        }

        .note-toolbar {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .document-count {
          font-size: 0.875rem;
          color: #6c757d;
          background: #e9ecef;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .selected-documents {
          margin-top: 1rem;
        }

        .selected-documents h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          color: #495057;
        }

        .document-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .document-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 4px;
        }

        .btn {
          padding: 0.375rem 0.75rem;
          border: 1px solid transparent;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          text-align: center;
          vertical-align: middle;
          user-select: none;
          transition: all 0.15s ease-in-out;
        }

        .btn-primary {
          color: #fff;
          background-color: #007bff;
          border-color: #007bff;
        }

        .btn-primary:hover {
          background-color: #0056b3;
          border-color: #004085;
        }

        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }

        .btn-danger {
          color: #fff;
          background-color: #dc3545;
          border-color: #dc3545;
        }

        .btn-danger:hover {
          background-color: #c82333;
          border-color: #bd2130;
        }
      `}</style>
    </div>
  );
};

export default NoteIntegration;