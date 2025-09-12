# EditorPage.tsx 기능 구현 계획

`editer` 프로젝트를 기반으로 `adCluster/src/components/EditorPage.tsx`의 기능 구현 계획을 수립합니다.

## 1. 목표

Tiptap 라이브러리를 사용하여 다음과 같은 기능을 갖춘 고기능 웹 에디터를 구현합니다:
- 서식 있는 텍스트 편집
- 파일 및 노트 트리 구조 관리
- 참고문헌 관리 및 인용
- 사용자 정의 콘텐츠(수식, 파일 첨부) 삽입

## 2. 아키텍처 및 레이아웃

- **3단 레이아웃:**
    - **왼쪽 사이드바:** 파일/노트 트리 뷰, 전체 참고문헌 목록
    - **중앙 컨텐츠:** 머리글, 본문, 바닥글로 구성된 Tiptap 에디터
    - **오른쪽 사이드바:** 현재 선택된 프로젝트의 상세 정보 및 참고문헌 목록
- **컴포넌트 기반 구조:** 각 UI 요소를 React 컴포넌트로 분리하여 개발합니다. (`Sidebar`, `TiptapEditor`, `RightSidebar`, `TopMenuBar`, `StatusBar`)

## 3. 단계별 구현 계획

### 1단계: 기본 에디터 설정 및 의존성 설치

1.  **필요 라이브러리 설치:**
    ```bash
    npm install @tiptap/react @tiptap/core @tiptap/starter-kit @tiptap/extension-font-family @tiptap/extension-text-style @tiptap/extension-font-size @tiptap/extension-text-align @tiptap/extension-table @tiptap/extension-image @tiptap/extension-highlight @tiptap/extension-link katex prosemirror-view
    ```

2.  **`EditorPage.tsx` 초기화:**
    - `useEditor` 훅을 사용하여 Tiptap 에디터 인스턴스 3개(머리글, 본문, 바닥글)를 생성합니다.
    - 기본적인 Tiptap 확장 기능(`StarterKit`)을 추가하여 기본 편집 기능을 활성화합니다.

### 2단계: UI 레이아웃 컴포넌트 구현

1.  **`Sidebar.tsx` (왼쪽 사이드바):**
    - 파일 및 폴더 트리 구조를 표시합니다. (재귀적인 `TreeNode` 컴포넌트 활용)
    - 노드 선택 시 `onNodeSelect` 콜백 함수를 호출하여 중앙 에디터의 콘텐츠를 업데이트합니다.
    - 전체 참고문헌 목록을 표시하고, 인용 버튼 클릭 시 `onCiteReference` 콜백을 호출합니다.

2.  **`RightSidebar.tsx` (오른쪽 사이드바):**
    - 현재 선택된 프로젝트의 상세 정보(제목, 저자 등)를 표시합니다.
    - 해당 프로젝트에 속한 참고문헌 목록을 표시합니다.
    - 참고문헌 추가/삭제 기능을 구현하고, 관련 콜백 함수(`onAddReference`, `onDeleteReference`)를 호출합니다.

3.  **`TopMenuBar.tsx`:**
    - 에디터의 форматирования 옵션(볼드, 이탤릭, 글꼴 크기, 정렬 등)을 위한 버튼과 드롭다운 메뉴를 포함합니다.
    - 각 버튼은 `editor.chain().focus()...run()` 형태의 Tiptap 명령을 실행합니다.
    - 표, 이미지, 수식 등을 삽입하는 기능을 포함합니다.

4.  **`StatusBar.tsx`:**
    - Tiptap의 `CharacterCount` 확장을 사용하여 현재 문서의 단어 수, 글자 수 등을 표시합니다.

### 3단계: Tiptap 고급 기능 및 사용자 정의 확장 구현

1.  **표준 확장 기능 추가:**
    - `Table`, `Image`, `Highlight`, `TextAlign`, `FontSize`, `FontFamily` 등 `editer` 프로젝트에서 사용된 모든 표준 확장을 `useEditor` 설정에 추가합니다.

2.  **사용자 정의 확장(Custom Extensions) 개발:**
    - **`CustomParagraph.ts`:** 단락 들여쓰기/내어쓰기 기능을 위해 `addAttributes`와 `addCommands`를 사용하여 `indent` 속성을 추가합니다.
    - **`FileAttachmentNode.ts`:** 첨부된 파일을 시각적으로 표시하기 위한 커스텀 노드를 생성합니다. `NodeView`를 사용하여 파일 아이콘, 이름, 다운로드 버튼 등을 렌더링할 수 있습니다.
    - **`EquationNode.ts`:** LaTeX 문법으로 수학 수식을 렌더링하는 노드를 생성합니다. `NodeView`와 KaTeX 라이브러리를 연동하여 구현합니다.
    - **`DataTag.ts`:** 문서 내에 특정 메타데이터를 포함하는 인라인 태그를 구현합니다.

### 4단계: 데이터 관리 및 상태 로직 구현

1.  **데이터 구조 정의:**
    - `TreeNodeData` (파일 트리용), `DocumentDetailsData` (문서 내용 및 메타데이터용), `ReferenceItem` (참고문헌용) 타입을 정의합니다. (`mockData.ts` 참고)

2.  **상태 관리:**
    - `useState`, `useCallback`, `useMemo` 훅을 사용하여 컴포넌트의 상태(선택된 노드, 문서 목록, 사이드바 너비 등)를 관리합니다.
    - `App.tsx` (또는 `EditorPage.tsx`의 부모 컴포넌트)가 최상위 상태를 관리하고, 콜백 함수와 props를 통해 자식 컴포넌트와 데이터를 주고받는 구조를 설계합니다.

3.  **참고문헌 로직 구현:**
    - `handleCiteReference`: 인용 시 `(저자, 연도)` 형식의 텍스트를 에디터에 삽입하고, 해당 프로젝트의 참고문헌 목록에 아이템을 추가합니다.
    - `handleAddReference`, `handleDeleteReference`: 오른쪽 사이드바에서 참고문헌을 관리하는 함수를 구현합니다.

### 5단계: 스타일링

1.  **전역 CSS 설정 (`index.css`):**
    - 전체 앱 레이아웃, 사이드바, 에디터 컨테이너 등 기본 구조에 대한 스타일을 정의합니다.
    - `prosemirror-view/style/prosemirror.css`와 `katex/dist/katex.min.css`를 임포트합니다.

2.  **컴포넌트별 스타일:**
    - Tiptap 에디터 자체(`ProseMirror` 클래스)의 스타일(폰트, 패딩, 테두리 등)을 정의합니다.
    - 머리글, 본문, 바닥글 영역을 구분하는 스타일을 추가합니다.
    - 다크 모드 또는 기타 테마를 고려하여 CSS 변수를 활용할 수 있습니다.

## 4. 예상되는 과제

- **상태 관리의 복잡성:** 에디터 인스턴스가 여러 개이고, 다양한 컴포넌트가 상태를 공유하므로 props drilling 문제가 발생할 수 있습니다. 필요시 `Context API` 또는 `Redux` 같은 상태 관리 라이브러리 도입을 고려합니다.
- **사용자 정의 노드 뷰:** 수식, 파일 첨부 등 복잡한 노드는 `NodeView` 구현이 까다로울 수 있습니다. Tiptap 문서를 참고하여 신중하게 개발해야 합니다.
- **데이터베이스 연동:** 현재 `mockData`로 구현된 부분을 실제 백엔드 API와 연동하는 작업이 필요합니다. API 명세에 맞춰 데이터 요청 및 업데이트 로직을 수정해야 합니다.
