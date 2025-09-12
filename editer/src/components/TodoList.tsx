// src/components/TodoList.tsx
import React, { useState, useEffect } from 'react';
import type { TodoItemData } from '../data/mockData';

const TodoList = () => {
  const [tasks, setTasks] = useState<TodoItemData[]>(() => {
    const savedTasks = localStorage.getItem('todoListData');
    if (savedTasks) {
      try {
        return JSON.parse(savedTasks);
      } catch (e) {
        console.error("로컬 스토리지 데이터 파싱 실패:", e);
        return [];
      }
    }
    return [];
  });

  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    localStorage.setItem('todoListData', JSON.stringify(tasks));
  }, [tasks]);
  
  // --- [핵심 수정 1] 핸들러 함수가 React.FormEvent를 받도록 수정 ---
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 시 페이지가 새로고침되는 것을 방지
    if (!newTaskText.trim()) return;

    const newTask: TodoItemData = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      completed: false,
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    setNewTaskText('');
  };

  const handleDeleteCompleted = () => {
    if (!window.confirm("완료된 모든 항목을 삭제하시겠습니까?")) return;
    const remainingTasks = tasks.filter(task => !task.completed);
    setTasks(remainingTasks);
  };
  
  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const incompleteTasks = tasks.filter(task => !task.completed).length;

  return (
    <div className="todo-panel">
      <header className="todo-header">
        <h3>Todo List ({incompleteTasks}개 남음)</h3>
        <button className="btn-icon" title="완료된 항목 삭제" onClick={handleDeleteCompleted}>
          <span className="material-symbols-outlined">delete_sweep</span>
        </button>
      </header>

      <section className="todo-list">
        {tasks.map(task => (
          <div key={task.id} className={`todo-item ${task.completed ? 'completed' : ''}`}>
            <input 
              type="checkbox" 
              className="todo-checkbox" 
              checked={task.completed}
              onChange={() => handleToggleTask(task.id)}
            />
            <div className="todo-content">
              <p className="todo-text">{task.text}</p>
              <p className="todo-time">{task.time}</p>
            </div>
          </div>
        ))}
      </section>

      {/* --- [핵심 수정 2] footer를 form 태그로 변경하고 onSubmit 연결 --- */}
      <form className="new-todo-form" onSubmit={handleAddTask}>
        <input 
          type="text" 
          className="new-todo-input" 
          placeholder="새 할 일 추가..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
        />
        <button type="submit" className="btn-add">추가</button>
      </form>
    </div>
  );
};

export default TodoList;