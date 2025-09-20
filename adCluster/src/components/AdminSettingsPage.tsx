import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API 기본 URL 가져오기
const getApiBaseUrl = () => {
  try {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  } catch (err) {
    console.error('Error accessing VITE_API_BASE_URL:', err);
    return 'http://localhost:8000';
  }
};

import {
  getUserLoginCollection,
  clearUserLoginCollection,
  removeUserFromLoginCollection,
  getUserByToken,
  getUserLoginInfoById,
} from '../services/userLoginCollection';

interface User {
  uid: string;
  uemail: string;
  urole: string;
  uavatar: string;
  status?: 'active' | 'blocked';
  name?: string;
  uname?: string;
  uactive?: boolean;
  uisdel?: boolean;
}

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

interface ProjectPermission {
  id: number;
  name: string;
  permission: string;
  documents: number;
  members: number;
}

interface KpiCard {
  id: number;
  icon: string;
  iconColor: string;
  value: string;
  label: string;
}

interface SystemWarning {
  id: number;
  message: string;
  timestamp: string;
}

interface ModelQuota {
  id: number;
  name: string;
  used: number;
  total: number;
  color: string;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  type: '상단 배너'; // Only dashboard banner notices
  priority: '긴급' | '중요' | '일반'; // Add priority field
  startDate: string;
  endDate: string;
  createdAt: string;
}

const AdminSettingsPage: React.FC = () => {
  // Tab state
  // Removed tab state as we're displaying both sections in a single column

  // User management data
  const [users, setUsers] = useState<User[]>([]);
  const [fullPermission, setFullPermission] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [usersPerPage] = useState<number>(5);
  
  // 사용자 목록 가져오기
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const response = await axios.get(`${getApiBaseUrl()}/users/?full_permission=${fullPermission ? 1 : 0}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // 사용자 이름과 이메일 형식으로 변환
        const formattedUsers = response.data.map((user: any) => ({
          ...user,
          name: user.uname || user.uemail.split('@')[0], // 실제 이름이 있으면 사용, 없으면 이메일에서 이름 추출
          status: user.uactive ? 'active' : 'blocked' // uactive 필드 기반으로 상태 설정
        }));
        
        // uisdel=true인 사용자는 표시하지 않음
        const filteredUsers = formattedUsers.filter((user: User) => !user.uisdel);
        
        // 이름순으로 정렬
        const sortedUsers = filteredUsers.sort((a: User, b: User) => {
          if (a.name && b.name) {
            return a.name.localeCompare(b.name);
          }
          return 0;
        });
        
        setUsers(sortedUsers);
        // 페이지 변경 시 첫 페이지로 리셋
        setCurrentPage(1);
      } catch (error: any) {
        console.error('사용자 목록을 가져오는 중 오류 발생:', error);
      }
    };
    
    fetchUsers();
  }, [fullPermission]); // fullPermission이 변경될 때마다 사용자 목록 다시 가져오기
  
  // 현재 페이지에 표시할 사용자 계산
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  
  // 페이지 변경 핸들러
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // KPI data
  const kpiData: KpiCard[] = [
    { id: 1, icon: 'fas fa-users', iconColor: '#3498db', value: '1,248', label: '총 사용자' },
    { id: 2, icon: 'fas fa-hdd', iconColor: '#3498db', value: '84.2GB', label: '스토리지 사용량' },
    { id: 3, icon: 'fas fa-robot', iconColor: '#3498db', value: '42,891', label: 'AI 호출량' },
    { id: 4, icon: 'fas fa-project-diagram', iconColor: '#3498db', value: '156', label: '활성 프로젝트' }
  ];

  // Notice settings
  const [noticeTitle, setNoticeTitle] = useState<string>('');
  const [noticeContent, setNoticeContent] = useState<string>('');
  const [noticePriority, setNoticePriority] = useState<'긴급' | '중요' | '일반'>('일반'); // Add priority state
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Notice management
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticeTab, setNoticeTab] = useState<'register' | 'list'>('register');

  // Fetch existing notices
  useEffect(() => {
    // In a real implementation, this would fetch from an API
    // For now, we'll use mock data
    const mockNotices: Notice[] = [
      {
        id: 1,
        title: '시스템 정기 점검 안내',
        content: '2024년 1월 15일 오전 2:00 ~ 4:00 (약 2시간) 동안 시스템 점검이 진행됩니다.',
        type: '상단 배너',
        priority: '긴급', // Add priority field
        startDate: '2024-01-10',
        endDate: '2024-01-20',
        createdAt: '2024-01-05'
      },
      {
        id: 2,
        title: '새로운 캘린더 기능 추가',
        content: '일정 관리와 팀 협업이 더욱 편리해졌습니다. 새로운 기능을 확인해보세요.',
        type: '상단 배너',
        priority: '중요', // Add priority field
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        createdAt: '2023-12-30'
      }
    ];
    setNotices(mockNotices);
  }, []);

  // Login Collection states
  const [loginCollectionUsers, setLoginCollectionUsers] = useState<UserLoginInfo[]>([]);
  const [loginCollectionCurrentUser, setLoginCollectionCurrentUser] = useState<UserLoginInfo | null>(null);
  const [loginCollectionShowAll, setLoginCollectionShowAll] = useState(false);

  useEffect(() => {
    refreshLoginCollectionUserList();
  }, [loginCollectionShowAll]);

  const refreshLoginCollectionUserList = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const currentUserFromToken = getUserByToken(token);
      setLoginCollectionCurrentUser(currentUserFromToken || null);
    }
    
    if (loginCollectionShowAll) {
      const collection = getUserLoginCollection();
      setLoginCollectionUsers(collection);
    } else if (token) {
      const currentUserFromToken = getUserByToken(token);
      setLoginCollectionUsers(currentUserFromToken ? [currentUserFromToken] : []);
    } else {
      setLoginCollectionUsers([]);
    }
  };

  const handleLoginCollectionClear = () => {
    if (window.confirm('정말 모든 로그인 정보를 삭제하시겠습니까?')) {
      clearUserLoginCollection();
      refreshLoginCollectionUserList();
    }
  };

  const handleLoginCollectionRemoveUser = (userId: string) => {
    if (window.confirm('정말 이 사용자를 삭제하시겠습니까?')) {
      removeUserFromLoginCollection(userId);
      refreshLoginCollectionUserList();
    }
  };

  const handleLoginCollectionForceLogout = (userId: string) => {
    if (window.confirm('정말 이 사용자를 강제 로그아웃 하시겠습니까?')) {
      removeUserFromLoginCollection(userId);
      
      const token = localStorage.getItem('authToken');
      if (token) {
        const userFromToken = getUserByToken(token);
        if (userFromToken && userFromToken.id === userId) {
          localStorage.removeItem('authToken');
          window.location.reload();
        }
      }
      
      refreshLoginCollectionUserList();
    }
  };

  const handleLoginCollectionViewUserDetails = (userId: string) => {
    const userDetails = getUserLoginInfoById(userId);
    if (userDetails) {
      alert(`사용자 상세 정보:
ID: ${userDetails.id}
이름: ${userDetails.name}
이메일: ${userDetails.email}
역할: ${userDetails.role}
로그인 시간: ${userDetails.loginTime}
마지막 활동: ${userDetails.lastActive}`);
    }
  };

  const formatLoginCollectionDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const toggleLoginCollectionViewMode = () => {
    setLoginCollectionShowAll(!loginCollectionShowAll);
  };

  // User action handlers
  const handleUserAction = async (userId: string, action: 'block' | 'unblock' | 'delete') => {
    const user = users.find(u => u.uid === userId);
    if (!user) return;

    try {
      let message = '';
      let apiEndpoint = '';
      let confirmMessage = '';
      
      switch (action) {
        case 'delete':
          confirmMessage = `${user.uname || user.name}님의 계정을 삭제하시겠습니까?`;
          apiEndpoint = `${getApiBaseUrl()}/users/${userId}/delete`;
          message = `${user.uname || user.name}님의 계정이 삭제되었습니다.`;
          break;
        case 'block':
          confirmMessage = `${user.uname || user.name}님을 차단하시겠습니까?`;
          apiEndpoint = `${getApiBaseUrl()}/users/${userId}/block`;
          message = `${user.uname || user.name}님이 차단되었습니다.`;
          break;
        case 'unblock':
          confirmMessage = `${user.uname || user.name}님의 차단을 해제하시겠습니까?`;
          apiEndpoint = `${getApiBaseUrl()}/users/${userId}/unblock`;
          message = `${user.uname || user.name}님의 차단이 해제되었습니다.`;
          break;
      }
      
      if (!window.confirm(confirmMessage)) return;
      
      // 백엔드 API 호출
      const response = await axios.put(apiEndpoint, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.status === 200) {
        // 사용자 목록 업데이트
        if (action === 'delete') {
          // 삭제된 사용자는 목록에서 제거
          setUsers(prevUsers => prevUsers.filter(u => u.uid !== userId));
        } else {
          // 차단/해제된 사용자는 상태 업데이트
          setUsers(prevUsers => 
            prevUsers.map(u => 
              u.uid === userId ? { ...u, uactive: action === 'unblock', status: action === 'unblock' ? 'active' : 'blocked' } : u
            )
          );
        }
        
        alert(message);
      }
    } catch (error: any) {
      console.error(`사용자 ${action} 연구 활동 중 오류 발생:`, error);
      alert(`연구 활동 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`);
    }
  };

  // Role change handler
  const handleRoleChange = async (userId: string, newRole: string) => {
    const user = users.find(u => u.uid === userId);
    if (!user) return;
    
    if (!confirm(`${user.uname || user.name}님의 권한을 ${newRole}로 변경하시겠습니까?`)) return;
    
    try {
      // 백엔드 API 호출 - role을 쿼리 파라미터로 전달
      const response = await axios.put(
        `${getApiBaseUrl()}/users/${userId}/role?role=${newRole}`, 
        {}, // 빈 객체를 바디로 전달
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      
      if (response.status === 200) {
        // 사용자 목록 업데이트
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.uid === userId ? { ...u, urole: newRole } : u
          )
        );
        alert(`${user.uname || user.name}님의 권한이 ${newRole}으로 변경되었습니다.`);
      }
    } catch (error: any) {
      console.error('권한 변경 중 오류 발생:', error);
      alert(`권한 변경 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`);
    }
  };

  // Save handlers
  const handleNoticeSubmit = () => {
    if (noticeTitle) {
      // In a real implementation, this would send to an API
      const newNotice: Notice = {
        id: notices.length + 1,
        title: noticeTitle,
        content: noticeContent,
        type: '상단 배너', // Only dashboard banner notices
        priority: noticePriority, // Add priority to the new notice
        startDate,
        endDate,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setNotices([newNotice, ...notices]);
      alert(`공지사항 "${noticeTitle}"이(가) 대시보드 배너에 등록되었습니다.`);
      
      // Reset form
      setNoticeTitle('');
      setNoticeContent('');
      setStartDate('');
      setEndDate('');
    } else {
      alert('공지사항 제목을 입력해주세요.');
    }
  };

  const handleDeleteNotice = (id: number, title: string) => {
    if (window.confirm(`"${title}" 공지사항을 삭제하시겠습니까?`)) {
      setNotices(notices.filter(notice => notice.id !== id));
      alert('공지사항이 삭제되었습니다.');
    }
  };

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-5">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          🛡️ 관리자 설정 
          <span className="ml-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">관리자 전용</span>
        </h1>
        <p className="text-gray-500">사용자 관리, 공지사항 등록 등을 관리할 수 있습니다</p>
      </div>

      {/* KPI 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        {kpiData.map((kpi) => (
          <div key={kpi.id} className="bg-white rounded-lg shadow-sm p-5 text-center">
            <div 
              className="w-12 h-12 rounded-full text-white flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: kpi.iconColor }}
            >
              <i className={kpi.icon}></i>
            </div>
            <div className="text-2xl font-bold text-gray-800 my-2">{kpi.value}</div>
            <div className="text-gray-500 text-sm">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {/* 공지사항 관리 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <i className="fas fa-bullhorn"></i>
            </div>
            <div className="text-xl font-semibold text-gray-800">대시보드 배너 공지사항 관리</div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm ${noticeTab === 'register' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setNoticeTab('register')}
            >
배너 공지 등록
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${noticeTab === 'list' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setNoticeTab('list')}
            >
등록된 배너 공지
            </button>
          </div>
          
          {/* 공지사항 등록 탭 */}
          {noticeTab === 'register' && (
            <div className="space-y-3">
              <div className="mb-3">
                <label className="block text-gray-700 font-medium mb-2">공지사항 제목</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="공지사항 제목을 입력하세요"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="block text-gray-700 font-medium mb-2">공지사항 내용</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-lg min-h-[100px]"
                  placeholder="공지사항 내용을 입력하세요&#10;&#10;• 내용을 입력하세요&#10;• 중요한 사항을 강조하세요"
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="block text-gray-700 font-medium mb-2">중요도</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={noticePriority}
                  onChange={(e) => setNoticePriority(e.target.value as '긴급' | '중요' | '일반')}
                >
                  <option value="일반">일반</option>
                  <option value="중요">중요</option>
                  <option value="긴급">긴급</option>
                </select>
              </div>

              {/* Remove the static notice type display */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">게시 기간</label>
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className="flex items-center">~</span>
                  <input 
                    type="date" 
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              
              <button 
                className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                onClick={handleNoticeSubmit}
              >
                <i className="fas fa-paper-plane"></i> 공지사항 발송
              </button>
            </div>
          )}
          
          {/* 등록된 공지사항 탭 */}
          {noticeTab === 'list' && (
            <div className="space-y-4">
              {notices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  등록된 공지사항이 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {notices.map((notice) => (
                    <div key={notice.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-800">{notice.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              notice.priority === '긴급' 
                                ? 'bg-red-100 text-red-800' 
                                : notice.priority === '중요' 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-blue-100 text-blue-800'
                            }`}>
                              {notice.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{notice.content}</p>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span>게시 기간: {notice.startDate} ~ {notice.endDate}</span>
                            <span>등록일: {notice.createdAt}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteNotice(notice.id, notice.title)}
                          className="ml-4 text-red-500 hover:text-red-700 p-2"
                          title="공지사항 삭제"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 사용자 관리 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <i className="fas fa-user-friends"></i>
            </div>
            <div className="text-xl font-semibold text-gray-800">사용자 관리</div>
          </div>
          
          {/* 전체 권한 섹션 */}
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">전체 권한</h3>
            <div className="mb-4">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="form-checkbox h-5 w-5 text-blue-500" 
                  checked={fullPermission}
                  onChange={() => setFullPermission(!fullPermission)}
                />
                <span className="ml-2 text-gray-700">전체 권한 설정 시 모든 사용자 표시</span>
              </label>
            </div>
            
            <div className="overflow-x-auto mt-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-semibold text-gray-700 border-b-2 border-gray-200">이름</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border-b-2 border-gray-200">이메일</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border-b-2 border-gray-200">전체 권한</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border-b-2 border-gray-200">상태</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border-b-2 border-gray-200">연구 활동</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50 border-b border-gray-100">
                      <td className="p-3">{user.name}</td>
                      <td className="p-3">{user.uemail}</td>
                      <td className="p-3">
                        <select 
                          className="p-2 border border-gray-300 rounded"
                          value={user.urole}
                          onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                        >
                          <option value="user">일반 사용자</option>
                          <option value="admin">관리자</option>
                          <option value="viewer">읽기 전용</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span className={user.uactive ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                          {user.uactive ? '활성' : '차단됨'}
                        </span>
                      </td>
                      <td className="p-3">
                        {user.uactive ? (
                          <button 
                            className="px-2 py-1 bg-yellow-500 text-white text-xs rounded mr-1"
                            onClick={() => handleUserAction(user.uid, 'block')}
                          >
                            차단
                          </button>
                        ) : (
                          <button 
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded mr-1"
                            onClick={() => handleUserAction(user.uid, 'unblock')}
                          >
                            해제
                          </button>
                        )}
                        <button 
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                          onClick={() => handleUserAction(user.uid, 'delete')}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              <div className="flex justify-center gap-2 mt-5">
                {/* Previous button */}
                <button 
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  이전
                </button>
                
                {/* Page number buttons */}
                {Array.from({ length: Math.ceil(users.length / usersPerPage) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`px-4 py-2 border border-gray-300 rounded ${
                      currentPage === page 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => paginate(page)}
                  >
                    {page}
                  </button>
                ))}
                
                {/* Next button */}
                <button 
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === Math.ceil(users.length / usersPerPage)}
                >
                  다음
                </button>
              </div>
            </div>
          </div>
          
          {/* 프로젝트별 권한 섹션 */}
        </div>
      </div>

      {/* 사용자 로그인 컬렉션 - 전체 너비 사용 */}
      <div className="w-full bg-white rounded-lg shadow-sm p-6 mt-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
            <i className="fas fa-users-cog"></i>
          </div>
          <div className="text-xl font-semibold text-gray-800">사용자 로그인 현황</div>
        </div>
        
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <button 
            onClick={refreshLoginCollectionUserList}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            새로고침
          </button>
          <button 
            onClick={toggleLoginCollectionViewMode}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            {loginCollectionShowAll ? '내 정보만 보기' : '모든 사용자 보기'}
          </button>
          {loginCollectionShowAll && (
            <button 
              onClick={handleLoginCollectionClear}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              전체 삭제
            </button>
          )}
        </div>

        {loginCollectionUsers.length === 0 ? (
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <p className="text-gray-500">저장된 사용자 로그인 정보가 없습니다.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">이름</th>
                  <th className="py-2 px-4 border-b text-left">이메일</th>
                  <th className="py-2 px-4 border-b text-left">역할</th>
                  <th className="py-2 px-4 border-b text-left">로그인 시간</th>
                  <th className="py-2 px-4 border-b text-left">마지막 활동</th>
                  <th className="py-2 px-4 border-b text-left">상태</th>
                  <th className="py-2 px-4 border-b text-left">연구 활동</th>
                </tr>
              </thead>
              <tbody>
                {loginCollectionUsers.map(user => (
                  <tr key={user.id} className={`hover:bg-gray-50 ${loginCollectionCurrentUser && loginCollectionCurrentUser.id === user.id ? 'bg-blue-50' : ''}`}>
                    <td className="py-2 px-4 border-b">{user.name}</td>
                    <td className="py-2 px-4 border-b">{user.email}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">{formatLoginCollectionDateTime(user.loginTime)}</td>
                    <td className="py-2 px-4 border-b">{formatLoginCollectionDateTime(user.lastActive)}</td>
                    <td className="py-2 px-4 border-b">
                      {loginCollectionCurrentUser && loginCollectionCurrentUser.id === user.id ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">현재 접속</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">접속중</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => handleLoginCollectionViewUserDetails(user.id)}
                          className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                          상세
                        </button>
                        <button 
                          onClick={() => handleLoginCollectionRemoveUser(user.id)}
                          className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                        >
                          삭제
                        </button>
                        <button 
                          onClick={() => handleLoginCollectionForceLogout(user.id)}
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
      </div>
      </div>
  );
};

export default AdminSettingsPage;