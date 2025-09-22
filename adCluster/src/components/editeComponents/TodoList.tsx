import React, { useState, useEffect } from 'react';
import { getUserLoginCollection } from '../../services/userLoginCollection';

interface TodoItemData {
  id: string;
  text: string;
  time: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low'; // Keep priority field
  completedAt?: string; // Add completion time field
}

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api`;

const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<TodoItemData[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium'); // Keep priority state
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active'); // Add tab state

  // 인증된 요청을 위한 헤더 생성 (향상된 버전)
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('인증 토큰이 없습니다.');
      return {
        'Content-Type': 'application/json',
        'Authorization': ''
      };
    }
    
    // 토큰 만료 시간 확인
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      const expTime = payload.exp * 1000; // 초를 밀리초로 변환
      
      if (Date.now() >= expTime) {
        console.error('토큰이 만료되었습니다.');
        localStorage.removeItem('authToken');
        return {
          'Content-Type': 'application/json',
          'Authorization': ''
        };
      }
    } catch (e) {
      console.error('토큰 디코딩 오류:', e);
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
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
      const headers = getAuthHeaders();
      
      // If no valid token, don't make the request
      if (!headers.Authorization) {
        console.error('유효한 인증 토큰이 없습니다. 로그인 페이지로 이동합니다.');
        // In a real app, you would redirect to login page
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/todos/`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data.map((todo: any) => ({
          id: todo.id,
          text: todo.text,
          time: new Date(todo.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }),
          completed: todo.completed,
          priority: todo.priority || 'medium', // Default to medium priority
          completedAt: todo.completed_at ? new Date(todo.completed_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }) : undefined
        })));
      } else if (response.status === 401) {
        console.error('인증이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('authToken');
        // In a real app, you would redirect to login page
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
      const headers = getAuthHeaders();
      
      // If no valid token, don't make the request
      if (!headers.Authorization) {
        console.error('유효한 인증 토큰이 없습니다. 로그인 페이지로 이동합니다.');
        // In a real app, you would redirect to login page
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/todos/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: newTaskText.trim(),
          completed: false,
          priority: newTaskPriority // Include priority in the request
        }),
      });

      if (response.ok) {
        const newTodo = await response.json();
        setTasks(prevTasks => [...prevTasks, {
          id: newTodo.id,
          text: newTodo.text,
          time: new Date(newTodo.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }),
          completed: newTodo.completed,
          priority: newTodo.priority || newTaskPriority // Include priority in the task
        }]);
        setNewTaskText('');
        setNewTaskPriority('medium'); // Reset to default priority
      } else if (response.status === 401) {
        console.error('인증이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('authToken');
        // In a real app, you would redirect to login page
      }
    } catch (error) {
      console.error('연구 활동 추가 중 오류 발생:', error);
    }
  };

  const handleDeleteCompleted = async () => {
    if (!window.confirm("완료된 모든 항목을 삭제하시겠습니까?")) return;
    
    const completedTasks = tasks.filter(task => task.completed);
    
    try {
      const headers = getAuthHeaders();
      
      // If no valid token, don't make the request
      if (!headers.Authorization) {
        console.error('유효한 인증 토큰이 없습니다. 로그인 페이지로 이동합니다.');
        // In a real app, you would redirect to login page
        return;
      }
      
      await Promise.all(
        completedTasks.map(task => 
          fetch(`${API_BASE_URL}/todos/${task.id}/`, {
            method: 'DELETE',
            headers
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
      const headers = getAuthHeaders();
      
      // If no valid token, don't make the request
      if (!headers.Authorization) {
        console.error('유효한 인증 토큰이 없습니다. 로그인 페이지로 이동합니다.');
        // In a real app, you would redirect to login page
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/todos/${taskId}/`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          text: task.text,
          completed: !task.completed,
          priority: task.priority, // Include priority in the update
          completed_at: !task.completed ? new Date().toISOString() : null // Set completion time when marking as completed
        }),
      });

      if (response.ok) {
        setTasks(tasks.map(task => 
          task.id === taskId ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }) : undefined
          } : task
        ));
      } else if (response.status === 401) {
        console.error('인증이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('authToken');
        // In a real app, you would redirect to login page
      }
    } catch (error) {
      console.error('연구 활동 상태 변경 중 오류 발생:', error);
    }
  };

  // Get priority display text and color
  const getPriorityDisplay = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return { text: '긴급', color: '#ef4444' }; // red
      case 'medium':
        return { text: '중요', color: '#f59e0b' }; // amber
      case 'low':
        return { text: '일반', color: '#3b82f6' }; // blue
      default:
        return { text: '중요', color: '#f59e0b' };
    }
  };

  // Sort completed tasks by completion time (newest first)
  const sortedCompletedTasks = [...tasks].sort((a, b) => {
    if (!a.completedAt || !b.completedAt) return 0;
    return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
  });

  // Sort active tasks by priority (high first, then medium, then low)
  const sortedActiveTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Filter tasks based on active tab
  const filteredTasks = activeTab === 'active' 
    ? sortedActiveTasks.filter(task => !task.completed)
    : sortedCompletedTasks.filter(task => task.completed);

  const incompleteTasks = tasks.filter(task => !task.completed).length;
  const completedTasks = tasks.filter(task => task.completed).length;

  return (
    <div className="todo-panel" style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className="todo-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          연구 활동 목록 ({loading ? '로딩중...' : activeTab === 'active' ? `${incompleteTasks}개 남음` : `${completedTasks}개 완료`})
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

      {/* 탭 섹션 */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            borderRadius: '4px',
            border: '1px solid #d1d5db',
            backgroundColor: activeTab === 'active' ? '#3b82f6' : 'white',
            color: activeTab === 'active' ? 'white' : '#374151',
            cursor: 'pointer'
          }}
        >
          진행중 ({incompleteTasks})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            borderRadius: '4px',
            border: '1px solid #d1d5db',
            backgroundColor: activeTab === 'completed' ? '#3b82f6' : 'white',
            color: activeTab === 'completed' ? 'white' : '#374151',
            cursor: 'pointer'
          }}
        >
          완료됨 ({completedTasks})
        </button>
      </div>

      <section className="todo-list" style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', marginTop: '20px' }}>연구 활동 목록을 불러오는 중...</p>
        ) : filteredTasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', marginTop: '20px' }}>
            {tasks.length === 0 ? '연구 활동이 없습니다' : activeTab === 'active' ? '진행중인 연구 활동이 없습니다' : '완료된 연구 활동이 없습니다'}
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
              {activeTab === 'active' ? (
                <input 
                  type="checkbox" 
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id)}
                  disabled={loading}
                  style={{ marginRight: '8px', marginTop: '2px' }}
                />
              ) : (
                <div style={{ width: '16px', marginRight: '8px', marginTop: '2px' }}>
                  <span style={{ color: '#10b981' }}>✓</span>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    textAlign: 'left',
                    flex: 1
                  }}>
                    {task.text}
                  </p>
                  {/* Priority indicator */}
                  <span style={{
                    fontSize: '11px',
                    padding: '1px 4px',
                    borderRadius: '4px',
                    backgroundColor: getPriorityDisplay(task.priority).color,
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {getPriorityDisplay(task.priority).text}
                  </span>
                </div>
                <p style={{ 
                  margin: 0, 
                  fontSize: '12px', 
                  color: '#6b7280',
                  textAlign: 'left'
                }}>
                  {activeTab === 'active' ? task.time : `완료: ${task.completedAt || task.time}`}
                </p>
              </div>
            </div>
          ))
        )}
      </section>

      <form onSubmit={handleAddTask} style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="새 연구 활동 추가..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            minWidth: '150px',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: loading ? '#f1f5f9' : 'white'
          }}
        />
        <select
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value as 'high' | 'medium' | 'low')}
          disabled={loading}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: loading ? '#f1f5f9' : 'white'
          }}
        >
          <option value="high">긴급</option>
          <option value="medium">중요</option>
          <option value="low">일반</option>
        </select>
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