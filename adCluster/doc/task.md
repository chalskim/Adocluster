# `EditorPage` 개발 작업 목록 (Task Checklist)

이 문서는 `plan.md`와 `tech_stack.md`를 기반으로 `EditorPage.tsx` 개발을 위한 구체적인 작업 목록을 제공합니다.

## 프로젝트 목표

- Tiptap 기반의 서식 있는 텍스트 편집, 파일 트리 관리, 참고문헌 인용, 사용자 정의 콘텐츠 삽입 기능을 갖춘 고기능 웹 에디터 구현

## 핵심 기술 스택

- **프레임워크/언어:** React, TypeScript, Vite
- **에디터:** Tiptap, Prosemirror
- **스타일링:** Tailwind CSS, PostCSS, 일반 CSS
- **상태 관리:** React Hooks (필요시 Redux/Context API)
- **주요 라이브러리:** KaTeX (수식)

---

## 개발 작업 체크리스트

### 1단계: 프로젝트 설정 및 기본 레이아웃

- [x] **의존성 설치:**
  ```bash
  npm install @tiptap/react @tiptap/core @tiptap/starter-kit @tiptap/extension-font-family @tiptap/extension-text-style @tiptap/extension-font-size @tiptap/extension-text-align @tiptap/extension-table @tiptap/extension-image @tiptap/extension-highlight @tiptap/extension-link katex prosemirror-view
  ```
- [x] Tailwind CSS 설정 파일 (`tailwind.config.js`, `postcss.config.js`) 생성 및 구성
- [x] 3단 레이아웃 (왼쪽 사이드바, 중앙 컨텐츠, 오른쪽 사이드바) 구조 설계 및 `div`로 기본 마크업 구현
- [x] `useEditor` 훅을 사용하여 머리글/본문/바닥글을 위한 3개의 Tiptap 에디터 인스턴스 초기화 (`EditorPage.tsx`)

### 2단계: 핵심 UI 컴포넌트 구현

- [x] **`Sidebar.tsx` (왼쪽 사이드바) 구현:**
    - [x] 재귀 `TreeNode` 컴포넌트를 사용하여 파일/폴더 트리 뷰 렌더링
    - [x] 노드 선택 시 부모 컴포넌트로 선택된 노드 ID를 전달하는 콜백 함수 (`onNodeSelect`) 연동
- [x] **`RightSidebar.tsx` (오른쪽 사이드바) 구현:**
    - [x] 선택된 프로젝트의 상세 정보 표시
    - [x] 프로젝트별 참고문헌 목록 표시
    - [x] 참고문헌 추가/삭제 버튼 및 이벤트 핸들러 (`onAddReference`, `onDeleteReference`) 연동
- [x] **`TopMenuBar.tsx` (상단 메뉴) 구현:**
    - [x] 텍스트 서식(굵게, 기울임, 정렬 등)을 위한 버튼 그룹 구현
    - [x] 글꼴 크기, 글꼴 종류 변경을 위한 드롭다운 메뉴 구현
    - [x] 표, 이미지 삽입 버튼 및 관련 모달 또는 로직 연동
- [x] **`StatusBar.tsx` (하단 상태바) 구현:**
    - [x] `CharacterCount` 확장을 에디터에 추가하고 단어/글자 수 표시

### 3단계: Tiptap 고급 기능 및 사용자 정의 노드

- [x] **표준 확장 기능 활성화:**
    - [x] `Table`, `Image`, `Highlight`, `TextAlign`, `FontSize`, `FontFamily`, `Link` 등 모든 필요 확장을 `useEditor` 설정에 추가
- [x] **사용자 정의 확장 개발 (`/extensions` 폴더):**
    - [x] `CustomParagraph.ts`: `indent` 속성을 추가하여 들여쓰기/내어쓰기 기능 구현
    - [x] `FileAttachmentNode.ts`: 파일 아이콘과 파일 이름을 표시하는 커스텀 노드 뷰(NodeView) 구현
    - [x] `EquationNode.ts`: KaTeX 라이브러리를 사용하여 LaTeX 수식을 렌더링하는 커스텀 노드 뷰 구현
    - [x] `DataTag.ts`: 특정 메타데이터를 표현하는 인라인(inline) 노드 구현

### 4단계: 데이터 및 상태 관리

- [x] **타입 정의:** `TreeNodeData`, `DocumentDetailsData`, `ReferenceItem` 등 프로젝트에서 사용할 모든 데이터 타입 정의 (`types.ts` 또는 유사 파일)
- [x] **상태 관리 로직 구현:**
    - [x] `EditorPage.tsx` 또는 상위 컴포넌트에서 `useState`를 사용하여 `selectedNode`, `documents` 등 핵심 상태 관리
    - [x] 각 컴포넌트에 필요한 상태와 콜백 함수를 `props`로 전달
- [x] **참고문헌 관리 로직 구현:**
    - [x] `handleCiteReference`: `(저자, 연도)` 형식으로 본문에 인용 텍스트 삽입
    - [x] `handleAddReference`, `handleDeleteReference`: 참고문헌 데이터 배열을 업데이트하는 로직 구현

### 5단계: 스타일링 및 최종화

- [x] **전역 스타일 적용 (`index.css`):**
    - [x] `prosemirror-view` 및 `katex` CSS 임포트
    - [x] 전체 레이아웃, 배경색, 기본 글꼴 등 전역 스타일 정의
- [x] **컴포넌트 스타일링:**
    - [x] Tailwind CSS 유틸리티를 사용하여 각 컴포넌트(`Sidebar`, `TopMenuBar` 등) 스타일링
- [x] **에디터 콘텐츠 스타일링:**
    - [x] `.ProseMirror` 클래스를 타겟으로 하여 에디터 내부의 글꼴, 간격, 제목, 목록 등 상세 스타일 정의
    - [x] 표(`table`, `th`, `td`), 인용문(`blockquote`) 등 특정 요소에 대한 스타일 지정