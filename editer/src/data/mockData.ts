// src/data/mockData.ts

export interface TreeNodeData {
  id: string;
  name: string;
  type: 'folder' | 'object' | 'note';
  content?: string; // 'note' 타입에만 내용이 있습니다.
  children?: TreeNodeData[];
}
export interface ReferenceItem {
  id: string;
  author: string;
  year: number;
  title: string;
  publication: string;
}

export const treeData: TreeNodeData[] = [
  { id: 'proj-1', name: 'Project 1', type: 'folder' },
  {
    id: 'proj-2',
    name: 'Project 2',
    type: 'folder',
    children: [
      {
        id: 'obj-a',
        name: 'Object A',
        type: 'object',
        children: [
          { 
            id: 'note-b', 
            name: 'Note B', 
            type: 'note', 
            content: '<h2>Note B의 내용입니다</h2><p>이곳에 Note B와 관련된 내용을 작성합니다.</p>' 
          },
          { 
            id: 'note-c', 
            name: 'Note C', 
            type: 'note', 
            content: '<h2>여기는 Note C 입니다</h2><p>안녕하세요! Tiptap 에디터입니다.</p>' 
          },
          { 
            id: 'note-d', 
            name: 'Note D', 
            type: 'note', 
            content: '<h2>Note D의 콘텐츠</h2><p>표와 이미지를 테스트해보세요.</p><table><tbody><tr><th><p>Header A</p></th><th><p>Header B</p></th></tr><tr><td><p>Cell A1</p></td><td><p>Cell B1</p></td></tr></tbody></table>' 
          },
        ],
      },
    ],
  },
  { id: 'proj-3', name: 'Project 3', type: 'folder' },
];

export interface FileNodeData {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: 'docx' | 'md' | 'image' | 'table'| 'link' |
   'calculate' | 'videocam'|'mic' | 'code' | 'format_quote' |'description' |
   'table_chart';
  children?: FileNodeData[];
}

export const fileExplorerData: FileNodeData[] = [
  {
    id: 'folder-docs',
    name: '문서',
    type: 'folder',
    fileType: 'description', 
    children: [
      { id: 'file-1', name: '제목 없는 문서.docx', type: 'file', fileType: 'docx' },
      { id: 'file-2', name: '초록.md', type: 'file', fileType: 'md' },
      { id: 'file-3', name: '결론.docx', type: 'file', fileType: 'docx' },
    ],
  },
  { id: 'folder-images', name: '그림', type: 'folder', fileType: 'image' },
  { id: 'folder-tables', name: '표', type: 'folder' , fileType: 'table_chart' },
    { id: 'data-websites', name: '웹사이트', type: 'folder', fileType: 'link' },
  { id: 'data-equations', name: '수식', type: 'folder', fileType: 'calculate' },
  { id: 'data-videos', name: '동영상', type: 'folder', fileType: 'videocam' },
  { id: 'data-audios', name: '음성', type: 'folder', fileType: 'mic' },
  { id: 'data-code', name: '코드 스니펫', type: 'folder', fileType: 'code' },
  { id: 'data-quotes', name: '인용/발췌', type: 'folder', fileType: 'format_quote' },
];

export interface TodoItemData {
  id: string;
  text: string;
  time: string;
  completed: boolean;
}

export interface DocumentDetailsData {
  id: string;
  properties: {
    title: string;
    author: string;
    keywords: string[];
    tags: string[];
  };
  references: ReferenceItem[]; 
  comments: {
    id: string;
    author: string;
    text: string;
    timestamp: string;
  }[];
}


export const allDocumentDetails: Record<string, DocumentDetailsData> = {
  'proj-2': { // 'note-b' -> 'proj-2'
    id: 'proj-2', // id도 프로젝트 ID로 맞춰줍니다.
    properties: {
      title: 'Project 2: 인공지능 기반 학습 시스템', // 제목도 프로젝트 단위로 변경
      author: '홍길동, 이순신', // 저자도 프로젝트 단위로
      keywords: ['AI', '교육', '학습 시스템'],
      tags: ['#핵심프로젝트', '#2025'],
    },
    references: [
      {
        id: 'ref-1',
        author: '김영희, 이민수, 박철수',
        year: 2024,
        title: '인공지능 기반 개인화 학습 시스템의 효과 분석.',
        publication: '교육공학연구, 40(2), 123-145.'
      },
      {
        id: 'ref-2',
        author: 'Smith, J., & Brown, A.',
        year: 2023,
        title: 'Machine Learning Applications in Education.',
        publication: 'Journal of Educational Technology, 15(3), 45-62.'
      }
    ],
    comments: [
      { id: 'comment-1', author: '홍길동', text: '...', timestamp: '2분 전' }
    ]
  },
  // 'proj-1', 'proj-3' 등 다른 프로젝트에 대한 데이터도 여기에 추가할 수 있습니다.
  'proj-1': {
    id: 'proj-1',
    properties: {
      title: 'Project 1: 초기 구상 단계',
      author: '팀 전체',
      keywords: [],
      tags: [],
    },
    references: [],
    comments: [],
  } 
};

export function findParentProject(nodeId: string, nodes: TreeNodeData[] = treeData): TreeNodeData | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      // 만약 찾으려는 노드가 최상위 폴더라면 자기 자신을 반환
      if (node.type === 'folder') {
        return node;
      }
      return null; // 최상위인데 폴더가 아니면 부모가 없음
    }
    
    if (node.children) {
      // 자식 중에 찾으려는 노드가 있는지 확인
      const isChildFound = node.children.some(child => child.id === nodeId);
      if (isChildFound) {
        // 찾았으면, 현재 노드가 부모. 현재 노드가 최상위 프로젝트가 아닐 수도 있으므로 재귀적으로 부모를 찾음
        if (node.type === 'folder') {
          return node;
        }
        // 중간 폴더(object)라면, 이 중간 폴더의 부모를 다시 찾아야 함
        return findParentProject(node.id, treeData);
      }

      // 자식의 자식들을 재귀적으로 탐색
      const foundInChildren = findParentProject(nodeId, node.children);
      if (foundInChildren) {
        // 자식들 사이에서 부모를 찾았다면, 그 부모가 최상위 프로젝트인지 확인
        if (foundInChildren.type === 'folder') {
          return foundInChildren;
        }
        // 아니라면, 찾은 부모의 부모를 다시 탐색
        return findParentProject(foundInChildren.id, treeData);
      }
    }
  }
  return null;
}