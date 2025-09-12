import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getUserByToken } from '../services/userLoginCollection';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      // Check if there's a token in localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.log('ProtectedRoute - 토큰이 없습니다. 인증 실패.');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      // Check if user exists in login collection
      const userInCollection = getUserByToken(token);
      if (!userInCollection) {
        console.log('ProtectedRoute - 로그인 컬렉션에 사용자가 없습니다. 인증 실패.');
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setIsLoading(false);
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
          console.log('ProtectedRoute - 토큰이 만료되었습니다. 인증 실패.');
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        // 토큰이 유효하면 인증된 것으로 간주
        console.log('ProtectedRoute - 토큰이 유효합니다. 인증 성공.');
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (e) {
        console.error('ProtectedRoute - 토큰 디코딩 오류:', e);
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    // 즉시 인증 확인 실행
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;