// 새로운 자료 관리 시스템 타입 정의
export type ResourceType = 'citation' | 'image' | 'table' | 'formula' | 'video' | 'audio';

// 기본 자료 인터페이스
export interface BaseResource {
  id: string;
  name: string;
  title: string;
  description?: string;
  source?: string;
  projectId: string;
  folderId: string;
  createdAt: string;
  updatedAt: string;
  type: ResourceType;
  tags?: string[];
}

// 폴더 인터페이스
export interface ResourceFolder {
  id: string;
  name: string;
  projectId: string;
  parentId?: string;
  type: ResourceType;
  children?: ResourceFolder[];
  createdAt: string;
  updatedAt: string;
}

// 인용/발취 자료
export interface CitationResource extends BaseResource {
  type: 'citation';
  content: string;
  originalText: string;
  documentInfo?: string;
  pageNumber?: number;
  selectedText?: string; // 문서에서 선택된 텍스트
  documentSource?: string; // 원본 문서 정보
}

// 이미지 자료
export interface ImageResource extends BaseResource {
  type: 'image';
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  alt?: string;
  width?: number;
  height?: number;
  thumbnail?: string;
}

// 표 자료
export interface TableResource extends BaseResource {
  type: 'table';
  data: any[][];
  headers?: string[];
  tableType: 'excel' | 'css';
  styles?: {
    [key: string]: any;
  };
  columnTypes?: string[]; // 각 컬럼의 데이터 타입
}

// 수식 자료
export interface FormulaResource extends BaseResource {
  type: 'formula';
  latex: string;
  rendered?: string; // 렌더링된 이미지 URL
  variables?: string[]; // 사용된 변수들
  category?: string; // 수식 카테고리 (대수, 미적분 등)
}

// 동영상 자료
export interface VideoResource extends BaseResource {
  type: 'video';
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
  thumbnail?: string;
  resolution?: string;
  // 추후 기능
  transcript?: string; // STT 결과
  summary?: string; // AI 요약
}

// 음성 자료
export interface AudioResource extends BaseResource {
  type: 'audio';
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
  waveform?: number[]; // 파형 데이터
  // 추후 기능
  transcript?: string; // STT 결과
  summary?: string; // AI 요약
}

// 통합 자료 타입
export type Resource = CitationResource | ImageResource | TableResource | FormulaResource | VideoResource | AudioResource;

// 자료 생성/수정을 위한 입력 타입
export type CreateResourceInput<T extends ResourceType> = Omit<
  Extract<Resource, { type: T }>,
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateResourceInput<T extends ResourceType> = Partial<
  Omit<Extract<Resource, { type: T }>, 'id' | 'type' | 'createdAt' | 'updatedAt'>
>;

// 자료 검색 필터
export interface ResourceFilter {
  type?: ResourceType;
  projectId?: string;
  folderId?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
}

// 자료 정렬 옵션
export interface ResourceSortOptions {
  field: 'name' | 'title' | 'createdAt' | 'updatedAt' | 'type';
  direction: 'asc' | 'desc';
}

// 파일 업로드 관련 타입
export interface FileUploadOptions {
  maxSize: number;
  allowedTypes: string[];
  generateThumbnail?: boolean;
}

// 자료 미리보기 정보
export interface ResourcePreview {
  id: string;
  type: ResourceType;
  title: string;
  thumbnail?: string;
  preview: string; // 미리보기 텍스트 또는 HTML
}