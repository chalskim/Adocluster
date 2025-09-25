// API 서비스 함수들

// User 인터페이스 정의
interface User {
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

// Project 타입을 별도 파일에서 import
import { ProjectData } from '../types/ProjectTypes';

// API 기본 URL 가져오기
export const getApiBaseUrl = () => {
  try {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
  } catch (err) {
    console.error('Error accessing VITE_API_BASE_URL:', err);
    return 'http://localhost:8001';
  }
};

// 인증된 요청을 위한 헤더 생성
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('인증 토큰이 없습니다.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// 현재 사용자 정보 가져오기
export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    console.log('API - 현재 사용자 정보를 가져오는 중...');
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.log('API - 저장된 토큰이 없습니다.');
      return null;
    }
    
    // 토큰 디코딩하여 만료 시간 확인
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      const expTime = payload.exp * 1000; // 초를 밀리초로 변환
      
      if (Date.now() >= expTime) {
        console.log('API - 토큰이 만료되었습니다. 토큰을 제거합니다.');
        localStorage.removeItem('authToken');
        return null;
      }
    } catch (e) {
      console.error('API - 토큰 디코딩 오류:', e);
    }
    
    const response = await fetch(`${getApiBaseUrl()}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log('API - 401 Unauthorized 응답을 받았습니다. 토큰을 제거합니다.');
        localStorage.removeItem('authToken');
        // 오류 메시지를 콘솔에만 출력하고 사용자에게는 표시하지 않음
        console.log('인증이 만료되었습니다. 다시 로그인해주세요.');
        return null;
      }
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    console.log('API - 사용자 정보 가져오기 성공:', data);
    return data;
  } catch (error) {
    console.log('API - 사용자 정보 조회 오류:', error);
    if (error instanceof Error && error.message.includes('인증이 만료')) {
      console.log('API - 인증 관련 오류로 토큰을 제거합니다:', error.message);
      localStorage.removeItem('authToken');
    }
    return null;
  }
};

// 모든 사용자 목록 가져오기 (관리자용)
export const fetchAllUsers = async (skip = 0, limit = 10) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/users?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 임시로 인증 헤더 제거 - 테스트용
      },
    });

    if (!response.ok) {
      throw new Error('사용자 목록을 가져오는데 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    throw error;
  }
};

// 사용자 프로필 업데이트
interface UserProfileUpdate {
  uname?: string;
  upassword?: string;
  uavatar?: string;
}

export const updateUserProfile = async (userData: UserProfileUpdate) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/users/update-profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('프로필 업데이트에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    throw error;
  }
};

// 프로젝트 목록 가져오기
export const fetchProjects = async (limit = 4): Promise<ProjectData[] | null> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/projects/?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 임시로 인증 헤더 제거 - 테스트용
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log('API - 401 Unauthorized 응답을 받았습니다. 토큰을 제거합니다.');
        localStorage.removeItem('authToken');
        return null;
      }
      throw new Error('프로젝트 목록을 가져오는데 실패했습니다.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('프로젝트 목록 조회 오류:', error);
    return null;
  }
};

// 프로젝트 상세 정보 가져오기
export const fetchProjectById = async (projectId: string): Promise<ProjectData | null> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/projects/${projectId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log('API - 401 Unauthorized 응답을 받았습니다. 토큰을 제거합니다.');
        localStorage.removeItem('authToken');
        return null;
      }
      throw new Error('프로젝트 정보를 가져오는데 실패했습니다.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('프로젝트 정보 조회 오류:', error);
    return null;
  }
};

// 폴더 관련 API 함수들

// 폴더 인터페이스 정의
export interface FolderData {
  id: string;
  name: string;
  project_id: string;
  parent_id?: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

// 프로젝트의 폴더 목록 가져오기
export const fetchFoldersByProject = async (projectId: string): Promise<FolderData[] | null> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/folders/project/${projectId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log('API - 401 Unauthorized 응답을 받았습니다. 토큰을 제거합니다.');
        localStorage.removeItem('authToken');
        return null;
      }
      throw new Error('폴더 목록을 가져오는데 실패했습니다.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('폴더 목록 조회 오류:', error);
    return null;
  }
};

// 새 폴더 생성
export const createFolder = async (folderData: {
  name: string;
  project_id: string;
  parent_id?: string;
}): Promise<FolderData | null> => {
  try {
    // Convert project_id to UUID format if it's not already
    const formattedFolderData = {
      ...folderData,
      project_id: folderData.project_id, // Keep as string for the API call
      // parent_id will remain as string or undefined
    };

    const response = await fetch(`${getApiBaseUrl()}/api/folders/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(formattedFolderData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log('API - 401 Unauthorized 응답을 받았습니다. 토큰을 제거합니다.');
        localStorage.removeItem('authToken');
        return null;
      }
      const errorText = await response.text();
      console.error('폴더 생성 API 오류 응답:', errorText);
      throw new Error(`폴더 생성에 실패했습니다. 상태 코드: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('폴더 생성 오류:', error);
    throw new Error(`폴더 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
};

// 폴더 삭제
export const deleteFolder = async (folderId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/folders/${folderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log('API - 401 Unauthorized 응답을 받았습니다. 토큰을 제거합니다.');
        localStorage.removeItem('authToken');
        return false;
      }
      throw new Error('폴더 삭제에 실패했습니다.');
    }

    return true;
  } catch (error) {
    console.error('폴더 삭제 오류:', error);
    return false;
  }
};

// 폴더 이름 수정
export const updateFolder = async (folderId: string, folderData: {
  name?: string;
  parent_id?: string;
}): Promise<FolderData | null> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/folders/${folderId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(folderData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log('API - 401 Unauthorized 응답을 받았습니다. 토큰을 제거합니다.');
        localStorage.removeItem('authToken');
        return null;
      }
      throw new Error('폴더 수정에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('폴더 수정 오류:', error);
    return null;
  }
};