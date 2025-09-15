import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  path: string;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // 로컬 스토리지에서 사용자 역할 확인
    const checkAdminStatus = () => {
      const userRole = localStorage.getItem('userRole');
      // 대소문자 구분 없이 관리자 역할 확인
      const isAdminUser = userRole && userRole.toLowerCase() === 'admin';
      setIsAdmin(!!isAdminUser);
      console.log('Sidebar - User role:', userRole, 'Is admin:', isAdminUser); // 디버깅용 로그
    };
    
    checkAdminStatus();
    
    // 현재 경로에 따라 활성 메뉴 아이템 설정
    const path = location.pathname;
    if (path.includes('dashboard')) setActiveItem('dashboard');
    else if (path.includes('projects')) setActiveItem('projects');
    else if (path.includes('search')) setActiveItem('search');
    else if (path.includes('document-management')) setActiveItem('document-management');
    else if (path.includes('data-management')) setActiveItem('data-management');
    else if (path.includes('references-management')) setActiveItem('references-management');
    else if (path.includes('message-management')) setActiveItem('message-management');
    else if (path.includes('import-export')) setActiveItem('import-export');
    // else if (path.includes('element-editor')) setActiveItem('element-editor'); // 제거
    else if (path.includes('general-settings')) setActiveItem('general-settings');
    else if (path.includes('admin-settings')) setActiveItem('admin-settings');
    
    // Add event listener to detect changes in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userRole') {
        checkAdminStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location]);

  // 기본 메뉴 아이템
  const baseMenuItems: MenuItem[] = [
    { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: '대시보드', path: '/dashboard' },
    { id: 'projects', icon: 'fas fa-project-diagram', label: '프로젝트 관리', path: '/projects' },
    { id: 'search', icon: 'fas fa-search', label: '검색', path: '/search' },
    // 문서 관리 메뉴 추가
    { id: 'document-management', icon: 'fas fa-folder-open', label: '문서 관리', path: '/document-management' },
    { id: 'data-management', icon: 'fas fa-database', label: '자료관리', path: '/data-management' },
    { id: 'references-management', icon: 'fas fa-book', label: '참고문헌 관리', path: '/references-management' },
    { id: 'message-management', icon: 'fas fa-envelope', label: '메세지 관리', path: '/message-management' },
    { id: 'import-export', icon: 'fas fa-file-export', label: '가져오기 / 내보내기', path: '/import-export' },
    // { id: 'element-editor', icon: 'fas fa-edit', label: '요소 편집기', path: '/element-editor' }, // 제거
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
    <div className="sidebar w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white h-screen fixed overflow-y-auto shadow-lg">
      <div className="logo p-5 text-center border-b border-gray-700">
        <h1 className="text-xl font-semibold">
          AD<span className="text-blue-500">Cluster</span>
        </h1>
      </div>
      <div className="menu py-4">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`menu-item p-4 flex items-center cursor-pointer transition-all duration-300 border-l-4 ${
              activeItem === item.id
                ? 'bg-blue-900 bg-opacity-20 border-blue-500'
                : 'border-transparent hover:bg-gray-700 hover:bg-opacity-50'
            }`}
            onClick={() => handleMenuClick(item)}
          >
            <i className={`${item.icon} mr-3 text-lg w-5 text-center`}></i>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;