// 프로젝트 관련 타입 정의

// API에서 사용하는 Project 타입 (서버 응답)
export interface ProjectData {
  prjid: string;  // 백엔드에서 prjid로 반환하므로 소문자로 변경
  crtID: string;
  title: string;
  description: string;
  visibility: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  update_at: string;
}

// 클라이언트에서 사용하는 Project 타입 (UI 컴포넌트용)
export interface Project {
  id: string; // prjID를 id로 매핑
  title: string;
  description: string;
  status?: 'planning' | 'in-progress' | 'completed' | 'on_hold';
  visibility: string;
  startDate: string; // start_date를 camelCase로 매핑
  endDate?: string | null; // end_date를 camelCase로 매핑
  createdAt: string; // created_at을 camelCase로 매핑
  updatedAt: string; // update_at을 camelCase로 매핑
  creatorId: string; // crtID를 camelCase로 매핑
  documents?: number;
  members?: number;
  lastUpdate?: string;
  progress?: number;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  collaborators?: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }>;
  timeline?: Array<{
    id: string;
    event: string;
    description: string;
    date: string;
    type: 'milestone' | 'update' | 'document' | 'meeting';
  }>;
  tags?: string[];
}

// ProjectData를 Project로 변환하는 유틸리티 함수
export const mapProjectDataToProject = (projectData: ProjectData): Project => {
  return {
    id: projectData.prjid,  // prjid 필드를 id로 매핑
    title: projectData.title,
    description: projectData.description,
    visibility: projectData.visibility,
    startDate: projectData.start_date,
    endDate: projectData.end_date,
    createdAt: projectData.created_at,
    updatedAt: projectData.update_at,
    creatorId: projectData.crtID,
  };
};

// Project를 ProjectData로 변환하는 유틸리티 함수
export const mapProjectToProjectData = (project: Project): Partial<ProjectData> => {
  return {
    prjid: project.id,
    title: project.title,
    description: project.description,
    visibility: project.visibility,
    start_date: project.startDate,
    end_date: project.endDate,
    crtID: project.creatorId,
  };
};

// 프로젝트 생성 요청 타입
export interface CreateProjectRequest {
  title: string;
  description: string;
  visibility: string;
  start_date: string;
  end_date?: string | null;
}

// 프로젝트 업데이트 요청 타입
export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  visibility?: string;
  start_date?: string;
  end_date?: string | null;
}