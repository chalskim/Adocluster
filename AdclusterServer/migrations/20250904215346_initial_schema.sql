-- 마이그레이션: initial_schema
-- 생성 시간: 2025-09-04 21:53:46

-- 업그레이드
-- ENUM 타입 생성
CREATE TYPE project_visibility AS ENUM ('private', 'team', 'public');
CREATE TYPE node_type AS ENUM ('project_folder', 'folder', 'note', 'external_file', 'external_bookmark', 'ai_generated');
CREATE TYPE content_block_type AS ENUM ('paragraph', 'heading', 'list', 'table', 'image', 'drawing', 'math', 'code', 'embed', 'file_attachment', 'graph');
CREATE TYPE reference_type AS ENUM ('bibtex', 'doi', 'crossref');
CREATE TYPE ai_job_type AS ENUM ('summarize', 'translate', 'image_gen', 'draft');
CREATE TYPE job_status AS ENUM ('pending', 'running', 'success', 'failed');
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE permission_role AS ENUM ('admin', 'editor', 'reviewer', 'reader');
CREATE TYPE export_type AS ENUM ('pdf', 'epub', 'md');

-- ltree 확장 활성화
CREATE EXTENSION IF NOT EXISTS ltree;

-- 사용자 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255),
    role VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT now(),
    last_login TIMESTAMPTZ
);
CREATE INDEX idx_users_last_login ON users(last_login);

-- 프로젝트 테이블
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255),
    description TEXT,
    visibility project_visibility NOT NULL DEFAULT 'private',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_projects_owner_visibility ON projects(owner_id, visibility);

-- 노드 테이블
CREATE TABLE nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_id UUID NULL REFERENCES nodes(id) ON DELETE CASCADE,
    type node_type NOT NULL,
    title VARCHAR(255),
    "order" INT,
    include_in_export BOOLEAN DEFAULT true,
    metadata JSONB,
    path LTREE
);
CREATE INDEX idx_nodes_path ON nodes USING GIST(path);
CREATE UNIQUE INDEX idx_nodes_order ON nodes(project_id, parent_id, "order");

-- 콘텐츠 블록 테이블
CREATE TABLE content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    block_type content_block_type NOT NULL,
    content JSONB,
    position INT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX idx_content_blocks_position ON content_blocks(node_id, position);
CREATE INDEX idx_content_blocks_content_gin ON content_blocks USING GIN (content jsonb_path_ops);

-- 파일 테이블
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    file_key VARCHAR(1024) UNIQUE NOT NULL,
    mime_type VARCHAR(255),
    size BIGINT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 프로젝트 참고문헌 라이브러리
CREATE TABLE project_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type reference_type NOT NULL,
    raw_data JSONB,
    formatted_text TEXT
);

-- 본문 내 인용
CREATE TABLE citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_block_id UUID NOT NULL REFERENCES content_blocks(id) ON DELETE CASCADE,
    reference_id UUID NOT NULL REFERENCES project_references(id) ON DELETE RESTRICT
);
CREATE INDEX idx_citations_content_block ON citations(content_block_id);

-- AI 작업 기록
CREATE TABLE ai_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    node_id UUID REFERENCES nodes(id),
    job_type ai_job_type NOT NULL,
    status job_status NOT NULL,
    request_payload JSONB,
    result_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX idx_ai_jobs_proj_status ON ai_jobs(project_id, status);

-- 리비전 관리
CREATE TABLE revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    content_snapshot JSONB,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_revisions_node_created ON revisions(node_id, created_at DESC);

-- 팀 테이블
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role team_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(team_id, user_id)
);

-- 권한 테이블
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role permission_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT user_or_team_check CHECK (user_id IS NOT NULL OR team_id IS NOT NULL)
);
CREATE INDEX idx_permissions_user_project ON permissions(user_id, project_id);
CREATE INDEX idx_permissions_team_project ON permissions(team_id, project_id);

-- 내보내기 기록
CREATE TABLE exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    export_type export_type NOT NULL,
    status job_status NOT NULL,
    artifact_key VARCHAR(1024),
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX idx_exports_proj_status ON exports(project_id, status);

-- 롤백
DROP TABLE IF EXISTS exports CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS revisions CASCADE;
DROP TABLE IF EXISTS ai_jobs CASCADE;
DROP TABLE IF EXISTS citations CASCADE;
DROP TABLE IF EXISTS project_references CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS content_blocks CASCADE;
DROP TABLE IF EXISTS nodes CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP EXTENSION IF EXISTS ltree;
DROP TYPE IF EXISTS export_type;
DROP TYPE IF EXISTS permission_role;
DROP TYPE IF EXISTS team_role;
DROP TYPE IF EXISTS job_status;
DROP TYPE IF EXISTS ai_job_type;
DROP TYPE IF EXISTS reference_type;
DROP TYPE IF EXISTS content_block_type;
DROP TYPE IF EXISTS node_type;
DROP TYPE IF EXISTS project_visibility;
