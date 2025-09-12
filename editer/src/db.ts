import type { DocumentDetailsData, ReferenceItem } from './data/mockData';

// INSERT, UPDATE, DELETE 작업의 반환 타입을 정의합니다.
export type MutationResponse = {
  success: boolean;
  message?: string;
};

// SELECT 작업의 반환 타입을 정의합니다.
export type SelectResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

const API_URL = 'http://localhost:4000/api/query'; 

type AppState = { [key: string]: DocumentDetailsData };

/**
 * App의 상태(state)를 관리하는 데이터베이스 클래스입니다.
 * React의 setState 함수를 직접 사용하여 상태 불변성을 유지합니다.
 */
export class Database {
  /**
   * SQL과 유사한 쿼리를 백엔드 API로 전송합니다.
   * @param sql 실행할 쿼리 문자열
   * @returns 서버로부터 받은 작업 결과
   */
  public async query(sql: string): Promise<any> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("API 통신 오류:", error);
      return { success: false, message: error.message };
    }
  }
}