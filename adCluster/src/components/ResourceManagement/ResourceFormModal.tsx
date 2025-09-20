import React, { useState, useEffect } from 'react';
import { Resource, ResourceType, ResourceFolder } from '../../types/ResourceTypes';

interface ResourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  resourceType: ResourceType;
  folders: ResourceFolder[];
  selectedFolder: string;
  editingResource?: Resource;
}

const ResourceFormModal: React.FC<ResourceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  resourceType,
  folders,
  selectedFolder,
  editingResource
}) => {
  const [formData, setFormData] = useState<any>({
    type: resourceType,
    title: '',
    description: '',
    folderId: selectedFolder,
    source: '',
    content: '',
    url: '',
    filePath: '',
    formula: '',
    tableData: [],
    tableHeaders: []
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    if (editingResource) {
      setFormData({
        type: editingResource.type,
        title: editingResource.title,
        description: editingResource.description || '',
        folderId: editingResource.folderId,
        source: editingResource.source || '',
        content: (editingResource as any).content || '',
        url: (editingResource as any).url || '',
        filePath: (editingResource as any).filePath || '',
        formula: (editingResource as any).formula || '',
        tableData: (editingResource as any).tableData || [],
        tableHeaders: (editingResource as any).tableHeaders || []
      });
    } else {
      setFormData({
        type: resourceType,
        title: '',
        description: '',
        folderId: selectedFolder,
        source: '',
        content: '',
        url: '',
        filePath: '',
        formula: '',
        tableData: [],
        tableHeaders: []
      });
    }
  }, [editingResource, resourceType, selectedFolder]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // 이미지 미리보기
      if (resourceType === 'image' && selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = { ...formData };
    
    // 파일이 있는 경우 파일 경로 설정 (실제로는 파일 업로드 로직 필요)
    if (file) {
      submitData.filePath = `/uploads/${resourceType}/${file.name}`;
    }
    
    onSubmit(submitData);
    onClose();
  };

  const renderFormFields = () => {
    switch (resourceType) {
      case 'citation':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                인용 내용 *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
                placeholder="인용할 내용을 입력하세요"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                출처 정보
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="출처를 입력하세요"
              />
            </div>
          </>
        );

      case 'image':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이미지 파일 *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!editingResource}
              />
              {preview && (
                <div className="mt-2">
                  <img src={preview} alt="미리보기" className="max-w-full h-32 object-contain border rounded" />
                </div>
              )}
            </div>
          </>
        );

      case 'table':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                표 유형
              </label>
              <select
                value={formData.url || 'excel'}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="excel">Excel 형식</option>
                <option value="css">CSS 스타일</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                표 데이터 (JSON 형식)
              </label>
              <textarea
                value={JSON.stringify(formData.tableData, null, 2)}
                onChange={(e) => {
                  try {
                    const data = JSON.parse(e.target.value);
                    setFormData({ ...formData, tableData: data });
                  } catch (error) {
                    // JSON 파싱 오류 무시
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder='[{"열1": "값1", "열2": "값2"}]'
              />
            </div>
          </>
        );

      case 'formula':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LaTeX 수식 *
              </label>
              <textarea
                value={formData.formula}
                onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
                placeholder="LaTeX 수식을 입력하세요 (예: E = mc^2)"
              />
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-600">
                미리보기: {formData.formula && `$${formData.formula}$`}
              </div>
            </div>
          </>
        );

      case 'video':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                동영상 파일 *
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!editingResource}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                동영상 URL (선택사항)
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </>
        );

      case 'audio':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                음성 파일 *
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!editingResource}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const resourceTypeNames = {
    citation: '인용/발취',
    image: '이미지',
    table: '표',
    formula: '수식',
    video: '동영상',
    audio: '음성'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editingResource ? '자료 수정' : '새 자료 추가'} - {resourceTypeNames[resourceType]}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              폴더 선택 *
            </label>
            <select
              value={formData.folderId}
              onChange={(e) => setFormData({ ...formData, folderId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="설명을 입력하세요"
            />
          </div>

          {renderFormFields()}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingResource ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceFormModal;