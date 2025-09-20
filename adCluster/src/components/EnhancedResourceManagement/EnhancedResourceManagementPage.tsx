import React, { useState, useEffect } from 'react';
import ResourceFolderTree from './ResourceFolderTree';
import ResourceList from './ResourceList';
import ResourceFormModal from './ResourceFormModal';
import ResourcePreviewModal from './ResourcePreviewModal';
import { fetchResources, createResource, updateResource, deleteResource, downloadResource } from '../../services/resourceService';

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

interface Folder {
  id: string;
  name: string;
  type: 'folder';
  parentId?: string;
  children?: Folder[];
}

const EnhancedResourceManagementPage: React.FC = () => {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load resources and folders on component mount
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      const data = await fetchResources();
      setResources(data);
      // Create folder structure from resources
      createFolderStructure(data);
    } catch (err) {
      setError('자료를 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const createFolderStructure = (resources: ResourceItem[]) => {
    // Create a basic folder structure for demonstration
    const defaultFolders: Folder[] = [
      { id: 'images', name: '이미지', type: 'folder' },
      { id: 'tables', name: '표(엑셀, CSV)', type: 'folder' },
      { id: 'formulas', name: '수식', type: 'folder' },
      { id: 'videos', name: '동영상', type: 'folder' },
      { id: 'audio', name: '음성', type: 'folder' }
    ];
    setFolders(defaultFolders);
  };

  const handleCreateResource = async (resourceData: Omit<ResourceItem, 'id' | 'itemCreated' | 'itemUpdated'>) => {
    try {
      const newResource = await createResource(resourceData);
      setResources([...resources, newResource]);
      setIsFormModalOpen(false);
      setEditingResource(null);
    } catch (err) {
      setError('자료를 생성하는 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleUpdateResource = async (id: string, resourceData: Partial<ResourceItem>) => {
    try {
      const updatedResource = await updateResource(id, resourceData);
      setResources(resources.map(res => res.id === id ? updatedResource : res));
      setIsFormModalOpen(false);
      setEditingResource(null);
    } catch (err) {
      setError('자료를 수정하는 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (window.confirm('정말로 이 자료를 삭제하시겠습니까?')) {
      try {
        await deleteResource(id);
        setResources(resources.filter(res => res.id !== id));
      } catch (err) {
        setError('자료를 삭제하는 중 오류가 발생했습니다.');
        console.error(err);
      }
    }
  };

  const handleDownloadResource = async (id: string) => {
    try {
      await downloadResource(id);
    } catch (err) {
      setError('자료를 다운로드하는 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolder(folderId);
  };

  const handleResourceSelect = (resource: ResourceItem) => {
    setSelectedResource(resource);
  };

  const handleEditResource = (resource: ResourceItem) => {
    setEditingResource(resource);
    setIsFormModalOpen(true);
  };

  const handlePreviewResource = (resource: ResourceItem) => {
    setSelectedResource(resource);
    setIsPreviewModalOpen(true);
  };

  const filteredResources = resources.filter(resource => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        resource.itemTitle.toLowerCase().includes(query) ||
        (resource.itemAuthor && resource.itemAuthor.toLowerCase().includes(query)) ||
        (resource.itemKeywords && resource.itemKeywords.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const folderResources = selectedFolder 
    ? filteredResources.filter(resource => {
        // Filter resources based on selected folder
        switch (selectedFolder) {
          case 'images': return resource.itemType === 'image';
          case 'tables': return resource.itemType === 'table';
          case 'formulas': return resource.itemType === 'latex';
          case 'videos': return resource.itemType === 'video';
          case 'audio': return resource.itemType === 'audio';
          default: return true;
        }
      })
    : filteredResources;

  return (
    <div className="flex h-full bg-gray-50">
      {/* 사이드바 - 폴더 트리 */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">자료 폴더</h2>
        </div>
        <ResourceFolderTree 
          folders={folders} 
          onSelectFolder={handleFolderSelect} 
          selectedFolder={selectedFolder}
        />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 툴바 */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                자료 관리
              </h1>
              {selectedFolder && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm w-fit">
                  {folders.find(f => f.id === selectedFolder)?.name}
                </span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <input
                type="text"
                placeholder="자료 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={() => {
                  setEditingResource(null);
                  setIsFormModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center text-sm whitespace-nowrap"
              >
                자료 추가
              </button>
            </div>
          </div>
        </div>

        {/* 자료 목록 */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResourceList
              resources={folderResources}
              onEdit={handleEditResource}
              onDelete={handleDeleteResource}
              onDownload={handleDownloadResource}
              onPreview={handlePreviewResource}
              onSelect={handleResourceSelect}
            />
          )}
        </div>
      </div>

      {/* 자료 생성/수정 모달 */}
      {isFormModalOpen && (
        <ResourceFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingResource(null);
          }}
          onSubmit={editingResource ? handleUpdateResource : handleCreateResource}
          resource={editingResource}
        />
      )}

      {/* 자료 미리보기 모달 */}
      {isPreviewModalOpen && selectedResource && (
        <ResourcePreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          resource={selectedResource}
        />
      )}
    </div>
  );
};

export default EnhancedResourceManagementPage;