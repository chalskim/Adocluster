import React, { useState, useEffect } from 'react';

interface ResourceItem {
  id: string;
  libID: string;
  itemType: 'file' | 'image' | 'table' | 'website' | 'latex' | 'video' | 'audio' | 'quote';
  itemTitle: string;
  itemAuthor?: string;
  itemPublisher?: string;
  itemYear?: string;
  itemURL?: string;
  itemDOI?: string;
  itemISBN?: string;
  itemISSN?: string;
  itemVolume?: string;
  itemIssue?: string;
  itemPages?: string;
  itemAbstract?: string;
  itemKeywords?: string;
  itemNotes?: string;
  content?: any;
  itemCreated: string;
  itemUpdated: string;
}

interface ResourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resourceData: any) => void;
  resource: ResourceItem | null;
}

const ResourceFormModal: React.FC<ResourceFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  resource 
}) => {
  const [formData, setFormData] = useState({
    itemType: 'file' as 'file' | 'image' | 'table' | 'website' | 'latex' | 'video' | 'audio' | 'quote',
    itemTitle: '',
    itemAuthor: '',
    itemPublisher: '',
    itemYear: '',
    itemURL: '',
    itemDOI: '',
    itemISBN: '',
    itemISSN: '',
    itemVolume: '',
    itemIssue: '',
    itemPages: '',
    itemAbstract: '',
    itemKeywords: '',
    itemNotes: '',
    file: null as File | null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (resource) {
      setFormData({
        itemType: resource.itemType,
        itemTitle: resource.itemTitle,
        itemAuthor: resource.itemAuthor || '',
        itemPublisher: resource.itemPublisher || '',
        itemYear: resource.itemYear || '',
        itemURL: resource.itemURL || '',
        itemDOI: resource.itemDOI || '',
        itemISBN: resource.itemISBN || '',
        itemISSN: resource.itemISSN || '',
        itemVolume: resource.itemVolume || '',
        itemIssue: resource.itemIssue || '',
        itemPages: resource.itemPages || '',
        itemAbstract: resource.itemAbstract || '',
        itemKeywords: resource.itemKeywords || '',
        itemNotes: resource.itemNotes || '',
        file: null
      });
    } else {
      setFormData({
        itemType: 'file',
        itemTitle: '',
        itemAuthor: '',
        itemPublisher: '',
        itemYear: '',
        itemURL: '',
        itemDOI: '',
        itemISBN: '',
        itemISSN: '',
        itemVolume: '',
        itemIssue: '',
        itemPages: '',
        itemAbstract: '',
        itemKeywords: '',
        itemNotes: '',
        file: null
      });
    }
    setErrors({});
  }, [resource, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.itemTitle.trim()) {
      newErrors.itemTitle = '제목은 필수 입력 항목입니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const { file, ...submissionData } = formData; // Remove file from submission data
    
    onSubmit(resource ? { ...submissionData, id: resource.id } : submissionData);
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'image': return '이미지';
      case 'table': return '표';
      case 'latex': return '수식';
      case 'video': return '동영상';
      case 'audio': return '음성';
      case 'website': return '웹사이트';
      case 'quote': return '인용';
      default: return '파일';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {resource ? '자료 수정' : '새 자료 추가'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {errors.general && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg">
                {errors.general}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  자료 유형 *
                </label>
                <select
                  name="itemType"
                  value={formData.itemType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="file">파일</option>
                  <option value="image">이미지</option>
                  <option value="table">표 (엑셀, CSV)</option>
                  <option value="latex">수식 (LaTeX)</option>
                  <option value="video">동영상</option>
                  <option value="audio">음성</option>
                  <option value="website">웹사이트</option>
                  <option value="quote">인용</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목 *
                </label>
                <input
                  type="text"
                  name="itemTitle"
                  value={formData.itemTitle}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.itemTitle ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="자료 제목을 입력하세요"
                />
                {errors.itemTitle && (
                  <p className="mt-1 text-sm text-red-600">{errors.itemTitle}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  작성자
                </label>
                <input
                  type="text"
                  name="itemAuthor"
                  value={formData.itemAuthor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="작성자 이름"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  출판사
                </label>
                <input
                  type="text"
                  name="itemPublisher"
                  value={formData.itemPublisher}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="출판사"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  출판년도
                </label>
                <input
                  type="text"
                  name="itemYear"
                  value={formData.itemYear}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="YYYY"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DOI
                </label>
                <input
                  type="text"
                  name="itemDOI"
                  value={formData.itemDOI}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DOI"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  name="itemISBN"
                  value={formData.itemISBN}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ISBN"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="text"
                name="itemURL"
                value={formData.itemURL}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                키워드
              </label>
              <input
                type="text"
                name="itemKeywords"
                value={formData.itemKeywords}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="키워드를 쉼표로 구분하여 입력"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                요약
              </label>
              <textarea
                name="itemAbstract"
                value={formData.itemAbstract}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="자료에 대한 간단한 요약"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메모
              </label>
              <textarea
                name="itemNotes"
                value={formData.itemNotes}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="개인 메모"
              />
            </div>
            
            {['image', 'video', 'audio'].includes(formData.itemType) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  파일 업로드
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {getItemTypeLabel(formData.itemType)} 파일을 선택하세요
                </p>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {resource ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceFormModal;