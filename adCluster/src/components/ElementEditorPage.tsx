import React, { useState, useEffect } from 'react';
import ElementSelector, { ElementInfo } from './ElementSelector';
import { fetchCurrentUser } from '../services/api';

interface User {
  uid: string;
  uemail: string;
  urole: string;
  uavatar: string | null;
  ucreate_at: string;
  ulast_login: string | null;
  uupdated_at: string | null;
}

const ElementEditorPage: React.FC = () => {
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedElementInfo, setSelectedElementInfo] = useState<ElementInfo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await fetchCurrentUser();
        setUser(userData);
      } catch (err: any) {
        console.error('사용자 정보 로딩 오류:', err);
        setError(err?.message || '사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);
  
  // 선택 모드 토글
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedElementInfo(null);
    }
  };
  
  // 요소 선택 처리
  const handleElementSelect = (elementInfo: ElementInfo) => {
    setSelectedElementInfo(elementInfo);
    console.log('Selected element:', elementInfo);
  };
  
  // 사용자 이름 삽입
  const insertUserName = () => {
    if (!selectedElementInfo || !user) return;
    
    const userName = user.uemail.split('@')[0];
    
    // content 속성을 우선 사용하고, 없으면 textContent 사용
    const currentContent = selectedElementInfo.content || selectedElementInfo.textContent;
    const updatedContent = currentContent + ` ${userName}`;
    
    const updatedInfo = {
      ...selectedElementInfo,
      content: updatedContent,
      textContent: updatedContent // textContent도 함께 업데이트
    };
    
    setSelectedElementInfo(updatedInfo);
  };

  // 사용자 이메일 삽입
  const insertUserEmail = () => {
    if (!selectedElementInfo || !user) return;
    
    const userEmail = user.uemail;
    
    // content 속성을 우선 사용하고, 없으면 textContent 사용
    const currentContent = selectedElementInfo.content || selectedElementInfo.textContent;
    const updatedContent = currentContent + ` ${userEmail}`;
    
    const updatedInfo = {
      ...selectedElementInfo,
      content: updatedContent,
      textContent: updatedContent // textContent도 함께 업데이트
    };
    
    setSelectedElementInfo(updatedInfo);
  };

  // 비밀번호 필드 표시 (보안상 실제 비밀번호는 서버에서 전송되지 않음)
  const insertPasswordPlaceholder = () => {
    if (!selectedElementInfo) return;
    
    // content 속성을 우선 사용하고, 없으면 textContent 사용
    const currentContent = selectedElementInfo.content || selectedElementInfo.textContent;
    const updatedContent = currentContent + " ********";
    
    const updatedInfo = {
      ...selectedElementInfo,
      content: updatedContent,
      textContent: updatedContent // textContent도 함께 업데이트
    };
    
    setSelectedElementInfo(updatedInfo);
  };
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">요소 선택 및 편집</h1>
          {loading ? (
            <p className="text-gray-500">사용자 정보 로딩 중...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : user ? (
            <p className="text-gray-600">
              안녕하세요, <span className="font-semibold">{user.uemail.split('@')[0]}</span>님!
            </p>
          ) : (
            <p className="text-gray-500">사용자 정보 없음</p>
          )}
        </div>
        <button
          className={`px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSelectionMode ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500' : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500'}`}
          onClick={toggleSelectionMode}
        >
          {isSelectionMode ? '선택 모드 종료' : '요소 선택 모드'}
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <p className="mb-4 text-gray-700">
          {isSelectionMode 
            ? '수정하려는 요소를 클릭하세요. 요소 위에 마우스를 올리면 파란색 테두리로 표시됩니다.' 
            : '오른쪽 상단의 "요소 선택 모드" 버튼을 클릭하여 페이지 요소 선택을 시작하세요.'}
        </p>
        
        {selectedElementInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h3 className="text-lg font-semibold mb-2">선택된 요소 정보</h3>
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={insertUserName}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!user}
              >
                이름 삽입
              </button>
              <button
                onClick={insertUserEmail}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!user}
              >
                이메일 삽입
              </button>
              <button
                onClick={insertPasswordPlaceholder}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                비밀번호 삽입
              </button>
              <div className="w-full mt-2">
                <span className="text-sm text-gray-500">
                  {user ? `사용자: ${user.uemail.split('@')[0]} (${user.uemail})` : '사용자 정보를 불러오는 중...'}
                </span>
              </div>
            </div>
            <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-x-auto">
              {JSON.stringify(selectedElementInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">테스트 요소 영역</h2>
        <p className="mb-4">아래 요소들을 선택하여 편집해보세요.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div id="test-div-1" className="p-4 bg-blue-100 rounded-md">
            <h3 className="text-lg font-medium mb-2">테스트 요소 1</h3>
            <p>이 요소를 선택하여 스타일과 내용을 변경해보세요.</p>
          </div>
          
          <div id="test-div-2" className="p-4 bg-green-100 rounded-md flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium mb-2">테스트 요소 2</h3>
            <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
              테스트 버튼
            </button>
          </div>
          
          <div id="test-div-3" className="p-4 bg-yellow-100 rounded-md">
            <h3 className="text-lg font-medium mb-2">테스트 요소 3</h3>
            <ul className="list-disc pl-5">
              <li>항목 1</li>
              <li>항목 2</li>
              <li>항목 3</li>
            </ul>
          </div>
          
          <div id="test-div-4" className="p-4 bg-purple-100 rounded-md">
            <h3 className="text-lg font-medium mb-2">테스트 요소 4</h3>
            <div className="flex items-center justify-between">
              <span>레이블:</span>
              <input type="text" className="border border-gray-300 rounded-md px-3 py-1" placeholder="텍스트 입력" />
            </div>
          </div>
        </div>
      </div>
      
      {/* 요소 선택기 컴포넌트 */}
      <ElementSelector 
        isActive={isSelectionMode} 
        onElementSelect={handleElementSelect} 
      />
    </div>
  );
};

export default ElementEditorPage;