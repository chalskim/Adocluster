import React, { useState } from 'react';

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

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState<SignupForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  interface SignupResponse {
    success: boolean;
    message?: string;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }
    
    if (!formData.terms) {
      setError('이용약관과 개인정보 처리방침에 동의해야 합니다.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('요청 데이터:', {
        url: `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_SIGNUP_ENDPOINT}`,
        body: {
          uname: formData.name,
          uemail: formData.email,
          password: formData.password,
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_SIGNUP_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uname: formData.name,
          uemail: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('서버 에러:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          
          // Handle validation errors (422) properly
          if (response.status === 422 && errorData.detail) {
            // Extract error messages from the validation error structure
            let errorMessage = '입력값이 올바르지 않습니다.';
            if (Array.isArray(errorData.detail)) {
              // Format validation errors
              errorMessage = errorData.detail.map((err: any) => {
                if (err.loc && err.msg) {
                  // Extract field name from location array
                  const field = err.loc[1] || '입력값';
                  return `${field}: ${err.msg}`;
                }
                return err.msg || '유효하지 않은 값';
              }).join(', ');
            } else if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail;
            }
            setError(errorMessage);
          } else {
            setError(errorData.detail || '회원가입에 실패했습니다. 다시 시도해주세요.');
          }
          setLoading(false);
          return;
        } catch (e) {
          const errorText = await response.text();
          console.error('서버 에러:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          setError(`서버 오류: ${response.status} - ${errorText}`);
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('서버 응답:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data
      });

      if (!data.success) {
        setError(data.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
        return;
      }
      
      if (data.success && data.message) {
        setSuccess(data.message);
      } else {
        setSuccess('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      }
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      console.error('회원가입 에러:', err);
      if (err instanceof Error) {
        console.error('에러 상세:', err.message);
        
        // 오류 메시지에서 특정 패턴 확인
        const errorMsg = err.message.toLowerCase();
        if (errorMsg.includes('email') && errorMsg.includes('registered')) {
          setError('이미 등록된 이메일입니다. 다른 이메일을 사용하거나 로그인해주세요.');
        } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
          setError('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.');
        } else if (errorMsg.includes('timeout')) {
          setError('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
        } else if (err.message.includes('서버 오류')) {
          setError(err.message);
        } else {
          setError('회원가입 중 오류가 발생했습니다: ' + err.message);
        }
      }
      
      // 서버 응답이 있는 경우
      else if (err instanceof Response) {
        try {
          const errorData = await err.json();
          console.error('서버 에러 응답:', {
            status: err.status,
            statusText: err.statusText,
            data: errorData
          });
          setError(errorData.detail || `서버 오류: ${err.status} - ${err.statusText}`);
        } catch (e) {
          try {
            const errorText = await err.text();
            setError(`서버 오류: ${err.status} - ${errorText}`);
          } catch (textError) {
            setError('서버 응답을 처리하는 중 오류가 발생했습니다.');
          }
        }
        return;
      }
      
      else {
        setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      // 구글 로그인 페이지로 리다이렉트하기 전에 서버 상태 확인
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health-check`, { method: 'GET' });
        if (!response.ok) {
          setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
          return;
        }
      } catch (e) {
        // 서버 상태 확인 실패 시 사용자에게 알림
        setError('서버 연결 상태를 확인할 수 없습니다. 인터넷 연결을 확인해주세요.');
        console.error('서버 상태 확인 오류:', e);
        return;
      }
      
      // 서버 상태가 정상이면 구글 로그인 페이지로 리다이렉트
      window.location.href = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_GOOGLE_LOGIN_ENDPOINT}`;
    } catch (err) {
      console.error('구글 회원가입 에러:', err);
      
      if (err instanceof Error) {
        const errorMsg = err.message.toLowerCase();
        if (errorMsg.includes('network') || errorMsg.includes('connection')) {
          setError('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.');
        } else if (errorMsg.includes('timeout')) {
          setError('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setError('구글 로그인 연동 중 오류가 발생했습니다: ' + err.message);
        }
      } else {
        setError('구글 로그인 연동에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 w-full max-w-md p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{import.meta.env.VITE_APP_NAME}</h1>
          <p className="text-gray-200">새로운 계정 만들기</p>
        </div>

        <button 
          type="button" 
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition duration-200 transform hover:scale-[1.02] mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google 계정으로 가입
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300 border-opacity-30"></div>
          <span className="mx-4 text-gray-400 text-sm">또는</span>
          <div className="flex-grow border-t border-gray-300 border-opacity-30"></div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg text-green-200 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2" htmlFor="name">
              이름
            </label>
            <input 
              type="text" 
              id="name" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-gray-300 border-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="홍길동"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2" htmlFor="email">
              이메일
            </label>
            <input 
              type="email" 
              id="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-gray-300 border-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="example@domain.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2" htmlFor="password">
              비밀번호
            </label>
            <input 
              type="password" 
              id="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-gray-300 border-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="••••••••"
            />
            <p className="mt-2 text-sm text-gray-300">최소 8자 이상, 영문, 숫자, 특수문자 포함</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2" htmlFor="confirmPassword">
              비밀번호 확인
            </label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-gray-300 border-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input 
                type="checkbox" 
                id="terms" 
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                required
                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
            </div>
            <label htmlFor="terms" className="ml-2 text-sm text-gray-200">
              <a href="#" className="text-blue-400 hover:text-blue-300">이용약관</a>과 
              <a href="#" className="text-blue-400 hover:text-blue-300 ml-1">개인정보 처리방침</a>에 동의합니다
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 font-medium rounded-lg transition duration-200 transform hover:scale-[1.02] ${
              loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {loading ? '회원가입 중...' : '회원가입'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-200">
            이미 계정이 있으신가요?
            <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition duration-200 ml-1">로그인</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;