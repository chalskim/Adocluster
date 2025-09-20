import React from 'react';
import { Resource } from '../../types/ResourceTypes';

interface ResourcePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
}

const ResourcePreviewModal: React.FC<ResourcePreviewModalProps> = ({
  isOpen,
  onClose,
  resource
}) => {
  if (!isOpen || !resource) return null;

  const renderPreviewContent = () => {
    switch (resource.type) {
      case 'citation':
        const citationResource = resource as any;
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="text-lg leading-relaxed">
                "{citationResource.content || citationResource.originalText}"
              </div>
            </div>
            {citationResource.documentInfo && (
              <div className="text-sm text-gray-600">
                <strong>문서 정보:</strong> {citationResource.documentInfo}
              </div>
            )}
            {citationResource.pageNumber && (
              <div className="text-sm text-gray-600">
                <strong>페이지:</strong> {citationResource.pageNumber}
              </div>
            )}
            {citationResource.documentSource && (
              <div className="text-sm text-gray-600">
                <strong>원본 출처:</strong> {citationResource.documentSource}
              </div>
            )}
          </div>
        );

      case 'image':
        const imageResource = resource as any;
        return (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={imageResource.url}
                alt={resource.title}
                className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div><strong>파일명:</strong> {imageResource.fileName}</div>
              <div><strong>파일 크기:</strong> {(imageResource.fileSize / 1024).toFixed(1)} KB</div>
              {imageResource.width && imageResource.height && (
                <>
                  <div><strong>가로:</strong> {imageResource.width}px</div>
                  <div><strong>세로:</strong> {imageResource.height}px</div>
                </>
              )}
            </div>
          </div>
        );

      case 'table':
        const tableResource = resource as any;
        return (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-2">
              <strong>표 유형:</strong> {tableResource.tableType === 'excel' ? 'Excel 형식' : 'CSS 스타일'}
            </div>
            {tableResource.data && tableResource.data.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  {tableResource.headers && (
                    <thead className="bg-gray-50">
                      <tr>
                        {tableResource.headers.map((header: string, index: number) => (
                          <th key={index} className="px-4 py-2 border border-gray-300 text-left font-medium">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {tableResource.data.map((row: any[], rowIndex: number) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {row.map((cell: any, cellIndex: number) => (
                          <td key={cellIndex} className="px-4 py-2 border border-gray-300">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'formula':
        const formulaResource = resource as any;
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="text-2xl font-mono mb-4">
                {formulaResource.latex}
              </div>
              <div className="text-sm text-gray-600">
                LaTeX 수식 미리보기 (실제 렌더링은 MathJax/KaTeX 필요)
              </div>
            </div>
            {formulaResource.variables && formulaResource.variables.length > 0 && (
              <div className="text-sm text-gray-600">
                <strong>사용된 변수:</strong> {formulaResource.variables.join(', ')}
              </div>
            )}
            {formulaResource.category && (
              <div className="text-sm text-gray-600">
                <strong>카테고리:</strong> {formulaResource.category}
              </div>
            )}
          </div>
        );

      case 'video':
        const videoResource = resource as any;
        return (
          <div className="space-y-4">
            <div className="flex justify-center">
              <video
                controls
                className="max-w-full max-h-96 rounded-lg shadow-lg"
                poster={videoResource.thumbnail}
              >
                <source src={videoResource.url} type={videoResource.mimeType} />
                브라우저가 비디오를 지원하지 않습니다.
              </video>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div><strong>파일명:</strong> {videoResource.fileName}</div>
              <div><strong>파일 크기:</strong> {(videoResource.fileSize / 1024 / 1024).toFixed(1)} MB</div>
              {videoResource.duration && (
                <div><strong>재생 시간:</strong> {Math.floor(videoResource.duration / 60)}:{(videoResource.duration % 60).toString().padStart(2, '0')}</div>
              )}
              {videoResource.resolution && (
                <div><strong>해상도:</strong> {videoResource.resolution}</div>
              )}
            </div>
            {videoResource.transcript && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">자동 생성 자막:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {videoResource.transcript}
                </div>
              </div>
            )}
            {videoResource.summary && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">AI 요약:</h4>
                <div className="bg-blue-50 p-3 rounded text-sm">
                  {videoResource.summary}
                </div>
              </div>
            )}
          </div>
        );

      case 'audio':
        const audioResource = resource as any;
        return (
          <div className="space-y-4">
            <div className="flex justify-center">
              <audio controls className="w-full max-w-md">
                <source src={audioResource.url} type={audioResource.mimeType} />
                브라우저가 오디오를 지원하지 않습니다.
              </audio>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div><strong>파일명:</strong> {audioResource.fileName}</div>
              <div><strong>파일 크기:</strong> {(audioResource.fileSize / 1024 / 1024).toFixed(1)} MB</div>
              {audioResource.duration && (
                <div><strong>재생 시간:</strong> {Math.floor(audioResource.duration / 60)}:{(audioResource.duration % 60).toString().padStart(2, '0')}</div>
              )}
            </div>
            {audioResource.waveform && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">파형:</h4>
                <div className="bg-gray-100 p-4 rounded flex items-end justify-center space-x-1" style={{ height: '100px' }}>
                  {audioResource.waveform.slice(0, 50).map((value: number, index: number) => (
                    <div
                      key={index}
                      className="bg-blue-500 w-1"
                      style={{ height: `${Math.max(2, value * 80)}px` }}
                    />
                  ))}
                </div>
              </div>
            )}
            {audioResource.transcript && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">자동 생성 텍스트:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {audioResource.transcript}
                </div>
              </div>
            )}
            {audioResource.summary && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">AI 요약:</h4>
                <div className="bg-blue-50 p-3 rounded text-sm">
                  {audioResource.summary}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            미리보기를 지원하지 않는 자료 유형입니다.
          </div>
        );
    }
  };

  const getResourceTypeLabel = (type: string) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">{resource.title}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                {getResourceTypeLabel(resource.type)}
              </span>
              {resource.source && (
                <span className="text-sm text-gray-500">
                  출처: {resource.source}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {resource.description && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">설명</h3>
            <p className="text-gray-700">{resource.description}</p>
          </div>
        )}

        <div className="mb-6">
          {renderPreviewContent()}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
          <div>
            생성일: {new Date(resource.createdAt).toLocaleString('ko-KR')}
          </div>
          <div>
            수정일: {new Date(resource.updatedAt).toLocaleString('ko-KR')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcePreviewModal;