import React, { useState } from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteType: 'source' | 'document' | 'all') => void;
  itemName: string;
  itemType: 'document' | 'reference' | 'project';
  hasReferences?: boolean;
  hasDocuments?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
  hasReferences = false,
  hasDocuments = false
}) => {
  const [deleteType, setDeleteType] = useState<'source' | 'document' | 'all'>('all');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(deleteType);
    onClose();
  };

  const getDeleteTypeDescription = () => {
    switch (deleteType) {
      case 'source':
        return '출처 정보만 삭제되며, 문서 파일은 유지됩니다.';
      case 'document':
        return '문서 파일만 삭제되며, 출처 정보는 유지됩니다.';
      case 'all':
        return '출처 정보와 문서 파일이 모두 삭제됩니다.';
      default:
        return '';
    }
  };

  const getWarningMessage = () => {
    switch (deleteType) {
      case 'source':
        return '출처 정보가 삭제되면 참고문헌 목록에서 제거되며, 관련 인용 정보도 함께 삭제됩니다.';
      case 'document':
        return '문서 파일이 삭제되면 복구할 수 없습니다. 출처 정보는 유지되지만 원본 파일에 접근할 수 없게 됩니다.';
      case 'all':
        return '모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.';
      default:
        return '';
    }
  };

  const showDeleteOptions = itemType === 'document' && hasReferences && hasDocuments;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">삭제 확인</h2>
              <p className="text-sm text-gray-600 mt-1">
                "{itemName}"을(를) 삭제하시겠습니까?
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {showDeleteOptions ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-700 mb-4">
                삭제할 항목을 선택해주세요:
              </p>

              {/* Delete Options */}
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteType"
                    value="source"
                    checked={deleteType === 'source'}
                    onChange={(e) => setDeleteType(e.target.value as 'source')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-bookmark text-blue-600"></i>
                      <span className="font-medium text-gray-900">출처 정보만 삭제</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      참고문헌 정보만 제거하고 문서 파일은 유지
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteType"
                    value="document"
                    checked={deleteType === 'document'}
                    onChange={(e) => setDeleteType(e.target.value as 'document')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-file-alt text-green-600"></i>
                      <span className="font-medium text-gray-900">문서 파일만 삭제</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      파일만 제거하고 출처 정보는 유지
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteType"
                    value="all"
                    checked={deleteType === 'all'}
                    onChange={(e) => setDeleteType(e.target.value as 'all')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-trash text-red-600"></i>
                      <span className="font-medium text-gray-900">전체 삭제</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      출처 정보와 문서 파일 모두 제거
                    </p>
                  </div>
                </label>
              </div>

              {/* Description */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <i className="fas fa-info-circle mr-2"></i>
                  {getDeleteTypeDescription()}
                </p>
              </div>

              {/* Warning */}
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {getWarningMessage()}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                이 작업은 되돌릴 수 없습니다. 정말로 삭제하시겠습니까?
              </p>
              
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  삭제된 데이터는 복구할 수 없습니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <i className="fas fa-trash mr-2"></i>
            {showDeleteOptions ? (
              deleteType === 'source' ? '출처만 삭제' :
              deleteType === 'document' ? '문서만 삭제' : '전체 삭제'
            ) : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;