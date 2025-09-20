import React from 'react';
import { Resource, ResourceType } from '../../types/ResourceTypes';

interface ResourceListProps {
  resources: Resource[];
  selectedResources: Set<string>;
  onSelectResource: (resourceId: string) => void;
  onSelectAll: () => void;
  onEditResource: (resource: Resource) => void;
  onDeleteResource: (resourceId: string) => void;
  onPreviewResource: (resource: Resource) => void;
}

const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  selectedResources,
  onSelectResource,
  onSelectAll,
  onEditResource,
  onDeleteResource,
  onPreviewResource
}) => {
  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'citation': return '📝';
      case 'image': return '🖼️';
      case 'table': return '📊';
      case 'formula': return '🧮';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      default: return '📄';
    }
  };

  const getResourceTypeLabel = (type: ResourceType) => {
    switch (type) {
      case 'citation': return '인용/발취';
      case 'image': return '이미지';
      case 'table': return '표';
      case 'formula': return '수식';
      case 'video': return '동영상';
      case 'audio': return '음성';
      default: return '기타';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderResourcePreview = (resource: Resource) => {
    switch (resource.type) {
      case 'citation':
        const citationResource = resource as any;
        return (
          <div className="text-sm text-gray-600 truncate">
            {citationResource.content || citationResource.originalText}
          </div>
        );
      
      case 'image':
        const imageResource = resource as any;
        return (
          <div className="flex items-center space-x-2">
            {imageResource.thumbnail && (
              <img 
                src={imageResource.thumbnail} 
                alt={resource.title}
                className="w-8 h-8 object-cover rounded"
              />
            )}
            <span className="text-sm text-gray-600">
              {imageResource.fileName}
            </span>
          </div>
        );
      
      case 'table':
        const tableResource = resource as any;
        return (
          <div className="text-sm text-gray-600">
            {tableResource.tableType === 'excel' ? 'Excel 형식' : 'CSS 스타일'} 표
          </div>
        );
      
      case 'formula':
        const formulaResource = resource as any;
        return (
          <div className="text-sm text-gray-600 font-mono">
            {formulaResource.latex}
          </div>
        );
      
      case 'video':
        const videoResource = resource as any;
        return (
          <div className="flex items-center space-x-2">
            {videoResource.thumbnail && (
              <img 
                src={videoResource.thumbnail} 
                alt={resource.title}
                className="w-8 h-8 object-cover rounded"
              />
            )}
            <span className="text-sm text-gray-600">
              {videoResource.duration && `${Math.floor(videoResource.duration / 60)}:${(videoResource.duration % 60).toString().padStart(2, '0')}`}
            </span>
          </div>
        );
      
      case 'audio':
        const audioResource = resource as any;
        return (
          <div className="text-sm text-gray-600">
            {audioResource.duration && `${Math.floor(audioResource.duration / 60)}:${(audioResource.duration % 60).toString().padStart(2, '0')}`}
          </div>
        );
      
      default:
        return null;
    }
  };

  if (resources.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">📂</div>
        <div className="text-lg font-medium mb-2">자료가 없습니다</div>
        <div className="text-sm">새로운 자료를 추가해보세요.</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* 헤더 */}
      <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedResources.size === resources.length && resources.length > 0}
            onChange={onSelectAll}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">
            전체 선택 ({resources.length}개)
          </span>
        </div>
        
        {selectedResources.size > 0 && (
          <div className="text-sm text-blue-600">
            {selectedResources.size}개 선택됨
          </div>
        )}
      </div>

      {/* 자료 목록 */}
      <div className="space-y-1">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className={`flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
              selectedResources.has(resource.id) ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
            }`}
          >
            {/* 체크박스 */}
            <input
              type="checkbox"
              checked={selectedResources.has(resource.id)}
              onChange={() => onSelectResource(resource.id)}
              className="mr-3 rounded border-gray-300"
            />

            {/* 자료 아이콘 */}
            <div className="mr-3 text-2xl">
              {getResourceIcon(resource.type)}
            </div>

            {/* 자료 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium text-gray-900 truncate">
                  {resource.title}
                </h3>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {getResourceTypeLabel(resource.type)}
                </span>
              </div>
              
              {resource.description && (
                <p className="text-sm text-gray-600 mb-2 truncate">
                  {resource.description}
                </p>
              )}
              
              {renderResourcePreview(resource)}
              
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>생성: {formatDate(resource.createdAt)}</span>
                {resource.source && (
                  <span>출처: {resource.source}</span>
                )}
                {resource.tags && resource.tags.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <span>태그:</span>
                    {resource.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {resource.tags.length > 2 && (
                      <span>+{resource.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onPreviewResource(resource)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                title="미리보기"
              >
                👁️
              </button>
              <button
                onClick={() => onEditResource(resource)}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                title="수정"
              >
                ✏️
              </button>
              <button
                onClick={() => {
                  if (confirm(`"${resource.title}" 자료를 삭제하시겠습니까?`)) {
                    onDeleteResource(resource.id);
                  }
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                title="삭제"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceList;