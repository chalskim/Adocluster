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

interface ResourceListProps {
  resources: ResourceItem[];
  onEdit: (resource: ResourceItem) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  onPreview: (resource: ResourceItem) => void;
  onSelect: (resource: ResourceItem) => void;
}

const ResourceList: React.FC<ResourceListProps> = ({ 
  resources, 
  onEdit, 
  onDelete, 
  onDownload, 
  onPreview,
  onSelect
}) => {
  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'image': return 'fas fa-image text-green-500';
      case 'table': return 'fas fa-table text-blue-500';
      case 'latex': return 'fas fa-square-root-alt text-purple-500';
      case 'video': return 'fas fa-video text-red-500';
      case 'audio': return 'fas fa-music text-yellow-500';
      case 'website': return 'fas fa-globe text-indigo-500';
      case 'quote': return 'fas fa-quote-right text-gray-500';
      default: return 'fas fa-file text-gray-500';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <h3 className="text-base sm:text-lg font-medium text-gray-900">
          자료 목록 ({resources.length}개)
        </h3>
      </div>
      
      {resources.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-3xl mb-4">📂</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            자료가 없습니다
          </h3>
          <p className="text-gray-500">
            "자료 추가" 버튼을 클릭하여 새로운 자료를 추가하세요.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  등록일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resources.map((resource) => (
                <tr 
                  key={resource.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelect(resource)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <i className={`${getItemIcon(resource.itemType)} text-lg mr-3`}></i>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {resource.itemTitle}
                        </div>
                        {resource.itemKeywords && (
                          <div className="text-xs text-gray-500 mt-1">
                            {resource.itemKeywords}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {resource.itemType === 'image' && '이미지'}
                      {resource.itemType === 'table' && '표'}
                      {resource.itemType === 'latex' && '수식'}
                      {resource.itemType === 'video' && '동영상'}
                      {resource.itemType === 'audio' && '음성'}
                      {resource.itemType === 'website' && '웹사이트'}
                      {resource.itemType === 'quote' && '인용'}
                      {resource.itemType === 'file' && '파일'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {resource.itemAuthor || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(resource.itemCreated)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreview(resource);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="미리보기"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(resource);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="수정"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(resource.id);
                      }}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="다운로드"
                    >
                      <i className="fas fa-download"></i>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(resource.id);
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="삭제"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResourceList;