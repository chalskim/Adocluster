import React, { useState, useEffect } from 'react';
import { getUserLoginCollection } from '../../services/userLoginCollection';

interface TodoItemData {
  id: string;
  text: string;
  time: string;
  completed: boolean;
}

const API_BASE_URL = 'http://localhost:8000/api';

const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<TodoItemData[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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

  // 서버에서 할일 목록 불러오기
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
          completed: todo.completed
        })));
      }
    } catch (error) {
      console.error('할일 목록을 불러오는 중 오류 발생:', error);
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
          completed: false
        }),
      });

      if (response.ok) {
        const newTodo = await response.json();
        setTasks(prevTasks => [...prevTasks, {
          id: newTodo.id,
          text: newTodo.text,
          time: new Date(newTodo.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }),
          completed: newTodo.completed
        }]);
        setNewTaskText('');
      }
    } catch (error) {
      console.error('할일 추가 중 오류 발생:', error);
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
      console.error('완료된 할일 삭제 중 오류 발생:', error);
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
          completed: !task.completed
        }),
      });

      if (response.ok) {
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
      }
    } catch (error) {
      console.error('할일 상태 변경 중 오류 발생:', error);
    }
  };

  const incompleteTasks = tasks.filter(task => !task.completed).length;

  return (
    <div className="todo-panel" style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className="todo-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          할일 목록 ({loading ? '로딩중...' : `${incompleteTasks}개 남음`})
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

      <section className="todo-list" style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', marginTop: '20px' }}>할일 목록을 불러오는 중...</p>
        ) : tasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', marginTop: '20px' }}>할일이 없습니다</p>
        ) : (
          tasks.map(task => (
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
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px',
                  textDecoration: task.completed ? 'line-through' : 'none'
                }}>
                  {task.text}
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '12px', 
                  color: '#6b7280',
                  marginTop: '2px'
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
          placeholder="새 할 일 추가..."
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