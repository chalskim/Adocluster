import React, { useState } from 'react';
import { ResourceFolder } from '../../types/ResourceTypes';

interface ResourceFolderTreeProps {
  folders: ResourceFolder[];
  selectedFolder: string;
  expandedFolders: Set<string>;
  onSelectFolder: (folderId: string) => void;
  onExpandFolder: (folderId: string) => void;
  onCreateFolder: (parentId: string, name: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

const ResourceFolderTree: React.FC<ResourceFolderTreeProps> = ({
  folders,
  selectedFolder,
  expandedFolders,
  onSelectFolder,
  onExpandFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder
}) => {
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState<string | null>(null);

  // 폴더 트리 구조 생성
  const buildFolderTree = (parentId?: string): ResourceFolder[] => {
    return folders
      .filter(folder => folder.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleCreateFolder = (parentId: string) => {
    if (newFolderName.trim()) {
      onCreateFolder(parentId, newFolderName.trim());
      setNewFolderName('');
      setCreatingFolder(null);
    }
  };

  const handleRenameFolder = (folderId: string) => {
    if (newFolderName.trim()) {
      onRenameFolder(folderId, newFolderName.trim());
      setNewFolderName('');
      setEditingFolder(null);
    }
  };

  const renderFolder = (folder: ResourceFolder, level: number = 0) => {
    const hasChildren = folders.some(f => f.parentId === folder.id);
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolder === folder.id;
    const isEditing = editingFolder === folder.id;
    const isCreating = creatingFolder === folder.id;

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center py-2 px-2 hover:bg-gray-100 cursor-pointer ${
            isSelected ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {/* 확장/축소 버튼 */}
          <button
            onClick={() => onExpandFolder(folder.id)}
            className={`mr-2 w-4 h-4 flex items-center justify-center ${
              hasChildren ? 'text-gray-500' : 'invisible'
            }`}
          >
            {hasChildren && (isExpanded ? '▼' : '▶')}
          </button>

          {/* 폴더 아이콘 */}
          <span className="mr-2 text-yellow-500">📁</span>

          {/* 폴더 이름 */}
          {isEditing ? (
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={() => handleRenameFolder(folder.id)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleRenameFolder(folder.id);
                }
                if (e.key === 'Escape') {
                  setEditingFolder(null);
                  setNewFolderName('');
                }
              }}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
              autoFocus
            />
          ) : (
            <span
              onClick={() => onSelectFolder(folder.id)}
              className="flex-1 text-sm"
            >
              {folder.name}
            </span>
          )}

          {/* 액션 버튼들 */}
          {!isEditing && (
            <div className="ml-auto flex items-center space-x-1 opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCreatingFolder(folder.id);
                  setNewFolderName('');
                }}
                className="p-1 text-gray-400 hover:text-green-600"
                title="하위 폴더 생성"
              >
                ➕
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingFolder(folder.id);
                  setNewFolderName(folder.name);
                }}
                className="p-1 text-gray-400 hover:text-blue-600"
                title="폴더 이름 변경"
              >
                ✏️
              </button>
              {folder.parentId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`"${folder.name}" 폴더를 삭제하시겠습니까?`)) {
                      onDeleteFolder(folder.id);
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="폴더 삭제"
                >
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>

        {/* 새 폴더 생성 입력 */}
        {isCreating && (
          <div
            className="flex items-center py-2 px-2 bg-gray-50"
            style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
          >
            <span className="mr-2 w-4 h-4"></span>
            <span className="mr-2 text-yellow-500">📁</span>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={() => {
                if (newFolderName.trim()) {
                  handleCreateFolder(folder.id);
                } else {
                  setCreatingFolder(null);
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder(folder.id);
                }
                if (e.key === 'Escape') {
                  setCreatingFolder(null);
                  setNewFolderName('');
                }
              }}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="폴더 이름을 입력하세요"
              autoFocus
            />
          </div>
        )}

        {/* 하위 폴더들 */}
        {isExpanded && hasChildren && (
          <div>
            {buildFolderTree(folder.id).map(childFolder =>
              renderFolder(childFolder, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const rootFolders = buildFolderTree();

  return (
    <div className="p-2">
      <div className="mb-2 text-sm font-medium text-gray-700">폴더</div>
      <div className="space-y-1 group">
        {rootFolders.map(folder => renderFolder(folder))}
      </div>
    </div>
  );
};

export default ResourceFolderTree;