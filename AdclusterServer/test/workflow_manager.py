import json
import logging
import psycopg2
import psycopg2.extras
from datetime import datetime
from typing import Dict, List, Any, Optional, Union

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class WorkflowManager:
    """워크플로우 관리 클래스
    
    Context7로 해석된 자연어 명령을 순차적 워크플로우로 변환하고 조건부 로직을 지원합니다.
    """
    
    def __init__(self, db_config=None):
        """초기화
        
        Args:
            db_config (dict, optional): 데이터베이스 연결 설정
        """
        self.db_config = db_config or {
            'dbname': 'adcluster',
            'user': 'postgres',
            'password': 'postgres',
            'host': 'localhost',
            'port': '5432'
        }
        self.conn = None
    
    def connect_db(self):
        """데이터베이스 연결
        
        데이터베이스 연결 실패 시에도 시스템이 계속 작동할 수 있도록 설계되었습니다.
        연결 실패 시 예외를 발생시키지 않고 None을 반환하며, 호출자는 이를 처리하여
        대체 로직을 실행하거나 임시 데이터를 사용할 수 있습니다.
        
        Returns:
            Connection 객체 또는 None (연결 실패 시)
        """
        try:
            if self.conn is None or self.conn.closed:
                self.conn = psycopg2.connect(**self.db_config)
            return self.conn
        except Exception as e:
            logger.error(f"데이터베이스 연결 오류: {e}")
            # 연결 실패 시 None 반환 (예외를 발생시키지 않음)
            # 이를 통해 시스템은 데이터베이스 없이도 계속 작동할 수 있음
            return None
    
    def close_db(self):
        """데이터베이스 연결 종료"""
        if self.conn and not self.conn.closed:
            self.conn.close()
    
    def create_workflow(self, name: str, description: str, definition: Dict, created_by: str = None) -> Optional[int]:
        """새 워크플로우 생성
        
        데이터베이스 연결 실패 시에도 워크플로우 생성이 가능하도록 설계되었습니다.
        연결 실패 시 임시 ID(음수 값)를 생성하여 메모리에서만 워크플로우를 관리합니다.
        이를 통해 데이터베이스 서버 장애 상황에서도 워크플로우 기능이 계속 작동할 수 있습니다.
        
        Args:
            name: 워크플로우 이름
            description: 워크플로우 설명
            definition: 워크플로우 정의 (JSON)
            created_by: 생성자
            
        Returns:
            int: 생성된 워크플로우 ID 또는 임시 ID (데이터베이스 연결 실패 시)
        """
        try:
            conn = self.connect_db()
            if conn is None:
                logger.warning("데이터베이스 연결 실패로 인해 메모리에만 워크플로우를 생성합니다.")
                # 데이터베이스 연결 실패 시 임시 ID 생성 (음수 값)
                # 타임스탬프를 사용하여 고유한 ID 생성
                workflow_id = -int(datetime.now().timestamp())
                logger.info(f"임시 워크플로우 ID 생성: {workflow_id}")
                return workflow_id
                
            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO workflows (name, description, definition, created_by) 
                    VALUES (%s, %s, %s, %s) RETURNING id""",
                    (name, description, json.dumps(definition), created_by)
                )
                workflow_id = cur.fetchone()[0]
                conn.commit()
                
                # 워크플로우 단계 추가
                if 'steps' in definition:
                    for i, step in enumerate(definition['steps']):
                        self.add_workflow_step(
                            workflow_id=workflow_id,
                            step_name=step.get('name', f"Step {i+1}"),
                            step_type=step.get('type', 'task'),
                            step_config=step,
                            step_order=i,
                            is_conditional=step.get('condition') is not None,
                            condition_expression=step.get('condition')
                        )
                
                return workflow_id
        except Exception as e:
            if conn is not None:
                conn.rollback()
            logger.error(f"워크플로우 생성 오류: {e}")
            # 오류 발생 시 임시 ID 생성 (음수 값)
            workflow_id = -int(datetime.now().timestamp())
            logger.info(f"오류 발생으로 임시 워크플로우 ID 생성: {workflow_id}")
            return workflow_id
    
    def add_workflow_step(self, workflow_id: int, step_name: str, step_type: str, 
                         step_config: Dict, step_order: int, is_conditional: bool = False,
                         condition_expression: str = None) -> Optional[int]:
        """워크플로우 단계 추가
        
        Args:
            workflow_id: 워크플로우 ID
            step_name: 단계 이름
            step_type: 단계 유형 (task, condition, loop 등)
            step_config: 단계 설정 (JSON)
            step_order: 단계 순서
            is_conditional: 조건부 단계 여부
            condition_expression: 조건식
            
        Returns:
            int: 생성된 단계 ID 또는 None (실패 시)
        """
        # 워크플로우 ID가 음수인 경우 (임시 ID) 데이터베이스 저장 없이 임시 단계 ID 반환
        if workflow_id < 0:
            step_id = -int(datetime.now().timestamp() * 1000 + step_order)
            logger.info(f"임시 워크플로우 단계 ID 생성: {step_id} (워크플로우 ID: {workflow_id})")
            return step_id
            
        try:
            conn = self.connect_db()
            if conn is None:
                # 데이터베이스 연결 실패 시 임시 ID 생성
                step_id = -int(datetime.now().timestamp() * 1000 + step_order)
                logger.warning(f"데이터베이스 연결 실패로 임시 워크플로우 단계 ID 생성: {step_id}")
                return step_id
                
            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO workflow_steps 
                    (workflow_id, step_name, step_type, step_config, step_order, is_conditional, condition_expression) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                    (workflow_id, step_name, step_type, json.dumps(step_config), 
                     step_order, is_conditional, condition_expression)
                )
                step_id = cur.fetchone()[0]
                conn.commit()
                return step_id
        except Exception as e:
            if conn is not None:
                conn.rollback()
            logger.error(f"워크플로우 단계 추가 오류: {e}")
            # 오류 발생 시 임시 ID 생성
            step_id = -int(datetime.now().timestamp() * 1000 + step_order)
            logger.info(f"오류 발생으로 임시 워크플로우 단계 ID 생성: {step_id}")
            return step_id
    
    def get_workflow(self, workflow_id: int) -> Optional[Dict]:
        """워크플로우 조회
        
        Args:
            workflow_id: 워크플로우 ID
            
        Returns:
            Dict: 워크플로우 정보 또는 None (실패 시)
        """
        # 임시 워크플로우 ID인 경우 (음수) 메모리에서 생성한 워크플로우 정보 반환
        if workflow_id < 0:
            # 임시 워크플로우 정보 생성
            return {
                'id': workflow_id,
                'name': f"임시 워크플로우 {abs(workflow_id)}",
                'description': "데이터베이스 연결 없이 생성된 임시 워크플로우",
                'definition': {},
                'created_at': datetime.now(),
                'updated_at': datetime.now(),
                'created_by': "system",
                'is_active': True,
                'steps': []
            }
            
        try:
            conn = self.connect_db()
            if conn is None:
                # 데이터베이스 연결 실패 시 임시 워크플로우 정보 생성
                logger.warning(f"데이터베이스 연결 실패로 임시 워크플로우 정보 생성: {workflow_id}")
                return {
                    'id': workflow_id,
                    'name': f"워크플로우 {workflow_id}",
                    'description': "데이터베이스 연결 실패로 정보를 가져올 수 없습니다",
                    'definition': {},
                    'created_at': datetime.now(),
                    'updated_at': datetime.now(),
                    'created_by': "system",
                    'is_active': True,
                    'steps': []
                }
                
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                cur.execute(
                    """SELECT id, name, description, definition, created_at, updated_at, created_by, is_active 
                    FROM workflows WHERE id = %s""",
                    (workflow_id,)
                )
                workflow = cur.fetchone()
                
                if not workflow:
                    return None
                
                # 워크플로우 단계 조회
                cur.execute(
                    """SELECT id, step_name, step_type, step_config, step_order, is_conditional, condition_expression 
                    FROM workflow_steps WHERE workflow_id = %s ORDER BY step_order""",
                    (workflow_id,)
                )
                steps = cur.fetchall()
                
                result = dict(workflow)
                result['steps'] = [dict(step) for step in steps]
                
                return result
        except Exception as e:
            logger.error(f"워크플로우 조회 오류: {e}")
            # 오류 발생 시 임시 워크플로우 정보 생성
            return {
                'id': workflow_id,
                'name': f"워크플로우 {workflow_id}",
                'description': f"오류 발생: {str(e)}",
                'definition': {},
                'created_at': datetime.now(),
                'updated_at': datetime.now(),
                'created_by': "system",
                'is_active': True,
                'steps': []
            }
    
    def update_workflow(self, workflow_id: int, name: str = None, description: str = None, 
                       definition: Dict = None, is_active: bool = None) -> bool:
        """워크플로우 업데이트
        
        Args:
            workflow_id: 워크플로우 ID
            name: 워크플로우 이름
            description: 워크플로우 설명
            definition: 워크플로우 정의 (JSON)
            is_active: 활성화 여부
            
        Returns:
            bool: 성공 여부
        """
        try:
            conn = self.connect_db()
            with conn.cursor() as cur:
                update_fields = []
                params = []
                
                if name is not None:
                    update_fields.append("name = %s")
                    params.append(name)
                
                if description is not None:
                    update_fields.append("description = %s")
                    params.append(description)
                
                if definition is not None:
                    update_fields.append("definition = %s")
                    params.append(json.dumps(definition))
                
                if is_active is not None:
                    update_fields.append("is_active = %s")
                    params.append(is_active)
                
                if not update_fields:
                    return False
                
                update_fields.append("updated_at = %s")
                params.append(datetime.now())
                
                params.append(workflow_id)
                
                query = f"""UPDATE workflows SET {', '.join(update_fields)} WHERE id = %s"""
                cur.execute(query, params)
                
                # 워크플로우 단계 업데이트
                if definition and 'steps' in definition:
                    # 기존 단계 삭제
                    cur.execute("DELETE FROM workflow_steps WHERE workflow_id = %s", (workflow_id,))
                    
                    # 새 단계 추가
                    for i, step in enumerate(definition['steps']):
                        self.add_workflow_step(
                            workflow_id=workflow_id,
                            step_name=step.get('name', f"Step {i+1}"),
                            step_type=step.get('type', 'task'),
                            step_config=step,
                            step_order=i,
                            is_conditional=step.get('condition') is not None,
                            condition_expression=step.get('condition')
                        )
                
                conn.commit()
                return cur.rowcount > 0
        except Exception as e:
            conn.rollback()
            logger.error(f"워크플로우 업데이트 오류: {e}")
            raise
    
    def delete_workflow(self, workflow_id: int) -> bool:
        """워크플로우 삭제
        
        Args:
            workflow_id: 워크플로우 ID
            
        Returns:
            bool: 성공 여부
        """
        try:
            conn = self.connect_db()
            with conn.cursor() as cur:
                # 워크플로우 단계 삭제
                cur.execute("DELETE FROM workflow_steps WHERE workflow_id = %s", (workflow_id,))
                
                # 워크플로우 실행 기록 삭제
                cur.execute("DELETE FROM workflow_executions WHERE workflow_id = %s", (workflow_id,))
                
                # 워크플로우 삭제
                cur.execute("DELETE FROM workflows WHERE id = %s", (workflow_id,))
                
                conn.commit()
                return cur.rowcount > 0
        except Exception as e:
            conn.rollback()
            logger.error(f"워크플로우 삭제 오류: {e}")
            raise
    
    def execute_workflow(self, workflow_id: int, execution_params: str = None) -> int:
        """워크플로우 실행
        
        Args:
            workflow_id: 워크플로우 ID
            execution_params: 실행 매개변수 (JSON 문자열)
            
        Returns:
            int: 실행 ID
        """
        try:
            # 워크플로우 조회
            workflow = self.get_workflow(workflow_id)
            if not workflow:
                logger.error(f"워크플로우를 찾을 수 없습니다: {workflow_id}")
                # 임시 실행 ID 생성
                return -int(datetime.now().timestamp())
            
            if not workflow.get('is_active', True) is False:
                logger.warning(f"비활성화된 워크플로우입니다: {workflow_id}")
            
            # 실행 기록 시작
            conn = self.connect_db()
            if conn is None:
                # 데이터베이스 연결 실패 시 임시 실행 ID 생성
                execution_id = -int(datetime.now().timestamp())
                logger.warning(f"데이터베이스 연결 실패로 임시 실행 ID 생성: {execution_id}")
                return execution_id
                
            try:
                with conn.cursor() as cur:
                    # 실행 기록 시작 (start_workflow_execution 함수가 없을 수 있으므로 직접 INSERT 사용)
                    try:
                        cur.execute(
                            "SELECT start_workflow_execution(%s)",
                            (workflow_id,)
                        )
                        execution_id = cur.fetchone()[0]
                    except Exception as e:
                        # 함수가 없는 경우 직접 INSERT
                        logger.warning(f"start_workflow_execution 함수 호출 실패: {e}, 직접 INSERT 시도")
                        cur.execute(
                            """INSERT INTO workflow_executions 
                            (workflow_id, status, execution_params, started_at) 
                            VALUES (%s, %s, %s, %s) RETURNING id""",
                            (workflow_id, 'running', execution_params, datetime.now())
                        )
                        execution_id = cur.fetchone()[0]
                    conn.commit()
                    return execution_id
            except Exception as e:
                if conn is not None:
                    conn.rollback()
                logger.error(f"워크플로우 실행 시작 오류: {e}")
                # 임시 실행 ID 생성
                execution_id = -int(datetime.now().timestamp())
                logger.warning(f"오류 발생으로 임시 실행 ID 생성: {execution_id}")
                return execution_id
            
        except Exception as e:
            logger.error(f"워크플로우 실행 초기화 오류: {e}")
            # 임시 실행 ID 생성
            execution_id = -int(datetime.now().timestamp())
            logger.warning(f"오류 발생으로 임시 실행 ID 생성: {execution_id}")
            return execution_id
    
    def get_execution_result(self, execution_id: int) -> Dict:
        """워크플로우 실행 결과 조회
        
        Args:
            execution_id: 실행 ID
            
        Returns:
            Dict: 실행 결과
        """
        # 임시 ID(음수)인 경우 임시 결과 반환
        if execution_id < 0:
            return {
                "execution_id": execution_id,
                "workflow_id": -1,
                "status": "unknown",
                "result": {"message": "데이터베이스 연결 실패로 실행 결과를 조회할 수 없습니다."},
                "error": "데이터베이스 연결 실패",
                "execution_data": {}
            }
            
        try:
            conn = self.connect_db()
            if conn is None:
                # 데이터베이스 연결 실패 시 임시 결과 반환
                return {
                    "execution_id": execution_id,
                    "workflow_id": -1,
                    "status": "unknown",
                    "result": {"message": "데이터베이스 연결 실패로 실행 결과를 조회할 수 없습니다."},
                    "error": "데이터베이스 연결 실패",
                    "execution_data": {}
                }
                
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """SELECT e.*, w.name as workflow_name 
                    FROM workflow_executions e 
                    JOIN workflows w ON e.workflow_id = w.id 
                    WHERE e.id = %s""",
                    (execution_id,)
                )
                execution = cur.fetchone()
                
                if not execution:
                    return {
                        "execution_id": execution_id,
                        "status": "not_found",
                        "error": f"실행 ID {execution_id}에 대한 기록을 찾을 수 없습니다.",
                        "result": {},
                        "execution_data": {}
                    }
                
                # 결과 변환
                result = {
                    "execution_id": execution['id'],
                    "workflow_id": execution['workflow_id'],
                    "workflow_name": execution['workflow_name'],
                    "status": execution['status'],
                    "started_at": execution['started_at'],
                    "completed_at": execution['completed_at'],
                    "execution_time": None,
                    "result": execution['result'] if execution['result'] else {},
                    "error": execution['error'],
                    "execution_data": execution['execution_data'] if execution['execution_data'] else {}
                }
                
                # 실행 시간 계산
                if execution['started_at'] and execution['completed_at']:
                    delta = execution['completed_at'] - execution['started_at']
                    result['execution_time'] = delta.total_seconds()
                
                return result
                
        except Exception as e:
            logger.error(f"워크플로우 실행 결과 조회 오류: {e}")
            return {
                "execution_id": execution_id,
                "status": "error",
                "error": str(e),
                "result": {},
                "execution_data": {}
            }
    
    def _evaluate_condition(self, condition: str, context: Dict) -> bool:
        """조건식 평가
        
        Args:
            condition: 조건식
            context: 컨텍스트 데이터
            
        Returns:
            bool: 조건 충족 여부
        """
        try:
            # 간단한 조건식 평가 (실제로는 더 안전한 방식 필요)
            # 예: "status == 'success'" 또는 "count > 5"
            
            # 컨텍스트 변수 대체
            for key, value in context.items():
                if isinstance(value, str):
                    condition = condition.replace(f"{{{key}}}", f"'{value}'")
                else:
                    condition = condition.replace(f"{{{key}}}", str(value))
            
            # 조건식 평가 (주의: 실제 구현에서는 보안 고려 필요)
            return eval(condition)
        except Exception as e:
            logger.error(f"조건식 평가 오류: {e}")
            return False
    
    def _execute_task(self, config: Dict, context: Dict) -> Any:
        """작업 단계 실행
        
        Args:
            config: 단계 설정
            context: 컨텍스트 데이터
            
        Returns:
            Any: 실행 결과
        """
        task_type = config.get('task_type')
        
        if task_type == 'http_request':
            # HTTP 요청 처리
            return {"message": "HTTP 요청 실행 (구현 필요)"}
        elif task_type == 'database_query':
            # 데이터베이스 쿼리 처리
            return {"message": "데이터베이스 쿼리 실행 (구현 필요)"}
        elif task_type == 'generate_test':
            # 테스트 코드 생성
            return {"message": "테스트 코드 생성 (구현 필요)"}
        elif task_type == 'github_action':
            # GitHub 액션 처리
            return {"message": "GitHub 액션 실행 (구현 필요)"}
        else:
            return {"message": f"지원되지 않는 작업 유형: {task_type}"}
    
    def _execute_loop(self, config: Dict, context: Dict) -> List[Any]:
        """반복 단계 실행
        
        Args:
            config: 단계 설정
            context: 컨텍스트 데이터
            
        Returns:
            List[Any]: 실행 결과 목록
        """
        items = config.get('items', [])
        item_var = config.get('item_var', 'item')
        steps = config.get('steps', [])
        
        results = []
        
        for item in items:
            # 아이템별 컨텍스트 생성
            item_context = context.copy()
            item_context[item_var] = item
            
            # 단계별 실행
            step_results = {}
            for step in steps:
                step_config = step.get('config', {})
                step_type = step.get('type', 'task')
                
                if step_type == 'task':
                    step_result = self._execute_task(step_config, item_context)
                else:
                    step_result = {"error": f"지원되지 않는 단계 유형: {step_type}"}
                
                step_results[step.get('name', 'step')] = step_result
                
                # 컨텍스트 업데이트
                if isinstance(step_result, dict):
                    item_context.update(step_result)
            
            results.append(step_results)
        
        return results

# 사용자 템플릿 관리 클래스
class UserTemplateManager:
    """사용자 템플릿 관리 클래스"""
    
    def __init__(self, db_config=None):
        """초기화
        
        Args:
            db_config (dict, optional): 데이터베이스 연결 설정
        """
        self.db_config = db_config or {
            'dbname': 'adcluster',
            'user': 'postgres',
            'password': 'postgres',
            'host': 'localhost',
            'port': '5432'
        }
        self.conn = None
    
    def connect_db(self):
        """데이터베이스 연결"""
        try:
            if self.conn is None or self.conn.closed:
                self.conn = psycopg2.connect(**self.db_config)
            return self.conn
        except Exception as e:
            logger.error(f"데이터베이스 연결 오류: {e}")
            raise
    
    def close_db(self):
        """데이터베이스 연결 종료"""
        if self.conn and not self.conn.closed:
            self.conn.close()
    
    def create_template(self, name: str, description: str, template_content: str, 
                       template_type: str, created_by: str = None, is_public: bool = False) -> int:
        """새 템플릿 생성
        
        Args:
            name: 템플릿 이름
            description: 템플릿 설명
            template_content: 템플릿 내용
            template_type: 템플릿 유형
            created_by: 생성자
            is_public: 공개 여부
            
        Returns:
            int: 생성된 템플릿 ID
        """
        try:
            conn = self.connect_db()
            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO user_templates 
                    (name, description, template_content, template_type, created_by, is_public) 
                    VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
                    (name, description, template_content, template_type, created_by, is_public)
                )
                template_id = cur.fetchone()[0]
                conn.commit()
                return template_id
        except Exception as e:
            conn.rollback()
            logger.error(f"템플릿 생성 오류: {e}")
            raise
    
    def get_template(self, template_id: int) -> Dict:
        """템플릿 조회
        
        Args:
            template_id: 템플릿 ID
            
        Returns:
            Dict: 템플릿 정보
        """
        try:
            conn = self.connect_db()
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                cur.execute(
                    """SELECT id, name, description, template_content, template_type, 
                    created_at, updated_at, created_by, is_public 
                    FROM user_templates WHERE id = %s""",
                    (template_id,)
                )
                template = cur.fetchone()
                
                if not template:
                    return None
                
                return dict(template)
        except Exception as e:
            logger.error(f"템플릿 조회 오류: {e}")
            raise
    
    def update_template(self, template_id: int, name: str = None, description: str = None, 
                       template_content: str = None, template_type: str = None, 
                       is_public: bool = None) -> bool:
        """템플릿 업데이트
        
        Args:
            template_id: 템플릿 ID
            name: 템플릿 이름
            description: 템플릿 설명
            template_content: 템플릿 내용
            template_type: 템플릿 유형
            is_public: 공개 여부
            
        Returns:
            bool: 성공 여부
        """
        try:
            conn = self.connect_db()
            with conn.cursor() as cur:
                update_fields = []
                params = []
                
                if name is not None:
                    update_fields.append("name = %s")
                    params.append(name)
                
                if description is not None:
                    update_fields.append("description = %s")
                    params.append(description)
                
                if template_content is not None:
                    update_fields.append("template_content = %s")
                    params.append(template_content)
                
                if template_type is not None:
                    update_fields.append("template_type = %s")
                    params.append(template_type)
                
                if is_public is not None:
                    update_fields.append("is_public = %s")
                    params.append(is_public)
                
                if not update_fields:
                    return False
                
                update_fields.append("updated_at = %s")
                params.append(datetime.now())
                
                params.append(template_id)
                
                query = f"""UPDATE user_templates SET {', '.join(update_fields)} WHERE id = %s"""
                cur.execute(query, params)
                
                conn.commit()
                return cur.rowcount > 0
        except Exception as e:
            conn.rollback()
            logger.error(f"템플릿 업데이트 오류: {e}")
            raise
    
    def delete_template(self, template_id: int) -> bool:
        """템플릿 삭제
        
        Args:
            template_id: 템플릿 ID
            
        Returns:
            bool: 성공 여부
        """
        try:
            conn = self.connect_db()
            with conn.cursor() as cur:
                cur.execute("DELETE FROM user_templates WHERE id = %s", (template_id,))
                
                conn.commit()
                return cur.rowcount > 0
        except Exception as e:
            conn.rollback()
            logger.error(f"템플릿 삭제 오류: {e}")
            raise
    
    def list_templates(self, template_type: str = None, created_by: str = None, 
                      is_public: bool = None) -> List[Dict]:
        """템플릿 목록 조회
        
        Args:
            template_type: 템플릿 유형 필터
            created_by: 생성자 필터
            is_public: 공개 여부 필터
            
        Returns:
            List[Dict]: 템플릿 목록
        """
        try:
            conn = self.connect_db()
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                query = """SELECT id, name, description, template_type, 
                created_at, updated_at, created_by, is_public 
                FROM user_templates WHERE 1=1"""
                
                params = []
                
                if template_type is not None:
                    query += " AND template_type = %s"
                    params.append(template_type)
                
                if created_by is not None:
                    query += " AND created_by = %s"
                    params.append(created_by)
                
                if is_public is not None:
                    query += " AND is_public = %s"
                    params.append(is_public)
                
                query += " ORDER BY updated_at DESC"
                
                cur.execute(query, params)
                templates = cur.fetchall()
                
                return [dict(template) for template in templates]
        except Exception as e:
            logger.error(f"템플릿 목록 조회 오류: {e}")
            raise

# 메인 실행 함수
def create_sample_workflow():
    """샘플 워크플로우 생성"""
    workflow_manager = WorkflowManager()
    
    # 샘플 워크플로우 정의
    workflow_definition = {
        "name": "테스트 코드 생성 및 실행 워크플로우",
        "description": "자연어 프롬프트를 분석하여 테스트 코드를 생성하고 GitHub에 저장한 후 실행하는 워크플로우",
        "steps": [
            {
                "name": "프롬프트 분석",
                "type": "task",
                "task_type": "analyze_prompt",
                "config": {
                    "prompt_field": "input_prompt"
                }
            },
            {
                "name": "테스트 코드 생성",
                "type": "task",
                "task_type": "generate_test",
                "config": {
                    "test_type": "{{test_type}}",
                    "prompt": "{{input_prompt}}"
                }
            },
            {
                "name": "GitHub 저장",
                "type": "task",
                "task_type": "github_action",
                "config": {
                    "action": "commit",
                    "file_path": "tests/generated/{{test_type}}_test.py",
                    "content": "{{test_code}}",
                    "commit_message": "Add {{test_type}} test from prompt"
                }
            },
            {
                "name": "테스트 실행",
                "type": "task",
                "task_type": "run_test",
                "config": {
                    "test_id": "{{test_id}}"
                },
                "condition": "run_test == True"
            }
        ]
    }
    
    # 워크플로우 생성
    workflow_id = workflow_manager.create_workflow(
        name="테스트 코드 생성 워크플로우",
        description="자연어 프롬프트로 테스트 코드를 생성하는 워크플로우",
        definition=workflow_definition,
        created_by="system"
    )
    
    print(f"샘플 워크플로우가 생성되었습니다. ID: {workflow_id}")
    return workflow_id

# 명령줄에서 실행 시
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "create_sample":
        create_sample_workflow()
    else:
        print("사용법: python workflow_manager.py create_sample")