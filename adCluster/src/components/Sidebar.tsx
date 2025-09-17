import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  path: string;
}

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string>('dashboard');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // 현재 경로에 따라 활성 메뉴 설정
    const currentPath = location.pathname;
    const currentMenuItem = baseMenuItems.find(item => item.path === currentPath) || 
                           adminMenuItems.find(item => item.path === currentPath);
    if (currentMenuItem) {
      setActiveItem(currentMenuItem.id);
    }

    // 관리자 권한 확인
    const checkAdminStatus = () => {
      const userRole = localStorage.getItem('userRole');
      setIsAdmin(userRole === 'admin');
    };

    checkAdminStatus();

    // Add event listener to detect changes in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userRole') {
        checkAdminStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    // 화면 크기 변화 감지
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 1024);
    };

    // 초기 화면 크기 확인
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [location]);

  // 기본 메뉴 아이템 - 연구 중심으로 재편
  const baseMenuItems: MenuItem[] = [
    // 연구 핵심 메뉴
    { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: '연구 대시보드', path: '/dashboard' },
    { id: 'projects', icon: 'fas fa-project-diagram', label: '연구 프로젝트 관리', path: '/projects' },
    { id: 'calendar-management', icon: 'fas fa-calendar-alt', label: '연구 일정 관리', path: '/calendar-management' },
    
    // 연구 자료 관리
    { id: 'document-management', icon: 'fas fa-folder-open', label: '연구노트 관리', path: '/document-management' },
    { id: 'data-management', icon: 'fas fa-database', label: '자료 관리', path: '/data-management' },
    { id: 'source-management', icon: 'fas fa-bookmark', label: '출처 관리', path: '/source-management' },
    
    // 연구 협업 및 소통
    { id: 'message-management', icon: 'fas fa-envelope', label: '연구팀 소통', path: '/message-management' },
    
    // 연구 도구
    { id: 'search', icon: 'fas fa-external-link-alt', label: '외부 문서 관리', path: '/search' },
    { id: 'import-export', icon: 'fas fa-file-export', label: '가져오기/내보내기', path: '/import-export' },
    
    // 시스템 설정
    { id: 'general-settings', icon: 'fas fa-cog', label: '일반 설정', path: '/general-settings' },
  ];
  
  // 관리자 메뉴 아이템
  const adminMenuItems: MenuItem[] = [
    { id: 'admin-settings', icon: 'fas fa-user-shield', label: '관리자 설정', path: '/admin-settings' },
  ];
  
  // 관리자인 경우에만 관리자 설정 메뉴 추가
  const menuItems: MenuItem[] = isAdmin ? [...baseMenuItems, ...adminMenuItems] : baseMenuItems;

  const handleMenuClick = (item: MenuItem) => {
    setActiveItem(item.id);
    navigate(item.path);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-gray-800 to-gray-900 text-white h-screen fixed overflow-y-auto shadow-lg transition-all duration-300`}>
      <div className="logo p-5 text-center border-b border-gray-700">
        <h1 className={`text-xl font-semibold ${isCollapsed ? 'hidden' : 'block'}`}>
          AD<span className="text-blue-500">Cluster</span>
        </h1>
        {isCollapsed && (
          <div className="text-blue-500 text-xl font-bold">AD</div>
        )}
      </div>
      <div className="menu py-4">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`menu-item p-4 flex items-center cursor-pointer transition-all duration-300 border-l-4 ${
              activeItem === item.id
                ? 'bg-blue-900 bg-opacity-20 border-blue-500'
                : 'border-transparent hover:bg-gray-700 hover:bg-opacity-50'
            } ${isCollapsed ? 'justify-center' : ''}`}
            onClick={() => handleMenuClick(item)}
            title={isCollapsed ? item.label : ''}
          >
            <i className={`${item.icon} text-lg w-5 text-center ${isCollapsed ? '' : 'mr-3'}`}></i>
            <span className={isCollapsed ? 'hidden' : 'block'}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;