import { Pool } from 'pg';

// 응답 타입 정의
export type MutationResponse = {
  success: boolean;
  message?: string;
};
export type SelectResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

/**
 * PostgreSQL 데이터베이스와 통신하는 클래스
 */
export class PostgresDatabase {
  private pool: Pool;

  constructor() {
    // .env 파일의 정보를 사용하여 데이터베이스 커넥션 풀을 생성합니다.
    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432'),
    });
    console.log('Database pool created.');
  }

  /**
   * 프론트엔드로부터 받은 추상 쿼리를 실제 SQL로 변환하여 실행합니다.
   * @param pseudoSql 프론트엔드에서 보낸 쿼리 문자열
   */
  public async query(pseudoSql: string): Promise<any> {
    const command = pseudoSql.trim().split(/\s+/)[0]?.toUpperCase();
    
    try {
      switch (command) {
        case 'SELECT':
          return await this.handleSelect(pseudoSql);
        case 'INSERT':
          return await this.handleInsert(pseudoSql);
        case 'DELETE':
          return await this.handleDelete(pseudoSql);
        // TODO: UPDATE 구현
        default:
          throw new Error(`지원하지 않는 명령어입니다: ${command}`);
      }
    } catch (error: any) {
      console.error('Query failed:', error);
      return { success: false, message: error.message };
    }
  }

  // --- 실제 SQL을 실행하는 private 핸들러 함수들 ---

  private async handleSelect(sql: string): Promise<SelectResponse<any>> {
    // 예시: "SELECT * FROM documents"
    if (/SELECT\s+\*\s+FROM\s+documents/i.test(sql)) {
      // 실제 테이블 이름을 'documents'라고 가정합니다.
      const result = await this.pool.query('SELECT * FROM documents');
      // 실제로는 document 컬럼(JSONB 타입)에서 references 등을 파싱해야 합니다.
      return { success: true, data: result.rows };
    }
    return { success: false, message: '지원하지 않는 SELECT 쿼리입니다.' };
  }

  private async handleInsert(sql: string): Promise<MutationResponse> {
    const match = /INSERT\s+INTO\s+references\s+VALUES\s+(.+)\s+WHERE\s+projectId\s+=\s+'(.+)'/i.exec(sql);
    if (!match) throw new Error('잘못된 INSERT 구문입니다.');

    const dataString = match[1];
    const projectId = match[2];
    const newReference = JSON.parse(dataString);

    // 중요: SQL Injection을 방지하기 위해 반드시 Parameterized Query를 사용해야 합니다.
    // 여기서는 documents 테이블에 JSONB 타입의 'data' 컬럼이 있다고 가정합니다.
    const query = `
      UPDATE documents
      SET data = data || jsonb_build_object('references', 
        (SELECT data->'references' FROM documents WHERE id = $1) || $2::jsonb
      )
      WHERE id = $1 AND NOT (data->'references')::jsonb @> $2::jsonb;
    `;
    
    const result = await this.pool.query(query, [projectId, JSON.stringify(newReference)]);
    
    if (result.rowCount === 0) {
      return { success: false, message: '이미 존재하는 참고문헌이거나 프로젝트가 없습니다.' };
    }
    return { success: true };
  }

  private async handleDelete(sql: string): Promise<MutationResponse> {
    const match = /DELETE\s+FROM\s+references\s+WHERE\s+id\s+=\s+'(.+)'\s+AND\s+projectId\s+=\s+'(.+)'/i.exec(sql);
    if (!match) throw new Error('잘못된 DELETE 구문입니다.');

    const referenceId = match[1];
    const projectId = match[2];

    const query = `
      UPDATE documents
      SET data = jsonb_set(
        data,
        '{references}',
        (SELECT jsonb_agg(elem) FROM jsonb_array_elements(data->'references') AS elem WHERE elem->>'id' <> $1)
      )
      WHERE id = $2;
    `;
    
    await this.pool.query(query, [referenceId, projectId]);
    return { success: true };
  }
}