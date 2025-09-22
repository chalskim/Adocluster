import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addUserToLoginCollection, cleanupOldEntries } from './services/userLoginCollection';
import { useWebSocket } from './contexts/WebSocketContext';

// Utility functions for cookie handling
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

// Define the type for import.meta.env
interface ImportMetaEnv {
  VITE_API_BASE_URL: string;
  VITE_LOGIN_ENDPOINT: string;
  VITE_SIGNUP_ENDPOINT: string;
  VITE_GOOGLE_LOGIN_ENDPOINT: string;
  VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

// User information interface
interface UserInfo {
  uid: string;
  uemail: string;
  uname: string;
  urole: string;
  uavatar?: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { disconnect } = useWebSocket(); // Get disconnect function from WebSocket context
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: true, // Default to true for persistent session
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on component mount
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const rememberMe = localStorage.getItem('rememberMe');
    
    // Load saved credentials if "Remember Me" was previously selected
    const savedEmail = getCookie('savedEmail');
    const savedPassword = getCookie('savedPassword');
    
    if (savedEmail && savedPassword) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        password: savedPassword,
        rememberMe: true
      }));
    }
    
    if (authToken && rememberMe === 'true') {
      // Validate token expiration if needed
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  interface LoginResponse {
    success: boolean;
    message?: string;
    access_token?: string;
    token_type?: string;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    // Clean up old entries in login collection
    cleanupOldEntries();
    
    // 로그인 시도 전에 기존 만료된 토큰 제거
    localStorage.removeItem('authToken');
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('요청 데이터:', {
        url: `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_LOGIN_ENDPOINT}`,
        body: {
          uemail: formData.email,
          password: formData.password,
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_LOGIN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uemail: formData.email,  // Changed from 'email' to 'uemail'
          password: formData.password,
        }),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('서버 에러:', {
            status: response.status,
            statusText: response.statusText,
            data: errorData,
          });
          setError(errorData.message || '로그인에 실패했습니다.');
        } catch (e) {
          setError(`로그인에 실패했습니다. 상태 코드: ${response.status}`);
        }
        return;
      }

      const data: LoginResponse = await response.json();
      
      if (data.success && data.access_token) {
        // Get user information after successful login
        try {
          const userResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
            headers: {
              'Authorization': `Bearer ${data.access_token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (userResponse.ok) {
            const userData: UserInfo = await userResponse.json();
            
            // Add user to login collection
            const userLoginInfo = {
              id: userData.uid,
              email: userData.uemail,
              name: userData.uname,
              loginTime: new Date().toISOString(),
              lastActive: new Date().toISOString(),
              token: data.access_token,
              role: userData.urole,
              avatar: userData.uavatar
            };
            
            addUserToLoginCollection(userLoginInfo);
            console.log('User added to login collection:', userLoginInfo);
          }
        } catch (userError) {
          console.error('Error fetching user info:', userError);
        }
        
        // 클라이언트 IP 기록
        try {
          await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_CLIENT_IP_ENDPOINT}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
        } catch (ipError) {
          console.log('IP 기록 실패:', ipError);
          // IP 기록 실패는 로그인에 영향을 주지 않음
        }
        
        // 로그인 성공 처리
        localStorage.setItem('authToken', data.access_token);
        localStorage.setItem('rememberMe', 'true'); // Always maintain session until logout
        localStorage.setItem('loginTime', new Date().toISOString()); // Store login time
        
        // Save credentials to cookies if "Remember Me" is checked
        if (formData.rememberMe) {
          setCookie('savedEmail', formData.email, 30); // Save for 30 days
          setCookie('savedPassword', formData.password, 30); // Save for 30 days
        } else {
          // Remove saved credentials if "Remember Me" is unchecked
          deleteCookie('savedEmail');
          deleteCookie('savedPassword');
        }
        
        navigate('/');
      } else {
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('로그인 요청 중 오류 발생:', err);
      setError('로그인 요청 중 오류가 발생했습니다. 나중에 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_GOOGLE_LOGIN_ENDPOINT}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {import.meta.env.VITE_APP_NAME || 'AdCluster'} 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              회원가입
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">이메일 주소</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="이메일 주소"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">비밀번호</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                아이디/비밀번호 저장
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                비밀번호를 잊으셨나요?
              </a>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                  </g>
                </svg>
                Google로 로그인
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;