import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiBaseUrl, getAuthHeaders, fetchCurrentUser } from '../services/api';

interface Member {
  id: number;
  name: string;
  email: string;
}

interface ProjectData {
  prjID: string;
  title: string;
  description: string;
  visibility: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  update_at: string;
}

const ProjectSetting: React.FC = () => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [defaultPermission, setDefaultPermission] = useState('write');
  const [inviteMessage, setInviteMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [folders, setFolders] = useState({
    documents: true,
    design: true,
    development: false,
    meetings: true,
    resources: false
  });
  const [sampleDocs, setSampleDocs] = useState({
    plan: true,
    requirements: false,
    meeting: true
  });
  const [template, setTemplate] = useState('default');
  const [visibility, setVisibility] = useState('company');
  const [notifications, setNotifications] = useState({
    edit: true,
    comment: true,
    invite: false
  });
  const [language, setLanguage] = useState('ko');
  const [timezone, setTimezone] = useState('Asia/Seoul');
  const [aiModel, setAiModel] = useState('default');
  const [webhook, setWebhook] = useState('');
  // Add state for logged-in user
  const [loggedInUser, setLoggedInUser] = useState({ name: '김개발', email: 'kim.dev@example.com' });
  const [loading, setLoading] = useState(false);
  
  // Collapsible states - default to collapsed (true)
  const [isInitialStructureCollapsed, setIsInitialStructureCollapsed] = useState(true);
  const [isProjectSettingsCollapsed, setIsProjectSettingsCollapsed] = useState(true);
  const [isAdvancedSettingsCollapsed, setIsAdvancedSettingsCollapsed] = useState(true);

  // Set today's date as default for startDate
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setStartDate(formattedDate);
  }, []);

  const availableMembers: Member[] = [
    { id: 1, name: '이디자인', email: 'lee.design@example.com' },
    { id: 2, name: '박매니저', email: 'park.manager@example.com' },
    { id: 3, name: '최분석', email: 'choi.analyst@example.com' },
    { id: 4, name: '정연구', email: 'jung.research@example.com' }
  ];

  const addMember = () => {
    if (selectedMember) {
      const member = availableMembers.find(m => 
        `${m.name} (${m.email})` === selectedMember
      );
      
      if (member && !members.find(m => m.email === member.email)) {
        setMembers([...members, member]);
        setSelectedMember('');
      }
    }
  };

  const removeMember = (email: string) => {
    setMembers(members.filter(member => member.email !== email));
  };

  const handleFolderChange = (folder: string) => {
    setFolders({
      ...folders,
      [folder]: !folders[folder as keyof typeof folders]
    });
  };

  const handleSampleDocChange = (doc: string) => {
    setSampleDocs({
      ...sampleDocs,
      [doc]: !sampleDocs[doc as keyof typeof sampleDocs]
    });
  };

  const handleNotificationChange = (notification: string) => {
    setNotifications({
      ...notifications,
      [notification]: !notifications[notification as keyof typeof notifications]
    });
  };

  const createProject = async (): Promise<ProjectData | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiBaseUrl()}/api/projects/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: projectName,
          description: projectDescription,
          visibility: visibility,
          start_date: startDate,
          end_date: endDate || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '프로젝트 생성에 실패했습니다.');
      }

      const projectData: ProjectData = await response.json();
      return projectData;
    } catch (error) {
      console.error('프로젝트 생성 오류:', error);
      alert(`프로젝트 생성 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      alert('프로젝트 이름을 입력해주세요.');
      return;
    }
    
    if (!startDate) {
      alert('시작일을 입력해주세요.');
      return;
    }
    
    // 프로젝트 생성
    const projectData = await createProject();
    
    // Debugging: Log the projectData to see what we received
    console.log('Project data received:', projectData);
    
    if (projectData) {
      // Get current user information
      const currentUser = await fetchCurrentUser();
      
      // Extract project ID - try multiple possible field names
      const projectId = projectData.prjID || projectData.prjid || projectData.id;
      
      // Debugging: Log the projectId to see if it exists
      console.log('Project ID:', projectId);
      
      // Check if we have a valid project ID
      if (!projectId) {
        console.error('Project ID is undefined or null');
        alert('프로젝트 생성 후 ID를 가져오는 중 오류가 발생했습니다.');
        return;
      }
      
      // 프로젝트 생성 성공 시 에디터 페이지로 이동하면서 프로젝트 정보 전달
      // 프로젝트 ID를 쿼리 파라미터로 전달
      navigate(`/editor?hideSidebar=false&projectId=${projectId}`, {
        state: { 
          project: projectData,
          user: currentUser
        }
      });
    } else {
      console.log('Project creation failed or returned null');
    }
  };

  const handleCancel = () => {
    if (window.confirm('프로젝트 생성을 취소하시겠습니까?')) {
      // Reset form
      setProjectName('');
      setProjectDescription('');
      setMembers([]);
      setDefaultPermission('write');
      setInviteMessage('');
      setStartDate('');
      setEndDate('');
      setFolders({
        documents: true,
        design: true,
        development: false,
        meetings: true,
        resources: false
      });
      setSampleDocs({
        plan: true,
        requirements: false,
        meeting: true
      });
      setTemplate('default');
      setVisibility('company');
      setNotifications({
        edit: true,
        comment: true,
        invite: false
      });
      setLanguage('ko');
      setTimezone('Asia/Seoul');
      setAiModel('default');
      setWebhook('');
      setSelectedMember('');
    }
  };

  // Toggle functions for collapsible sections
  const toggleInitialStructure = () => {
    setIsInitialStructureCollapsed(!isInitialStructureCollapsed);
  };

  const toggleProjectSettings = () => {
    setIsProjectSettingsCollapsed(!isProjectSettingsCollapsed);
  };

  const toggleAdvancedSettings = () => {
    setIsAdvancedSettingsCollapsed(!isAdvancedSettingsCollapsed);
  };

  return (
    <div className="project-setting bg-gray-100 p-5 min-h-screen">
      <div className="modal-content bg-white rounded-lg w-full max-w-6xl mx-auto">
        <div className="modal-header p-5 border-b border-gray-200 flex justify-between items-center">
          <div className="modal-title text-xl font-semibold text-gray-800">새 프로젝트 생성</div>
        </div>
        <div className="modal-body p-6">
          <form id="projectForm" onSubmit={handleSubmit}>
            {/* 프로젝트 기본 정보 */}
            <div className="section mb-8">
              <div className="section-header flex items-center gap-3 mb-5 pb-3 border-b-2 border-blue-500">
                <div className="section-icon w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                  <i className="fas fa-info-circle"></i>
                </div>
                <div className="section-title text-lg font-semibold text-gray-800">프로젝트 기본 정보</div>
              </div>
              
              <div className="form-group mb-5">
                <label className="form-label block mb-2 font-semibold text-gray-800">
                  프로젝트 이름 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className="form-control w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  name="projectName" 
                  placeholder="프로젝트 이름을 입력하세요" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group mb-5">
                <label className="form-label block mb-2 font-semibold text-gray-800">프로젝트 설명</label>
                <textarea 
                  className="form-control w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors min-h-[100px] resize-y"
                  name="projectDescription" 
                  placeholder="프로젝트의 목적과 범위를 간단히 설명해주세요"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  disabled={loading}
                ></textarea>
              </div>
            </div>

            {/* 멤버 및 권한 설정 */}
            <div className="section mb-8">
              <div className="section-header flex items-center gap-3 mb-5 pb-3 border-b-2 border-blue-500">
                <div className="section-icon w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                  <i className="fas fa-users"></i>
                </div>
                <div className="section-title text-lg font-semibold text-gray-800">멤버 및 권한 설정</div>
              </div>
              
              <div className="form-group mb-5">
                <label className="form-label block mb-2 font-semibold text-gray-800">프로젝트 소유자</label>
                <input 
                  type="text" 
                  className="form-control w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                  value={`${loggedInUser.name} (${loggedInUser.email})`} 
                  readOnly
                  disabled={loading}
                />
                <input type="hidden" name="projectOwner" value={loggedInUser.email} />
              </div>
              
              <div className="form-group mb-5">
                <label className="form-label block mb-2 font-semibold text-gray-800">초기 멤버 추가</label>
                <div className="member-input-area flex gap-3 mb-4">
                  <select 
                    className="form-control flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors appearance-none bg-no-repeat bg-right-center"
                    style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")", backgroundSize: '16px', paddingRight: '40px' }}
                    id="memberSelect"
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">멤버를 선택하세요</option>
                    {availableMembers.map(member => (
                      <option key={member.id} value={`${member.name} (${member.email})`}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                  <button 
                    className="add-member-btn px-5 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                    type="button"
                    onClick={addMember}
                    disabled={loading}
                  >
                    <i className="fas fa-plus mr-2"></i> 추가
                  </button>
                </div>
                <div className="member-tags flex flex-wrap gap-3 mt-3">
                  {members.map(member => (
                    <div key={member.email} className="member-tag bg-blue-50 border border-blue-200 rounded-full px-4 py-2 flex items-center gap-2">
                      {member.name}
                      <button 
                        className="remove-member w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100 text-red-500"
                        type="button"
                        onClick={() => removeMember(member.email)}
                        disabled={loading}
                      >
                        &times;
                      </button>
                      <input type="hidden" name="members" value={member.email} />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-group mb-5">
                <label className="form-label block mb-2 font-semibold text-gray-800">
                  시작일 <span className="text-red-500">*</span> ~ 종료일
                </label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="date" 
                    className="form-control flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    name="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <span className="flex items-center">~</span>
                  <input 
                    type="date" 
                    className="form-control flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    name="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* 초기 구조 설정 (Collapsible) */}
            <div className="section mb-8">
              <div 
                className="section-header flex items-center gap-3 mb-5 pb-3 border-b-2 border-blue-500 cursor-pointer"
                onClick={toggleInitialStructure}
              >
                <div className="section-icon w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                  <i className="fas fa-folder"></i>
                </div>
                <div className="section-title text-lg font-semibold text-gray-800">초기 구조 설정</div>
                <div className="ml-auto">
                  <i className={`fas ${isInitialStructureCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
                </div>
              </div>
              
              {!isInitialStructureCollapsed && (
                <>
                  <div className="form-group mb-5">
                    <label className="form-label block mb-2 font-semibold text-gray-800">기본 폴더 구조</label>
                    <div className="checkbox-group flex flex-wrap gap-4 mt-3">
                      {Object.entries(folders).map(([key, value]) => {
                        const labels: Record<string, string> = {
                          documents: '문서',
                          design: '디자인',
                          development: '개발',
                          meetings: '회의록',
                          resources: '리소스'
                        };
                        
                        return (
                          <div key={key} className="checkbox-item flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              name="folders" 
                              value={key}
                              checked={value}
                              onChange={() => handleFolderChange(key)}
                              className="w-4 h-4"
                              disabled={loading}
                            />
                            <span>{labels[key]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="form-group mb-5">
                    <label className="form-label block mb-2 font-semibold text-gray-800">템플릿 선택</label>
                    <select 
                      className="form-control w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      name="template"
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                      disabled={loading}
                    >
                      <option value="default">기본 템플릿</option>
                      <option value="web">웹 개발 프로젝트</option>
                      <option value="marketing">마케팅 캠페인</option>
                      <option value="research">연구 프로젝트</option>
                      <option value="app">앱 개발</option>
                    </select>
                  </div>
                  
                  <div className="form-group mb-5">
                    <label className="form-label block mb-2 font-semibold text-gray-800">샘플 문서</label>
                    <div className="checkbox-group flex flex-wrap gap-4 mt-3">
                      {Object.entries(sampleDocs).map(([key, value]) => {
                        const labels: Record<string, string> = {
                          plan: '프로젝트 계획서',
                          requirements: '요구사항 명세서',
                          meeting: '회의록 템플릿'
                        };
                        
                        return (
                          <div key={key} className="checkbox-item flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              name="sampleDocs" 
                              value={key}
                              checked={value}
                              onChange={() => handleSampleDocChange(key)}
                              className="w-4 h-4"
                              disabled={loading}
                            />
                            <span>{labels[key]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 프로젝트 설정 (Collapsible) */}
            <div className="section mb-8">
              <div 
                className="section-header flex items-center gap-3 mb-5 pb-3 border-b-2 border-blue-500 cursor-pointer"
                onClick={toggleProjectSettings}
              >
                <div className="section-icon w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                  <i className="fas fa-cog"></i>
                </div>
                <div className="section-title text-lg font-semibold text-gray-800">프로젝트 설정</div>
                <div className="ml-auto">
                  <i className={`fas ${isProjectSettingsCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
                </div>
              </div>
              
              {!isProjectSettingsCollapsed && (
                <>
                  <div className="form-group mb-5">
                    <label className="form-label block mb-2 font-semibold text-gray-800">공개 범위</label>
                    <select 
                      className="form-control w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      name="visibility"
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      disabled={loading}
                    >
                      <option value="private">비공개</option>
                      <option value="team">팀원만</option>
                      <option value="company">회사 전체</option>
                      <option value="public">전체 공개</option>
                    </select>
                  </div>
                  
                  <div className="form-group mb-5">
                    <label className="form-label block mb-2 font-semibold text-gray-800">알림 설정</label>
                    <div className="checkbox-group flex flex-wrap gap-4 mt-3">
                      {Object.entries(notifications).map(([key, value]) => {
                        const labels: Record<string, string> = {
                          edit: '문서 편집 알림',
                          comment: '댓글 알림',
                          invite: '멤버 초대 알림'
                        };
                        
                        return (
                          <div key={key} className="checkbox-item flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              name="notifications" 
                              value={key}
                              checked={value}
                              onChange={() => handleNotificationChange(key)}
                              className="w-4 h-4"
                              disabled={loading}
                            />
                            <span>{labels[key]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="form-group mb-5">
                    <label className="form-label block mb-2 font-semibold text-gray-800">언어 설정</label>
                    <select 
                      className="form-control w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      name="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      disabled={loading}
                    >
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>
                  
                  <div className="form-group mb-5">
                    <label className="form-label block mb-2 font-semibold text-gray-800">시간대 설정</label>
                    <select 
                      className="form-control w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      name="timezone"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      disabled={loading}
                    >
                      <option value="Asia/Seoul">Asia/Seoul (UTC+9)</option>
                      <option value="America/New_York">America/New_York (UTC-5)</option>
                      <option value="Europe/London">Europe/London (UTC+0)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* 고급 설정 (Collapsible) */}
            <div className="section mb-8">
              <div 
                className="section-header flex items-center gap-3 mb-5 pb-3 border-b-2 border-blue-500 cursor-pointer"
                onClick={toggleAdvancedSettings}
              >
                <div className="section-icon w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                  <i className="fas fa-tools"></i>
                </div>
                <div className="section-title text-lg font-semibold text-gray-800">고급 설정 (선택사항)</div>
                <div className="ml-auto">
                  <i className={`fas ${isAdvancedSettingsCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
                </div>
              </div>
              
              {!isAdvancedSettingsCollapsed && (
                <>
                  <div className="form-group mb-5">
                    <label className="form-label block mb-2 font-semibold text-gray-800">AI 모델 선택</label>
                    <select 
                      className="form-control w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      name="aiModel"
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      disabled={loading}
                    >
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="claude-3-opus">Claude 3 Opus</option>
                      <option value="gemini-pro">Gemini Pro</option>
                      <option value="default">기본 모델</option>
                    </select>
                  </div>
                  
                  <div className="form-group mb-5">
                    <label className="form-label block mb-2 font-semibold text-gray-800">웹훅 설정</label>
                    <input 
                      type="text" 
                      className="form-control w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      name="webhook" 
                      placeholder="웹훅 URL을 입력하세요"
                      value={webhook}
                      onChange={(e) => setWebhook(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </>
              )}
            </div>
          </form>
        </div>
        <div className="modal-footer p-5 border-t border-gray-200 flex justify-end gap-3">
          <button 
            className="btn btn-secondary px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
            id="cancelBtn" 
            type="button"
            onClick={handleCancel}
            disabled={loading}
          >
            취소
          </button>
          <button 
            className={`btn btn-success px-6 py-3 font-semibold rounded-lg transition-colors flex items-center ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            id="createBtn" 
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                <span className="hidden md:inline">생성 중...</span>
              </>
            ) : (
              <>
                <i className="fas fa-plus-circle mr-2"></i>
                <span className="hidden md:inline">프로젝트 생성</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSetting;