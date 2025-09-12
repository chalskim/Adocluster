// src/data/mockData.ts

export interface TreeNodeData {
  id: string;
  name: string;
  type: 'folder' | 'note';
  children?: TreeNodeData[];
  content?: string;
}

export interface ReferenceItem {
  id: string;
  author: string;
  year: number;
  title: string;
  publication: string;
}

export interface DocumentDetailsData {
  id: string;
  title: string;
  author: string;
  progress: number;
  references: ReferenceItem[];
}

// 샘플 파일 트리 데이터
export const treeData: TreeNodeData[] = [
  {
    id: 'project-a',
    name: '연구 프로젝트 A',
    type: 'folder',
    children: [
      {
        id: 'note-1',
        name: '1. 서론',
        type: 'note',
        content: '<h2>서론</h2><p>이것은 서론입니다.</p>',
      },
      {
        id: 'note-2',
        name: '2. 문헌 리뷰',
        type: 'note',
        content: '<h2>문헌 리뷰</h2><p>이것은 문헌 리뷰입니다.</p>',
      },
      {
        id: 'note-3',
        name: '3. 방법론',
        type: 'note',
        content: '<h2>방법론</h2><p>이것은 방법론입니다.</p>',
      },
    ],
  },
  {
    id: 'project-b',
    name: '연구 프로젝트 B',
    type: 'folder',
    children: [
      {
        id: 'note-4',
        name: '1. 개요',
        type: 'note',
        content: '<h2>개요</h2><p>이것은 프로젝트 B의 개요입니다.</p>',
      },
    ],
  },
];

// 샘플 문서 상세 정보
export const allDocumentDetails: Record<string, DocumentDetailsData> = {
  'project-a': {
    id: 'project-a',
    title: 'AI 기반 콘텐츠 제작 플랫폼 개발 연구',
    author: '김연구',
    progress: 60,
    references: [
      {
        id: 'ref-1',
        author: 'Smith, J.',
        year: 2020,
        title: 'AI in Content Creation',
        publication: 'Journal of AI Research, 15(3), 123-145',
      },
      {
        id: 'ref-2',
        author: 'Johnson, A.',
        year: 2019,
        title: 'Collaborative Writing Platforms',
        publication: 'Tech Writing Review, 8(2), 67-89',
      },
    ],
  },
  'project-b': {
    id: 'project-b',
    title: '데이터 시각화 도구 개발',
    author: '이데이터',
    progress: 30,
    references: [
      {
        id: 'ref-3',
        author: 'Brown, T.',
        year: 2021,
        title: 'Modern Data Visualization Techniques',
        publication: 'Visualization Quarterly, 12(1), 45-67',
      },
    ],
  },
};

// 노드 ID를 기반으로 부모 프로젝트 찾기
export const findParentProject = (nodeId: string): TreeNodeData | null => {
  for (const project of treeData) {
    if (project.id === nodeId) {
      return project;
    }
    if (project.children) {
      for (const child of project.children) {
        if (child.id === nodeId) {
          return project;
        }
      }
    }
  }
  return null;
};