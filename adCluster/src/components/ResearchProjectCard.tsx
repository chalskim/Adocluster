import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ResearchProjectCardProps {
  title: string;
  description: string;
  date: string;
  documents: string;
  collaborators: string[];
  projectId?: string;
  status?: 'in_progress' | 'completed' | 'on_hold' | 'planning';
  progress?: number;
  thumbnail?: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
}

const ResearchProjectCard: React.FC<ResearchProjectCardProps> = ({ 
  title, 
  description, 
  date, 
  documents, 
  collaborators, 
  projectId,
  status = 'in_progress',
  progress = 0,
  thumbnail,
  category = '일반 연구',
  priority = 'medium'
}) => {
  const navigate = useNavigate();
  
  // 프로젝트가 이미 열려있는지 확인
  const isProjectOpen = React.useMemo(() => {
    if (!projectId) return false;
    
    const projectTabKey = `project-tab-${projectId}`;
    const existingTabInfo = localStorage.getItem(projectTabKey);
    
    if (existingTabInfo) {
      try {
        const tabInfo = JSON.parse(existingTabInfo);
        const currentTime = new Date().getTime();
        
        // 5분 이내에 열린 탭인지 확인
        if (currentTime - tabInfo.timestamp < 5 * 60 * 1000) {
          return true;
        }
      } catch (e) {
        // 파싱 오류 시 localStorage 항목 제거
        localStorage.removeItem(`project-tab-${projectId}`);
      }
    }
    
    return false;
  }, [projectId]);

  const handleOpenProject = () => {
    if (projectId) {
      // 프로젝트 탭 재사용을 위한 키 생성
      const projectTabKey = `project-tab-${projectId}`;
      
      // 현재 열려있는 프로젝트 탭이 있는지 확인
      const existingTabInfo = localStorage.getItem(projectTabKey);
      
      if (existingTabInfo) {
        try {
          const tabInfo = JSON.parse(existingTabInfo);
          const currentTime = new Date().getTime();
          
          // 5분 이내에 열린 탭인지 확인 (세션 만료 방지)
          if (currentTime - tabInfo.timestamp < 5 * 60 * 1000) {
            // 기존 탭이 존재하면 사용자에게 알림
            const userChoice = window.confirm(
              '이 프로젝트는 이미 열려있는 탭이 있습니다.\n\n' +
              '확인(OK): 기존 탭으로 이동하려면 브라우저에서 해당 탭을 수동으로 선택해주세요.\n' +
              '취소(Cancel): 새 탭에서 프로젝트를 열겠습니다.\n\n' +
              '계속 진행하시겠습니까?'
            );
            
            // 사용자가 취소를 선택하면 새 탭에서 열기
            if (!userChoice) {
              const newWindow = window.open(`/editor?hideSidebar=false&projectId=${projectId}`, '_blank');
              if (newWindow) {
                newWindow.focus();
              }
            }
            return;
          } else {
            // 탭 정보가 오래된 경우 localStorage에서 제거
            localStorage.removeItem(projectTabKey);
          }
        } catch (e) {
          // 파싱 오류 시 localStorage 항목 제거
          localStorage.removeItem(projectTabKey);
        }
      }
      
      // 새 탭에서 프로젝트 열기
      const newWindow = window.open(`/editor?hideSidebar=false&projectId=${projectId}`, '_blank');
      if (newWindow) {
        newWindow.focus();
      }
    } else {
      // 프로젝트 ID가 없는 경우 기본 프로젝트 ID로 에디터 페이지 새 탭에서 열기
      const newWindow = window.open('/editor?hideSidebar=false&projectId=d7d72d7c-5f24-474d-9dab-f5b6880bed04', '_blank');
      if (newWindow) {
        newWindow.focus();
      }
    }
  };
  // 상태별 색상 및 텍스트 정의
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: '완료',
          icon: 'fas fa-check-circle'
        };
      case 'on_hold':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          text: '보류',
          icon: 'fas fa-pause-circle'
        };
      case 'planning':
        return {
          color: 'bg-purple-500',
          textColor: 'text-purple-700',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          text: '기획',
          icon: 'fas fa-lightbulb'
        };
      default: // in_progress
        return {
          color: 'bg-blue-500',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          text: '진행중',
          icon: 'fas fa-play-circle'
        };
    }
  };

  // 우선순위별 색상 정의
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: '높음',
          icon: 'fas fa-exclamation-triangle'
        };
      case 'low':
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: '낮음',
          icon: 'fas fa-minus-circle'
        };
      default: // medium
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          text: '보통',
          icon: 'fas fa-circle'
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const priorityConfig = getPriorityConfig(priority);

  return (
    <div className={`research-project-card border ${statusConfig.borderColor} rounded-lg p-3 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg bg-white relative overflow-hidden group ${isProjectOpen ? 'ring-2 ring-blue-500' : ''}`}>
      {/* 컴팩트 헤더 - 상태와 우선순위를 한 줄에 */}
      <div className="flex justify-between items-center mb-2">
        <div className={`${statusConfig.color} text-white px-2 py-1 rounded text-xs font-medium flex items-center`}>
          <i className={`${statusConfig.icon} mr-1 text-xs`}></i>
          {statusConfig.text}
        </div>
        <div className="flex items-center">
          {isProjectOpen && (
            <div className="mr-2" title="이 프로젝트는 이미 열려있는 탭이 있습니다">
              <i className="fas fa-external-link-alt text-blue-500"></i>
            </div>
          )}
          <div className={`${priorityConfig.bgColor} ${priorityConfig.color} px-2 py-1 rounded text-xs font-medium`}>
            {priorityConfig.text}
          </div>
        </div>
      </div>

      {/* 프로젝트 정보 */}
      <div className="project-info">
        {/* 제목 */}
        <h3 className="project-title text-sm font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
          {title}
        </h3>

        {/* 설명 - 1줄로 고정 */}
        <p className="project-desc text-gray-600 text-xs mb-2 leading-relaxed truncate">
          {description}
        </p>

        {/* 진행률 바 - 더 양게 */}
        <div className="progress-section mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">진행률</span>
            <span className="text-xs font-medium text-gray-800">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`${statusConfig.color} h-1.5 rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* 메타 정보 - 한 줄로 압축 */}
        <div className="project-meta flex justify-between items-center text-gray-500 text-xs mb-2">
          <div className="flex items-center">
            <i className="fas fa-calendar-alt mr-1"></i>
            <span className="truncate">{date}</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-file-alt mr-1"></i>
            <span>{documents}</span>
          </div>
        </div>

        {/* 협업자와 액션 버튼 */}
        <div className="collaborators flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex -space-x-1">
              {collaborators.slice(0, 2).map((initial, index) => (
                <div 
                  key={`collaborator-${initial}-${index}`} 
                  className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold border border-white shadow-sm"
                  title={`협업자 ${initial}`}
                >
                  {initial}
                </div>
              ))}
              {collaborators.length > 2 && (
                <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-semibold border border-white shadow-sm">
                  +{collaborators.length - 2}
                </div>
              )}
            </div>
          </div>

          {/* 액션 버튼 - 더 작게 */}
          <div className="project-actions flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={handleOpenProject}
              className={`action-btn ${isProjectOpen ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'} text-white px-2 py-1 rounded text-xs transition-colors`}
              title={isProjectOpen ? "프로젝트 열기 (이미 열려있는 탭이 있습니다)" : "프로젝트 열기"}
            >
              <i className="fas fa-external-link-alt"></i>
            </button>
            <button 
              className="action-btn bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors"
              title="더 많은 옵션"
            >
              <i className="fas fa-ellipsis-h"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 호버 효과를 위한 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-transparent group-hover:from-blue-50/20 group-hover:to-transparent transition-all duration-300 pointer-events-none rounded-lg"></div>
    </div>
  );
};

export default ResearchProjectCard;