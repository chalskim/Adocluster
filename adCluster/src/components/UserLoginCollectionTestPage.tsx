// UserLoginCollectionTestPage.tsx
// Test page to demonstrate user login collection functionality

import React, { useState, useEffect } from 'react';
import { 
  getUserLoginCollection, 
  clearUserLoginCollection, 
  removeUserFromLoginCollection,
  getUserLoginInfoById,
  getUserByToken
} from '../services/userLoginCollection';
import { getAuthHeaders } from '../services/api';

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

const UserLoginCollectionTestPage: React.FC = () => {
  const [users, setUsers] = useState<UserLoginInfo[]>([]);
  const [currentUser, setCurrentUser] = useState<UserLoginInfo | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    refreshUserList();
  }, []);

  const refreshUserList = () => {
    // Get current user from token
    const token = localStorage.getItem('authToken');
    if (token) {
      const currentUserFromToken = getUserByToken(token);
      setCurrentUser(currentUserFromToken || null);
    }
    
    if (showAllUsers) {
      const collection = getUserLoginCollection();
      setUsers(collection);
    } else if (token) {
      const currentUserFromToken = getUserByToken(token);
      setUsers(currentUserFromToken ? [currentUserFromToken] : []);
    } else {
      setUsers([]);
    }
  };

  const handleClearCollection = () => {
    if (window.confirm('정말 모든 로그인 정보를 삭제하시겠습니까?')) {
      clearUserLoginCollection();
      refreshUserList();
    }
  };

  const handleRemoveUser = (userId: string) => {
    if (window.confirm('정말 이 사용자를 삭제하시겠습니까?')) {
      removeUserFromLoginCollection(userId);
      refreshUserList();
    }
  };

  const handleForceLogout = (userId: string) => {
    if (window.confirm('정말 이 사용자를 강제 로그아웃 하시겠습니까?')) {
      // Remove user from login collection
      removeUserFromLoginCollection(userId);
      
      // If this is the current user, also remove the auth token
      const token = localStorage.getItem('authToken');
      if (token) {
        const userFromToken = getUserByToken(token);
        if (userFromToken && userFromToken.id === userId) {
          localStorage.removeItem('authToken');
          // Reload the page to redirect to login
          window.location.reload();
        }
      }
      
      refreshUserList();
    }
  };

  const handleViewUserDetails = (userId: string) => {
    const userDetails = getUserLoginInfoById(userId);
    if (userDetails) {
      alert(`사용자 상세 정보:\nID: ${userDetails.id}\n이름: ${userDetails.name}\n이메일: ${userDetails.email}\n역할: ${userDetails.role}\n로그인 시간: ${userDetails.loginTime}\n마지막 활동: ${userDetails.lastActive}`);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const toggleViewMode = () => {
    setShowAllUsers(!showAllUsers);
    refreshUserList();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">사용자 로그인 컬렉션 테스트</h1>
      
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <button 
          onClick={refreshUserList}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          새로고침
        </button>
        <button 
          onClick={toggleViewMode}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          {showAllUsers ? '내 정보만 보기' : '모든 사용자 보기'}
        </button>
        {showAllUsers && (
          <button 
            onClick={handleClearCollection}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            전체 삭제
          </button>
        )}
      </div>

      {users.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-500">저장된 사용자 로그인 정보가 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">이름</th>
                <th className="py-2 px-4 border-b text-left">이메일</th>
                <th className="py-2 px-4 border-b text-left">역할</th>
                <th className="py-2 px-4 border-b text-left">로그인 시간</th>
                <th className="py-2 px-4 border-b text-left">마지막 활동</th>
                <th className="py-2 px-4 border-b text-left">상태</th>
                <th className="py-2 px-4 border-b text-left">작업</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className={`hover:bg-gray-50 ${currentUser && currentUser.id === user.id ? 'bg-blue-50' : ''}`}>
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">{formatDateTime(user.loginTime)}</td>
                  <td className="py-2 px-4 border-b">{formatDateTime(user.lastActive)}</td>
                  <td className="py-2 px-4 border-b">
                    {currentUser && currentUser.id === user.id ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">현재 접속</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">접속중</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleViewUserDetails(user.id)}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                      >
                        상세
                      </button>
                      <button 
                        onClick={() => handleRemoveUser(user.id)}
                        className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                      >
                        삭제
                      </button>
                      <button 
                        onClick={() => handleForceLogout(user.id)}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        강제 로그아웃
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">사용법</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>로그인 시 사용자 정보가 자동으로 컬렉션에 저장됩니다.</li>
          <li>사용자의 마지막 활동 시간은 1분마다 자동 업데이트됩니다.</li>
          <li>7일 이상 지난 오래된 항목은 자동으로 삭제됩니다.</li>
          <li>컬렉션은 브라우저의 localStorage에 저장됩니다.</li>
          <li><strong>기본적으로 현재 접속한 사용자만 표시됩니다.</strong></li>
          <li>"모든 사용자 보기" 버튼을 클릭하면 다른 접속 중인 사용자도 확인할 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default UserLoginCollectionTestPage;