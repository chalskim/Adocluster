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

const AdminSettingsPage: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'global' | 'project'>('global');

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

  // Project permission data
  const [selectedProject, setSelectedProject] = useState<string>('데이터 분석 대시보드');
  const projects = [
    '웹사이트 리디자인 프로젝트',
    '모바일 앱 개발 프로젝트',
    '데이터 분석 대시보드',
    '마케팅 전략 문서'
  ];

  const [selectedUser, setSelectedUser] = useState<string>('');
  const [projectUsers, setProjectUsers] = useState<string[]>([]);
  
  // 프로젝트 사용자 목록 가져오기
  useEffect(() => {
    const fetchProjectUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        // 모든 사용자 정보 가져오기
        const response = await axios.get(`${getApiBaseUrl()}/users/?full_permission=1`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // 사용자 이름과 이메일 형식으로 변환
        const formattedUsers = response.data
          .filter((user: any) => !user.uisdel) // uisdel=true인 사용자는 표시하지 않음
          .map((user: any) => {
            const name = user.uname || user.uemail.split('@')[0];
            return `${name} (${user.uemail})`;
          });
        
        setProjectUsers(formattedUsers);
        
        // 첫 번째 사용자를 기본 선택
        if (formattedUsers.length > 0 && !selectedUser) {
          setSelectedUser(formattedUsers[0]);
        }
      } catch (error: any) {
        console.error('프로젝트 사용자 목록을 가져오는 중 오류 발생:', error);
      }
    };
    
    fetchProjectUsers();
  }, [selectedProject, selectedUser]); // 선택된 프로젝트가 변경될 때마다 사용자 목록 다시 가져오기

  const [projectPermissions, setProjectPermissions] = useState<ProjectPermission[]>([
    { id: 1, name: '웹사이트 리디자인 프로젝트', permission: '편집 가능', documents: 24, members: 5 },
    { id: 2, name: '모바일 앱 개발 프로젝트', permission: '접근 불가', documents: 18, members: 3 },
    { id: 3, name: '데이터 분석 대시보드', permission: '읽기 전용', documents: 32, members: 4 }
  ]);
  
  // 선택된 사용자의 프로젝트 권한 정보 가져오기
  useEffect(() => {
    const fetchUserProjectPermissions = async () => {
      if (!selectedUser) return;
      
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        // 사용자 이메일 추출
        const emailMatch = selectedUser.match(/\((.*?)\)/);
        if (!emailMatch || !emailMatch[1]) return;
        
        const userEmail = emailMatch[1];
        
        // 실제 구현에서는 백엔드 API를 호출하여 사용자의 프로젝트 권한 정보를 가져와야 함
        // 현재는 더미 데이터로 대체
        const dummyPermissions = [
          { id: 1, name: '웹사이트 리디자인 프로젝트', permission: '편집 가능', documents: 24, members: 5 },
          { id: 2, name: '모바일 앱 개발 프로젝트', permission: '접근 불가', documents: 18, members: 3 },
          { id: 3, name: '데이터 분석 대시보드', permission: '읽기 전용', documents: 32, members: 4 }
        ];
        
        setProjectPermissions(dummyPermissions);
        
        console.log(`${selectedUser}의 프로젝트 권한 정보를 가져왔습니다.`);
      } catch (error: any) {
        console.error('사용자의 프로젝트 권한 정보를 가져오는 중 오류 발생:', error);
      }
    };
    
    fetchUserProjectPermissions();
  }, [selectedUser]); // 선택된 사용자가 변경될 때마다 프로젝트 권한 정보 다시 가져오기

  // KPI data
  const kpiData: KpiCard[] = [
    { id: 1, icon: 'fas fa-users', iconColor: '#3498db', value: '1,248', label: '총 사용자' },
    { id: 2, icon: 'fas fa-hdd', iconColor: '#3498db', value: '84.2GB', label: '스토리지 사용량' },
    { id: 3, icon: 'fas fa-robot', iconColor: '#3498db', value: '42,891', label: 'AI 호출량' },
    { id: 4, icon: 'fas fa-project-diagram', iconColor: '#3498db', value: '156', label: '활성 프로젝트' }
  ];

  const systemKpiData: KpiCard[] = [
    { id: 1, icon: 'fas fa-server', iconColor: '#9b59b6', value: '98.5%', label: '서버 가용성' },
    { id: 2, icon: 'fas fa-microchip', iconColor: '#f39c12', value: '72%', label: 'CPU 사용률' },
    { id: 3, icon: 'fas fa-memory', iconColor: '#1abc9c', value: '64%', label: '메모리 사용률' },
    { id: 4, icon: 'fas fa-exclamation-triangle', iconColor: '#e74c3c', value: '3', label: '경고 발생' }
  ];

  // System warnings
  const systemWarnings: SystemWarning[] = [
    { id: 1, message: '스토리지 사용량 초과', timestamp: '2023.11.20 14:30' },
    { id: 2, message: 'CPU 사용률 과다', timestamp: '2023.11.20 10:15' },
    { id: 3, message: '백업 실패', timestamp: '2023.11.19 23:45' }
  ];

  // AI settings
  const [selectedModel, setSelectedModel] = useState<string>('GPT-4o');
  const aiModels = ['GPT-4 Turbo', 'GPT-4o', 'Claude 3 Opus', 'Claude 3 Sonnet', 'Gemini Pro'];
  
  const [apiKey, setApiKey] = useState<string>('sk-••••••••••••••••••••••••••••••••');
  
  const modelQuotas: ModelQuota[] = [
    { id: 1, name: 'GPT-4o', used: 25000, total: 50000, color: '#3498db' },
    { id: 2, name: 'Claude 3', used: 12000, total: 30000, color: '#9b59b6' }
  ];

  // Notice settings
  const [noticeTitle, setNoticeTitle] = useState<string>('');
  const [noticeContent, setNoticeContent] = useState<string>('');
  const [noticeType, setNoticeType] = useState<string>('팝업 알림');
  const noticeTypes = ['팝업 알림', '상단 배너', '이메일 발송', '모두'];
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

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
      alert(`사용자 상세 정보:\nID: ${userDetails.id}\n이름: ${userDetails.name}\n이메일: ${userDetails.email}\n역할: ${userDetails.role}\n로그인 시간: ${userDetails.loginTime}\n마지막 활동: ${userDetails.lastActive}`);
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
      console.error(`사용자 ${action} 작업 중 오류 발생:`, error);
      alert(`작업 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`);
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

  // Project permission change handler
  const handlePermissionChange = (projectId: number, newPermission: string) => {
    const project = projectPermissions.find(p => p.id === projectId);
    if (!project) return;
    
    setProjectPermissions(projectPermissions.map(p => 
      p.id === projectId ? { ...p, permission: newPermission } : p
    ));
    console.log(`${project.name}의 권한이 ${newPermission}으로 변경됨`);
  };

  // Save handlers
  const handleProjectPermissionSave = () => {
    alert('프로젝트별 권한 설정이 저장되었습니다.');
  };

  const handleAiSettingsSave = () => {
    alert('AI 연동 설정이 저장되었습니다.');
  };

  const handleNoticeSubmit = () => {
    if (noticeTitle) {
      alert(`공지사항 "${noticeTitle}"이(가) 모든 사용자에게 발송되었습니다.`);
    } else {
      alert('공지사항 제목을 입력해주세요.');
    }
  };

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-5">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          🛡️ 관리자 설정 
          <span className="ml-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">관리자 전용</span>
        </h1>
        <p className="text-gray-500">사용자 관리, 시스템 현황, AI 연동 설정 등을 관리할 수 있습니다</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 사용자 관리 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <i className="fas fa-user-friends"></i>
            </div>
            <div className="text-xl font-semibold text-gray-800">사용자 관리</div>
          </div>
          
          <div className="flex border-b border-gray-200 bg-gray-100 rounded-t-lg">
            <div 
              className={`px-5 py-3 cursor-pointer font-medium ${
                activeTab === 'global' 
                  ? 'bg-white border-b-2 border-blue-500 text-blue-500' 
                  : 'hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('global')}
            >
              전체 권한
            </div>
            <div 
              className={`px-5 py-3 cursor-pointer font-medium ${
                activeTab === 'project' 
                  ? 'bg-white border-b-2 border-blue-500 text-blue-500' 
                  : 'hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('project')}
            >
              프로젝트별 권한
            </div>
          </div>
          
          {activeTab === 'global' && (
            <div className="mt-4 mb-4">
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
          )}
          
          {activeTab === 'global' && (
            <div className="overflow-x-auto mt-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-semibold text-gray-700 border-b-2 border-gray-200">이름</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border-b-2 border-gray-200">이메일</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border-b-2 border-gray-200">전체 권한</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border-b-2 border-gray-200">상태</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border-b-2 border-gray-200">작업</th>
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
          )}
          
          {activeTab === 'project' && (
            <div className="mt-4">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">프로젝트 선택</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  {projects.map((project, index) => (
                    <option key={index} value={project}>{project}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">사용자 선택</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  {projectUsers.map((user, index) => (
                    <option key={index} value={user}>{user}</option>
                  ))}
                </select>
              </div>
              
              {projectPermissions.map((permission) => (
                <div key={permission.id} className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold text-gray-800">{permission.name}</div>
                    <select 
                      className="p-2 border border-gray-300 rounded"
                      value={permission.permission}
                      onChange={(e) => handlePermissionChange(permission.id, e.target.value)}
                    >
                      <option>읽기 전용</option>
                      <option>편집 가능</option>
                      <option>관리자</option>
                      <option>접근 불가</option>
                    </select>
                  </div>
                  <div className="text-sm text-gray-500">
                    문서 {permission.documents}개, 멤버 {permission.members}명
                  </div>
                </div>
              ))}
              
              <button 
                className="px-5 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mt-3"
                onClick={handleProjectPermissionSave}
              >
                <i className="fas fa-save"></i> 프로젝트 권한 저장
              </button>
            </div>
          )}
        </div>

        {/* 시스템 현황 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <i className="fas fa-chart-bar"></i>
            </div>
            <div className="text-xl font-semibold text-gray-800">시스템 현황</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {systemKpiData.map((kpi) => (
              <div key={kpi.id} className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div 
                  className="w-12 h-12 rounded-full text-white flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: kpi.iconColor }}
                >
                  <i className={kpi.icon}></i>
                </div>
                <div className="text-xl font-bold text-gray-800 my-1">{kpi.value}</div>
                <div className="text-gray-500 text-sm">{kpi.label}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <label className="block text-gray-700 font-medium mb-2">최근 경고 내역</label>
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
              {systemWarnings.map((warning) => (
                <div key={warning.id} className="mb-2 last:mb-0">
                  <strong>{warning.message}</strong> - {warning.timestamp}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI 연동 설정 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <i className="fas fa-robot"></i>
            </div>
            <div className="text-xl font-semibold text-gray-800">AI 연동 설정</div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">기본 AI 모델</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {aiModels.map((model, index) => (
                <option key={index} value={model}>{model}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">API Key</label>
            <input 
              type="password" 
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">모델 별 할당량</label>
            <div className="bg-gray-100 rounded-lg p-4">
              {modelQuotas.map((quota) => (
                <div key={quota.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-2">
                    <span>{quota.name}</span>
                    <span>{quota.used.toLocaleString()} / {quota.total.toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-300 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${(quota.used / quota.total) * 100}%`,
                        backgroundColor: quota.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            className="px-5 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            onClick={handleAiSettingsSave}
          >
            <i className="fas fa-save"></i> 설정 저장
          </button>
        </div>

        {/* 공지사항 등록 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <i className="fas fa-bullhorn"></i>
            </div>
            <div className="text-xl font-semibold text-gray-800">공지사항 등록</div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">공지사항 제목</label>
            <input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="공지사항 제목을 입력하세요"
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">공지사항 내용</label>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg min-h-[120px]"
              placeholder="공지사항 내용을 입력하세요&#10;&#10;• 내용을 입력하세요&#10;• 중요한 사항을 강조하세요"
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">공지 유형</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={noticeType}
              onChange={(e) => setNoticeType(e.target.value)}
            >
              {noticeTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">게시 기간</label>
            <div className="flex gap-2">
              <input 
                type="date" 
                className="flex-1 p-3 border border-gray-300 rounded-lg"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="flex items-center">~</span>
              <input 
                type="date" 
                className="flex-1 p-3 border border-gray-300 rounded-lg"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <button 
            className="px-5 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            onClick={handleNoticeSubmit}
          >
            <i className="fas fa-paper-plane"></i> 공지사항 발송
          </button>
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
                  <th className="py-2 px-4 border-b text-left">작업</th>
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