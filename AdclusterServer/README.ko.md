# Adcluster 서버

이 프로젝트는 FastAPI로 구축된 Adcluster 프로젝트의 백엔드 서버입니다.

## 프로젝트 구조

```
.
├── main.py                 # 애플리케이션 진입점
├── requirements.txt        # 파이썬 의존성
├── .env                    # 환경 변수 (버전 관리에 포함되지 않음)
├── .gitignore              # Git 무시 파일
├── README.md               # 이 파일 (영문)
├── README.ko.md            # 이 파일 (한글)
├── socket_test.html       # WebSocket 테스트 인터페이스
├── group_messaging_test.html # 그룹 메시징 테스트 인터페이스
├── db/                    # 데이터베이스 관련 스크립트
│   ├── db_full_backup.py  # 데이터베이스 전체 백업 스크립트
│   ├── db_restore.py      # 데이터베이스 복원 스크립트
│   ├── db_web_gui.py      # 데이터베이스 웹 GUI
│   └── ...                # 기타 데이터베이스 관련 스크립트
├── dbBackup/              # 데이터베이스 백업 파일 저장 디렉토리
│   └── full_backup_*.sql  # 백업 파일들
├── uploads/               # 파일 업로드 디렉토리
│   ├── images/            # 이미지 업로드
│   ├── documents/         # 문서 업로드
│   └── files/             # 기타 파일 업로드
└── app/                   # 메인 애플리케이션 패키지
    ├── __init__.py
    ├── core/              # 핵심 설정
    │   ├── __init__.py
    │   ├── config.py      # 애플리케이션 설정
    │   ├── database.py    # 데이터베이스 설정
    │   ├── dependencies.py # 인증 의존성
    │   ├── jwt.py         # JWT 토큰 처리
    │   └── security.py    # 비밀번호 해싱 유틸리티
    ├── routers/           # API 라우터
    │   ├── __init__.py
    │   ├── auth.py        # 인증 라우터
    │   ├── users.py       # 사용자 라우터
    │   ├── websocket.py   # WebSocket 라우터
    │   └── uploads_router.py # 파일 업로드 라우터
    ├── schemas/           # Pydantic 모델
    │   ├── __init__.py
    │   ├── auth.py        # 인증 스키마
    │   └── user.py        # 사용자 스키마
    └── models/            # 데이터베이스 모델
        ├── __init__.py
        ├── user.py        # 사용자 모델
        ├── team.py        # 팀 모델
        └── ...            # 기타 모델
```

## 설정
# windows
1. 가상 환경 생성:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows에서는: venv\Scripts\activate
   ```

bin/activate
2. 의존성 설치:
   ```bash
   pip3 install fastapi uvicorn 
   python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 
   pip install -r requirements.txt
   ```

3. PostgreSQL 데이터베이스 설정:
   - 시스템에 PostgreSQL 설치
   - .env 파일에 따라 데이터베이스 및 사용자 생성
   - 실제 데이터베이스 자격 증명으로 .env 파일 업데이트

4. 서버 실행:
   ```bash
   source /Users/nicchals/src/Adcluster/server/venv/
   uvicorn main:app --reload
   ```
# MacBook
   lsof -i :8000
   kill -9 4478 4488
   source /Users/nicchals/src/Adcluster/server/venv/
   python main.py --port 8000

서버는 `http://localhost:8000`에서 시작됩니다.

### 테스트
http://localhost:8000/socket_test.html

## 환경 변수

루트 디렉토리에 다음 변수가 포함된 `.env` 파일을 생성합니다:

# 데이터 베이스 서버
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adcluster_db
DB_USER=postgres
DB_PASSWORD=a770405z
SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
```

## API 문서

- 대화형 API 문서: `http://localhost:8000/docs`
- 대체 API 문서: `http://localhost:8000/redoc`

## 인증

서버는 JWT 기반 인증을 구현합니다:

1. 사용자는 이메일과 비밀번호로 `POST /auth/login`을 통해 로그인합니다
2. 인증 성공 시 서버는 JWT 액세스 토큰을 반환합니다
3. 클라이언트는 보호된 엔드포인트에 대해 Authorization 헤더에 이 토큰을 포함합니다
4. 토큰은 기본적으로 30분 후에 만료됩니다

## WebSocket 지원

서버는 실시간 통신을 위한 WebSocket 엔드포인트를 포함합니다:

1. `ws://localhost:8000/ws` - 기본 WebSocket 엔드포인트
2. `ws://localhost:8000/ws/{client_id}` - 클라이언트 식별이 포함된 WebSocket 엔드포인트
3. `ws://localhost:8000/ws/{client_id}/{group}` - 클라이언트 식별 및 그룹이 포함된 WebSocket 엔드포인트

### WebSocket 명령어

- `/send_to <client_id> <message>` - 특정 클라이언트에게 개인 메시지 보내기
- `/group <message>` - 같은 그룹의 모든 클라이언트에게 메시지 보내기
- `/join <group_name>` - 그룹 멤버십 변경

### 그룹 메시징

서버는 클라이언트를 그룹으로 구성할 수 있는 그룹 기반 메시징을 지원합니다:

- 그룹 내에서 전송된 메시지는 같은 그룹의 클라이언트에게만 전달됩니다
- 클라이언트는 `/join` 명령을 사용하여 동적으로 그룹을 전환할 수 있습니다
- 개인 메시지는 그룹 멤버십에 관계없이 모든 클라이언트 간에 전송할 수 있습니다
- **그룹 관리**: 클라이언트는 생성된 그룹 목록과 해당 그룹의 멤버 목록을 가져올 수 있습니다

그룹 메시징 기능을 테스트하려면 웹 브라우저에서 `group_messaging_test.html`을 엽니다.

## 파일 업로드 지원

서버는 파일 업로드를 처리하기 위한 엔드포인트를 포함합니다:

- 파일은 유형에 따라 자동으로 하위 디렉토리로 정리됩니다:
  - 이미지: `uploads/images/` (jpg, jpeg, png, gif, bmp, webp, tiff, svg)
  - 문서: `uploads/documents/` (txt, doc, docx, xls, xlsx, ppt, pptx, hwp, hwpx, pdf, rtf, odt, ods, odp)
  - 기타 파일: `uploads/files/` (다른 모든 파일 형식)
- 모든 업로드된 파일에는 충돌을 방지하기 위해 고유한 이름이 부여됩니다
- 파일은 `http://localhost:8000/uploads/`에서 정적 파일 서버를 통해 액세스할 수 있습니다

## 데이터베이스 연결 실패 대응 기능

서버는 데이터베이스 연결 실패 상황에서도 안정적으로 작동하도록 설계되었습니다:

- **자동 재시도 메커니즘**: 데이터베이스 연결 실패 시 자동으로 재연결을 시도합니다
- **그레이스풀 디그레이드**: 데이터베이스 연결이 불가능한 경우에도 핵심 기능은 계속 작동합니다
- **메모리 캐싱**: 중요 데이터는 메모리에 캐싱되어 일시적인 데이터베이스 중단 시에도 서비스가 유지됩니다
- **오류 로깅 및 알림**: 데이터베이스 연결 문제 발생 시 자세한 로그를 생성하고 관리자에게 알림을 보냅니다
- **워크플로우 관리자**: 워크플로우 실행 중 데이터베이스 연결 실패 시에도 작업을 계속 진행하고 결과를 안전하게 처리합니다

이러한 기능은 시스템의 안정성과 복원력을 크게 향상시키며, 데이터베이스 서버 유지보수나 일시적인 네트워크 문제 발생 시에도 서비스 중단을 최소화합니다.

## 데이터베이스 백업 및 복구

서버는 PostgreSQL 데이터베이스의 백업 및 복구를 위한 스크립트를 제공합니다:

### db/db_full_backup.py

`db/db_full_backup.py`는 PostgreSQL 데이터베이스의 전체 백업을 생성하는 스크립트입니다. 이 스크립트는 다음과 같은 기능을 제공합니다:

- `.env` 파일에서 데이터베이스 자격 증명 자동 로드
- 타임스탬프가 포함된 백업 파일 생성 (dbBackup 폴더에 저장)
- 백업 프로세스 로깅
- 오류 처리 및 보고

#### 사용법

```bash
# 기본 백업 실행
python3 db/db_full_backup.py

# 또는 실행 권한 부여 후 직접 실행
chmod +x db/db_full_backup.py
./db/db_full_backup.py
```

### db/db_restore.py

`db/db_restore.py`는 PostgreSQL 데이터베이스 백업을 복원하는 스크립트입니다. 이 스크립트는 다음과 같은 기능을 제공합니다:

- `.env` 파일에서 데이터베이스 자격 증명 자동 로드
- dbBackup 폴더에서 최신 백업 파일 자동 감지 또는 특정 백업 파일 지정 가능
- 복원 전 사용자 확인 요청
- 드라이 런 모드 (실제 복원 없이 명령 및 백업 파일 크기 표시)
- 복원 프로세스 로깅
- 오류 처리 및 보고

#### 사용법

```bash
# 도움말 표시
python3 db/db_restore.py --help

# 최신 백업 파일로 복원 (드라이 런 모드)
python3 db/db_restore.py --dry-run

# 특정 백업 파일로 복원 (드라이 런 모드)
python3 db/db_restore.py --dry-run dbBackup/full_backup_2023-09-06.sql

# 최신 백업 파일로 실제 복원 (사용자 확인 필요)
python3 db/db_restore.py

# 특정 백업 파일로 실제 복원 (사용자 확인 필요)
python3 db/db_restore.py dbBackup/full_backup_2023-09-06.sql
```

> **경고**: 복원 프로세스는 기존 데이터베이스 데이터를 덮어쓰게 됩니다. 복원 전에 항상 중요한 데이터를 백업하고 신중하게 진행하세요.

## 데이터베이스 웹 GUI

서버는 데이터베이스를 쉽게 탐색하고 관리할 수 있는 웹 기반 GUI를 제공합니다:

### db/db_web_gui.py

`db/db_web_gui.py`는 PostgreSQL 데이터베이스를 위한 웹 기반 쿼리 실행기입니다. 이 도구를 사용하면 다음과 같은 작업을 수행할 수 있습니다:

- 데이터베이스 테이블 목록 조회
- 테이블 구조 및 데이터 샘플 확인
- SQL 쿼리 실행 및 결과 확인
- 쿼리 결과를 CSV 또는 JSON 형식으로 내보내기
- 쿼리 결과를 막대 차트, 선 차트, 파이 차트로 시각화
- 자주 사용하는 쿼리 저장 및 재사용

#### 실행 방법

```bash
pip3 install pandas matplotlib flask 
python3 db/db_web_gui.py
```

웹 브라우저에서 `http://localhost:3030`으로 접속하여 사용할 수 있습니다.

#### 주요 기능

- **테이블 탐색**: 데이터베이스의 모든 테이블 목록을 확인하고 각 테이블의 구조와 데이터를 조회할 수 있습니다.
- **쿼리 실행**: SQL 쿼리를 작성하고 실행하여 결과를 확인할 수 있습니다.
- **데이터 시각화**: 쿼리 결과를 다양한 차트 형식으로 시각화할 수 있습니다.
- **데이터 내보내기**: 쿼리 결과를 CSV 또는 JSON 형식으로 내보낼 수 있습니다.
- **쿼리 저장**: 자주 사용하는 쿼리를 저장하고 필요할 때 불러와 재사용할 수 있습니다.

## 엔드포인트

### 일반
- `GET /` - 환영 메시지
- `GET /health` - 상태 확인

### 인증
- `POST /auth/login` - 사용자 로그인 (JWT 토큰 반환)

### 사용자
- `GET /users/` - 사용자 목록 가져오기
- `GET /users/{user_id}` - 특정 사용자 가져오기
- `GET /users/me` - 현재 사용자 프로필 가져오기 (보호됨)
- `POST /users/` - 새 사용자 생성

### WebSocket
- `WebSocket /ws` - 기본 WebSocket 엔드포인트
- `WebSocket /ws/{client_id}` - 클라이언트 식별이 포함된 WebSocket 엔드포인트
- `WebSocket /ws/{client_id}/{group}` - 클라이언트 식별 및 그룹이 포함된 WebSocket 엔드포인트
- `GET /api/ws/clients` - 연결된 WebSocket 클라이언트 목록 가져오기
- `GET /api/ws/groups` - 생성된 모든 그룹 목록과 멤버 수 가져오기
- `GET /api/ws/groups/{group_name}` - 특정 그룹의 멤버 가져오기
- `POST /api/ws/send_to/{client_id}` - 특정 클라이언트에게 메시지 보내기
- `POST /api/ws/broadcast_to_group/{group_name}` - 그룹에 메시지 브로드캐스트

### 파일 업로드
- `POST /api/upload` - 단일 파일 업로드
- `POST /api/upload/multiple` - 여러 파일 업로드
- `GET /api/files` - 모든 업로드된 파일 목록
- `DELETE /api/files/{filename}` - 특정 파일 삭제
- `GET /uploads/{file_path}` - 업로드된 파일 액세스 (정적 파일 제공)
