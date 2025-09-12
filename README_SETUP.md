# Adcluster 프로젝트 설치 및 실행 가이드

이 문서는 Adcluster 프로젝트(백엔드 및 프론트엔드)를 맥북(MacBook)과 아이맥(iMac) 환경에서 설치하고 실행하는 방법을 안내합니다.

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [맥북(MacBook) 환경 설정](#맥북macbook-환경-설정)
  - [백엔드 설정](#맥북-백엔드-설정)
  - [프론트엔드 설정](#맥북-프론트엔드-설정)
- [아이맥(iMac) 환경 설정](#아이맥imac-환경-설정)
  - [백엔드 설정](#아이맥-백엔드-설정)
  - [프론트엔드 설정](#아이맥-프론트엔드-설정)
- [문제 해결](#문제-해결)

## 프로젝트 개요

Adcluster 프로젝트는 다음 두 부분으로 구성됩니다:

1. **백엔드 서버 (AdclusterServer)**: FastAPI로 개발된 RESTful API 및 WebSocket 서버
2. **프론트엔드 애플리케이션 (adCluster)**: React와 TypeScript로 개발된 웹 애플리케이션

## 맥북(MacBook) 환경 설정

### 맥북 백엔드 설정

#### 1. 요구사항

- Python 3.8 이상
- PostgreSQL 데이터베이스
- Git

#### 2. 저장소 클론

```bash
git clone <repository-url>
cd AdclusterServer
```

#### 3. 가상 환경 생성 및 활성화

```bash
python3 -m venv new_venv
source new_venv/bin/activate
```

#### 4. 의존성 설치

```bash
pip3 install -r requirements.txt
```

#### 5. 환경 변수 설정

`.env` 파일을 프로젝트 루트 디렉토리에 생성하고 다음 내용을 추가합니다:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adcluster_db
DB_USER=postgres
DB_PASSWORD=your_password
SECRET_KEY=your_secret_key
```

#### 6. 데이터베이스 설정

- PostgreSQL이 설치되어 있는지 확인합니다.
- 데이터베이스를 생성합니다:

```bash
psql -U postgres
CREATE DATABASE adcluster_db;
\q
```

#### 7. 서버 실행

맥북에서는 다음 명령어로 서버를 실행합니다:

```bash
python3 main.py
```

또는 다음과 같이 실행할 수도 있습니다:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

또는 FastAPI CLI를 사용할 수 있습니다(설치된 경우):

```bash
fastapi dev main.py
```

#### 8. 서버 중지

실행 중인 서버를 중지하려면 다음 명령어를 사용합니다:

```bash
# 8000 포트를 사용 중인 프로세스 확인
lsof -i :8000

# 해당 프로세스 종료 (PID는 위 명령어 결과에서 확인)
kill -9 <PID>
```

### 맥북 프론트엔드 설정

#### 1. 요구사항

- Node.js 14.0 이상
- npm 6.0 이상 또는 yarn 1.22 이상

#### 2. 저장소 클론

```bash
git clone <repository-url>
cd adCluster
```

#### 3. 의존성 설치

npm 사용:

```bash
npm install
```

또는 yarn 사용:

```bash
yarn install
```

#### 4. 환경 변수 설정

`.env` 파일을 프로젝트 루트 디렉토리에 생성하고 다음 내용을 추가합니다:

```
VITE_API_URL=http://localhost:8000
```

#### 5. 개발 서버 실행

npm 사용:

```bash
npm run dev
```

또는 yarn 사용:

```bash
yarn dev
```

## 아이맥(iMac) 환경 설정

### 아이맥 백엔드 설정

#### 1. 요구사항

- Python 3.8 이상
- PostgreSQL 데이터베이스
- Git

#### 2. 저장소 클론

```bash
git clone <repository-url>
cd AdclusterServer
```

#### 3. 가상 환경 생성 및 활성화

```bash
python3 -m venv venv
source venv/bin/activate
```

#### 4. 의존성 설치

```bash
pip3 install -r requirements.txt
```

#### 5. 환경 변수 설정

`.env` 파일을 프로젝트 루트 디렉토리에 생성하고 다음 내용을 추가합니다:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adcluster_db
DB_USER=postgres
DB_PASSWORD=your_password
SECRET_KEY=your_secret_key
```

#### 6. 데이터베이스 설정

- PostgreSQL이 설치되어 있는지 확인합니다.
- 데이터베이스를 생성합니다:

```bash
psql -U postgres
CREATE DATABASE adcluster_db;
\q
```

#### 7. 서버 실행

아이맥에서는 다음 명령어로 서버를 실행합니다:

```bash
python3 main.py
```

또는 다음과 같이 실행할 수도 있습니다:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

또는 FastAPI CLI를 사용할 수 있습니다(설치된 경우):

```bash
fastapi dev main.py
```

#### 8. 서버 중지

실행 중인 서버를 중지하려면 다음 명령어를 사용합니다:

```bash
# 8000 포트를 사용 중인 프로세스 확인
lsof -i :8000

# 해당 프로세스 종료 (PID는 위 명령어 결과에서 확인)
kill -9 <PID>
```

### 아이맥 프론트엔드 설정

#### 1. 요구사항

- Node.js 14.0 이상
- npm 6.0 이상 또는 yarn 1.22 이상

#### 2. 저장소 클론

```bash
git clone <repository-url>
cd adCluster
```

#### 3. 의존성 설치

npm 사용:

```bash
npm install
```

또는 yarn 사용:

```bash
yarn install
```

#### 4. 환경 변수 설정

`.env` 파일을 프로젝트 루트 디렉토리에 생성하고 다음 내용을 추가합니다:

```
VITE_API_URL=http://localhost:8000
```

#### 5. 개발 서버 실행

npm 사용:

```bash
npm run dev
```

또는 yarn 사용:

```bash
yarn dev
```

## 문제 해결

### 백엔드 문제 해결

#### 포트 충돌

8000 포트가 이미 사용 중인 경우:

```bash
# 포트를 사용 중인 프로세스 확인
lsof -i :8000

# 해당 프로세스 종료
kill -9 <PID>
```

또는 다른 포트를 사용하여 서버를 실행할 수 있습니다:

```bash
python3 main.py --port 8001
```

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

#### 가상 환경 문제

가상 환경 활성화에 문제가 있는 경우:

```bash
# 기존 가상 환경 삭제
rm -rf new_venv

# 새 가상 환경 생성
python3 -m venv new_venv
source new_venv/bin/activate

# 의존성 재설치
pip3 install -r requirements.txt
```

#### 데이터베이스 연결 문제

데이터베이스 연결에 문제가 있는 경우:

1. PostgreSQL 서비스가 실행 중인지 확인합니다.
2. `.env` 파일의 데이터베이스 자격 증명이 올바른지 확인합니다.
3. 데이터베이스와 사용자가 존재하는지 확인합니다.

```bash
psql -U postgres
\l  # 데이터베이스 목록 확인
\du  # 사용자 목록 확인
```

#### FastAPI 서버 로그 확인

서버 실행 시 문제가 발생하는 경우 로그를 확인합니다:

```bash
# 디버그 모드로 실행
uvicorn main:app --reload --host 0.0.0.0 --port 8000 --log-level debug
```

### 프론트엔드 문제 해결

#### 포트 충돌

5173 포트가 이미 사용 중인 경우, Vite는 자동으로 다음 사용 가능한 포트를 사용합니다. 터미널 출력에서 실제 사용 중인 포트를 확인하세요.

#### 의존성 문제

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

#### API 연결 문제

백엔드 API 연결에 문제가 있는 경우:

1. 백엔드 서버가 실행 중인지 확인합니다.
2. `.env` 파일의 `VITE_API_URL` 값이 올바른지 확인합니다.
3. 브라우저 콘솔에서 CORS 관련 오류가 있는지 확인합니다.
4. 백엔드 서버의 CORS 설정이 올바른지 확인합니다.

#### 개발 서버 성능 문제

개발 서버가 느리게 실행되는 경우:

```bash
# 빌드 모드로 실행하여 성능 확인
npm run build
npm run preview
# 또는
yarn build
yarn preview
```