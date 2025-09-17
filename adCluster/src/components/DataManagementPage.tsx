// src/components/DataManagementPage.tsx
import React, { useState } from 'react';
import { FileNodeData } from '../data/mockData';
import FileNode from './editeComponents/FileNode';
import Icon from './editeComponents/Icon';

const DataManagementPage: React.FC = () => {
  // Sample data for the file explorer
  const [fileData, setFileData] = useState<FileNodeData[]>([
    {
      id: 'folder-docs',
      name: '문서',
      type: 'folder',
      fileType: 'description', 
      children: [
        { id: 'file-1', name: '제목 없는 문서.docx', type: 'file', fileType: 'docx' },
        { id: 'file-2', name: '초록.md', type: 'file', fileType: 'md' },
        { id: 'file-3', name: '결론.docx', type: 'file', fileType: 'docx' },
      ],
    },
    { 
      id: 'folder-images', 
      name: '그림', 
      type: 'folder', 
      fileType: 'image',
      children: [
        { id: 'image-1', name: '차트.png', type: 'file', fileType: 'image' },
        { id: 'image-2', name: '그래프.jpg', type: 'file', fileType: 'image' },
      ]
    },
    { id: 'folder-tables', name: '표', type: 'folder' , fileType: 'table_chart' },
    { id: 'data-websites', name: '웹사이트', type: 'folder', fileType: 'link' },
    { id: 'data-equations', name: '수식', type: 'folder', fileType: 'calculate' },
    { id: 'data-videos', name: '동영상', type: 'folder', fileType: 'videocam' },
    { id: 'data-audios', name: '음성', type: 'folder', fileType: 'mic' },
    { id: 'data-code', name: '코드 스니펫', type: 'folder', fileType: 'code' },
    { id: 'data-quotes', name: '인용/발췌', type: 'folder', fileType: 'format_quote' },
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [selectedNode, setSelectedNode] = useState<FileNodeData | null>(null);
  const [actionMode, setActionMode] = useState<'create' | 'rename' | 'none'>('none');
  const [itemType, setItemType] = useState<'folder' | 'file'>('file');

  // Function to add a new file or folder
  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: FileNodeData = {
      id: `item-${Date.now()}`,
      name: newItemName,
      type: itemType,
      fileType: itemType === 'folder' ? 'description' : 'docx',
      ...(itemType === 'folder' && { children: [] })
    };
    
    setFileData([...fileData, newItem]);
    resetForm();
  };

  // Function to delete selected item
  const handleDeleteItem = () => {
    if (!selectedNode) return;
    
    const deleteRecursive = (nodes: FileNodeData[]): FileNodeData[] => {
      return nodes.filter(node => {
        if (node.id === selectedNode.id) {
          return false;
        }
        if (node.children) {
          node.children = deleteRecursive(node.children);
        }
        return true;
      });
    };
    
    setFileData(deleteRecursive(fileData));
    setSelectedNode(null);
  };

  // Function to rename selected item
  const handleRenameItem = () => {
    if (!selectedNode || !newItemName.trim()) return;
    
    const renameRecursive = (nodes: FileNodeData[]): FileNodeData[] => {
      return nodes.map(node => {
        if (node.id === selectedNode.id) {
          return { ...node, name: newItemName };
        }
        if (node.children) {
          return { ...node, children: renameRecursive(node.children) };
        }
        return node;
      });
    };
    
    setFileData(renameRecursive(fileData));
    resetForm();
  };

  // Function to reset form
  const resetForm = () => {
    setNewItemName('');
    setActionMode('none');
    setItemType('file');
  };

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actionMode === 'create') {
      handleAddItem();
    } else if (actionMode === 'rename') {
      handleRenameItem();
    }
  };

  return (
    <div className="data-management-page p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">자료관리</h1>
        <div className="text-sm text-gray-500">
          총 {fileData.length}개 항목
        </div>
      </div>
      
      <div className="flex gap-6 h-full">
        {/* File Explorer Panel */}
        <div className="w-2/3 bg-white rounded-lg shadow p-4 flex flex-col">
          <div className="section-title mb-4 flex justify-between items-center">
            <span>파일 구조</span>
            <div className="text-sm text-gray-500">
              {selectedNode ? `선택됨: ${selectedNode.name}` : '항목을 선택하세요'}
            </div>
          </div>
          <div className="flex-1 overflow-auto border border-gray-200 rounded">
            <div className="file-explorer-container p-2">
              {fileData.map(node => (
                <FileNode key={node.id} node={node} />
              ))}
            </div>
          </div>
        </div>
        
        {/* Management Panel */}
        <div className="w-1/3 bg-white rounded-lg shadow p-4 flex flex-col">
          <div className="section-title mb-4">관리 도구</div>
          
          {/* Action Form */}
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">연구 활동 선택</label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setActionMode('create')}
                  className={`flex-1 py-2 px-3 text-sm rounded transition ${
                    actionMode === 'create'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  생성
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedNode) {
                      setActionMode('rename');
                      setNewItemName(selectedNode.name);
                    }
                  }}
                  disabled={!selectedNode}
                  className={`flex-1 py-2 px-3 text-sm rounded transition ${
                    actionMode === 'rename'
                      ? 'bg-yellow-500 text-white'
                      : selectedNode
                      ? 'bg-gray-100 hover:bg-gray-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  이름 변경
                </button>
              </div>
            </div>

            {actionMode !== 'none' && (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    {actionMode === 'create' ? '새 항목 이름' : '변경할 이름'}
                  </label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder={actionMode === 'create' ? '파일 또는 폴더 이름' : '새 이름 입력'}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {actionMode === 'create' && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">유형</label>
                    <div className="flex gap-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="itemType"
                          checked={itemType === 'file'}
                          onChange={() => setItemType('file')}
                          className="mr-1"
                        />
                        파일
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="itemType"
                          checked={itemType === 'folder'}
                          onChange={() => setItemType('folder')}
                          className="mr-1"
                        />
                        폴더
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                  >
                    {actionMode === 'create' ? '생성' : '변경'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                  >
                    취소
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Delete Action */}
          <div className="mb-4">
            <button
              onClick={handleDeleteItem}
              disabled={!selectedNode}
              className={`w-full py-2 px-4 rounded transition flex items-center justify-center ${
                selectedNode
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Icon name="delete" className="file-icon mr-2" />
              삭제
            </button>
          </div>

          {/* Selected Item Info */}
          {selectedNode && (
            <div className="mt-auto p-3 bg-gray-50 rounded border border-gray-200">
              <h3 className="font-medium mb-2">선택된 항목 정보</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">이름:</span> {selectedNode.name}</p>
                <p><span className="font-medium">유형:</span> {selectedNode.type === 'folder' ? '폴더' : '파일'}</p>
                {selectedNode.fileType && (
                  <p><span className="font-medium">파일 타입:</span> {selectedNode.fileType}</p>
                )}
                {selectedNode.children && (
                  <p><span className="font-medium">하위 항목:</span> {selectedNode.children.length}개</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataManagementPage;