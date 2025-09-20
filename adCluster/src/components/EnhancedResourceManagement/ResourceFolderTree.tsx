import React from 'react';

interface Folder {
  id: string;
  name: string;
  type: 'folder';
  parentId?: string;
  children?: Folder[];
}

interface ResourceFolderTreeProps {
  folders: Folder[];
  onSelectFolder: (folderId: string) => void;
  selectedFolder: string | null;
}

const ResourceFolderTree: React.FC<ResourceFolderTreeProps> = ({ 
  folders, 
  onSelectFolder, 
  selectedFolder 
}) => {
  return (
    <div className="p-2">
      <div 
        className={`p-3 rounded-lg cursor-pointer mb-1 flex items-center ${
          selectedFolder === null 
            ? 'bg-blue-100 text-blue-800' 
            : 'hover:bg-gray-100'
        }`}
        onClick={() => onSelectFolder('')}
      >
        <i className="fas fa-folder mr-2 text-yellow-500"></i>
        <span>전체 자료</span>
      </div>
      
      {folders.map(folder => (
        <div 
          key={folder.id}
          className={`p-3 rounded-lg cursor-pointer mb-1 flex items-center ${
            selectedFolder === folder.id 
              ? 'bg-blue-100 text-blue-800' 
              : 'hover:bg-gray-100'
          }`}
          onClick={() => onSelectFolder(folder.id)}
        >
          <i className="fas fa-folder mr-2 text-yellow-500"></i>
          <span>{folder.name}</span>
        </div>
      ))}
      
      <div className="mt-4 p-3">
        <button className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-md text-sm flex items-center justify-center">
          <i className="fas fa-plus mr-2"></i>
          새 폴더 추가
        </button>
      </div>
    </div>
  );
};

export default ResourceFolderTree;