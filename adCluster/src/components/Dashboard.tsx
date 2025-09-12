import React, { useState, useEffect } from 'react';
import { fetchProjects, Project } from '../services/api';

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

const KpiCard: React.FC<KpiCardProps> = ({ icon, value, label, color }) => (
  <div className="kpi-card bg-white rounded-lg shadow-md p-5 text-center transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
    <div className={`kpi-icon w-12 h-12 rounded-full ${color} text-white flex items-center justify-center mx-auto mb-3 text-xl`}>
      <i className={icon}></i>
    </div>
    <div className="kpi-value text-3xl font-bold text-gray-800 my-2">{value}</div>
    <div className="kpi-label text-gray-600 text-sm">{label}</div>
  </div>
);

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description, date, documents, collaborators }) => (
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
          key={index} 
          className="avatar w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-[-8px] border-2 border-white"
          style={{ zIndex: collaborators.length - index }}
        >
          {initial}
        </div>
      ))}
    </div>
    <div className="project-actions flex justify-between">
      <button className="action-btn px-3 py-1 rounded border border-gray-200 bg-white text-xs transition-all duration-300 hover:bg-gray-50">
        <i className="fas fa-external-link-alt mr-1"></i> 바로가기
      </button>
      <button className="action-btn px-3 py-1 rounded border border-gray-200 bg-white text-xs transition-all duration-300 hover:bg-gray-50">
        <i className="fas fa-ellipsis-h"></i>
      </button>
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

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 10;

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
      <div className="header bg-white p-5 rounded-lg shadow-md mb-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">대시보드</h1>
          <p className="text-gray-600">시스템 전체 현황을 확인할 수 있습니다</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-all duration-300 flex items-center">
            <i className="fas fa-plus mr-2"></i> 새 프로젝트
          </button>
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
            <a href="#" className="view-all text-blue-500 text-sm hover:text-blue-600">전체 보기</a>
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
                {currentProjects.map(project => ({
                  title: project.title,
                  description: project.description || '설명이 없습니다',
                  date: project.created_at ? new Date(project.created_at).toLocaleDateString('ko-KR') : '날짜 정보 없음',
                  documents: '문서 0개', // This would need to be fetched from a documents API
                  collaborators: ['K', 'M', 'J', '+2'], // This would need to be fetched from a collaborators API
                })).map((project, index) => (
                  <ProjectCard
                    key={index}
                    title={project.title}
                    description={project.description}
                    date={project.date}
                    documents={project.documents}
                    collaborators={project.collaborators}
                  />
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-controls flex justify-center mt-6">
                  <nav className="flex items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`w-10 h-10 rounded-full ${
                            currentPage === pageNumber
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>

        {/* 최근 활동 및 알림 센터 */}
        <div className="section-grid grid grid-cols-1 gap-5">
          {/* 최근 활동 */}
          <div className="section-card bg-white rounded-lg shadow-md p-5">
            <div className="section-header flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-gray-800">최근 활동</h2>
              <a href="#" className="view-all text-blue-500 text-sm hover:text-blue-600">전체 보기</a>
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
              <a href="#" className="view-all text-blue-500 text-sm hover:text-blue-600">전체 보기</a>
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