import React from 'react';

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

interface ResourcePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ResourceItem;
}

const ResourcePreviewModal: React.FC<ResourcePreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  resource 
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPreviewContent = () => {
    switch (resource.itemType) {
      case 'image':
        return (
          <div className="flex justify-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
              <span className="text-gray-500">이미지 미리보기</span>
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="flex justify-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
              <span className="text-gray-500">동영상 미리보기</span>
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex justify-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-32 flex items-center justify-center">
              <span className="text-gray-500">음성 미리듣기</span>
            </div>
          </div>
        );
      
      case 'latex':
        return (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">수식 미리보기</h4>
            <div className="bg-white p-4 rounded border">
              <div className="text-center text-lg">
                {resource.content ? resource.content.formula : 'LaTeX 수식이 여기에 표시됩니다'}
              </div>
            </div>
          </div>
        );
      
      case 'table':
        return (
          <div className="overflow-x-auto">
            <h4 className="font-medium text-gray-900 mb-2">표 미리보기</h4>
            <div className="bg-white p-4 rounded border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">열 1</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">열 2</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">열 3</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">데이터 1</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">데이터 2</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">데이터 3</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">데이터 4</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">데이터 5</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">데이터 6</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">
              {resource.itemType === 'website' ? '🌐' : 
               resource.itemType === 'quote' ? '❝' : '📄'}
            </div>
            <p className="text-gray-600">
              {resource.itemType === 'website' ? '웹사이트 링크' : 
               resource.itemType === 'quote' ? '인용 정보' : '파일'}
              미리보기를 지원하지 않습니다.
            </p>
            {resource.itemURL && (
              <a 
                href={resource.itemURL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 inline-block text-blue-600 hover:text-blue-800 underline"
              >
                {resource.itemURL}
              </a>
            )}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {resource.itemTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {renderPreviewContent()}
            </div>
            
            <div className="border-l border-gray-200 pl-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">자료 정보</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">유형</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {resource.itemType === 'image' && '이미지'}
                    {resource.itemType === 'table' && '표'}
                    {resource.itemType === 'latex' && '수식'}
                    {resource.itemType === 'video' && '동영상'}
                    {resource.itemType === 'audio' && '음성'}
                    {resource.itemType === 'website' && '웹사이트'}
                    {resource.itemType === 'quote' && '인용'}
                    {resource.itemType === 'file' && '파일'}
                  </p>
                </div>
                
                {resource.itemAuthor && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">작성자</h4>
                    <p className="mt-1 text-sm text-gray-900">{resource.itemAuthor}</p>
                  </div>
                )}
                
                {resource.itemPublisher && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">출판사</h4>
                    <p className="mt-1 text-sm text-gray-900">{resource.itemPublisher}</p>
                  </div>
                )}
                
                {(resource.itemYear || resource.itemVolume || resource.itemIssue || resource.itemPages) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">출판 정보</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {[resource.itemYear, resource.itemVolume, resource.itemIssue, resource.itemPages]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                )}
                
                {(resource.itemDOI || resource.itemISBN || resource.itemISSN) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">식별자</h4>
                    <div className="mt-1 text-sm text-gray-900 space-y-1">
                      {resource.itemDOI && <div>DOI: {resource.itemDOI}</div>}
                      {resource.itemISBN && <div>ISBN: {resource.itemISBN}</div>}
                      {resource.itemISSN && <div>ISSN: {resource.itemISSN}</div>}
                    </div>
                  </div>
                )}
                
                {resource.itemURL && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">URL</h4>
                    <a 
                      href={resource.itemURL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-blue-600 hover:text-blue-800 underline block truncate"
                    >
                      {resource.itemURL}
                    </a>
                  </div>
                )}
                
                {resource.itemKeywords && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">키워드</h4>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {resource.itemKeywords.split(',').map((keyword, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {resource.itemAbstract && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">요약</h4>
                    <p className="mt-1 text-sm text-gray-900">{resource.itemAbstract}</p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500">등록일</h4>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(resource.itemCreated)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourcePreviewModal;