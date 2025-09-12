FastAPI 기반 API 프로토콜 디자인
이 프로토콜은 FastAPI를 사용하여 백엔드 API를 구축할 때 필요한 주요 엔드포인트, HTTP 메서드, 요청 및 응답 본문 구조를 정의합니다.
공통 지침:
인증: 모든 보호된 엔드포인트는 JWT 토큰을 통한 인증을 요구합니다. Authorization: Bearer <token> 헤더를 사용합니다.
응답: 성공적인 요청에는 해당 데이터와 함께 2xx 상태 코드를 반환합니다. 오류 발생 시, 적절한 HTTP 상태 코드 (예: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error)와 함께 오류 메시지를 포함한 JSON 응답을 반환합니다.
날짜/시간: 모든 날짜/시간 필드는 ISO 8601 형식(예: YYYY-MM-DDTHH:MM:SSZ)을 사용합니다.
일관된 ID: 모든 리소스 ID는 고유한 UUID 또는 숫자 ID를 사용합니다.
1. 인용 서비스 (Auth Service)
설명: 사용자 인증 및 권한 부여, 접근 제어 관련 기능을 제공합니다.
API 엔드포인트:
사용자 등록: POST /auth/register
요청: {"username": "string", "password": "string", "email": "string"}
응답: {"message": "User registered successfully", "user_id": "uuid"}
로그인 (Access Token 발급): POST /auth/login
요청: {"username": "string", "password": "string"}
응답: {"access_token": "string", "token_type": "bearer"}
로그아웃: POST /auth/logout
요청: (인증된 요청)
응답: {"message": "Logged out successfully"}
토큰 갱신 (Refresh Token 사용): POST /auth/refresh
요청: {"refresh_token": "string"}
응답: {"access_token": "string", "token_type": "bearer"}
사용자 정보 조회: GET /users/me
요청: (인증된 요청)
응답: {"user_id": "uuid", "username": "string", "email": "string", "roles": ["string"]}
사용자 권한 변경 (RBAC): PATCH /users/{user_id}/permissions
요청: {"roles": ["string"]}
응답: {"message": "User permissions updated"}
모든 사용자 조회 (관리자용): GET /users
요청: (인증된 요청) 쿼리 파라미터: skip=integer, limit=integer, full_permission=integer (1: 모든 사용자, 0: 페이지네이션 적용)
응답: [{"uid": "uuid", "uemail": "string", "urole": "string", "uavatar": "string"}, ...]

단일 사용자 조회: GET /users/{user_id}
요청: (인증된 요청)
응답: {"uid": "uuid", "uemail": "string", "urole": "string", "uavatar": "string"}

현재 사용자 정보 조회: GET /users/me
요청: (인증된 요청)
응답: {"uid": "uuid", "uemail": "string", "urole": "string", "uavatar": "string"}

사용자 생성: POST /users
요청: {"uemail": "string", "upassword": "string", "urole": "string", "uavatar": "string"}
응답: {"uid": "uuid", "uemail": "string", "urole": "string", "uavatar": "string"}
2. 문서 서비스 (Document Service)
설명: 프로젝트 문서 생성, 조회, 수정, 삭제(CRUD)를 총괄하며 시스템의 핵심 비즈니스 로직을 처리합니다.
API 엔드포인트:
프로젝트 목록 조회: GET /projects
요청: (인증된 요청)
응답: [{"project_id": "uuid", "name": "string", "description": "string"}, ...]
단일 프로젝트 조회: GET /projects/{project_id}
요청: (인증된 요청)
응답: {"project_id": "uuid", "name": "string", "description": "string", "blocks": [...], "content_block_meta": {...}}
블록 목록 조회: GET /projects/{project_id}/blocks
요청: (인증된 요청)
응답: [{"block_id": "uuid", "type": "string", "content": "string", "order": "integer"}, ...]
개정 이력 조회: GET /projects/{project_id}/revisions
요청: (인증된 요청)
응답: [{"revision_id": "uuid", "timestamp": "datetime", "changed_by": "uuid"}, ...]
인용 정보 연결/해제: POST /projects/{project_id}/citations
요청: {"citation_id": "uuid"} (연결), DELETE /projects/{project_id}/citations/{citation_id} (해제)
응답: {"message": "Citation linked/unlinked"}
프로젝트 생성: POST /projects
요청: {"name": "string", "description": "string"}
응답: {"message": "Project created", "project_id": "uuid"}
프로젝트 업데이트: PUT /projects/{project_id}
요청: {"name": "string", "description": "string"}
응답: {"message": "Project updated"}
프로젝트 삭제: DELETE /projects/{project_id}
요청: (인증된 요청)
응답: {"message": "Project deleted"}
노드/블록 생성: POST /projects/{project_id}/nodes 또는 POST /projects/{project_id}/blocks
요청: {"type": "string", "content": "string", "order": "integer"}
응답: {"message": "Node/Block created", "block_id": "uuid"}
노드/블록 업데이트: PUT /projects/{project_id}/nodes/{node_id} 또는 PUT /projects/{project_id}/blocks/{block_id}
요청: {"type": "string", "content": "string", "order": "integer"}
응답: {"message": "Node/Block updated"}
노드/블록 삭제: DELETE /projects/{project_id}/nodes/{node_id} 또는 DELETE /projects/{project_id}/blocks/{block_id}
요청: (인증된 요청)
응답: {"message": "Node/Block deleted"}
이미지 업로드: POST /projects/{project_id}/blocks/{block_id}/images
요청: {"file": "binary_data"} (form-data)
응답: {"message": "Image uploaded", "image_url": "string"}
3. 검색 서비스 (Search Service)
설명: 데이터베이스 내의 모든 데이터를 검색하고 색인화하며, 검색어에 대한 정확하고 확장된 형태로 전문적인 검색 기능을 제공합니다.
API 엔드포인트:
전체 검색: GET /search
쿼리 파라미터: q=string (검색어), limit=integer, offset=integer
응답: [{"type": "string", "id": "uuid", "title": "string", "snippet": "string", "score": "float"}, ...]
4. AI 오케스트레이터 서비스 (AI Orchestrator Service)
설명: 사용자의 요청에 응답하여 다양한 AI 작업을 관리하고 조율합니다.
API 엔드포인트:
AI 작업 생성: POST /ai/jobs
요청: {"job_type": "string", "input_data": "any", "parameters": "dict"}
응답: {"message": "AI job created", "job_id": "uuid", "status": "pending"}
AI 작업 상태 조회: GET /ai/jobs/{job_id}
요청: (인증된 요청)
응답: {"job_id": "uuid", "status": "string", "progress": "float", "result": "any", "error": "string"}
5. 파일 서비스 (File Service)
설명: 바이너리 파일 업로드, 다운로드, 관리 및 스토리지를 담당합니다.
API 엔드포인트:
파일 업로드: POST /files/upload
요청: {"file": "binary_data"} (form-data)
응답: {"message": "File uploaded", "file_id": "uuid", "file_url": "string"}
파일 다운로드: GET /files/{file_id}/download
요청: (인증된 요청)
응답: (파일 바이너리 데이터)
파일 메타데이터 조회: GET /files/{file_id}
요청: (인증된 요청)
응답: {"file_id": "uuid", "filename": "string", "content_type": "string", "size": "integer", "uploaded_at": "datetime"}
6. 내보내기 서비스 (Export Service)
설명: 리소스 데이터를 다양한 파일 형식(PDF, EPUB, MD 등)으로 변환하는 작업을 처리합니다.
API 엔드포인트:
내보내기 요청: POST /exports
요청: {"resource_type": "string", "resource_id": "uuid", "format": "string"} (예: "pdf", "epub", "md")
응답: {"message": "Export job started", "export_job_id": "uuid", "status": "pending"}
내보내기 상태 조회 및 다운로드: GET /exports/{export_job_id}
요청: (인증된 요청)
응답: {"export_job_id": "uuid", "status": "string", "download_url": "string", "created_at": "datetime"} (다운로드 URL은 status가 "completed"일 때 제공)

7. 할일 서비스 (Todo Service)
설명: 사용자의 할일 목록을 관리하는 서비스로, 할일 항목의 생성, 조회, 수정, 삭제 기능을 제공합니다. 각 사용자는 자신의 할일만을 조회하고 관리할 수 있습니다.
API 엔드포인트:
할일 목록 조회: GET /api/todos/
요청: (인증된 요청)
응답: [{"id": "uuid", "text": "string", "completed": "boolean", "created_at": "datetime", "updated_at": "datetime"}, ...]
할일 생성: POST /api/todos/
요청: {"text": "string"}
응답: {"id": "uuid", "text": "string", "completed": "boolean", "created_at": "datetime", "updated_at": "datetime"}
할일 업데이트: PUT /api/todos/{todo_id}
요청: {"text": "string", "completed": "boolean"}
응답: {"id": "uuid", "text": "string", "completed": "boolean", "created_at": "datetime", "updated_at": "datetime"}
할일 삭제: DELETE /api/todos/{todo_id}
요청: (인증된 요청)
응답: {"message": "Todo deleted successfully"}
완료된 할일 일괄 삭제: DELETE /api/todos/completed
요청: (인증된 요청)
응답: {"message": "All completed todos deleted"}