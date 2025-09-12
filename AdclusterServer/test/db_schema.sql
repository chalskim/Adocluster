-- 테스트 코드 생성 및 워크플로우 관리를 위한 데이터베이스 스키마

-- 테스트 코드 테이블
CREATE TABLE IF NOT EXISTS test_codes (
    id SERIAL PRIMARY KEY,
    prompt TEXT NOT NULL,
    test_code TEXT NOT NULL,
    test_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    github_url VARCHAR(255),
    execution_status VARCHAR(20) DEFAULT 'pending'
);

-- 워크플로우 정의 테이블
CREATE TABLE IF NOT EXISTS workflows (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    definition JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

-- 워크플로우 실행 기록 테이블
CREATE TABLE IF NOT EXISTS workflow_executions (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES workflows(id),
    status VARCHAR(20) NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    execution_data JSONB,
    result JSONB,
    error_message TEXT
);

-- 워크플로우 단계 테이블
CREATE TABLE IF NOT EXISTS workflow_steps (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES workflows(id),
    step_name VARCHAR(100) NOT NULL,
    step_type VARCHAR(50) NOT NULL,
    step_config JSONB NOT NULL,
    step_order INTEGER NOT NULL,
    is_conditional BOOLEAN DEFAULT FALSE,
    condition_expression TEXT
);

-- 사용자 템플릿 테이블
CREATE TABLE IF NOT EXISTS user_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    template_content TEXT NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    is_public BOOLEAN DEFAULT FALSE
);

-- 테스트 실행 결과 테이블
CREATE TABLE IF NOT EXISTS test_executions (
    id SERIAL PRIMARY KEY,
    test_id INTEGER REFERENCES test_codes(id),
    execution_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    duration_ms INTEGER,
    output TEXT,
    error_message TEXT
);

-- GitHub 통합 설정 테이블
CREATE TABLE IF NOT EXISTS github_settings (
    id SERIAL PRIMARY KEY,
    repo_owner VARCHAR(100) NOT NULL,
    repo_name VARCHAR(100) NOT NULL,
    branch_name VARCHAR(100) DEFAULT 'main',
    token_encrypted TEXT,
    auto_commit BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_test_codes_test_type ON test_codes(test_type);
CREATE INDEX IF NOT EXISTS idx_workflows_name ON workflows(name);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow_id ON workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_user_templates_template_type ON user_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_test_executions_test_id ON test_executions(test_id);

-- 함수: 워크플로우 실행 시작
CREATE OR REPLACE FUNCTION start_workflow_execution(workflow_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    execution_id INTEGER;
BEGIN
    INSERT INTO workflow_executions (workflow_id, status)
    VALUES (workflow_id, 'running')
    RETURNING id INTO execution_id;
    
    RETURN execution_id;
END;
$$ LANGUAGE plpgsql;

-- 함수: 워크플로우 실행 완료
CREATE OR REPLACE FUNCTION complete_workflow_execution(execution_id INTEGER, execution_status VARCHAR, result_data JSONB)
RETURNS VOID AS $$
BEGIN
    UPDATE workflow_executions
    SET 
        status = execution_status,
        end_time = CURRENT_TIMESTAMP,
        result = result_data
    WHERE id = execution_id;
END;
$$ LANGUAGE plpgsql;

-- 함수: 테스트 실행 기록
CREATE OR REPLACE FUNCTION record_test_execution(test_id INTEGER, test_status VARCHAR, duration INTEGER, test_output TEXT, error TEXT)
RETURNS INTEGER AS $$
DECLARE
    execution_id INTEGER;
BEGIN
    INSERT INTO test_executions (test_id, status, duration_ms, output, error_message)
    VALUES (test_id, test_status, duration, test_output, error)
    RETURNING id INTO execution_id;
    
    -- 테스트 코드 상태 업데이트
    UPDATE test_codes
    SET execution_status = test_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = test_id;
    
    RETURN execution_id;
END;
$$ LANGUAGE plpgsql;