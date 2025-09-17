import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface ProjectDetailPageProps {
  projectId?: string;
}

interface ProjectData {
  id: string;
  title: string;
  description: string;
  status: 'in_progress' | 'completed' | 'on_hold' | 'planning';
  progress: number;
  created_at: string;
  updated_at: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  collaborators: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    uploaded_at: string;
  }>;
  timeline: Array<{
    id: string;
    event: string;
    description: string;
    date: string;
    type: 'milestone' | 'update' | 'document' | 'meeting';
  }>;
  tags: string[];
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ projectId: propProjectId }) => {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const projectId = propProjectId || paramProjectId;
  
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'timeline' | 'collaborators'>('overview');
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockData: ProjectData = {
      id: projectId || '1',
      title: 'AI 기반 광고 클러스터링 연구',
      description: '머신러닝을 활용한 광고 데이터 클러스터링 및 분석 시스템 개발 프로젝트입니다. 대용량 광고 데이터를 효율적으로 분류하고 패턴을 분석하여 광고 효과를 극대화하는 것이 목표입니다.',
      status: 'in_progress',
      progress: 65,
      created_at: '2024-01-15',
      updated_at: '2024-01-20',
      category: '머신러닝 연구',
      priority: 'high',
      collaborators: [
        { id: '1', name: '김연구', role: '프로젝트 리더', avatar: 'K' },
        { id: '2', name: '박개발', role: '개발자', avatar: 'P' },
        { id: '3', name: '이분석', role: '데이터 분석가', avatar: 'L' },
        { id: '4', name: '최디자인', role: 'UI/UX 디자이너', avatar: 'C' }
      ],
      documents: [
        { id: '1', name: '프로젝트 제안서.pdf', type: 'PDF', size: '2.5MB', uploaded_at: '2024-01-15' },
        { id: '2', name: '데이터 분석 결과.xlsx', type: 'Excel', size: '1.8MB', uploaded_at: '2024-01-18' },
        { id: '3', name: '시스템 아키텍처.png', type: 'Image', size: '850KB', uploaded_at: '2024-01-20' }
      ],
      timeline: [
        { id: '1', event: '프로젝트 시작', description: '프로젝트 킥오프 미팅 및 초기 계획 수립', date: '2024-01-15', type: 'milestone' },
        { id: '2', event: '데이터 수집 완료', description: '광고 데이터 10만건 수집 및 전처리 완료', date: '2024-01-17', type: 'update' },
        { id: '3', event: '중간 보고서 제출', description: '1차 분석 결과 보고서 작성 및 제출', date: '2024-01-20', type: 'document' },
        { id: '4', event: '팀 미팅', description: '주간 진행상황 점검 및 다음 단계 논의', date: '2024-01-22', type: 'meeting' }
      ],
      tags: ['머신러닝', 'AI', '광고', '클러스터링', '데이터분석']
    };

    setTimeout(() => {
      setProjectData(mockData);
      setLoading(false);
    }, 500);
  }, [projectId]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50', text: '완료' };
      case 'on_hold':
        return { color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50', text: '보류' };
      case 'planning':
        return { color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50', text: '계획' };
      default:
        return { color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50', text: '진행중' };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return { color: 'text-red-600', bgColor: 'bg-red-50', text: '높음' };
      case 'low':
        return { color: 'text-green-600', bgColor: 'bg-green-50', text: '낮음' };
      default:
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-50', text: '보통' };
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'fas fa-flag';
      case 'document':
        return 'fas fa-file-alt';
      case 'meeting':
        return 'fas fa-users';
      default:
        return 'fas fa-info-circle';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600">프로젝트를 찾을 수 없습니다.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(projectData.status);
  const priorityConfig = getPriorityConfig(projectData.priority);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{projectData.title}</h1>
                <p className="text-gray-600 mt-1">{projectData.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.textColor} ${statusConfig.bgColor}`}>
                {statusConfig.text}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityConfig.color} ${priorityConfig.bgColor}`}>
                우선순위: {priorityConfig.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">진행률</span>
            <span className="text-sm font-medium text-gray-900">{projectData.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${projectData.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: '개요', icon: 'fas fa-info-circle' },
              { id: 'documents', label: '문서', icon: 'fas fa-folder' },
              { id: 'timeline', label: '타임라인', icon: 'fas fa-history' },
              { id: 'collaborators', label: '협업자', icon: 'fas fa-users' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 설명</h2>
                <p className="text-gray-700 leading-relaxed">{projectData.description}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">태그</h2>
                <div className="flex flex-wrap gap-2">
                  {projectData.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 정보</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">생성일</label>
                    <p className="text-gray-900">{new Date(projectData.created_at).toLocaleDateString('ko-KR')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">최종 수정일</label>
                    <p className="text-gray-900">{new Date(projectData.updated_at).toLocaleDateString('ko-KR')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">협업자 수</label>
                    <p className="text-gray-900">{projectData.collaborators.length}명</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">문서 수</label>
                    <p className="text-gray-900">{projectData.documents.length}개</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">문서 목록</h2>
            </div>
            <div className="divide-y">
              {projectData.documents.map((doc) => (
                <div key={doc.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-file-alt text-blue-600"></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{doc.name}</h3>
                      <p className="text-sm text-gray-500">{doc.type} • {doc.size} • {doc.uploaded_at}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 transition-colors">
                    <i className="fas fa-download"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">프로젝트 타임라인</h2>
            <div className="space-y-6">
              {projectData.timeline.map((item, index) => (
                <div key={item.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className={`${getTimelineIcon(item.type)} text-blue-600 text-sm`}></i>
                    </div>
                    {index < projectData.timeline.length - 1 && (
                      <div className="w-px h-6 bg-gray-200 ml-5 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{item.event}</h3>
                      <span className="text-sm text-gray-500">{item.date}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'collaborators' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">협업자 목록</h2>
            </div>
            <div className="divide-y">
              {projectData.collaborators.map((collaborator) => (
                <div key={collaborator.id} className="p-6 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {collaborator.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{collaborator.name}</h3>
                    <p className="text-sm text-gray-500">{collaborator.role}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <i className="fas fa-envelope"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;