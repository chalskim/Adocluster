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
        content: '<h2>1. 서론</h2><p>본 연구는 AI 기반 콘텐츠 제작 플랫폼 개발에 관한 연구입니다.</p><p>연구의 목적은 다음과 같습니다:</p><ul><li>인공지능을 활용한 자동 콘텐츠 생성 시스템 개발</li><li>사용자 친화적인 인터페이스 설계</li><li>고품질 콘텐츠 생성을 위한 알고리즘 최적화</li></ul><p>본 연구를 통해 콘텐츠 제작 분야의 혁신을 이루고자 합니다.</p>',
      },
      {
        id: 'note-2',
        name: '2. 문헌 리뷰',
        type: 'note',
        content: '<h2>2. 문헌 리뷰</h2><p>AI 기반 콘텐츠 생성에 관한 기존 연구들을 검토하였습니다.</p><h3>2.1 자연어 처리 기술</h3><p>GPT, BERT 등의 대규모 언어 모델들이 텍스트 생성 분야에서 혁신적인 성과를 보여주고 있습니다.</p><h3>2.2 콘텐츠 생성 플랫폼</h3><p>기존의 콘텐츠 생성 도구들은 템플릿 기반 접근법을 주로 사용하였으나, 최근 AI 기술의 발전으로 더욱 창의적인 콘텐츠 생성이 가능해졌습니다.</p><h3>2.3 연구 격차</h3><p>기존 연구들은 주로 영어 콘텐츠에 집중되어 있어, 한국어 콘텐츠 생성에 대한 연구가 부족한 상황입니다.</p>',
      },
      {
        id: 'note-3',
        name: '3. 방법론',
        type: 'note',
        content: '<h2>3. 방법론</h2><p>본 연구에서는 다음과 같은 방법론을 사용합니다:</p><h3>3.1 연구 설계</h3><p>혼합 연구 방법론(Mixed Methods)을 채택하여 정량적 분석과 정성적 분석을 병행합니다.</p><h3>3.2 데이터 수집</h3><ul><li>한국어 텍스트 코퍼스 구축</li><li>사용자 요구사항 설문조사</li><li>기존 플랫폼 성능 벤치마킹</li></ul><h3>3.3 모델 개발</h3><p>Transformer 기반 언어 모델을 한국어 데이터로 파인튜닝하여 콘텐츠 생성 모델을 개발합니다.</p><h3>3.4 평가 방법</h3><ul><li>BLEU, ROUGE 점수를 통한 정량적 평가</li><li>전문가 평가를 통한 정성적 평가</li><li>사용자 만족도 조사</li></ul>',
      },
      {
        id: 'note-4',
        name: '4. 결과 (작성중)',
        type: 'note',
        content: '<h2>4. 결과 (작성중)</h2><p>현재 실험을 진행 중이며, 예비 결과는 다음과 같습니다:</p><h3>4.1 모델 성능</h3><p>개발된 모델의 BLEU 점수는 기존 모델 대비 15% 향상되었습니다.</p><h3>4.2 사용자 평가</h3><p>초기 사용자 테스트에서 긍정적인 반응을 얻었습니다. (상세 결과 분석 중)</p><p><em>※ 추가 실험 결과 및 분석 내용을 작성 예정</em></p>',
      },
      {
        id: 'note-5',
        name: '5. 결론 (미작성)',
        type: 'note',
        content: '<h2>5. 결론 (미작성)</h2><p><em>※ 실험 완료 후 작성 예정</em></p><p>작성 예정 내용:</p><ul><li>연구 결과 요약</li><li>연구의 기여도</li><li>한계점 및 향후 연구 방향</li><li>실무적 시사점</li></ul>',
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