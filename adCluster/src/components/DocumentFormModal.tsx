import React, { useState, useEffect } from 'react';

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

interface DocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (document: Document) => void;
  document?: Document;
  projectId: string;
  folderId: string;
}

const DocumentFormModal: React.FC<DocumentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  document,
  projectId,
  folderId
}) => {
  const [formData, setFormData] = useState<Partial<Document>>({
    type: 'text',
    title: '',
    description: '',
    source: '',
    tags: []
  });

  useEffect(() => {
    if (document) {
      setFormData(document);
    } else {
      setFormData({
        type: 'text',
        title: '',
        description: '',
        source: '',
        tags: []
      });
    }
  }, [document]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newDocument: Document = {
      id: document?.id || `doc_${Date.now()}`,
      name: formData.title || '제목 없음',
      projectId,
      folderId,
      date: new Date().toISOString().split('T')[0],
      ...formData
    } as Document;

    onSave(newDocument);
    onClose();
  };

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'citation':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                인용 내용
              </label>
              <textarea
                value={(formData as CitationDocument).content || ''}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="인용할 내용을 입력하세요"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                원본 텍스트
              </label>
              <textarea
                value={(formData as CitationDocument).originalText || ''}
                onChange={(e) => setFormData({...formData, originalText: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="원본 텍스트를 입력하세요"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                문서 정보
              </label>
              <input
                type="text"
                value={(formData as CitationDocument).documentInfo || ''}
                onChange={(e) => setFormData({...formData, documentInfo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="문서명, 저자 등"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                페이지 번호
              </label>
              <input
                type="number"
                value={(formData as CitationDocument).pageNumber || ''}
                onChange={(e) => setFormData({...formData, pageNumber: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="페이지 번호"
              />
            </div>
          </>
        );

      case 'image':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이미지 URL
              </label>
              <input
                type="url"
                value={(formData as ImageDocument).url || ''}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="이미지 URL을 입력하세요"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대체 텍스트
              </label>
              <input
                type="text"
                value={(formData as ImageDocument).alt || ''}
                onChange={(e) => setFormData({...formData, alt: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="이미지 설명"
              />
            </div>
          </>
        );

      case 'table':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                표 유형
              </label>
              <select
                value={(formData as TableDocument).tableType || 'excel'}
                onChange={(e) => setFormData({...formData, tableType: e.target.value as 'excel' | 'css'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="excel">Excel 형식</option>
                <option value="css">CSS 스타일</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                헤더 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={(formData as TableDocument).headers?.join(', ') || ''}
                onChange={(e) => setFormData({...formData, headers: e.target.value.split(', ').filter(h => h.trim())})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="열1, 열2, 열3"
              />
            </div>
          </>
        );

      case 'formula':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LaTeX 수식
            </label>
            <textarea
              value={(formData as FormulaDocument).latex || ''}
              onChange={(e) => setFormData({...formData, latex: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="LaTeX 수식을 입력하세요 (예: E = mc^2)"
            />
          </div>
        );

      case 'video':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                동영상 URL
              </label>
              <input
                type="url"
                value={(formData as VideoDocument).url || ''}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="동영상 URL을 입력하세요"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                썸네일 URL
              </label>
              <input
                type="url"
                value={(formData as VideoDocument).thumbnail || ''}
                onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="썸네일 이미지 URL"
              />
            </div>
          </>
        );

      case 'audio':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              음성 파일 URL
            </label>
            <input
              type="url"
              value={(formData as AudioDocument).url || ''}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="음성 파일 URL을 입력하세요"
            />
          </div>
        );

      case 'code':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로그래밍 언어
              </label>
              <input
                type="text"
                value={(formData as CodeDocument).language || ''}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="JavaScript, Python, Java 등"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프레임워크 (선택사항)
              </label>
              <input
                type="text"
                value={(formData as CodeDocument).framework || ''}
                onChange={(e) => setFormData({...formData, framework: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="React, Vue, Django 등"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                코드
              </label>
              <textarea
                value={(formData as CodeDocument).code || ''}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                rows={8}
                placeholder="코드를 입력하세요"
              />
            </div>
          </>
        );

      case 'text':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <textarea
              value={(formData as TextDocument).content || ''}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              placeholder="텍스트 내용을 입력하세요"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {document ? '자료 수정' : '새 자료 등록'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              자료 유형
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as DocumentType})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">텍스트</option>
              <option value="citation">인용/발취</option>
              <option value="image">이미지</option>
              <option value="table">표</option>
              <option value="formula">수식</option>
              <option value="video">동영상</option>
              <option value="audio">음성</option>
              <option value="code">코드 스니펫</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="자료 제목을 입력하세요"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="자료에 대한 설명을 입력하세요"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출처
            </label>
            <input
              type="text"
              value={formData.source || ''}
              onChange={(e) => setFormData({...formData, source: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="출처 정보를 입력하세요"
            />
          </div>

          {renderTypeSpecificFields()}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={formData.tags?.join(', ') || ''}
              onChange={(e) => setFormData({...formData, tags: e.target.value.split(', ').filter(t => t.trim())})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="태그1, 태그2, 태그3"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {document ? '수정' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentFormModal;