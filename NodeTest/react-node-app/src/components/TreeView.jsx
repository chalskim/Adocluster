import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TreeNode from './TreeNode';
import { treeNodeAPI } from '../services/api';
import './TreeView.css';

const TreeView = () => {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddRootForm, setShowAddRootForm] = useState(false);
  const [newRootName, setNewRootName] = useState('');
  const [folderView, setFolderView] = useState(false);

  // 트리 데이터 로드
  const loadTreeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await treeNodeAPI.getAll();
      setTreeData(data);
    } catch (err) {
      setError('트리 데이터를 불러오는데 실패했습니다.');
      console.error('트리 데이터 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTreeData();
  }, []);

  // 노드 추가
  const handleAddNode = async (nodeData) => {
    try {
      await treeNodeAPI.create(nodeData);
      await loadTreeData(); // 트리 데이터 새로고침
    } catch (err) {
      setError('노드 추가에 실패했습니다.');
      console.error('노드 추가 오류:', err);
    }
  };

  // 노드 수정
  const handleEditNode = async (id, nodeData) => {
    try {
      await treeNodeAPI.update(id, nodeData);
      await loadTreeData(); // 트리 데이터 새로고침
    } catch (err) {
      setError('노드 수정에 실패했습니다.');
      console.error('노드 수정 오류:', err);
    }
  };

  // 노드 삭제
  const handleDeleteNode = async (id) => {
    try {
      await treeNodeAPI.delete(id);
      await loadTreeData(); // 트리 데이터 새로고침
    } catch (err) {
      setError('노드 삭제에 실패했습니다.');
      console.error('노드 삭제 오류:', err);
    }
  };

  // 순환 참조 검사 함수
  const isCircularReference = (draggedNodeId, targetNodeId, treeData) => {
    // 타겟 노드가 드래그된 노드의 하위에 있는지 확인
    const findNodeAndCheckDescendants = (nodes, nodeId) => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          return node;
        }
        if (node.children) {
          const found = findNodeAndCheckDescendants(node.children, nodeId);
          if (found) return found;
        }
      }
      return null;
    };

    const checkIfDescendant = (node, targetId) => {
      if (node.id === targetId) {
        return true;
      }
      if (node.children) {
        return node.children.some(child => checkIfDescendant(child, targetId));
      }
      return false;
    };

    const draggedNode = findNodeAndCheckDescendants(treeData, draggedNodeId);
    if (!draggedNode) return false;

    return checkIfDescendant(draggedNode, targetNodeId);
  };

  // 노드 이동 - 드래그된 노드를 타겟 노드의 하위로 이동
  const handleMoveNode = async (draggedNodeId, targetNodeId) => {
    try {
      // 순환 참조 검사
      if (isCircularReference(draggedNodeId, targetNodeId, treeData)) {
        setError('하위 노드를 상위 노드로 이동할 수 없습니다.');
        return;
      }

      await treeNodeAPI.move(draggedNodeId, {
        new_parent_id: targetNodeId,
        position: 0 // 항상 첫 번째 자식으로 추가
      });
      await loadTreeData(); // 트리 데이터 새로고침
    } catch (err) {
      setError('노드 이동에 실패했습니다.');
      console.error('노드 이동 오류:', err);
    }
  };

  // 노드 위치 변경 (형제 노드들 사이에서 위치 변경)
  const handleReorderNode = async (nodeId, newPosition) => {
    try {
      await treeNodeAPI.reorder(nodeId, newPosition);
      await loadTreeData(); // 트리 데이터 새로고침
    } catch (err) {
      setError('노드 위치 변경에 실패했습니다.');
      console.error('노드 위치 변경 오류:', err);
    }
  };

  // 루트 노드 추가
  const handleAddRoot = async () => {
    if (newRootName.trim()) {
      // 루트 노드의 position은 기존 루트 노드 수로 설정
      await handleAddNode({
        name: newRootName.trim(),
        parent_id: null,
        position: treeData.length
      });
      setNewRootName('');
      setShowAddRootForm(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddRoot();
    } else if (e.key === 'Escape') {
      setNewRootName('');
      setShowAddRootForm(false);
    }
  };

  if (loading) {
    return (
      <div className="tree-view">
        <div className="loading">트리 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="tree-view">
        <div className="tree-header">
          <h2>트리 노드 관리</h2>
          <div className="header-actions">
            <button
              className="add-root-button"
              onClick={() => setShowAddRootForm(true)}
            >
              + 루트 노드 추가
            </button>
            <button
              className="refresh-button"
              onClick={loadTreeData}
            >
              🔄 새로고침
            </button>
            <button
              className={`folder-view-button ${folderView ? 'active' : ''}`}
              onClick={() => setFolderView(!folderView)}
              title={folderView ? '리스트 보기로 전환' : '폴더 보기로 전환'}
            >
              {folderView ? '📋 리스트' : '📁 폴더'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)} className="close-error">
              ×
            </button>
          </div>
        )}

        {showAddRootForm && (
          <div className="add-root-form">
            <input
              type="text"
              value={newRootName}
              onChange={(e) => setNewRootName(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="루트 노드 이름"
              className="root-input"
              autoFocus
            />
            <button onClick={handleAddRoot} className="confirm-button">
              추가
            </button>
            <button 
              onClick={() => {
                setNewRootName('');
                setShowAddRootForm(false);
              }}
              className="cancel-button"
            >
              취소
            </button>
          </div>
        )}

        <div className="tree-container">
          {treeData.length === 0 ? (
            <div className="empty-tree">
              <p>트리가 비어있습니다.</p>
              <p>루트 노드를 추가해보세요!</p>
            </div>
          ) : (
            <>
              {treeData.map((node, index) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  onAdd={handleAddNode}
                  onEdit={handleEditNode}
                  onDelete={handleDeleteNode}
                  onMove={handleMoveNode}
                  onReorder={handleReorderNode}
                  level={0}
                  folderView={folderView}
                  siblings={treeData} // 루트 노드들의 형제 관계
                />
              ))}
            </>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default TreeView;