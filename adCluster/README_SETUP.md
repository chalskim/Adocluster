# Adcluster 프론트엔드 설치 및 실행 가이드

이 문서는 Adcluster 프론트엔드 애플리케이션을 맥북(MacBook)과 아이맥(iMac) 환경에서 설치하고 실행하는 방법을 안내합니다.

## 목차

- [공통 요구사항](#공통-요구사항)
- [맥북(MacBook) 환경 설정](#맥북macbook-환경-설정)
- [아이맥(iMac) 환경 설정](#아이맥imac-환경-설정)
- [애플리케이션 실행 확인](#애플리케이션-실행-확인)
- [문제 해결](#문제-해결)

## 공통 요구사항

두 환경 모두 다음 요구사항이 필요합니다:

- Node.js 14.0 이상
- npm 6.0 이상 또는 yarn 1.22 이상
- Git (소스 코드 관리용)

## 맥북(MacBook) 환경 설정

### 1. 저장소 클론

```bash
git clone <repository-url>
cd adCluster
```

### 2. 의존성 설치

npm 사용:

```bash
npm install
```

또는 yarn 사용:

```bash
yarn install
```

### 3. 환경 변수 설정

`.env` 파일을 프로젝트 루트 디렉토리에 생성하고 다음 내용을 추가합니다:

```
VITE_API_URL=http://localhost:8000
```

### 4. 개발 서버 실행

npm 사용:

```bash
npm run dev
```

또는 yarn 사용:

```bash
yarn dev
```

### 5. 프로덕션 빌드

npm 사용:

```bash
npm run build
npm run preview
```

또는 yarn 사용:

```bash
yarn build
yarn preview
```

## 아이맥(iMac) 환경 설정

### 1. 저장소 클론

```bash
git clone <repository-url>
cd adCluster
```

### 2. 의존성 설치

npm 사용:

```bash
npm install
```

또는 yarn 사용:

```bash
yarn install
```

### 3. 환경 변수 설정

`.env` 파일을 프로젝트 루트 디렉토리에 생성하고 다음 내용을 추가합니다:

```
VITE_API_URL=http://localhost:8000
```

### 4. 개발 서버 실행

npm 사용:

```bash
npm run dev
```

또는 yarn 사용:

```bash
yarn dev
```

### 5. 프로덕션 빌드

npm 사용:

```bash
npm run build
npm run preview
```

또는 yarn 사용:

```bash
yarn build
yarn preview
```

## 애플리케이션 실행 확인

개발 서버가 성공적으로 실행되면 다음 URL에서 접속할 수 있습니다:

- 개발 서버: http://localhost:5173
- 프로덕션 프리뷰: http://localhost:4173 (빌드 후 preview 명령어 실행 시)

## 문제 해결

### 포트 충돌

5173 포트가 이미 사용 중인 경우, Vite는 자동으로 다음 사용 가능한 포트를 사용합니다. 터미널 출력에서 실제 사용 중인 포트를 확인하세요.

### 의존성 문제

의존성 설치에 문제가 있는 경우:

```bash
# node_modules 삭제
rm -rf node_modules

# package-lock.json 또는 yarn.lock 삭제
rm -f package-lock.json
# 또는
rm -f yarn.lock

# 의존성 재설치
npm install
# 또는
yarn install
```

### API 연결 문제

백엔드 API 연결에 문제가 있는 경우:

1. 백엔드 서버가 실행 중인지 확인합니다.
2. `.env` 파일의 `VITE_API_URL` 값이 올바른지 확인합니다.
3. 브라우저 콘솔에서 CORS 관련 오류가 있는지 확인합니다.

### 빌드 문제

빌드에 문제가 있는 경우:

```bash
# 캐시 삭제 후 다시 빌드
npm run build -- --force
# 또는
yarn build --force
```