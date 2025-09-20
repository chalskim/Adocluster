import React, { useState, useEffect } from 'react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modifiedAt: string;
  path: string;
  parentId?: string;
}

const ResourceManagementPage: React.FC = () => {
  // 간단한 상태 관리
  const [currentPath, setCurrentPath] = useState<string>('/Downloads');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // 드래그 앤 드롭 상태
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [isUploading, setIsUploading] = useState(false);

  // 기본 다운로드 폴더 초기화
  useEffect(() => {
    initializeDownloadsFolder();
  }, []);

  const initializeDownloadsFolder = () => {
    const defaultFiles: FileItem[] = [
      {
        id: 'folder-documents',
        name: '문서',
        type: 'folder',
        modifiedAt: new Date().toISOString(),
        path: '/Downloads/문서',
        parentId: 'downloads-root'
      },
      {
        id: 'folder-images',
        name: '이미지',
        type: 'folder',
        modifiedAt: new Date().toISOString(),
        path: '/Downloads/이미지',
        parentId: 'downloads-root'
      },
      {
        id: 'folder-videos',
        name: '동영상',
        type: 'folder',
        modifiedAt: new Date().toISOString(),
        path: '/Downloads/동영상',
        parentId: 'downloads-root'
      },
      {
        id: 'folder-audio',
        name: '음성',
        type: 'folder',
        modifiedAt: new Date().toISOString(),
        path: '/Downloads/음성',
        parentId: 'downloads-root'
      }
    ];

    setFiles(defaultFiles);
  };

  // 파일 업로드 관련 함수들
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (file.size > maxSize) {
      return { isValid: false, error: '파일 크기는 50MB를 초과할 수 없습니다.' };
    }

    return { isValid: true };
  };

  const handleFileUpload = async (fileList: FileList) => {
    setIsUploading(true);
    const uploadPromises = Array.from(fileList).map(async (file) => {
      const validation = validateFile(file);
      if (!validation.isValid) {
        alert(`${file.name}: ${validation.error}`);
        return;
      }

      // 업로드 진행률 시뮬레이션
      const fileId = `${file.name}-${Date.now()}`;
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      // 실제 업로드 로직 (여기서는 시뮬레이션)
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }

      // 파일 추가
      const newFile: FileItem = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: 'file',
        size: file.size,
        modifiedAt: new Date().toISOString(),
        path: `${currentPath}/${file.name}`,
        parentId: 'downloads-root'
      };

      setFiles(prev => [...prev, newFile]);
      
      // 업로드 완료 후 진행률 제거
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }, 1000);
    });

    await Promise.all(uploadPromises);
    setIsUploading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileUpload(selectedFiles);
    }
  };

  const handleFileClick = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 필터링된 파일 목록
  const filteredFiles = files.filter(file => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return file.name.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div className="flex h-full bg-gray-50">
      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 툴바 - 반응형 */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                파일 관리자
              </h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm w-fit">
                {currentPath}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <input
                type="text"
                placeholder="파일 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer text-center text-sm whitespace-nowrap"
              >
                파일 추가
              </label>
            </div>
          </div>
        </div>

        {/* 파일 목록 - 반응형 드래그 앤 드롭 영역 */}
        <div 
          className={`flex-1 overflow-y-auto p-2 sm:p-4 transition-colors ${
            isDragOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* 업로드 진행률 표시 - 반응형 */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
              <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-2">파일 업로드 중...</h4>
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId} className="mb-2">
                  <div className="flex justify-between text-xs text-blue-700 mb-1">
                    <span className="truncate mr-2">{fileId.split('-')[0]}</span>
                    <span className="flex-shrink-0">{progress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 드래그 앤 드롭 안내 - 반응형 */}
          {isDragOver && (
            <div className="fixed inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-40 pointer-events-none">
              <div className="bg-white p-4 sm:p-8 rounded-lg shadow-lg border-2 border-dashed border-blue-400 mx-4 max-w-sm">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl mb-4">📁</div>
                  <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">
                    파일을 여기에 드롭하세요
                  </h3>
                  <p className="text-sm sm:text-base text-blue-700">
                    모든 파일 형식을 지원합니다 (최대 50MB)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 파일 목록 테이블 - 반응형 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                파일 목록 ({filteredFiles.length}개)
              </h3>
            </div>
            
            {/* 데스크톱/태블릿용 테이블 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      크기
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      수정일
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFiles.map((file) => (
                    <tr 
                      key={file.id}
                      onClick={() => handleFileClick(file.id)}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedFiles.has(file.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">
                            {file.type === 'folder' ? '📁' : '📄'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {file.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {file.path}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {file.type === 'file' ? formatFileSize(file.size) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(file.modifiedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일용 카드 레이아웃 */}
            <div className="md:hidden">
              {filteredFiles.map((file) => (
                <div 
                  key={file.id}
                  onClick={() => handleFileClick(file.id)}
                  className={`p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                    selectedFiles.has(file.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl flex-shrink-0">
                      {file.type === 'folder' ? '📁' : '📄'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {file.path}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {file.type === 'file' ? formatFileSize(file.size) : '폴더'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(file.modifiedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
              
            {filteredFiles.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="text-3xl sm:text-4xl mb-4">📂</div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  파일이 없습니다
                </h3>
                <p className="text-sm sm:text-base text-gray-500 px-4">
                  파일을 드래그하거나 "파일 추가" 버튼을 클릭하여 파일을 추가하세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceManagementPage;