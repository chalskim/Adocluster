import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '../services/api';

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

interface RegisteredNotice {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'urgent';
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
}

const AdminSettingsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [projectPermissions, setProjectPermissions] = useState<ProjectPermission[]>([]);
  const [systemWarnings, setSystemWarnings] = useState<SystemWarning[]>([]);
  const [modelQuotas, setModelQuotas] = useState<ModelQuota[]>([]);
  const [loginCollectionUsers, setLoginCollectionUsers] = useState<UserLoginInfo[]>([]);
  const [loginCollectionShowAll, setLoginCollectionShowAll] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeType, setNoticeType] = useState('info');
  const [noticeStartDate, setNoticeStartDate] = useState('');
  const [noticeEndDate, setNoticeEndDate] = useState('');
  const [activeNoticeTab, setActiveNoticeTab] = useState<'preview' | 'registered'>('preview');
  const [registeredNotices, setRegisteredNotices] = useState<RegisteredNotice[]>([]);

  const kpiData: KpiCard[] = [
    { id: 1, icon: 'fas fa-users', iconColor: '#3B82F6', value: users.length.toString(), label: '총 사용자' },
    { id: 2, icon: 'fas fa-project-diagram', iconColor: '#10B981', value: projectPermissions.length.toString(), label: '활성 프로젝트' },
    { id: 3, icon: 'fas fa-exclamation-triangle', iconColor: '#F59E0B', value: systemWarnings.length.toString(), label: '시스템 경고' },
    { id: 4, icon: 'fas fa-robot', iconColor: '#8B5CF6', value: modelQuotas.length.toString(), label: 'AI 모델' }
  ];

  useEffect(() => {
    fetchUsers();
    fetchProjectPermissions();
    fetchSystemWarnings();
    fetchModelQuotas();
    refreshLoginCollectionUserList();
    fetchRegisteredNotices();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
    }
  };

  const fetchProjectPermissions = async () => {
    const mockData: ProjectPermission[] = [
      { id: 1, name: 'AI 연구 프로젝트', permission: 'admin', documents: 45, members: 8 },
      { id: 2, name: '데이터 분석 프로젝트', permission: 'editor', documents: 32, members: 5 },
      { id: 3, name: '머신러닝 실험', permission: 'viewer', documents: 28, members: 12 }
    ];
    setProjectPermissions(mockData);
  };

  const fetchSystemWarnings = async () => {
    const mockData: SystemWarning[] = [
      { id: 1, message: 'GPU 메모리 사용률이 85%를 초과했습니다', timestamp: '2024-01-15 14:30' },
      { id: 2, message: '데이터베이스 연결 지연이 감지되었습니다', timestamp: '2024-01-15 13:45' }
    ];
    setSystemWarnings(mockData);
  };

  const fetchModelQuotas = async () => {
    const mockData: ModelQuota[] = [
      { id: 1, name: 'GPT-4', used: 750, total: 1000, color: '#3B82F6' },
      { id: 2, name: 'Claude-3', used: 450, total: 800, color: '#10B981' },
      { id: 3, name: 'Gemini Pro', used: 320, total: 500, color: '#F59E0B' }
    ];
    setModelQuotas(mockData);
  };

  const fetchRegisteredNotices = async () => {
    const mockData: RegisteredNotice[] = [
      {
        id: 1,
        title: '시스템 정기 점검 안내',
        content: '2024년 1월 15일 오전 2시부터 4시까지 시스템 정기 점검이 진행됩니다. 해당 시간 동안 서비스 이용이 제한될 수 있습니다.',
        type: 'info',
        startDate: '2024-01-14T00:00',
        endDate: '2024-01-16T23:59',
        status: 'active',
        createdAt: '2024-01-10T09:00:00'
      },
      {
        id: 2,
        title: '새로운 AI 모델 추가',
        content: 'GPT-4 Turbo 모델이 새롭게 추가되었습니다. 더욱 빠르고 정확한 AI 서비스를 이용하실 수 있습니다.',
        type: 'info',
        startDate: '2024-01-12T00:00',
        endDate: '2024-01-20T23:59',
        status: 'active',
        createdAt: '2024-01-12T10:30:00'
      },
      {
        id: 3,
        title: '보안 업데이트 필수 적용',
        content: '중요한 보안 업데이트가 배포되었습니다. 모든 사용자는 반드시 업데이트를 적용해 주시기 바랍니다.',
        type: 'urgent',
        startDate: '2024-01-08T00:00',
        endDate: '2024-01-15T23:59',
        status: 'active',
        createdAt: '2024-01-08T14:15:00'
      },
      {
        id: 4,
        title: '서버 용량 증설 완료',
        content: '사용자 증가에 따른 서버 용량 증설이 완료되었습니다. 더욱 안정적인 서비스를 제공하겠습니다.',
        type: 'info',
        startDate: '2024-01-05T00:00',
        endDate: '2024-01-10T23:59',
        status: 'expired',
        createdAt: '2024-01-05T16:45:00'
      }
    ];
    setRegisteredNotices(mockData);
  };

  const refreshLoginCollectionUserList = async () => {
    try {
      const users = await getUserLoginCollection();
      setLoginCollectionUsers(users);
    } catch (error) {
      console.error('로그인 컬렉션 조회 실패:', error);
    }
  };

  const toggleLoginCollectionViewMode = () => {
    setLoginCollectionShowAll(!loginCollectionShowAll);
  };

  const handleLoginCollectionClear = async () => {
    if (window.confirm('모든 사용자 로그인 정보를 삭제하시겠습니까?')) {
      try {
        await clearUserLoginCollection();
        await refreshLoginCollectionUserList();
        alert('모든 사용자 로그인 정보가 삭제되었습니다.');
      } catch (error) {
        console.error('로그인 컬렉션 삭제 실패:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleLoginCollectionRemove = async (userId: string) => {
    if (window.confirm('이 사용자의 로그인 정보를 삭제하시겠습니까?')) {
      try {
        await removeUserFromLoginCollection(userId);
        await refreshLoginCollectionUserList();
        alert('사용자 로그인 정보가 삭제되었습니다.');
      } catch (error) {
        console.error('사용자 로그인 정보 삭제 실패:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleLoginCollectionForceLogout = async (userId: string) => {
    if (window.confirm('이 사용자를 강제 로그아웃 시키시겠습니까?')) {
      try {
        await removeUserFromLoginCollection(userId);
        await refreshLoginCollectionUserList();
        alert('사용자가 강제 로그아웃되었습니다.');
      } catch (error) {
        console.error('강제 로그아웃 실패:', error);
        alert('강제 로그아웃 중 오류가 발생했습니다.');
      }
    }
  };

  const handleUserStatusChange = async (userId: string, newStatus: 'active' | 'blocked') => {
    try {
      await axios.put(`${getApiBaseUrl()}/users/${userId}/status`, { status: newStatus });
      await fetchUsers();
      alert(`사용자 상태가 ${newStatus === 'active' ? '활성' : '차단'}으로 변경되었습니다.`);
    } catch (error) {
      console.error('사용자 상태 변경 실패:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      await axios.put(`${getApiBaseUrl()}/users/${userId}/role`, { role: newRole });
      await fetchUsers();
      alert(`사용자 권한이 ${newRole}로 변경되었습니다.`);
    } catch (error) {
      console.error('사용자 권한 변경 실패:', error);
      alert('권한 변경 중 오류가 발생했습니다.');
    }
  };

  const handlePermissionChange = (projectId: number, newPermission: string) => {
    setProjectPermissions(prev => 
      prev.map(project => 
        project.id === projectId 
          ? { ...project, permission: newPermission }
          : project
      )
    );
  };

  const handleSavePermissions = () => {
    alert('프로젝트 권한 설정이 저장되었습니다.');
  };

  const handleNoticeSubmit = () => {
    if (noticeTitle) {
      alert(`공지사항 "${noticeTitle}"이(가) 모든 사용자에게 발송되었습니다.`);
    } else {
      alert('공지사항 제목을 입력해주세요.');
    }
  };

  const handleDeleteNotice = (noticeId: number) => {
    if (window.confirm('이 공지사항을 삭제하시겠습니까?')) {
      setRegisteredNotices(prevNotices => 
        prevNotices.filter(notice => notice.id !== noticeId)
      );
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
          
          <div className="w-full overflow-x-auto">
            <table className="w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">사용자</th>
                  <th className="py-2 px-4 border-b text-left">이메일</th>
                  <th className="py-2 px-4 border-b text-left">권한</th>
                  <th className="py-2 px-4 border-b text-left">상태</th>
                  <th className="py-2 px-4 border-b text-left">작업</th>
                </tr>
              </thead>
              <tbody>
                {users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage).map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.uavatar || '/default-avatar.png'} 
                          alt="Avatar" 
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-medium">{user.uname || user.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b text-sm text-gray-600">{user.uemail}</td>
                    <td className="py-2 px-4 border-b">
                      <select 
                        value={user.urole} 
                        onChange={(e) => handleUserRoleChange(user.uid, e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="user">사용자</option>
                        <option value="admin">관리자</option>
                        <option value="editor">편집자</option>
                      </select>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? '활성' : '차단'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button 
                        onClick={() => handleUserStatusChange(user.uid, user.status === 'active' ? 'blocked' : 'active')}
                        className={`px-2 py-1 text-xs rounded ${
                          user.status === 'active' 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {user.status === 'active' ? '차단' : '활성화'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: Math.ceil(users.length / usersPerPage) }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* 프로젝트 권한 설정 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
              <i className="fas fa-project-diagram"></i>
            </div>
            <div className="text-xl font-semibold text-gray-800">프로젝트 권한 설정</div>
          </div>
          
          <div className="space-y-4">
            {projectPermissions.map((project) => (
              <div key={project.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-800">{project.name}</h3>
                  <select 
                    value={project.permission}
                    onChange={(e) => handlePermissionChange(project.id, e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="admin">관리자</option>
                    <option value="editor">편집자</option>
                    <option value="viewer">뷰어</option>
                  </select>
                </div>
                <div className="text-sm text-gray-500">
                  문서: {project.documents}개 | 멤버: {project.members}명
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={handleSavePermissions}
            className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            권한 설정 저장
          </button>
        </div>
      </div>

      {/* 시스템 현황 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="text-xl font-semibold text-gray-800">시스템 현황</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <h3 className="font-medium text-gray-800 mb-3">시스템 경고</h3>
            <div className="space-y-2">
              {systemWarnings.map((warning) => (
                <div key={warning.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                  <div className="text-sm text-yellow-800">{warning.message}</div>
                  <div className="text-xs text-yellow-600 mt-1">{warning.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-3">리소스 사용률</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU</span>
                  <span>65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>메모리</span>
                  <span>78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>디스크</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI 연동 설정 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center">
            <i className="fas fa-robot"></i>
          </div>
          <div className="text-xl font-semibold text-gray-800">AI 연동 설정</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {modelQuotas.map((model) => (
            <div key={model.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-800">{model.name}</h3>
                <span className="text-sm text-gray-500">{model.used}/{model.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="h-2 rounded-full" 
                  style={{ 
                    width: `${(model.used / model.total) * 100}%`,
                    backgroundColor: model.color 
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                사용률: {Math.round((model.used / model.total) * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 공지사항 등록 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center">
            <i className="fas fa-bullhorn"></i>
          </div>
          <div className="text-xl font-semibold text-gray-800">공지사항 등록</div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">공지사항 제목</label>
              <input
                type="text"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="공지사항 제목을 입력하세요"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">공지사항 내용</label>
              <textarea
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="공지사항 내용을 입력하세요"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">공지 유형</label>
                <select
                  value={noticeType}
                  onChange={(e) => setNoticeType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="info">정보</option>
                  <option value="warning">경고</option>
                  <option value="urgent">긴급</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">게시 시작일</label>
                <input
                  type="datetime-local"
                  value={noticeStartDate}
                  onChange={(e) => setNoticeStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">게시 종료일</label>
                <input
                  type="datetime-local"
                  value={noticeEndDate}
                  onChange={(e) => setNoticeEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <button 
              onClick={handleNoticeSubmit}
              className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              공지사항 발송
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveNoticeTab('preview')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeNoticeTab === 'preview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                미리보기
              </button>
              <button
                onClick={() => setActiveNoticeTab('registered')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeNoticeTab === 'registered'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                등록된 공지사항
              </button>
            </div>
            
            {activeNoticeTab === 'preview' ? (
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    noticeType === 'urgent' ? 'bg-red-100 text-red-800' :
                    noticeType === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {noticeType === 'urgent' ? '긴급' : noticeType === 'warning' ? '경고' : '정보'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date().toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  {noticeTitle || '공지사항 제목'}
                </h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {noticeContent || '공지사항 내용이 여기에 표시됩니다.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">게시기간</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등록일</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {registeredNotices.map((notice) => (
                        <tr key={notice.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{notice.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{notice.content}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              notice.type === 'urgent' ? 'bg-red-100 text-red-800' :
                              notice.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {notice.type === 'urgent' ? '긴급' : notice.type === 'warning' ? '경고' : '정보'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              notice.status === 'active' ? 'bg-green-100 text-green-800' :
                              notice.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {notice.status === 'active' ? '활성' : notice.status === 'expired' ? '만료' : '비활성'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            <div>{new Date(notice.startDate).toLocaleDateString('ko-KR')}</div>
                            <div>~ {new Date(notice.endDate).toLocaleDateString('ko-KR')}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDeleteNotice(notice.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                              title="공지사항 삭제"
                            >
                              <i className="fas fa-trash-alt mr-1"></i>
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {registeredNotices.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    등록된 공지사항이 없습니다.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 사용자 로그인 현황 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center">
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
                  <th className="py-2 px-4 border-b text-left">작업</th>
                </tr>
              </thead>
              <tbody>
                {loginCollectionUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar || '/default-avatar.png'} 
                          alt="Avatar" 
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b text-sm text-gray-600">{user.email}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? '관리자' : '사용자'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b text-sm text-gray-600">{user.loginTime}</td>
                    <td className="py-2 px-4 border-b text-sm text-gray-600">{user.lastActive}</td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleLoginCollectionRemove(user.id)}
                          className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
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