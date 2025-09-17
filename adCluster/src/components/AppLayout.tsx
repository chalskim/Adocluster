import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import UserLoginCollectionViewer from './UserLoginCollectionViewer';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { fetchCurrentUser } from '../services/api';
import { useWebSocket } from '../contexts/WebSocketContext';

interface User {
  uid: string;
  uemail: string;
  urole: string;
  uname: string;
  uavatar: string | null;
  uisdel: boolean;
  uactive: boolean;
  ucreate_at: string;
  ulast_login: string | null;
  uupdated_at: string | null;
}

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { disconnect } = useWebSocket(); // Get disconnect function from WebSocket context
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        // 토큰이 없으면 로그인 페이지로 이동
        if (!token) {
          console.log('저장된 토큰이 없습니다. 로그인 페이지로 이동합니다.');
          setError('인증 정보가 없습니다. 로그인 페이지로 이동합니다.');
          navigate('/login');
          return;
        }
        
        // 토큰 디코딩하여 만료 시간 확인
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const payload = JSON.parse(jsonPayload);
          const expTime = payload.exp * 1000; // 초를 밀리초로 변환
          
          if (Date.now() >= expTime) {
            console.log('토큰이 만료되었습니다. 토큰을 제거하고 로그인 페이지로 이동합니다.');
            localStorage.removeItem('authToken');
            setError('인증 토큰이 만료되었습니다. 다시 로그인해주세요.');
            navigate('/login');
            return;
          }
        } catch (e) {
          console.error('토큰 디코딩 오류:', e);
          localStorage.removeItem('authToken');
          setError('인증 토큰이 유효하지 않습니다. 다시 로그인해주세요.');
          navigate('/login');
          return;
        }
        
        // 사용자 정보 가져오기 시도
        const userData = await fetchCurrentUser();
        
        // 사용자 정보가 성공적으로 로드된 경우
        if (userData) {
          setUser(userData);
          // 사용자 역할을 localStorage에 저장 (Sidebar에서 사용)
          console.log('사용자 역할:', userData.urole); // 디버깅용 로그
          localStorage.setItem('userRole', userData.urole);
          // Store the current user's name in localStorage to override any old values
          localStorage.setItem('userName', userData.uname);
          // Also dispatch a storage event to notify other components
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'userRole',
            newValue: userData.urole
          }));
          setError(null); // 성공 시 이전 오류 메시지 초기화
          console.log('사용자 정보 로드 성공:', userData.uemail);
        } else {
          // fetchCurrentUser에서 null을 반환한 경우 (토큰 문제)
          console.log('사용자 정보를 가져올 수 없습니다. 토큰을 제거하고 로그인 페이지로 이동합니다.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole'); // 역할 정보도 제거
          localStorage.removeItem('userName'); // 사용자 이름도 제거
          // Also dispatch a storage event to notify other components
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'userRole',
            newValue: null
          }));
          setError('인증 정보에 문제가 있습니다. 다시 로그인해주세요.');
          navigate('/login');
        }
      } catch (err: any) {
        console.error('사용자 정보 로딩 오류:', err);
        // 오류 메시지가 있으면 해당 메시지 표시, 없으면 기본 메시지 표시
        setError(err?.message || '사용자 정보를 불러오는데 실패했습니다.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole'); // 역할 정보도 제거
        localStorage.removeItem('userName'); // 사용자 이름도 제거
        // Also dispatch a storage event to notify other components
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'userRole',
          newValue: null
        }));
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  // 화면 크기 변화 감지를 위한 useEffect 추가
  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 1024);
    };

    // 초기 화면 크기 확인
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = () => {
    // Disconnect WebSocket connection
    disconnect();
    
    // Remove the authentication token from localStorage
    localStorage.removeItem('authToken');
    // Remove user role from localStorage
    localStorage.removeItem('userRole');
    // Remove userName from localStorage (added to fix the user name display issue)
    localStorage.removeItem('userName');
    // Dispatch a storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'userRole',
      newValue: null
    }));
    // Redirect to the login page
    navigate('/login');
  };

  const searchParams = new URLSearchParams(location.search);
  const isSimpleView = searchParams.get('view') === 'simple';
  // Check if we're on the editor page
  const isEditorPage = location.pathname === '/editor';

  if (isSimpleView || isEditorPage) {
    return (
      <div className="min-h-screen bg-white">
        <Outlet />
        <UserLoginCollectionViewer />
      </div>
    );
  }
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className={`flex-1 ${isCollapsed ? 'ml-16' : 'ml-64'} flex flex-col transition-all duration-300`}>
        {/* Header with user info and logout button */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center">
            {loading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-36"></div>
                </div>
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : user ? (
              <div className="flex items-center">
                <div className="bg-blue-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                  {user.uemail.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user.uname || user.uemail.split('@')[0]}</p>
                  <p className="text-xs text-gray-500">{user.uemail}</p>
                </div>
                {user.urole && user.urole.toLowerCase() === 'admin' && (
                  <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                    관리자
                  </span>
                )}
              </div>
            ) : (
              <div>사용자 정보 없음</div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            로그아웃
          </button>
        </header>
        {/* Main content area */}
        <div className="flex-1 p-5">
          <div className="content-area bg-white rounded-lg shadow-md p-5 min-h-[500px]">
            <Outlet />
          </div>
        </div>
      </div>
      <UserLoginCollectionViewer />
    </div>
  );
};

export default AppLayout;