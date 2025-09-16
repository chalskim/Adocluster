import React, { useState, useEffect } from 'react';
import { fetchProjects, Project } from '../services/api';
import { useCalendar } from '../hooks/useCalendar';

interface KpiCardProps {
  icon: string;
  value: string;
  label: string;
  color: string;
}

interface ProjectCardProps {
  title: string;
  description: string;
  date: string;
  documents: string;
  collaborators: string[];
  projectId?: string;
}

interface ActivityItemProps {
  icon: string;
  color: string;
  text: string;
  time: string;
}

interface NotificationItemProps {
  text: string;
  time: string;
  unread: boolean;
}

interface TodayEventItemProps {
  title: string;
  time: string;
  category: string;
  color: string;
  isAllDay: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, value, label, color }) => (
  <div className="kpi-card bg-white rounded-lg shadow-md p-5 text-center transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
    <div className={`kpi-icon w-12 h-12 rounded-full ${color} text-white flex items-center justify-center mx-auto mb-3 text-xl`}>
      <i className={icon}></i>
    </div>
    <div className="kpi-value text-3xl font-bold text-gray-800 my-2">{value}</div>
    <div className="kpi-label text-gray-600 text-sm">{label}</div>
  </div>
);

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description, date, documents, collaborators, projectId }) => (
  <div className="project-card border border-gray-200 rounded-lg p-5 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md">
    <h3 className="project-title text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="project-desc text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>
    <div className="project-meta flex justify-between text-gray-500 text-xs mb-4">
      <span>{date}</span>
      <span>{documents}</span>
    </div>
    <div className="collaborators flex items-center mb-4">
      {collaborators.map((initial, index) => (
        <div 
          key={`collaborator-${initial}-${index}`} 
          className="avatar w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-[-8px] border-2 border-white"
          style={{ zIndex: collaborators.length - index }}
        >
          {initial}
        </div>
      ))}
    </div>
    <div className="project-actions">
      <a 
        href={`/editor?hideSidebar=false&projectId=${encodeURIComponent(projectId || '')}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!projectId) {
            console.error('Project ID is missing for quick open');
            alert('프로젝트 ID를 찾지 못했습니다. 잠시 후 다시 시도해 주세요.');
            return;
          }
          const url = `/editor?hideSidebar=false&projectId=${encodeURIComponent(projectId)}`;
          const win = window.open(url, 'adcluster-editor');
          if (win) {
            win.focus();
          } else {
            // Pop-up blocked fallback
            window.location.href = url;
          }
        }}
        className="action-btn w-full px-3 py-2 rounded border border-gray-200 bg-white text-sm transition-all duration-300 hover:bg-gray-50 flex items-center justify-center"
      >
        <i className="fas fa-external-link-alt mr-2"></i> 바로가기
      </a>
    </div>
  </div>
);

const ActivityItem: React.FC<ActivityItemProps> = ({ icon, color, text, time }) => (
  <li className="activity-item flex items-center py-4 border-b border-gray-100">
    <div className={`activity-icon w-10 h-10 rounded-full ${color} text-white flex items-center justify-center mr-4 flex-shrink-0`}>
      <i className={icon}></i>
    </div>
    <div className="activity-content flex-1">
      <div className="activity-text text-gray-800 mb-1" dangerouslySetInnerHTML={{ __html: text }}></div>
      <div className="activity-time text-gray-500 text-sm">{time}</div>
    </div>
  </li>
);

const NotificationItem: React.FC<NotificationItemProps> = ({ text, time, unread }) => (
  <li className={`notification-item rounded-lg p-4 mb-3 ${unread ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'}`}>
    <div className="notification-text text-gray-800 mb-1">{text}</div>
    <div className="notification-time text-gray-500 text-sm">{time}</div>
  </li>
);

const TodayEventItem: React.FC<TodayEventItemProps> = ({ title, time, category, color, isAllDay }) => (
  <li className="today-event-item flex items-center py-3 border-b border-gray-100 last:border-b-0">
    <div className={`event-indicator w-3 h-3 rounded-full ${color} mr-3 flex-shrink-0`}></div>
    <div className="event-content flex-1">
      <div className="event-title text-gray-800 font-medium mb-1">{title}</div>
      <div className="event-meta flex items-center text-gray-500 text-sm">
        <span className="event-time">{isAllDay ? '종일' : time}</span>
        <span className="mx-2">•</span>
        <span className="event-category">{category}</span>
      </div>
    </div>
  </li>
);

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 10;
  
  // 캘린더 훅 사용
  const { events, getEventsForDate } = useCalendar();
  
  // 오늘 날짜 가져오기
  const today = new Date();
  const todayEvents = getEventsForDate(today);10;

  const kpiData = [
    { icon: 'fas fa-folder', value: '24', label: '활성 프로젝트', color: 'bg-blue-500' },
    { icon: 'fas fa-file-alt', value: '1,248', label: '총 문서', color: 'bg-blue-500' },
    { icon: 'fas fa-users', value: '36', label: '협업자', color: 'bg-blue-500' },
    { icon: 'fas fa-edit', value: '142', label: '최근 편집', color: 'bg-blue-500' },
  ];

  // Fetch projects from the database
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const fetchedProjects = await fetchProjects(100); // Fetch more projects to enable pagination
        if (fetchedProjects) {
          setProjects(fetchedProjects);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Calculate pagination values
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const activityData = [
    {
      icon: 'fas fa-edit',
      color: 'bg-green-500',
      text: '<strong>김개발</strong>님이 "웹사이트 리디자인" 프로젝트의 문서를 편집했습니다',
      time: '2분 전',
    },
    {
      icon: 'fas fa-plus',
      color: 'bg-blue-500',
      text: '<strong>이디자인</strong>님이 새 문서 "홈페이지 레이아웃"을 생성했습니다',
      time: '15분 전',
    },
    {
      icon: 'fas fa-share-alt',
      color: 'bg-yellow-500',
      text: '<strong>박매니저</strong>님이 "모바일 앱 개발" 프로젝트를 공유했습니다',
      time: '1시간 전',
    },
    {
      icon: 'fas fa-file-export',
      color: 'bg-purple-500',
      text: '<strong>최분석</strong>님이 데이터 보고서를 내보냈습니다',
      time: '3시간 전',
    },
  ];

  const notificationData = [
    {
      text: '<strong>새 초대</strong>: "데이터 분석 대시보드" 프로젝트에 초대되었습니다',
      time: '5분 전',
      unread: true,
    },
    {
      text: '<strong>댓글</strong>: 이디자인님이 "홈페이지 레이아웃" 문서에 댓글을 남겼습니다',
      time: '25분 전',
      unread: true,
    },
    {
      text: '<strong>API 키 만료</strong>: 내일 만료되는 API 키가 있습니다',
      time: '2시간 전',
      unread: false,
    },
    {
      text: '<strong>시스템 업데이트</strong>: 내일 오전 2시에 시스템 점검이 예정되어 있습니다',
      time: '1일 전',
      unread: false,
    },
  ];

  return (
    <div className="dashboard p-5">
       
        {/* 공지사항 섹션 */}
        <div className="notice-section bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <i className="fas fa-bullhorn text-blue-500 text-lg mt-1"></i>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-blue-800 mb-2"> 공지사항 </h3>
              <div className="space-y-2">
                <div className="notice-item bg-white bg-opacity-60 rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 font-medium mb-1">
                        🔧 시스템 정기 점검 안내
                      </p>
                      <p className="text-xs text-gray-600">
                        2024년 1월 15일 오전 2:00 ~ 4:00 (약 2시간)
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      중요
                    </span>
                  </div>
                </div>
                
                <div className="notice-item bg-white bg-opacity-60 rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 font-medium mb-1">
                        ✨ 새로운 캘린더 기능이 추가되었습니다
                      </p>
                      <p className="text-xs text-gray-600">
                        일정 관리와 팀 협업이 더욱 편리해졌습니다
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      신규
                    </span>
                  </div>
                </div>
                
                <div className="notice-item bg-white bg-opacity-60 rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 font-medium mb-1">
                        📊 월간 사용량 리포트 발송
                      </p>
                      <p className="text-xs text-gray-600">
                        매월 첫째 주에 프로젝트 활동 리포트를 이메일로 발송합니다
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      정보
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-2 border-t border-blue-200">
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
                  전체 공지사항 보기 →
                </button>
              </div>
            </div>
          </div>
        </div>


      {/* KPI 대시보드 */}
      <div className="kpi-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        {kpiData.map((kpi, index) => (
          <KpiCard
            key={index}
            icon={kpi.icon}
            value={kpi.value}
            label={kpi.label}
            color={kpi.color}
          />
        ))}
      </div>

      <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 프로젝트 섹션 */}
        <div className="section-card bg-white rounded-lg shadow-md p-5">
          <div className="section-header flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-gray-800">최근 프로젝트</h2>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">프로젝트를 불러오는 중...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-folder-open text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">생성된 프로젝트가 없습니다</p>
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                새 프로젝트 만들기
              </button>
            </div>
          ) : (
            <>
              <div className="projects-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                {/* Transform project data to match the existing UI structure */}
                {currentProjects.map((project, index) => (
                  <ProjectCard
                    key={project.prjID ? project.prjID : `project-${index}-${project.title}`}
                    title={project.title}
                    description={project.description || '설명이 없습니다'}
                    date={project.created_at ? new Date(project.created_at).toLocaleDateString('ko-KR') : '날짜 정보 없음'}
                    documents={'문서 0개'} // This would need to be fetched from a documents API
                    collaborators={['K', 'M', 'J', '+2']} // This would need to be fetched from a collaborators API
                    projectId={(() => { const rawId = (project as any).prjID ?? (project as any).prjid ?? (project as any).id; return typeof rawId === 'object' ? (rawId?.id ?? rawId?._id ?? '') : rawId; })()}
                  />
                ))}
              </div>
              
              {/* Pagination Controls at Section Bottom */}
              {totalPages > 1 && (
                <div className="pagination-controls mt-6 pt-4 border-t border-gray-100">
                  <div className="flex justify-center">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                          currentPage === 1 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <i className="fas fa-chevron-left text-sm"></i>
                      </button>
                      
                      {/* Page Numbers */}
                      {(() => {
                        const maxVisiblePages = 5;
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                        
                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }
                        
                        const pages = [];
                        
                        // First page
                        if (startPage > 1) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => paginate(1)}
                              className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
                            >
                              1
                            </button>
                          );
                          if (startPage > 2) {
                            pages.push(
                              <span key="ellipsis1" className="px-2 text-gray-400">...</span>
                            );
                          }
                        }
                        
                        // Visible pages
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => paginate(i)}
                              className={`w-10 h-10 rounded-lg transition-all duration-200 text-sm font-medium ${
                                currentPage === i
                                  ? 'bg-blue-500 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                        
                        // Last page
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(
                              <span key="ellipsis2" className="px-2 text-gray-400">...</span>
                            );
                          }
                          pages.push(
                            <button
                              key={totalPages}
                              onClick={() => paginate(totalPages)}
                              className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
                            >
                              {totalPages}
                            </button>
                          );
                        }
                        
                        return pages;
                      })()}
                      
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                          currentPage === totalPages 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <i className="fas fa-chevron-right text-sm"></i>
                      </button>
                    </nav>
                  </div>
                  
                  {/* Page Info */}
                  <div className="text-center mt-3">
                    <span className="text-xs text-gray-500">
                      {currentPage} / {totalPages} 페이지 (총 {projects.length}개 프로젝트)
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 최근 활동 및 알림 센터 */}
        <div className="section-grid grid grid-cols-1 gap-5">
          {/* 오늘 일정 */}
          <div className="section-card bg-white rounded-lg shadow-md p-5">
            <div className="section-header flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-gray-800">오늘 일정</h2>
              <a href="/calendar-management" className="view-all text-blue-500 text-sm hover:text-blue-600">전체 보기</a>
            </div>
            {todayEvents.length > 0 ? (
              <ul className="today-events-list list-none">
                {todayEvents.slice(0, 4).map((event, index) => {
                  const categoryColors: { [key: string]: string } = {
                    work: 'bg-blue-500',
                    personal: 'bg-green-500',
                    meeting: 'bg-yellow-500',
                    health: 'bg-red-500',
                    education: 'bg-purple-500',
                    other: 'bg-gray-500'
                  };
                  
                  const timeString = event.isAllDay === false && event.startTime && event.endTime 
                    ? `${event.startTime} - ${event.endTime}`
                    : event.startTime || '';
                  
                  return (
                    <TodayEventItem
                      key={event.id}
                      title={event.title}
                      time={timeString}
                      category={event.category}
                      color={categoryColors[event.category] || 'bg-gray-500'}
                      isAllDay={event.isAllDay === true}
                    />
                  );
                })}
              </ul>
            ) : (
              <div className="no-events text-center py-8 text-gray-500">
                <i className="fas fa-calendar-alt text-4xl mb-3 opacity-50"></i>
                <p>오늘 예정된 일정이 없습니다.</p>
              </div>
            )}
          </div>
          
          {/* 최근 활동 */}
          <div className="section-card bg-white rounded-lg shadow-md p-5">
            <div className="section-header flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-gray-800">최근 활동</h2>
              <a href="/message-management" className="view-all text-blue-500 text-sm hover:text-blue-600">전체 보기</a>
            </div>
            <ul className="activity-list list-none">
              {activityData.map((activity, index) => (
                <ActivityItem
                  key={index}
                  icon={activity.icon}
                  color={activity.color}
                  text={activity.text}
                  time={activity.time}
                />
              ))}
            </ul>
          </div>

          {/* 알림 센터 */}
          <div className="section-card bg-white rounded-lg shadow-md p-5">
            <div className="section-header flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-gray-800">알림 센터</h2>
            </div>
            <ul className="notification-list list-none">
              {notificationData.map((notification, index) => (
                <NotificationItem
                  key={index}
                  text={notification.text}
                  time={notification.time}
                  unread={notification.unread}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;