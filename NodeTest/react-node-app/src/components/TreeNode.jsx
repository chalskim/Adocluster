import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import NodeIcon from './NodeIcon';
import { treeNodeAPI } from '../services/api';
import './TreeNode.css';

const TreeNode = ({ 
  node, 
  onAdd, 
  onEdit, 
  onDelete, 
  onMove,
  onReorder,
  level = 0,
  folderView = false,
  siblings = [] // 같은 레벨의 형제 노드들
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');

  const hasChildren = node.children && node.children.length > 0;
  const isFolder = hasChildren;

  // 드래그 설정
  const [{ isDragging }, drag] = useDrag({
    type: 'TREE_NODE',
    item: { 
      id: node.id, 
      name: node.name, 
      parent_id: node.parent_id,
      level: level,
      position: node.position
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // 노드 콘텐츠 영역 드롭 설정 - 드래그된 노드를 현재 노드의 하위로 이동
  const [{ isOver: isOverContent, canDrop: canDropContent }, dropContent] = useDrop({
    accept: 'TREE_NODE',
    drop: (draggedItem, monitor) => {
      // 자기 자신에게 드롭하는 것을 방지
      if (draggedItem.id === node.id) {
        return;
      }

      // 가장 가까운 드롭 타겟에서만 처리 (이벤트 버블링 방지)
      if (!monitor.isOver({ shallow: true })) {
        return;
      }

      // 드래그된 노드를 현재 노드의 하위로 이동
      onMove(draggedItem.id, node.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  // 노드 사이에 드롭 설정 - 드래그된 노드를 현재 위치로 이동 (형제 노드로 추가)
  const [{ isOver: isOverBetween, canDrop: canDropBetween }, dropBetween] = useDrop({
    accept: 'TREE_NODE',
    drop: (draggedItem, monitor) => {
      if (draggedItem.id === node.id) {
        return;
      }

      if (!monitor.isOver({ shallow: true })) {
        return;
      }

      // 같은 부모를 가진 형제 노드로 이동
      onMove(draggedItem.id, node.parent_id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  // 노드 클래스 정의
  const nodeClasses = [
    'tree-node',
    folderView ? 'folder-view' : '',
    folderView && isFolder ? 'folder' : '',
    folderView && !isFolder ? 'file' : '',
    isDragging ? 'dragging' : '',
    isOverContent && canDropContent ? 'drop-target' : ''
  ].filter(Boolean).join(' ');

  const handleEdit = async () => {
    if (editName.trim() && editName !== node.name) {
      await onEdit(node.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleAdd = async () => {
    if (newNodeName.trim()) {
      await onAdd({
        name: newNodeName.trim(),
        parent_id: node.id,
        position: hasChildren ? node.children.length : 0
      });
      setNewNodeName('');
      setShowAddForm(false);
      setIsExpanded(true);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`"${node.name}" 노드를 삭제하시겠습니까? 하위 노드들도 함께 삭제됩니다.`)) {
      await onDelete(node.id);
    }
  };

  // 위로 이동
  const handleMoveUp = async () => {
    const currentIndex = siblings.findIndex(sibling => sibling.id === node.id);
    if (currentIndex > 0) {
      await onReorder(node.id, currentIndex - 1);
    }
  };

  // 아래로 이동
  const handleMoveDown = async () => {
    const currentIndex = siblings.findIndex(sibling => sibling.id === node.id);
    if (currentIndex < siblings.length - 1) {
      await onReorder(node.id, currentIndex + 1);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    } else if (e.key === 'Escape') {
      if (action === handleEdit) {
        setEditName(node.name);
        setIsEditing(false);
      } else if (action === handleAdd) {
        setNewNodeName('');
        setShowAddForm(false);
      }
    }
  };

  return (
    <div>
      {/* 노드 사이에 드롭 영역 */}
      <div 
        ref={dropBetween}
        className="drop-between"
        style={{
          height: '4px',
          backgroundColor: isOverBetween && canDropBetween ? '#2196f3' : 'transparent',
          margin: '2px 0',
          borderRadius: '2px',
          transition: 'all 0.2s ease'
        }}
      />
      
      <div 
        ref={drag}
        className={nodeClasses} 
        style={{ 
          marginLeft: `${level * 20}px`,
          opacity: isDragging ? 0.5 : 1,
          transition: 'all 0.2s ease'
        }}
      >
        <div 
          ref={dropContent}
          className="node-content"
          style={{
            backgroundColor: isOverContent && canDropContent ? '#e3f2fd' : 'transparent',
            border: isOverContent && canDropContent ? '2px dashed #2196f3' : '2px solid transparent',
            borderRadius: '4px',
            transition: 'all 0.2s ease'
          }}
        >
          <div className="node-info">
            {hasChildren && (
              <button
                className="expand-button"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            
            <NodeIcon 
              node={node} 
              folderView={folderView} 
              isExpanded={isExpanded} 
            />
            
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleEdit}
                onKeyDown={(e) => handleKeyPress(e, handleEdit)}
                className="edit-input"
                autoFocus
              />
            ) : (
              <span 
                className="node-name"
                onDoubleClick={() => setIsEditing(true)}
              >
                {node.name}
              </span>
            )}
          </div>

          <div className="node-actions">
            {/* 위치 조정 버튼들 */}
            <button
              className="action-button move-up"
              onClick={handleMoveUp}
              title="위로 이동"
              disabled={siblings.findIndex(s => s.id === node.id) === 0}
            >
              ↑
            </button>
            <button
              className="action-button move-down"
              onClick={handleMoveDown}
              title="아래로 이동"
              disabled={siblings.findIndex(s => s.id === node.id) === siblings.length - 1}
            >
              ↓
            </button>
            
            <button
              className="action-button add"
              onClick={() => setShowAddForm(true)}
              title="자식 노드 추가"
            >
              +
            </button>
            <button
              className="action-button edit"
              onClick={() => setIsEditing(true)}
              title="노드 수정"
            >
              ✏️
            </button>
            <button
              className="action-button delete"
              onClick={handleDelete}
              title="노드 삭제"
            >
              🗑️
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="add-form" style={{ marginLeft: '20px' }}>
            <input
              type="text"
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, handleAdd)}
              placeholder="새 노드 이름"
              className="add-input"
              autoFocus
            />
            <button onClick={handleAdd} className="confirm-button">
              추가
            </button>
            <button 
              onClick={() => {
                setNewNodeName('');
                setShowAddForm(false);
              }}
              className="cancel-button"
            >
              취소
            </button>
          </div>
        )}

        {isExpanded && hasChildren && (
          <div className="children">
            {node.children.map((child, index) => (
              <TreeNode
                key={child.id}
                node={child}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={onMove}
                onReorder={onReorder}
                level={level + 1}
                folderView={folderView}
                siblings={node.children} // 형제 노드들 전달
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TreeNode;