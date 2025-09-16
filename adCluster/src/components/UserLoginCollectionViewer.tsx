// UserLoginCollectionViewer.tsx
// KakaoTalk-style messaging component

import React, { useState, useEffect } from 'react';
import { getUserLoginCollection } from '../services/userLoginCollection';

interface UserLoginInfo {
  id: string;
  email: string;
  name: string;
  loginTime: string;
  lastActive: string;
  token: string;
  role: string;
  avatar?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: Date;
}

interface User {
  uid: string;
  uemail: string;
  uname: string;
  uavatar?: string;
  urole: string;
}

interface Project {
  prjid: string;
  title: string;
  description: string;
  visibility: string;
}

type MessageType = 'company' | 'project' | 'individual';

const UserLoginCollectionViewer: React.FC = () => {
  const [users, setUsers] = useState<UserLoginInfo[]>([]);
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '안녕하세요! 관리자입니다.',
      timestamp: new Date('2024-01-15T10:30:00'),
      sender: 'other'
    },
    {
      id: '2',
      text: '네, 안녕하세요!',
      timestamp: new Date('2024-01-15T10:31:00'),
      sender: 'me'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('company');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showUserList, setShowUserList] = useState(false);

  // API 호출 함수들
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/users?full_permission=1');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllUsers(data);
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      setAllUsers([]); // 오류 시 빈 배열로 설정
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/projects');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('프로젝트 목록 조회 실패:', error);
      setProjects([]); // 오류 시 빈 배열로 설정
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchProjects();
    if (visible) {
      const collection = getUserLoginCollection();
      setUsers(collection);
    }
  }, [visible]);

  const getHeaderTitle = () => {
    switch (messageType) {
      case 'company':
        return '회사 전체 메시지';
      case 'project':
        return selectedProject ? `${selectedProject.title} 프로젝트` : '프로젝트 선택';
      case 'individual':
        return selectedUsers.length > 0 
          ? selectedUsers.length === 1 
            ? selectedUsers[0].uname 
            : `${selectedUsers[0].uname} 외 ${selectedUsers.length - 1}명`
          : '개별 메시지';
      default:
        return '메시지';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        timestamp: new Date(),
        sender: 'me'
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!visible) {
    return (
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        <button 
          onClick={() => setVisible(true)}
          style={{ 
            width: '60px',
            height: '60px',
            backgroundColor: '#FEE500',
            border: 'none',
            borderRadius: '50%',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          💬
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 20, 
      right: 20, 
      zIndex: 1000,
      width: '350px',
      height: '500px',
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 헤더 */}
      <div style={{ 
        backgroundColor: '#FEE500',
        padding: '16px 20px',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderRadius: '20px 20px 0 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            backgroundColor: '#3C1E1E', 
            borderRadius: '50%', 
            marginRight: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>
            👤
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#3C1E1E' }}>{getHeaderTitle()}</div>
            <div style={{ fontSize: '12px', color: '#3C1E1E', opacity: 0.7 }}>온라인</div>
          </div>
        </div>
        <button
          onClick={() => setVisible(false)}
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'rgba(60, 30, 30, 0.1)',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: '#3C1E1E'
          }}
        >
          ✕
        </button>
      </div>

      {/* 메시지 타입 선택 */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => setMessageType('company')}
          style={{
            padding: '6px 12px',
            borderRadius: '16px',
            border: 'none',
            backgroundColor: messageType === 'company' ? '#FEE500' : '#ffffff',
            color: messageType === 'company' ? '#3C1E1E' : '#666666',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: messageType === 'company' ? 'bold' : 'normal'
          }}
        >
          회사 전체
        </button>
        <button
          onClick={() => setMessageType('project')}
          style={{
            padding: '6px 12px',
            borderRadius: '16px',
            border: 'none',
            backgroundColor: messageType === 'project' ? '#FEE500' : '#ffffff',
            color: messageType === 'project' ? '#3C1E1E' : '#666666',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: messageType === 'project' ? 'bold' : 'normal'
          }}
        >
          프로젝트
        </button>
        <button
          onClick={() => setMessageType('individual')}
          style={{
            padding: '6px 12px',
            borderRadius: '16px',
            border: 'none',
            backgroundColor: messageType === 'individual' ? '#FEE500' : '#ffffff',
            color: messageType === 'individual' ? '#3C1E1E' : '#666666',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: messageType === 'individual' ? 'bold' : 'normal'
          }}
        >
          개별
        </button>
      </div>

      {/* 프로젝트/사용자 선택 영역 */}
      {messageType === 'project' && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e9ecef'
        }}>
          <select
            value={selectedProject?.prjid || ''}
            onChange={(e) => {
              const project = projects.find(p => p.prjid === e.target.value);
              setSelectedProject(project || null);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="">프로젝트를 선택하세요</option>
            {projects.map(project => (
              <option key={project.prjid} value={project.prjid}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {messageType === 'individual' && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e9ecef'
        }}>
          <button
            onClick={() => setShowUserList(!showUserList)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              fontSize: '14px',
              textAlign: 'left'
            }}
          >
            {selectedUsers.length > 0 
              ? `${selectedUsers.length}명 선택됨` 
              : '사용자를 선택하세요'}
          </button>
          
          {showUserList && (
            <div style={{
              marginTop: '8px',
              maxHeight: '150px',
              overflowY: 'auto',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              backgroundColor: '#ffffff'
            }}>
              {allUsers.map(user => (
                <div
                  key={user.uid}
                  onClick={() => {
                    const isSelected = selectedUsers.some(u => u.uid === user.uid);
                    if (isSelected) {
                      setSelectedUsers(selectedUsers.filter(u => u.uid !== user.uid));
                    } else {
                      setSelectedUsers([...selectedUsers, user]);
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: selectedUsers.some(u => u.uid === user.uid) ? '#FEE500' : 'transparent',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '14px'
                  }}
                >
                  {user.uname} ({user.uemail})
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div style={{ 
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        backgroundColor: '#f8f9fa'
      }}>
        {messages.map((message) => (
          <div key={message.id} style={{
            display: 'flex',
            justifyContent: message.sender === 'me' ? 'flex-end' : 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: message.sender === 'me' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              backgroundColor: message.sender === 'me' ? '#FEE500' : '#ffffff',
              color: message.sender === 'me' ? '#3C1E1E' : '#333333',
              fontSize: '14px',
              lineHeight: '1.4',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              wordBreak: 'break-word'
            }}>
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div style={{ 
        padding: '16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e9ecef',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #e9ecef',
            borderRadius: '20px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: '#f8f9fa'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: newMessage.trim() ? '#FEE500' : '#e9ecef',
            border: 'none',
            borderRadius: '50%',
            cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            transition: 'all 0.2s ease'
          }}
        >
          📤
        </button>
      </div>
    </div>
  );
};

export default UserLoginCollectionViewer;