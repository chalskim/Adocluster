# EditorPage Top Menu Bar 추가 작업 계획

## 프로젝트 개요
EditorPage 컴포넌트에 Top Menu Bar 기능을 추가하여 리본 스타일의 편집 도구 모음을 구현합니다.

## 작업 목표
- `/Users/nicchals/src/ADOCluster/adCluster/doc/editer_menu.md`에 정의된 기능을 EditorPage에 통합
- 세 가지 탭(Home, Insert, AI Tools)으로 구성된 리본 메뉴 구현
- Tiptap 에디터와의 완전한 통합

## 작업 단계별 계획

### Phase 1: 기본 구조 설정 (우선순위: 높음)
**예상 소요시간: 2-3시간**

#### 1.1 TopMenuBar 컴포넌트 파일 생성
- [ ] `/src/components/TopMenuBar.tsx` 파일 생성
- [ ] 기본 컴포넌트 구조 구현
- [ ] Props 인터페이스 정의 (editor 객체 전달)

#### 1.2 EditorPage 수정
- [ ] import 구문에 TopMenuBar 추가
- [ ] TopMenuBar 컴포넌트 렌더링 위치 확인
- [ ] editor props 전달 구현

### Phase 2: 탭 구조 구현 (우선순위: 높음)
**예상 소요시간: 3-4시간**

#### 2.1 탭 네비게이션 구현
- [ ] Home 탭 UI 구현
- [ ] Insert 탭 UI 구현  
- [ ] AI Tools 탭 UI 구현
- [ ] 활성 탭 상태 관리 (useState)

#### 2.2 탭 콘텐츠 영역 구현
- [ ] 각 탭별 기능 그룹 구성
- [ ] 버튼 레이아웃 및 아이콘 배치
- [ ] 반응형 그리드 시스템 적용

### Phase 3: 기능 통합 (우선순위: 중간)
**예상 소요시간: 4-5시간**

#### 3.1 텍스트 포맷팅 기능
- [ ] Bold, Italic, Underline, Strike 구현
- [ ] Font family, font size 컨트롤
- [ ] Text align 기능 (좌우중앙 정렬)
- [ ] Text color 및 highlight 기능

#### 3.2 리스트 및 블록 기능
- [ ] Bullet list, Ordered list 구현
- [ ] Blockquote 기능
- [ ] Code block 기능
- [ ] Horizontal rule 삽입

#### 3.3 미디어 및 특수 요소
- [ ] Link 삽입/편집 기능
- [ ] Image 삽입 기능
- [ ] Table 생성/편집 기능
- [ ] File attachment 기능
- [ ] Equation (수식) 삽입 기능

### Phase 4: 고급 기능 구현 (우선순위: 중간)
**예상 소요시간: 3-4시간**

#### 4.1 PDF Export 기능
- [ ] html2pdf.js 라이브러리 설치 및 설정
- [ ] PDF 내보내기 모달 구현
- [ ] A4 페이지 레이아웃 적용
- [ ] CSS 스타일링 최적화

#### 4.2 위치 정보 기능
- [ ] 텍스트 선택 위치 추적
- [ ] 커서 위치 표시
- [ ] 선택 영역 하이라이트

#### 4.3 데이터 태깅
- [ ] DataTag 확장 프로그램 활용
- [ ] 메타데이터 연결 기능
- [ ] 태그 관리 모달 구현

### Phase 5: AI Tools 통합 (우선순위: 낮음)
**예상 소요시간: 2-3시간**

#### 5.1 AI 기능 스켈레톤 구현
- [ ] AI Tools 탭 기본 구조
- [ ] 텍스트 요약 기능 인터페이스
- [ ] 번역 기능 인터페이스
- [ ] 콘텐츠 재구성 기능 인터페이스

### Phase 6: 스타일링 및 최적화 (우선순위: 중간)
**예상 소요시간: 2-3시간**

#### 6.1 CSS 스타일링
- [ ] 리본 스타일 CSS 클래스 정의
- [ ] Material Design 아이콘 통합
- [ ] 다크/라이트 테마 지원
- [ ] 반응형 디자인 적용

#### 6.2 접근성 개선
- [ ] 키보드 네비게이션
- [ ] ARIA 속성 추가
- [ ] 포커스 관리 개선

### Phase 7: 테스트 및 디버깅 (우선순위: 낮음)
**예상 소요시간: 1-2시간**

#### 7.1 기능 테스트
- [ ] 각 버튼 기능 검증
- [ ] 탭 전환 동작 확인
- [ ] 모달 동작 테스트
- [ ] 모바일 반응성 확인

#### 7.2 성능 최적화
- [ ] 메모이제이션 적용
- [ ] 불필요한 리렌더링 방지
- [ ] 이미지/아이콘 최적화

## 의존성 설치 목록

### 필수 라이브러리
```bash
npm install html2pdf.js
npm install @material-symbols/svg-400
```

### 선택 라이브러리 (AI 기능 확장 시)
```bash
npm install axios  # API 통신용
```

## 파일 구조 변경사항

### 새로 생성될 파일
```
src/
├── components/
│   ├── TopMenuBar.tsx          # 메인 리본 메뉴
│   ├── ribbon-tabs/
│   │   ├── HomeTab.tsx         # Home 탭 콘텐츠
│   │   ├── InsertTab.tsx       # Insert 탭 콘텐츠
│   │   └── AIToolsTab.tsx      # AI Tools 탭 콘텐츠
│   └── modals/
│       ├── PDFExportModal.tsx  # PDF 내보내기 모달
│       ├── LinkModal.tsx       # 링크 삽입 모달
│       └── DataTagModal.tsx    # 데이터 태그 모달
```

### 수정될 기존 파일
```
src/
├── components/
│   └── EditorPage.tsx          # TopMenuBar import 및 통합
├── App.css                     # 리본 스타일 추가
└── tailwind.config.cjs         # 새로운 컬러/스페이스 정의
```

## 구현 우선순위

1. **즉시 구현** (Phase 1-2): 기본 구조와 탭 UI
2. **단기 구현** (Phase 3): 핵심 편집 기능
3. **중기 구현** (Phase 4-5): 고급 기능 및 AI 도구
4. **장기 구현** (Phase 6-7): 스타일링 및 최적화

## 위험 요소 및 대응책

### 잠재적 문제점
1. **Tiptap 버전 호환성**: 현재 사용 중인 확장 프로그램과의 충돌 가능성
2. **성능 저하**: 많은 버튼과 기능으로 인한 렌더링 지연
3. **모바일 반응성**: 복잡한 리본 UI의 모바일 최적화

### 대응 전략
1. **점진적 통합**: 작은 단위로 기능 추가하며 테스트
2. **성능 모니터링**: React DevTools로 렌더링 성능 추적
3. **반응형 테스트**: 다양한 화면 크기에서 지속적 테스트

## 완료 기준

- [ ] 모든 탭이 정상적으로 표시되고 전환됨
- [ ] 기본 텍스트 포맷팅 기능이 작동함
- [ ] PDF 내보내기 기능이 정상 작동함
- [ ] 모바일에서도 사용 가능한 UI 제공
- [ ] 기존 EditorPage 기능과 충돌 없음

## 다음 단계

이 작업 계획을 바탕으로 Phase 1부터 순차적으로 구현을 시작합니다. 각 Phase 완료 시 코드 리뷰 및 테스트를 진행합니다.