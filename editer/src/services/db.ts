// src/services/db.ts

import Dexie from 'dexie';

// 1. Dexie 데이터베이스 정의
export const db = new Dexie('AdoClusterDB');

// 2. 스키마 정의: projects 테이블에 저장할 예정
// ++nodeId는 Primary Key이며, project_id로 인덱스를 검색합니다.
db.version(1).stores({
  projects: '++nodeId, projectId, content', 
});

// 3. 타입 정의 (선택적)
export interface ProjectContent {
  nodeId: string;
  projectId: string;
  content: string; // Tiptap JSONB (문자열 형태)
  updatedAt: number;
}