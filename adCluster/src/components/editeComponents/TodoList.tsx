import React, { useState, useEffect } from 'react';
import { getUserLoginCollection } from '../../services/userLoginCollection';

interface TodoItemData {
  id: string;
  text: string;
  time: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
  progress: number; // 0-100
}

const API_BASE_URL = 'http://localhost:8000/api';

const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<TodoItemData[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState('일반');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // 인증된 요청을 위한 헤더 생성
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // Get current user ID from login collection
  const getCurrentUserId = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const collection = getUserLoginCollection();
      const currentUser = collection.find(user => user.token === token);
      return currentUser ? currentUser.id : null;
    }
    return null;
  };

  // 서버에서 연구 활동 목록 불러오기
  useEffect(() => {
    // Get current user ID
    const userId = getCurrentUserId();
    setCurrentUserId(userId);
    
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/todos/`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.map((todo: any) => ({
          id: todo.id,
          text: todo.text,
          time: new Date(todo.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }),
          completed: todo.completed,
          priority: todo.priority || 'medium',
          category: todo.category || '일반',
          progress: todo.progress || 0
        })));
      }
    } catch (error) {
      console.error('연구 활동 목록을 불러오는 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/todos/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          text: newTaskText.trim(),
          completed: false,
          priority: newTaskPriority,
          category: newTaskCategory,
          progress: 0
        }),
      });

      if (response.ok) {
        const newTodo = await response.json();
        setTasks(prevTasks => [...prevTasks, {
          id: newTodo.id,
          text: newTodo.text,
          time: new Date(newTodo.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }),
          completed: newTodo.completed,
          priority: newTodo.priority || newTaskPriority,
          category: newTodo.category || newTaskCategory,
          progress: newTodo.progress || 0
        }]);
        setNewTaskText('');
        setNewTaskPriority('medium');
        setNewTaskCategory('일반');
      }
    } catch (error) {
      console.error('연구 활동 추가 중 오류 발생:', error);
    }
  };

  const handleDeleteCompleted = async () => {
    if (!window.confirm("완료된 모든 항목을 삭제하시겠습니까?")) return;
    
    const completedTasks = tasks.filter(task => task.completed);
    
    try {
      await Promise.all(
        completedTasks.map(task => 
          fetch(`${API_BASE_URL}/todos/${task.id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          })
        )
      );
      
      const remainingTasks = tasks.filter(task => !task.completed);
      setTasks(remainingTasks);
    } catch (error) {
      console.error('완료된 연구 활동 삭제 중 오류 발생:', error);
    }
  };
  
  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const response = await fetch(`${API_BASE_URL}/todos/${taskId}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          text: task.text,
          completed: !task.completed,
          priority: task.priority,
          category: task.category,
          progress: task.progress
        }),
      });

      if (response.ok) {
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
      }
    } catch (error) {
      console.error('연구 활동 상태 변경 중 오류 발생:', error);
    }
  };

  // 필터링된 작업 목록
  const filteredTasks = tasks.filter(task => {
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    const categoryMatch = filterCategory === 'all' || task.category === filterCategory;
    return priorityMatch && categoryMatch;
  });

  // 우선순위별 색상 반환
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // 카테고리 목록 추출
  const categories = Array.from(new Set(tasks.map(task => task.category)));

  const incompleteTasks = filteredTasks.filter(task => !task.completed).length;

  return (
    <div className="todo-panel" style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className="todo-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          연구 활동 목록 ({loading ? '로딩중...' : `${incompleteTasks}개 남음`})
        </h3>
        <button 
          className="btn-icon" 
          title="완료된 항목 삭제" 
          onClick={handleDeleteCompleted}
          disabled={loading}
          style={{
            background: 'none',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            padding: '4px',
            color: loading ? '#cbd5e1' : '#64748b',
            fontSize: '14px'
          }}
        >
          🗑️
        </button>
      </header>

      {/* 필터 섹션 */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <select 
          value={filterPriority} 
          onChange={(e) => setFilterPriority(e.target.value as 'all' | 'high' | 'medium' | 'low')}
          style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d1d5db' }}
        >
          <option value="all">모든 우선순위</option>
          <option value="high">높음</option>
          <option value="medium">보통</option>
          <option value="low">낮음</option>
        </select>
        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d1d5db' }}
        >
          <option value="all">모든 카테고리</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <section className="todo-list" style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', marginTop: '20px' }}>연구 활동 목록을 불러오는 중...</p>
        ) : filteredTasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', marginTop: '20px' }}>
            {tasks.length === 0 ? '연구 활동이 없습니다' : '필터 조건에 맞는 연구 활동이 없습니다'}
          </p>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              padding: '8px 0', 
              borderBottom: '1px solid #e5e7eb',
              opacity: task.completed ? 0.6 : 1
            }}>
              <input 
                type="checkbox" 
                checked={task.completed}
                onChange={() => handleToggleTask(task.id)}
                disabled={loading}
                style={{ marginRight: '8px', marginTop: '2px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    flex: 1
                  }}>
                    {task.text}
                  </p>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '12px',
                    backgroundColor: getPriorityColor(task.priority),
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {task.priority === 'high' ? '높음' : task.priority === 'medium' ? '보통' : '낮음'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '11px',
                    padding: '1px 4px',
                    borderRadius: '4px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151'
                  }}>
                    {task.category}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    진행률: {task.progress}%
                  </span>
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${task.progress}%`,
                      height: '100%',
                      backgroundColor: getPriorityColor(task.priority),
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
                <p style={{ 
                  margin: 0, 
                  fontSize: '12px', 
                  color: '#6b7280'
                }}>
                  {task.time}
                </p>
              </div>
            </div>
          ))
        )}
      </section>

      <form onSubmit={handleAddTask} style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          placeholder="새 연구 활동 추가..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: loading ? '#f1f5f9' : 'white'
          }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: loading ? '#cbd5e1' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          추가
        </button>
      </form>
    </div>
  );
};

export default TodoList;