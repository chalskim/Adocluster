# 자료관리 기능 설명서

## 개요
이 문서는 ADOCluster 시스템의 새로운 자료관리 기능에 대한 설명서입니다. 이 기능은 사용자가 프로젝트별로 다양한 형태의 자료를 효율적으로 관리할 수 있도록 도와줍니다.

## 주요 기능

### 1. 자료 유형별 관리
다음과 같은 다양한 유형의 자료를 관리할 수 있습니다:
- **이미지**: 사진, 그래픽, 차트 등
- **표**: 엑셀 데이터, CSS 기반 표 등
- **수식**: LaTeX 수식
- **동영상**: MP4, AVI 등 다양한 형식
- **음성**: MP3, WAV 등 오디오 파일
- **웹사이트**: URL 링크 및 관련 정보
- **인용**: 참고문헌 및 출처 정보

### 2. 폴더 기반 구조
- 자료를 폴더로 구분하여 체계적으로 관리
- 폴더 이름 변경 기능 제공
- 계층적 폴더 구조 지원

### 3. 자료 관리 기능
- **이미지, 동영상, 음성**: 등록, 삭제, 다운로드
- **수식, 표**: 등록, 수정, 삭제, 다운로드
- 자료별 제목과 설명 등록
- 자료의 기본 정보 자동 추출
- 인터넷에서 가져온 정보의 URL 및 사이트 이미지 저장
- 출처 정보 등록

### 4. 노트 통합 기능
- **이미지**: 제목, 설명, 미리보기, 등록/수정/삭제 기능
- **표**: 데이터 입력 및 표시 기능
- **수식**: 미리보기 및 입력 기능
- **동영상**: 미리보기 기능 (향후 STT, AI 요약 기능 추가 예정)
- **음성**: 미리듣기 기능 (향후 STT, AI 요약 기능 추가 예정)

## 사용 방법

### 1. 자료 추가
1. "자료 추가" 버튼 클릭
2. 자료 유형 선택
3. 필요한 정보 입력 (제목, 작성자, 출판사 등)
4. 파일 업로드 (이미지, 동영상, 음성의 경우)
5. "추가" 버튼 클릭

### 2. 자료 검색
- 상단 검색창을 사용하여 자료 검색
- 제목, 작성자, 키워드 등으로 검색 가능

### 3. 자료 수정/삭제
- 자료 목록에서 수정/삭제 버튼 클릭
- 수정 시 폼에서 정보 변경 후 저장
- 삭제 시 확인 메시지 후 삭제

### 4. 자료 다운로드
- 자료 목록에서 다운로드 버튼 클릭
- 해당 자료 파일 다운로드

## 기술 구조

### 프론트엔드
- **경로**: `/src/components/EnhancedResourceManagement/`
- **주요 컴포넌트**:
  - `EnhancedResourceManagementPage.tsx`: 메인 페이지
  - `ResourceFolderTree.tsx`: 폴더 트리
  - `ResourceList.tsx`: 자료 목록
  - `ResourceFormModal.tsx`: 자료 등록/수정 폼
  - `ResourcePreviewModal.tsx`: 자료 미리보기

### 백엔드
- **라우터**: `/app/routers/resources.py`
- **모델**: `/app/models/my_lib.py`, `/app/models/my_lib_items.py`
- **스키마**: `/app/schemas/resource.py`
- **엔드포인트**:
  - `GET /api/resources`: 자료 목록 조회
  - `POST /api/resources`: 자료 생성
  - `GET /api/resources/{id}`: 특정 자료 조회
  - `PUT /api/resources/{id}`: 자료 수정
  - `DELETE /api/resources/{id}`: 자료 삭제
  - `POST /api/resources/{id}/upload`: 파일 업로드

## 데이터베이스 구조

### mylib 테이블 (자료실)
- `libID`: 자료실 ID (UUID)
- `libName`: 자료실 이름
- `libDescription`: 자료실 설명
- `libCreated`: 생성일
- `libUpdated`: 수정일
- `libOwnerID`: 소유자 ID (users.uid 참조)

### mylibitems 테이블 (자료 항목)
- `itemID`: 자료 항목 ID (UUID)
- `libID`: 자료실 ID (mylib.libID 참조)
- `itemType`: 자료 유형
- `itemTitle`: 자료 제목
- `itemAuthor`: 작성자
- `itemPublisher`: 출판사
- `itemYear`: 출판년도
- `itemURL`: URL
- `itemDOI`: DOI
- `itemISBN`: ISBN
- `itemISSN`: ISSN
- `itemVolume`: 권호
- `itemIssue`: 발행호
- `itemPages`: 페이지
- `itemAbstract`: 요약
- `itemKeywords`: 키워드
- `itemNotes`: 메모
- `itemCreated`: 생성일
- `itemUpdated`: 수정일
- `content`: 추가 정보 (JSON)

## 향후 개선 계획
1. STT (음성->텍스트) 기능 추가
2. AI 요약 기능 추가
3. 자료 공유 기능
4. 태그 기반 분류 기능
5. 자료 버전 관리 기능