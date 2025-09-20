// src/data/mockData.ts

export interface TreeNodeData {
  id: string;
  name: string;
  type: 'folder' | 'note';
  children?: TreeNodeData[];
  content?: string;
}

export interface FileNodeData {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: 'docx' | 'md' | 'image' | 'table'| 'link' |
   'calculate' | 'videocam'|'mic' | 'code' | 'format_quote' |'description' |
   'table_chart';
  children?: FileNodeData[];
}

export interface ReferenceItem {
  id: string;
  title: string;
  author: string;
  year: number;
  publication: string;
  doi?: string;
  url?: string;
}

export interface DocumentDetailsData {
  id: string;
  title: string;
  author: string;
  progress: number;
  references: ReferenceItem[];
  description?: string;
  start_date?: string;
  end_date?: string;
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
    description: '이 프로젝트는 인공지능을 활용하여 고품질의 콘텐츠를 자동으로 생성하는 플랫폼을 개발하는 것을 목표로 합니다. 자연어 처리와 딥러닝 기술을 적용하여 창의적인 글쓰기를 지원합니다.',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
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
    description: '복잡한 데이터 세트를 직관적이고 이해하기 쉬운 시각적 표현으로 변환하는 도구를 개발합니다. 다양한 차트와 그래프 유형을 지원하여 데이터 분석을 용이하게 합니다.',
    start_date: '2024-03-01',
    end_date: '2024-11-30',
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