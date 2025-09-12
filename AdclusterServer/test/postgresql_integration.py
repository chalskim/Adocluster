import os
import json
import logging
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, List, Any, Optional, Union
from datetime import datetime

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PostgreSQLIntegration:
    """PostgreSQL 통합 클래스
    
    워크플로우 정의, 실행 로그, 사용자 템플릿을 데이터베이스에 저장하고 관리하는 기능을 제공합니다.
    """
    
    def __init__(self, connection_string=None):
        """초기화
        
        Args:
            connection_string (str, optional): PostgreSQL 연결 문자열
        """
        self.connection_string = connection_string or os.environ.get('POSTGRES_CONNECTION_STRING')
        if not self.connection_string:
            logger.warning("PostgreSQL 연결 문자열이 설정되지 않았습니다. 환경 변수 POSTGRES_CONNECTION_STRING을 설정하거나 초기화 시 제공하세요.")
        
        # 연결 테스트
        try:
            self._get_connection()
            logger.info("PostgreSQL 연결 성공")
        except Exception as e:
            logger.error(f"PostgreSQL 연결 실패: {e}")
    
    def _get_connection(self):
        """데이터베이스 연결 가져오기
        
        Returns:
            psycopg2.connection: 데이터베이스 연결
        """
        if not self.connection_string:
            raise ValueError("PostgreSQL 연결 문자열이 설정되지 않았습니다.")
        
        return psycopg2.connect(self.connection_string)
    
    def execute_query(self, query, params=None, fetch=True):
        """쿼리 실행
        
        Args:
            query (str): SQL 쿼리
            params (tuple, optional): 쿼리 파라미터
            fetch (bool, optional): 결과 가져오기 여부
            
        Returns:
            list: 쿼리 결과
        """
        conn = None
        try:
            conn = self._get_connection()
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params or ())
                
                if fetch:
                    result = cursor.fetchall()
                    return [dict(row) for row in result]
                else:
                    conn.commit()
                    return None
        except Exception as e:
            logger.error(f"쿼리 실행 오류: {e}")
            if conn:
                conn.rollback()
            raise
        finally:
            if conn:
                conn.close()
    
    # 워크플로우 관리 메서드
    def create_workflow(self, name, description, steps):
        """워크플로우 생성
        
        Args:
            name (str): 워크플로우 이름
            description (str): 워크플로우 설명
            steps (list): 워크플로우 단계
            
        Returns:
            int: 생성된 워크플로우 ID
        """
        query = """
        INSERT INTO workflows (name, description, steps, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
        """
        
        now = datetime.now()
        params = (name, description, json.dumps(steps), now, now)
        
        try:
            result = self.execute_query(query, params)
            workflow_id = result[0]['id']
            logger.info(f"워크플로우 생성 성공: {workflow_id}")
            return workflow_id
        except Exception as e:
            logger.error(f"워크플로우 생성 오류: {e}")
            raise
    
    def get_workflow(self, workflow_id):
        """워크플로우 조회
        
        Args:
            workflow_id (int): 워크플로우 ID
            
        Returns:
            dict: 워크플로우 정보
        """
        query = """
        SELECT id, name, description, steps, created_at, updated_at
        FROM workflows
        WHERE id = %s
        """
        
        try:
            result = self.execute_query(query, (workflow_id,))
            if result:
                workflow = result[0]
                workflow['steps'] = json.loads(workflow['steps'])
                return workflow
            else:
                logger.warning(f"워크플로우를 찾을 수 없음: {workflow_id}")
                return None
        except Exception as e:
            logger.error(f"워크플로우 조회 오류: {e}")
            raise
    
    def update_workflow(self, workflow_id, name=None, description=None, steps=None):
        """워크플로우 업데이트
        
        Args:
            workflow_id (int): 워크플로우 ID
            name (str, optional): 워크플로우 이름
            description (str, optional): 워크플로우 설명
            steps (list, optional): 워크플로우 단계
            
        Returns:
            bool: 업데이트 성공 여부
        """
        # 현재 워크플로우 조회
        current = self.get_workflow(workflow_id)
        if not current:
            logger.warning(f"업데이트할 워크플로우를 찾을 수 없음: {workflow_id}")
            return False
        
        # 업데이트할 필드 설정
        update_name = name if name is not None else current['name']
        update_description = description if description is not None else current['description']
        update_steps = json.dumps(steps) if steps is not None else current['steps']
        
        query = """
        UPDATE workflows
        SET name = %s, description = %s, steps = %s, updated_at = %s
        WHERE id = %s
        """
        
        params = (update_name, update_description, update_steps, datetime.now(), workflow_id)
        
        try:
            self.execute_query(query, params, fetch=False)
            logger.info(f"워크플로우 업데이트 성공: {workflow_id}")
            return True
        except Exception as e:
            logger.error(f"워크플로우 업데이트 오류: {e}")
            raise
    
    def delete_workflow(self, workflow_id):
        """워크플로우 삭제
        
        Args:
            workflow_id (int): 워크플로우 ID
            
        Returns:
            bool: 삭제 성공 여부
        """
        query = """
        DELETE FROM workflows
        WHERE id = %s
        """
        
        try:
            self.execute_query(query, (workflow_id,), fetch=False)
            logger.info(f"워크플로우 삭제 성공: {workflow_id}")
            return True
        except Exception as e:
            logger.error(f"워크플로우 삭제 오류: {e}")
            raise
    
    def list_workflows(self, limit=100, offset=0):
        """워크플로우 목록 조회
        
        Args:
            limit (int, optional): 조회 개수 제한
            offset (int, optional): 조회 시작 위치
            
        Returns:
            list: 워크플로우 목록
        """
        query = """
        SELECT id, name, description, created_at, updated_at
        FROM workflows
        ORDER BY updated_at DESC
        LIMIT %s OFFSET %s
        """
        
        try:
            result = self.execute_query(query, (limit, offset))
            return result
        except Exception as e:
            logger.error(f"워크플로우 목록 조회 오류: {e}")
            raise
    
    # 워크플로우 실행 관리 메서드
    def create_workflow_execution(self, workflow_id, status='pending', input_data=None, output_data=None):
        """워크플로우 실행 생성
        
        Args:
            workflow_id (int): 워크플로우 ID
            status (str, optional): 실행 상태
            input_data (dict, optional): 입력 데이터
            output_data (dict, optional): 출력 데이터
            
        Returns:
            int: 생성된 실행 ID
        """
        query = """
        INSERT INTO workflow_executions (workflow_id, status, input_data, output_data, started_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
        """
        
        now = datetime.now()
        params = (
            workflow_id,
            status,
            json.dumps(input_data) if input_data else None,
            json.dumps(output_data) if output_data else None,
            now,
            now
        )
        
        try:
            result = self.execute_query(query, params)
            execution_id = result[0]['id']
            logger.info(f"워크플로우 실행 생성 성공: {execution_id}")
            return execution_id
        except Exception as e:
            logger.error(f"워크플로우 실행 생성 오류: {e}")
            raise
    
    def update_workflow_execution(self, execution_id, status=None, output_data=None, error=None):
        """워크플로우 실행 업데이트
        
        Args:
            execution_id (int): 실행 ID
            status (str, optional): 실행 상태
            output_data (dict, optional): 출력 데이터
            error (str, optional): 오류 메시지
            
        Returns:
            bool: 업데이트 성공 여부
        """
        # 현재 실행 조회
        current = self.get_workflow_execution(execution_id)
        if not current:
            logger.warning(f"업데이트할 워크플로우 실행을 찾을 수 없음: {execution_id}")
            return False
        
        # 업데이트할 필드 설정
        update_status = status if status is not None else current['status']
        update_output = json.dumps(output_data) if output_data is not None else current['output_data']
        update_error = error if error is not None else current['error']
        
        # 완료 시간 설정
        completed_at = datetime.now() if status in ['completed', 'failed'] else None
        
        query = """
        UPDATE workflow_executions
        SET status = %s, output_data = %s, error = %s, updated_at = %s, completed_at = %s
        WHERE id = %s
        """
        
        params = (update_status, update_output, update_error, datetime.now(), completed_at, execution_id)
        
        try:
            self.execute_query(query, params, fetch=False)
            logger.info(f"워크플로우 실행 업데이트 성공: {execution_id}")
            return True
        except Exception as e:
            logger.error(f"워크플로우 실행 업데이트 오류: {e}")
            raise
    
    def get_workflow_execution(self, execution_id):
        """워크플로우 실행 조회
        
        Args:
            execution_id (int): 실행 ID
            
        Returns:
            dict: 워크플로우 실행 정보
        """
        query = """
        SELECT id, workflow_id, status, input_data, output_data, error, started_at, updated_at, completed_at
        FROM workflow_executions
        WHERE id = %s
        """
        
        try:
            result = self.execute_query(query, (execution_id,))
            if result:
                execution = result[0]
                if execution['input_data']:
                    execution['input_data'] = json.loads(execution['input_data'])
                if execution['output_data']:
                    execution['output_data'] = json.loads(execution['output_data'])
                return execution
            else:
                logger.warning(f"워크플로우 실행을 찾을 수 없음: {execution_id}")
                return None
        except Exception as e:
            logger.error(f"워크플로우 실행 조회 오류: {e}")
            raise
    
    def list_workflow_executions(self, workflow_id=None, status=None, limit=100, offset=0):
        """워크플로우 실행 목록 조회
        
        Args:
            workflow_id (int, optional): 워크플로우 ID
            status (str, optional): 실행 상태
            limit (int, optional): 조회 개수 제한
            offset (int, optional): 조회 시작 위치
            
        Returns:
            list: 워크플로우 실행 목록
        """
        query = """
        SELECT id, workflow_id, status, started_at, updated_at, completed_at
        FROM workflow_executions
        WHERE 1=1
        """
        
        params = []
        
        if workflow_id is not None:
            query += " AND workflow_id = %s"
            params.append(workflow_id)
        
        if status is not None:
            query += " AND status = %s"
            params.append(status)
        
        query += """
        ORDER BY started_at DESC
        LIMIT %s OFFSET %s
        """
        
        params.extend([limit, offset])
        
        try:
            result = self.execute_query(query, tuple(params))
            return result
        except Exception as e:
            logger.error(f"워크플로우 실행 목록 조회 오류: {e}")
            raise
    
    # 워크플로우 단계 실행 관리 메서드
    def create_workflow_step(self, execution_id, step_name, step_type, status='pending', input_data=None, output_data=None):
        """워크플로우 단계 생성
        
        Args:
            execution_id (int): 실행 ID
            step_name (str): 단계 이름
            step_type (str): 단계 유형
            status (str, optional): 실행 상태
            input_data (dict, optional): 입력 데이터
            output_data (dict, optional): 출력 데이터
            
        Returns:
            int: 생성된 단계 ID
        """
        query = """
        INSERT INTO workflow_steps (execution_id, step_name, step_type, status, input_data, output_data, started_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """
        
        now = datetime.now()
        params = (
            execution_id,
            step_name,
            step_type,
            status,
            json.dumps(input_data) if input_data else None,
            json.dumps(output_data) if output_data else None,
            now,
            now
        )
        
        try:
            result = self.execute_query(query, params)
            step_id = result[0]['id']
            logger.info(f"워크플로우 단계 생성 성공: {step_id}")
            return step_id
        except Exception as e:
            logger.error(f"워크플로우 단계 생성 오류: {e}")
            raise
    
    def update_workflow_step(self, step_id, status=None, output_data=None, error=None):
        """워크플로우 단계 업데이트
        
        Args:
            step_id (int): 단계 ID
            status (str, optional): 실행 상태
            output_data (dict, optional): 출력 데이터
            error (str, optional): 오류 메시지
            
        Returns:
            bool: 업데이트 성공 여부
        """
        # 현재 단계 조회
        current = self.get_workflow_step(step_id)
        if not current:
            logger.warning(f"업데이트할 워크플로우 단계를 찾을 수 없음: {step_id}")
            return False
        
        # 업데이트할 필드 설정
        update_status = status if status is not None else current['status']
        update_output = json.dumps(output_data) if output_data is not None else current['output_data']
        update_error = error if error is not None else current['error']
        
        # 완료 시간 설정
        completed_at = datetime.now() if status in ['completed', 'failed'] else None
        
        query = """
        UPDATE workflow_steps
        SET status = %s, output_data = %s, error = %s, updated_at = %s, completed_at = %s
        WHERE id = %s
        """
        
        params = (update_status, update_output, update_error, datetime.now(), completed_at, step_id)
        
        try:
            self.execute_query(query, params, fetch=False)
            logger.info(f"워크플로우 단계 업데이트 성공: {step_id}")
            return True
        except Exception as e:
            logger.error(f"워크플로우 단계 업데이트 오류: {e}")
            raise
    
    def get_workflow_step(self, step_id):
        """워크플로우 단계 조회
        
        Args:
            step_id (int): 단계 ID
            
        Returns:
            dict: 워크플로우 단계 정보
        """
        query = """
        SELECT id, execution_id, step_name, step_type, status, input_data, output_data, error, started_at, updated_at, completed_at
        FROM workflow_steps
        WHERE id = %s
        """
        
        try:
            result = self.execute_query(query, (step_id,))
            if result:
                step = result[0]
                if step['input_data']:
                    step['input_data'] = json.loads(step['input_data'])
                if step['output_data']:
                    step['output_data'] = json.loads(step['output_data'])
                return step
            else:
                logger.warning(f"워크플로우 단계를 찾을 수 없음: {step_id}")
                return None
        except Exception as e:
            logger.error(f"워크플로우 단계 조회 오류: {e}")
            raise
    
    def list_workflow_steps(self, execution_id, status=None, limit=100, offset=0):
        """워크플로우 단계 목록 조회
        
        Args:
            execution_id (int): 실행 ID
            status (str, optional): 실행 상태
            limit (int, optional): 조회 개수 제한
            offset (int, optional): 조회 시작 위치
            
        Returns:
            list: 워크플로우 단계 목록
        """
        query = """
        SELECT id, execution_id, step_name, step_type, status, started_at, updated_at, completed_at
        FROM workflow_steps
        WHERE execution_id = %s
        """
        
        params = [execution_id]
        
        if status is not None:
            query += " AND status = %s"
            params.append(status)
        
        query += """
        ORDER BY started_at ASC
        LIMIT %s OFFSET %s
        """
        
        params.extend([limit, offset])
        
        try:
            result = self.execute_query(query, tuple(params))
            return result
        except Exception as e:
            logger.error(f"워크플로우 단계 목록 조회 오류: {e}")
            raise
    
    # 사용자 템플릿 관리 메서드
    def create_user_template(self, name, description, template_data, user_id=None):
        """사용자 템플릿 생성
        
        Args:
            name (str): 템플릿 이름
            description (str): 템플릿 설명
            template_data (dict): 템플릿 데이터
            user_id (int, optional): 사용자 ID
            
        Returns:
            int: 생성된 템플릿 ID
        """
        query = """
        INSERT INTO user_templates (name, description, template_data, user_id, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
        """
        
        now = datetime.now()
        params = (name, description, json.dumps(template_data), user_id, now, now)
        
        try:
            result = self.execute_query(query, params)
            template_id = result[0]['id']
            logger.info(f"사용자 템플릿 생성 성공: {template_id}")
            return template_id
        except Exception as e:
            logger.error(f"사용자 템플릿 생성 오류: {e}")
            raise
    
    def get_user_template(self, template_id):
        """사용자 템플릿 조회
        
        Args:
            template_id (int): 템플릿 ID
            
        Returns:
            dict: 사용자 템플릿 정보
        """
        query = """
        SELECT id, name, description, template_data, user_id, created_at, updated_at
        FROM user_templates
        WHERE id = %s
        """
        
        try:
            result = self.execute_query(query, (template_id,))
            if result:
                template = result[0]
                template['template_data'] = json.loads(template['template_data'])
                return template
            else:
                logger.warning(f"사용자 템플릿을 찾을 수 없음: {template_id}")
                return None
        except Exception as e:
            logger.error(f"사용자 템플릿 조회 오류: {e}")
            raise
    
    def update_user_template(self, template_id, name=None, description=None, template_data=None):
        """사용자 템플릿 업데이트
        
        Args:
            template_id (int): 템플릿 ID
            name (str, optional): 템플릿 이름
            description (str, optional): 템플릿 설명
            template_data (dict, optional): 템플릿 데이터
            
        Returns:
            bool: 업데이트 성공 여부
        """
        # 현재 템플릿 조회
        current = self.get_user_template(template_id)
        if not current:
            logger.warning(f"업데이트할 사용자 템플릿을 찾을 수 없음: {template_id}")
            return False
        
        # 업데이트할 필드 설정
        update_name = name if name is not None else current['name']
        update_description = description if description is not None else current['description']
        update_template_data = json.dumps(template_data) if template_data is not None else current['template_data']
        
        query = """
        UPDATE user_templates
        SET name = %s, description = %s, template_data = %s, updated_at = %s
        WHERE id = %s
        """
        
        params = (update_name, update_description, update_template_data, datetime.now(), template_id)
        
        try:
            self.execute_query(query, params, fetch=False)
            logger.info(f"사용자 템플릿 업데이트 성공: {template_id}")
            return True
        except Exception as e:
            logger.error(f"사용자 템플릿 업데이트 오류: {e}")
            raise
    
    def delete_user_template(self, template_id):
        """사용자 템플릿 삭제
        
        Args:
            template_id (int): 템플릿 ID
            
        Returns:
            bool: 삭제 성공 여부
        """
        query = """
        DELETE FROM user_templates
        WHERE id = %s
        """
        
        try:
            self.execute_query(query, (template_id,), fetch=False)
            logger.info(f"사용자 템플릿 삭제 성공: {template_id}")
            return True
        except Exception as e:
            logger.error(f"사용자 템플릿 삭제 오류: {e}")
            raise
    
    def list_user_templates(self, user_id=None, limit=100, offset=0):
        """사용자 템플릿 목록 조회
        
        Args:
            user_id (int, optional): 사용자 ID
            limit (int, optional): 조회 개수 제한
            offset (int, optional): 조회 시작 위치
            
        Returns:
            list: 사용자 템플릿 목록
        """
        query = """
        SELECT id, name, description, user_id, created_at, updated_at
        FROM user_templates
        WHERE 1=1
        """
        
        params = []
        
        if user_id is not None:
            query += " AND user_id = %s"
            params.append(user_id)
        
        query += """
        ORDER BY updated_at DESC
        LIMIT %s OFFSET %s
        """
        
        params.extend([limit, offset])
        
        try:
            result = self.execute_query(query, tuple(params))
            return result
        except Exception as e:
            logger.error(f"사용자 템플릿 목록 조회 오류: {e}")
            raise

# 메인 실행 함수
def create_sample_workflow():
    """샘플 워크플로우 생성 함수"""
    db = PostgreSQLIntegration()
    
    # 샘플 워크플로우 생성
    workflow_id = db.create_workflow(
        name="테스트 코드 생성 워크플로우",
        description="프롬프트를 기반으로 테스트 코드를 생성하는 워크플로우",
        steps=[
            {
                "name": "프롬프트 분석",
                "type": "task",
                "task_type": "analyze_prompt",
                "config": {
                    "prompt": "{{prompt}}"
                }
            },
            {
                "name": "테스트 코드 생성",
                "type": "task",
                "task_type": "generate_test",
                "config": {
                    "test_type": "{{test_type}}",
                    "prompt": "{{prompt}}"
                }
            },
            {
                "name": "GitHub 저장",
                "type": "task",
                "task_type": "github_action",
                "config": {
                    "action": "commit",
                    "file_path": "tests/generated/{{test_type}}_test.py",
                    "commit_message": "Add {{test_type}} test from prompt"
                }
            }
        ]
    )
    
    print(f"샘플 워크플로우 생성 완료: {workflow_id}")
    return workflow_id

def execute_sample_workflow(workflow_id, prompt="웹소켓 연결 테스트 코드를 작성해주세요"):
    """샘플 워크플로우 실행 함수"""
    db = PostgreSQLIntegration()
    
    # 워크플로우 조회
    workflow = db.get_workflow(workflow_id)
    if not workflow:
        print(f"워크플로우를 찾을 수 없음: {workflow_id}")
        return None
    
    # 워크플로우 실행 생성
    input_data = {
        "prompt": prompt,
        "test_type": "websocket"  # 기본값
    }
    
    execution_id = db.create_workflow_execution(
        workflow_id=workflow_id,
        status="running",
        input_data=input_data
    )
    
    print(f"워크플로우 실행 시작: {execution_id}")
    
    # 워크플로우 단계 실행 (간단한 시뮬레이션)
    for i, step in enumerate(workflow['steps']):
        step_id = db.create_workflow_step(
            execution_id=execution_id,
            step_name=step['name'],
            step_type=step['task_type'],
            status="running",
            input_data={
                **step['config'],
                "prompt": input_data['prompt'],
                "test_type": input_data['test_type']
            }
        )
        
        print(f"단계 {i+1} 실행 중: {step['name']}")
        
        # 단계 완료 시뮬레이션
        output_data = {
            "result": f"{step['name']} 완료",
            "success": True
        }
        
        db.update_workflow_step(
            step_id=step_id,
            status="completed",
            output_data=output_data
        )
        
        print(f"단계 {i+1} 완료: {step['name']}")
    
    # 워크플로우 실행 완료
    db.update_workflow_execution(
        execution_id=execution_id,
        status="completed",
        output_data={
            "result": "워크플로우 실행 완료",
            "success": True
        }
    )
    
    print(f"워크플로우 실행 완료: {execution_id}")
    return execution_id

# 명령줄에서 실행 시
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "create":
            create_sample_workflow()
        elif command == "execute":
            if len(sys.argv) > 2:
                workflow_id = int(sys.argv[2])
                prompt = sys.argv[3] if len(sys.argv) > 3 else "웹소켓 연결 테스트 코드를 작성해주세요"
                execute_sample_workflow(workflow_id, prompt)
            else:
                print("워크플로우 ID를 지정하세요.")
        else:
            print("알 수 없는 명령: 'create' 또는 'execute'를 사용하세요.")
    else:
        print("명령을 지정하세요: 'create' 또는 'execute'")