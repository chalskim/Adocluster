# Adcluster 서버 설치 및 실행 가이드

이 문서는 Adcluster 백엔드 서버를 맥북(MacBook)과 아이맥(iMac) 환경에서 설치하고 실행하는 방법을 안내합니다.

## 목차

- [공통 요구사항](#공통-요구사항)
- [맥북(MacBook) 환경 설정](#맥북macbook-환경-설정)
- [아이맥(iMac) 환경 설정](#아이맥imac-환경-설정)
- [서버 실행 확인](#서버-실행-확인)
- [문제 해결](#문제-해결)

## 공통 요구사항

두 환경 모두 다음 요구사항이 필요합니다:

- Python 3.8 이상
- PostgreSQL 데이터베이스
- Git (소스 코드 관리용)

## 맥북(MacBook) 환경 설정

### 1. 저장소 클론

```bash
git clone <repository-url>
cd AdclusterServer
```

### 2. 가상 환경 생성 및 활성화

```bash
python3 -m venv new_venv
source new_venv/bin/activate
```

### 3. 의존성 설치

```bash
pip3 install -r requirements.txt
```

### 4. 환경 변수 설정

`.env` 파일을 프로젝트 루트 디렉토리에 생성하고 다음 내용을 추가합니다:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adcluster_db
DB_USER=postgres
DB_PASSWORD=your_password
SECRET_KEY=your_secret_key
```

### 5. 데이터베이스 설정

- PostgreSQL이 설치되어 있는지 확인합니다.
- 데이터베이스를 생성합니다:

```bash
psql -U postgres
CREATE DATABASE adcluster_db;
\q
```

### 6. 서버 실행

맥북에서는 다음 명령어로 서버를 실행합니다:

```bash
python3 main.py
```

또는 다음과 같이 실행할 수도 있습니다:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 7. 서버 중지

실행 중인 서버를 중지하려면 다음 명령어를 사용합니다:

```bash
# 8000 포트를 사용 중인 프로세스 확인
lsof -i :8000

# 해당 프로세스 종료 (PID는 위 명령어 결과에서 확인)
kill -9 <PID>
```

## 아이맥(iMac) 환경 설정

### 1. 저장소 클론

```bash
git clone <repository-url>
cd AdclusterServer
```

### 2. 가상 환경 생성 및 활성화

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. 의존성 설치

```bash
pip3 install -r requirements.txt
```

### 4. 환경 변수 설정

`.env` 파일을 프로젝트 루트 디렉토리에 생성하고 다음 내용을 추가합니다:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adcluster_db
DB_USER=postgres
DB_PASSWORD=your_password
SECRET_KEY=your_secret_key
```

### 5. 데이터베이스 설정

- PostgreSQL이 설치되어 있는지 확인합니다.
- 데이터베이스를 생성합니다:

```bash
psql -U postgres
CREATE DATABASE adcluster_db;
\q
```

### 6. 서버 실행

아이맥에서는 다음 명령어로 서버를 실행합니다:

```bash
python3 main.py
```

또는 다음과 같이 실행할 수도 있습니다:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 7. 서버 중지

실행 중인 서버를 중지하려면 다음 명령어를 사용합니다:

```bash
# 8000 포트를 사용 중인 프로세스 확인
lsof -i :8000

# 해당 프로세스 종료 (PID는 위 명령어 결과에서 확인)
kill -9 <PID>
```

## 서버 실행 확인

서버가 성공적으로 실행되면 다음 URL에서 접속할 수 있습니다:

- API 서버: http://localhost:8000
- API 문서: http://localhost:8000/docs
- 대체 API 문서: http://localhost:8000/redoc
- WebSocket 테스트: http://localhost:8000/socket_test.html

## 문제 해결

### 포트 충돌

8000 포트가 이미 사용 중인 경우:

```bash
# 포트를 사용 중인 프로세스 확인
lsof -i :8000

# 해당 프로세스 종료
kill -9 <PID>
```

### 가상 환경 문제

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

### 데이터베이스 연결 문제

데이터베이스 연결에 문제가 있는 경우:

1. PostgreSQL 서비스가 실행 중인지 확인합니다.
2. `.env` 파일의 데이터베이스 자격 증명이 올바른지 확인합니다.
3. 데이터베이스와 사용자가 존재하는지 확인합니다.

```bash
psql -U postgres
\l  # 데이터베이스 목록 확인
\du  # 사용자 목록 확인
```