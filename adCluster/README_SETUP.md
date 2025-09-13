# Adcluster 프론트엔드 설치 및 실행 가이드

이 문서는 Adcluster 프론트엔드 애플리케이션을 맥북(MacBook)과 아이맥(iMac) 환경에서 설치하고 실행하는 방법을 안내합니다.

## 목차

- [공통 요구사항](#공통-요구사항)
- [맥북(MacBook) 환경 설정](#맥북macbook-환경-설정)
- [아이맥(iMac) 환경 설정](#아이맥imac-환경-설정)
- [애플리케이션 실행 확인](#애플리케이션-실행-확인)
- [백엔드 서버 환경 설정](#백엔드-서버-환경-설정)
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
VITE_API_BASE_URL=http://localhost:8000
VITE_LOGIN_ENDPOINT=/auth/login
VITE_SIGNUP_ENDPOINT=/auth/signup
VITE_GOOGLE_LOGIN_ENDPOINT=/auth/google-login
VITE_APP_NAME=ADOCluster
```

각 환경 변수의 역할:
- `VITE_API_BASE_URL`: 백엔드 API 서버의 기본 URL
- `VITE_LOGIN_ENDPOINT`: 로그인 API 엔드포인트 경로
- `VITE_SIGNUP_ENDPOINT`: 회원가입 API 엔드포인트 경로
- `VITE_GOOGLE_LOGIN_ENDPOINT`: 구글 로그인 API 엔드포인트 경로
- `VITE_APP_NAME`: 애플리케이션 이름

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
VITE_API_BASE_URL=http://localhost:8000
VITE_LOGIN_ENDPOINT=/auth/login
VITE_SIGNUP_ENDPOINT=/auth/signup
VITE_GOOGLE_LOGIN_ENDPOINT=/auth/google-login
VITE_APP_NAME=ADOCluster
```

각 환경 변수의 역할은 맥북 환경 설정의 환경 변수 설정 섹션을 참조하세요.

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

## 백엔드 서버 환경 설정

프론트엔드가 올바르게 작동하려면 백엔드 서버도 적절히 설정되어야 합니다. 백엔드 서버는 프로젝트 루트 디렉토리의 상위 폴더에 있는 `AdclusterServer` 디렉토리에 위치해 있습니다.

### 1. 백엔드 환경 변수 설정

백엔드 서버의 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가합니다:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adcluster_db
DB_USER=adcluster
DB_PASSWORD=your_password
SECRET_KEY=your_secret_key
```

각 환경 변수의 역할:
- `DB_HOST`: 데이터베이스 호스트 주소
- `DB_PORT`: 데이터베이스 포트
- `DB_NAME`: 데이터베이스 이름
- `DB_USER`: 데이터베이스 사용자 이름
- `DB_PASSWORD`: 데이터베이스 비밀번호
- `SECRET_KEY`: JWT 토큰 생성 및 검증에 사용되는 비밀 키 (최소 32자 이상의 복잡한 문자열 권장)

> **중요**: 실제 운영 환경에서는 보안을 위해 강력한 비밀번호와 SECRET_KEY를 사용하세요. SECRET_KEY는 무작위로 생성된 문자열을 사용하는 것이 좋습니다.

### 2. 백엔드 서버 실행

```bash
# 프로젝트 루트 디렉토리에서 상위 폴더로 이동 후 AdclusterServer로 이동
cd ../AdclusterServer

# 필요한 패키지 설치 (처음 실행 시)
pip install -r requirements.txt

# 서버 실행
python main.py
```

백엔드 서버가 성공적으로 실행되면 http://localhost:8000 에서 접속할 수 있습니다.

### 3. 데이터베이스 설정

백엔드 서버는 PostgreSQL 데이터베이스를 사용합니다. 데이터베이스가 설정되어 있지 않은 경우 다음 단계를 따르세요:

1. PostgreSQL이 설치되어 있는지 확인합니다.
2. 데이터베이스와 사용자를 생성합니다:

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE adcluster_db;

# 사용자 생성 및 권한 부여
CREATE USER adcluster WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE adcluster_db TO adcluster;

# PostgreSQL 종료
\q
```

3. 백엔드 서버 디렉토리에서 데이터베이스 초기화 스크립트를 실행합니다:

```bash
python init_db.py
```

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

### 환경 변수 문제

환경 변수 설정에 문제가 있는 경우:

1. `.env` 파일이 프로젝트 루트 디렉토리에 있는지 확인합니다.
2. 환경 변수 이름이 정확히 일치하는지 확인합니다 (오타 주의).
3. 환경 변수 변경 후에는 개발 서버를 재시작해야 변경사항이 적용됩니다.
4. Vite는 `VITE_` 접두사가 있는 환경 변수만 클라이언트 코드에서 접근할 수 있습니다.

### API 연결 문제

백엔드 API 연결에 문제가 있는 경우:

1. 백엔드 서버가 실행 중인지 확인합니다 (`python main.py` 명령어로 실행).
2. `.env` 파일의 `VITE_API_BASE_URL` 값이 올바른지 확인합니다 (기본값: `http://localhost:8000`).
3. 환경 변수가 올바르게 설정되었는지 확인합니다 (VITE_LOGIN_ENDPOINT, VITE_SIGNUP_ENDPOINT 등).
4. 브라우저 콘솔에서 CORS 관련 오류가 있는지 확인합니다.
5. 백엔드 서버의 `.env` 파일에 SECRET_KEY가 설정되어 있는지 확인합니다.
6. 데이터베이스 연결 정보가 올바른지 확인합니다.

백엔드와 프론트엔드 연결 테스트:

```bash
# 백엔드 서버가 실행 중인지 확인
curl http://localhost:8000/docs

# API 엔드포인트 테스트 (예: 로그인 엔드포인트)
curl -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password"}'  
```

### 빌드 문제

빌드에 문제가 있는 경우:

```bash
# 캐시 삭제 후 다시 빌드
npm run build -- --force
# 또는
yarn build --force
```