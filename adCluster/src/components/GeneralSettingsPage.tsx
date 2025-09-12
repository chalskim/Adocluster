import React, { useState, useEffect } from 'react';
import { fetchCurrentUser, updateUserProfile } from '../services/api';

interface NotificationSetting {
  id: string;
  label: string;
  enabled: boolean;
}

interface ActivityItem {
  id: number;
  icon: string;
  iconColor: string;
  text: string;
  time: string;
}

// Define the user profile interface
interface UserProfile {
  name: string;
  email: string;
  password: string;
}

// Define the server user interface
interface ServerUser {
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

const GeneralSettingsPage: React.FC = () => {
  // Profile state
  const [profileName, setProfileName] = useState<string>('');
  const [profileEmail, setProfileEmail] = useState<string>('');
  const [profilePassword, setProfilePassword] = useState<string>('••••••••');
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Theme state
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');

  // Language state
  const [selectedLanguage, setSelectedLanguage] = useState<string>('한국어');
  const languages = ['한국어', 'English', '日本語', '中文'];

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { id: 'email', label: '이메일 알림', enabled: true },
    { id: 'push', label: '푸시 알림', enabled: true },
    { id: 'project', label: '프로젝트 업데이트', enabled: true },
    { id: 'comments', label: '댓글 및 멘션', enabled: false }
  ]);

  // Share settings
  const [selectedShareOption, setSelectedShareOption] = useState<string>('팀원만');
  const shareOptions = [
    { title: '팀원만', description: '프로젝트 팀원만 접근 가능' },
    { title: '회사 전체', description: '회사 내 모든 직원 접근 가능' },
    { title: '비공개', description: '나만 접근 가능' }
  ];

  // Activity history
  const activityItems: ActivityItem[] = [
    {
      id: 1,
      icon: 'fas fa-edit',
      iconColor: '#27ae60',
      text: '"웹사이트 리디자인" 프로젝트 문서 편집',
      time: '2시간 전'
    },
    {
      id: 2,
      icon: 'fas fa-comment',
      iconColor: '#3498db',
      text: '이디자인님의 댓글에 답글 작성',
      time: '5시간 전'
    },
    {
      id: 3,
      icon: 'fas fa-share-alt',
      iconColor: '#f39c12',
      text: '"모바일 앱 개발" 프로젝트 공유',
      time: '1일 전'
    }
  ];

  // Fetch user profile data from the server
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingProfile(true);
        
        // Fetch user data from the server
        const serverUser = await fetchCurrentUser();
        
        // Check if serverUser is null
        if (!serverUser) {
          throw new Error('사용자 정보를 가져올 수 없습니다.');
        }
        
        // Convert server user data to user profile format
        const userData: UserProfile = {
          name: serverUser.uname, // Use the actual user name from server
          email: serverUser.uemail,
          password: '••••••••' // Password is not returned from server for security reasons
        };
        
        setProfileName(userData.name);
        setProfileEmail(userData.email);
        setProfilePassword(userData.password);
        setProfileError(null);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setProfileError('프로필 정보를 불러오는데 실패했습니다.');
        // Set default values if API fails
        setProfileName('사용자');
        setProfileEmail('user@example.com');
        setProfilePassword('••••••••');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Toggle notification setting
  const toggleNotification = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, enabled: !notification.enabled } 
        : notification
    ));
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      // 사용자 프로필 업데이트 API 호출
      const userData = {
        uname: profileName,
        upassword: profilePassword !== '••••••••' ? profilePassword : undefined
      };
      
      await updateUserProfile(userData);
      
      alert('개인 정보가 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      alert('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // Handle notification save
  const handleNotificationSave = () => {
    alert('알림 설정이 저장되었습니다.');
  };

  // Handle theme/language apply
  const handleSettingsApply = () => {
    alert(`테마가 ${selectedTheme === 'dark' ? '다크' : '라이트'} 모드로 변경되었습니다.\n${selectedLanguage}로 언어가 변경되었습니다.`);
  };

  // Handle profile image click
  const handleProfileImageClick = () => {
    alert('프로필 이미지 변경 기능이 실행됩니다.');
  };

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-5">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">⚙️ 일반 설정</h1>
        <p className="text-gray-500">개인 정보, 알림, 화면 설정 등을 관리할 수 있습니다</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* 개인정보 관리 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <i className="fas fa-user"></i>
            </div>
            <div className="text-xl font-semibold text-gray-800">개인정보 관리</div>
          </div>
          
          {loadingProfile ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : profileError ? (
            <div className="text-red-500 text-center py-4">{profileError}</div>
          ) : (
            <>
              <div className="flex items-center gap-5 mb-6">
                <div 
                  className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-semibold cursor-pointer relative"
                  onClick={handleProfileImageClick}
                >
                  {profileName.charAt(0)}
                  <div className="absolute bottom-0 right-0 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm">
                    ✏️
                  </div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-gray-800 mb-1">{profileName}</div>
                  <div className="text-gray-500 mb-4">{profileEmail}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">이름</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={profileName}
                  onChange={(e) => {
                    setProfileName(e.target.value);
                  }}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">비밀번호</label>
                <input 
                  type="password" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                />
              </div>
              
              <button 
                className="px-5 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                onClick={handleProfileUpdate}
              >
                <i className="fas fa-save"></i> 정보 업데이트
              </button>
            </>
          )}
        </div>

        {/* 알림 설정 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <i className="fas fa-bell"></i>
            </div>
            <div className="text-xl font-semibold text-gray-800">알림 설정</div>
          </div>
          
          <div className="mt-2">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                <div className="font-medium text-gray-700">{notification.label}</div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={notification.enabled}
                    onChange={() => toggleNotification(notification.id)}
                  />
                  <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            ))}
          </div>
          
          <button 
            className="px-5 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mt-5"
            onClick={handleNotificationSave}
          >
            <i className="fas fa-save"></i> 알림 설정 저장
          </button>
        </div>

        {/* 화면 및 언어 설정 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <i className="fas fa-desktop"></i>
            </div>
            <div className="text-xl font-semibold text-gray-800">화면 및 언어 설정</div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">테마</label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div 
                className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
                  selectedTheme === 'light' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => setSelectedTheme('light')}
              >
                <div className="h-15 bg-white border border-gray-300 rounded mb-2 flex items-center justify-center text-xs text-gray-700">
                  밝은 테마
                </div>
                <div>라이트</div>
              </div>
              <div 
                className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
                  selectedTheme === 'dark' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => setSelectedTheme('dark')}
              >
                <div className="h-15 bg-gray-700 rounded mb-2 flex items-center justify-center text-xs text-white">
                  어두운 테마
                </div>
                <div>다크</div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">언어</label>
            <div className="flex flex-wrap gap-3 mt-2">
              {languages.map((language) => (
                <div 
                  key={language}
                  className={`px-5 py-2.5 border-2 rounded-full cursor-pointer transition-all ${
                    selectedLanguage === language 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                  onClick={() => setSelectedLanguage(language)}
                >
                  {language}
                </div>
              ))}
            </div>
          </div>
          
          <button 
            className="px-5 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            onClick={handleSettingsApply}
          >
            <i className="fas fa-sync-alt"></i> 설정 적용
          </button>
        </div>

        {/* 공유 및 활동 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <i className="fas fa-share-alt"></i>
            </div>
            <div className="text-xl font-semibold text-gray-800">공유 및 활동</div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">기본 공유 범위</label>
            <div className="space-y-3">
              {shareOptions.map((option, index) => (
                <div 
                  key={index}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedShareOption === option.title 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedShareOption(option.title)}
                >
                  <div className="font-semibold text-gray-800 mb-1">{option.title}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">최근 작업 내역</label>
            <ul className="space-y-3 mt-2">
              {activityItems.map((item) => (
                <li key={item.id} className="flex gap-3 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                  <div 
                    className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs flex-shrink-0"
                    style={{ backgroundColor: item.iconColor }}
                  >
                    <i className={item.icon}></i>
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-800 mb-1">{item.text}</div>
                    <div className="text-xs text-gray-500">{item.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsPage;