import os
import sys
import time
import argparse
import psycopg2
import datetime
import threading
from tabulate import tabulate
from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드
load_dotenv()

# 데이터베이스 설정
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "nicchals")
DB_PASSWORD = os.getenv("DB_PASSWORD", "a770405z")
DB_NAME = os.getenv("DB_NAME", "adcluster_db")


def get_db_connection():
    """데이터베이스 연결 생성"""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname=DB_NAME
        )
        return conn
    except Exception as e:
        print(f"데이터베이스 연결 오류: {e}")
        return None


def get_database_size():
    """데이터베이스 크기 조회"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT pg_size_pretty(pg_database_size(%s)) as size
        """, (DB_NAME,))
        result = cursor.fetchone()
        cursor.close()
        return result[0] if result else None
    except Exception as e:
        print(f"데이터베이스 크기 조회 오류: {e}")
        return None
    finally:
        conn.close()


def get_table_sizes():
    """테이블별 크기 조회"""
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                table_schema || '.' || table_name as table_name,
                pg_size_pretty(pg_total_relation_size(table_schema || '.' || table_name)) as total_size,
                pg_size_pretty(pg_relation_size(table_schema || '.' || table_name)) as table_size,
                pg_size_pretty(pg_total_relation_size(table_schema || '.' || table_name) - 
                              pg_relation_size(table_schema || '.' || table_name)) as index_size,
                (SELECT COUNT(*) FROM information_schema.columns 
                 WHERE table_schema = t.table_schema AND table_name = t.table_name) as column_count,
                (SELECT reltuples::bigint FROM pg_class c 
                 JOIN pg_namespace n ON n.oid = c.relnamespace 
                 WHERE n.nspname = t.table_schema AND c.relname = t.table_name) as row_count
            FROM information_schema.tables t
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
              AND table_type = 'BASE TABLE'
            ORDER BY pg_total_relation_size(table_schema || '.' || table_name) DESC
        """)
        results = cursor.fetchall()
        cursor.close()
        
        table_data = []
        for row in results:
            table_data.append({
                'table_name': row[0],
                'total_size': row[1],
                'table_size': row[2],
                'index_size': row[3],
                'column_count': row[4],
                'row_count': row[5] if row[5] is not None else 'N/A'
            })
        
        return table_data
    except Exception as e:
        print(f"테이블 크기 조회 오류: {e}")
        return []
    finally:
        conn.close()


def get_active_connections():
    """활성 연결 정보 조회"""
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                datname as database,
                usename as username,
                application_name,
                client_addr,
                state,
                query_start,
                NOW() - query_start as duration,
                query
            FROM pg_stat_activity
            WHERE datname = %s
            ORDER BY query_start DESC
        """, (DB_NAME,))
        results = cursor.fetchall()
        cursor.close()
        
        connection_data = []
        for row in results:
            connection_data.append({
                'database': row[0],
                'username': row[1],
                'application': row[2],
                'client_addr': str(row[3]) if row[3] else 'N/A',
                'state': row[4],
                'query_start': row[5].strftime('%Y-%m-%d %H:%M:%S') if row[5] else 'N/A',
                'duration': str(row[6]) if row[6] else 'N/A',
                'query': row[7] if row[7] else 'N/A'
            })
        
        return connection_data
    except Exception as e:
        print(f"활성 연결 조회 오류: {e}")
        return []
    finally:
        conn.close()


def get_slow_queries(min_duration_ms=1000):
    """느린 쿼리 로그 조회 (pg_stat_statements 확장 필요)"""
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor()
        
        # pg_stat_statements 확장이 설치되어 있는지 확인
        cursor.execute("""
            SELECT COUNT(*) FROM pg_extension WHERE extname = 'pg_stat_statements'
        """)
        if cursor.fetchone()[0] == 0:
            print("경고: pg_stat_statements 확장이 설치되어 있지 않습니다.")
            print("느린 쿼리 모니터링을 위해 다음 명령을 실행하세요:")
            print("CREATE EXTENSION pg_stat_statements;")
            return []
        
        # 느린 쿼리 조회
        cursor.execute("""
            SELECT 
                round(mean_exec_time) as avg_time_ms,
                calls,
                round(total_exec_time) as total_time_ms,
                query
            FROM pg_stat_statements
            WHERE dbid = (SELECT oid FROM pg_database WHERE datname = %s)
              AND mean_exec_time > %s
            ORDER BY mean_exec_time DESC
            LIMIT 20
        """, (DB_NAME, min_duration_ms))
        results = cursor.fetchall()
        cursor.close()
        
        query_data = []
        for row in results:
            query_data.append({
                'avg_time_ms': row[0],
                'calls': row[1],
                'total_time_ms': row[2],
                'query': row[3]
            })
        
        return query_data
    except Exception as e:
        print(f"느린 쿼리 조회 오류: {e}")
        return []
    finally:
        conn.close()


def get_index_usage():
    """인덱스 사용 통계 조회"""
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                schemaname || '.' || relname as table_name,
                indexrelname as index_name,
                idx_scan as index_scans,
                idx_tup_read as tuples_read,
                idx_tup_fetch as tuples_fetched,
                pg_size_pretty(pg_relation_size(schemaname || '.' || indexrelname::text)) as index_size
            FROM pg_stat_user_indexes
            JOIN pg_index USING (indexrelid)
            ORDER BY idx_scan DESC, pg_relation_size(schemaname || '.' || indexrelname::text) DESC
        """)
        results = cursor.fetchall()
        cursor.close()
        
        index_data = []
        for row in results:
            index_data.append({
                'table_name': row[0],
                'index_name': row[1],
                'index_scans': row[2],
                'tuples_read': row[3],
                'tuples_fetched': row[4],
                'index_size': row[5]
            })
        
        return index_data
    except Exception as e:
        print(f"인덱스 사용 통계 조회 오류: {e}")
        return []
    finally:
        conn.close()


def get_unused_indexes():
    """사용되지 않는 인덱스 조회"""
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                schemaname || '.' || relname as table_name,
                indexrelname as index_name,
                pg_size_pretty(pg_relation_size(schemaname || '.' || indexrelname::text)) as index_size,
                idx_scan as index_scans
            FROM pg_stat_user_indexes
            JOIN pg_index USING (indexrelid)
            WHERE idx_scan = 0 AND indisunique IS FALSE
            ORDER BY pg_relation_size(schemaname || '.' || indexrelname::text) DESC
        """)
        results = cursor.fetchall()
        cursor.close()
        
        unused_index_data = []
        for row in results:
            unused_index_data.append({
                'table_name': row[0],
                'index_name': row[1],
                'index_size': row[2],
                'index_scans': row[3]
            })
        
        return unused_index_data
    except Exception as e:
        print(f"사용되지 않는 인덱스 조회 오류: {e}")
        return []
    finally:
        conn.close()


def get_bloat_info():
    """테이블 및 인덱스 블로트(bloat) 정보 조회"""
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            WITH constants AS (
                SELECT current_setting('block_size')::numeric AS bs,
                       23 AS hdr,
                       8 AS ma
            )
            SELECT
                schemaname || '.' || tablename as table_name,
                cc.reltuples::bigint as row_count,
                pg_size_pretty(cc.relpages::bigint * bs) as table_size,
                CASE WHEN iname IS NULL
                    THEN 'table'
                    ELSE 'index'
                END as object_type,
                CASE WHEN iname IS NULL
                    THEN pct_bloat
                    ELSE pct_bloat
                END as bloat_pct,
                CASE WHEN iname IS NULL
                    THEN pg_size_pretty((cc.relpages::bigint * bs * pct_bloat/100)::bigint)
                    ELSE pg_size_pretty((cc.relpages::bigint * bs * pct_bloat/100)::bigint)
                END as bloat_size,
                CASE WHEN iname IS NULL
                    THEN pg_size_pretty((cc.relpages::bigint * bs)::bigint - (cc.relpages::bigint * bs * pct_bloat/100)::bigint)
                    ELSE pg_size_pretty((cc.relpages::bigint * bs)::bigint - (cc.relpages::bigint * bs * pct_bloat/100)::bigint)
                END as actual_size
            FROM (
                SELECT
                    schemaname,
                    tablename,
                    cc.reltuples,
                    cc.relpages,
                    bs,
                    CASE WHEN pgc.reltoastrelid = 0
                        THEN NULL
                        ELSE pgc.reltoastrelid
                    END as toast,
                    CASE
                        WHEN pgc.relhasindex
                            AND EXISTS (SELECT 1 FROM pg_class c2 WHERE c2.oid = pgc.reltoastrelid AND c2.relhasindex)
                        THEN (SELECT SUM(c2.relpages) FROM pg_index i3, pg_class c2
                              WHERE i3.indrelid = pgc.reltoastrelid AND c2.oid = i3.indexrelid)
                        ELSE 0
                    END as tidx,
                    NULL as iname,
                    NULL as ituples,
                    NULL as ipages,
                    NULL as iotta,
                    ROUND(
                        CASE
                            WHEN pgc.reltuples > 0
                            THEN 100 * (cc.relpages - 
                                        ((pgc.reltuples * (datahdr + ma - 
                                                            CASE WHEN datahdr%ma = 0 THEN ma ELSE datahdr%ma END) + nullhdr2 + 4) / 
                                          (bs - 20))) / cc.relpages
                            ELSE 0
                        END
                    ) AS pct_bloat
                FROM (
                    SELECT
                        ma,
                        bs,
                        schemaname,
                        tablename,
                        (datawidth + (hdr + ma - (CASE WHEN hdr%ma = 0 THEN ma ELSE hdr%ma END)))::numeric as datahdr,
                        (maxfracsum * (nullhdr + ma - (CASE WHEN nullhdr%ma = 0 THEN ma ELSE nullhdr%ma END))) as nullhdr2
                    FROM (
                        SELECT
                            schemaname,
                            tablename,
                            hdr,
                            ma,
                            bs,
                            SUM((1 - null_frac) * avg_width) as datawidth,
                            MAX(null_frac) as maxfracsum,
                            hdr + (
                                SELECT 1 + COUNT(*) / 8
                                FROM pg_stats s2
                                WHERE null_frac <> 0 AND s2.schemaname = s.schemaname AND s2.tablename = s.tablename
                            ) as nullhdr
                        FROM pg_stats s, constants
                        GROUP BY 1, 2, 3, 4, 5
                    ) AS foo
                ) AS rs
                JOIN pg_class cc ON cc.relname = rs.tablename
                JOIN pg_namespace nn ON cc.relnamespace = nn.oid AND nn.nspname = rs.schemaname
                JOIN pg_class pgc ON pgc.relname = rs.tablename AND pgc.relnamespace = nn.oid
            ) AS sml
            WHERE sml.relpages > 0
            ORDER BY pct_bloat DESC
            LIMIT 20
        """)
        results = cursor.fetchall()
        cursor.close()
        
        bloat_data = []
        for row in results:
            bloat_data.append({
                'table_name': row[0],
                'row_count': row[1],
                'table_size': row[2],
                'object_type': row[3],
                'bloat_pct': row[4],
                'bloat_size': row[5],
                'actual_size': row[6]
            })
        
        return bloat_data
    except Exception as e:
        print(f"블로트 정보 조회 오류: {e}")
        return []
    finally:
        conn.close()


def get_vacuum_stats():
    """VACUUM 통계 정보 조회"""
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                schemaname || '.' || relname as table_name,
                n_live_tup as live_rows,
                n_dead_tup as dead_rows,
                CASE WHEN n_live_tup > 0
                    THEN ROUND(n_dead_tup * 100.0 / n_live_tup, 1)
                    ELSE 0
                END as dead_rows_pct,
                last_vacuum,
                last_autovacuum,
                last_analyze,
                last_autoanalyze
            FROM pg_stat_user_tables
            ORDER BY n_dead_tup DESC
        """)
        results = cursor.fetchall()
        cursor.close()
        
        vacuum_data = []
        for row in results:
            vacuum_data.append({
                'table_name': row[0],
                'live_rows': row[1],
                'dead_rows': row[2],
                'dead_rows_pct': row[3],
                'last_vacuum': row[4].strftime('%Y-%m-%d %H:%M:%S') if row[4] else 'Never',
                'last_autovacuum': row[5].strftime('%Y-%m-%d %H:%M:%S') if row[5] else 'Never',
                'last_analyze': row[6].strftime('%Y-%m-%d %H:%M:%S') if row[6] else 'Never',
                'last_autoanalyze': row[7].strftime('%Y-%m-%d %H:%M:%S') if row[7] else 'Never'
            })
        
        return vacuum_data
    except Exception as e:
        print(f"VACUUM 통계 조회 오류: {e}")
        return []
    finally:
        conn.close()


def print_table(data, title, headers=None):
    """데이터를 테이블 형식으로 출력"""
    if not data:
        print(f"\n=== {title} ===\n")
        print("데이터가 없습니다.")
        return
    
    print(f"\n=== {title} ===\n")
    
    if not headers:
        headers = data[0].keys()
    
    table_data = []
    for item in data:
        row = []
        for key in headers:
            row.append(item.get(key, 'N/A'))
        table_data.append(row)
    
    print(tabulate(table_data, headers=headers, tablefmt="grid"))


def monitor_database(interval=5, continuous=False):
    """데이터베이스 모니터링 실행"""
    try:
        while True:
            os.system('cls' if os.name == 'nt' else 'clear')
            print(f"\n=== PostgreSQL 데이터베이스 모니터링 ({DB_NAME}) ===")
            print(f"시간: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            # 데이터베이스 크기
            db_size = get_database_size()
            if db_size:
                print(f"\n데이터베이스 크기: {db_size}")
            
            # 활성 연결
            connections = get_active_connections()
            print_table(connections, "활성 연결", 
                       ['username', 'client_addr', 'state', 'duration', 'query'])
            
            # 테이블 크기
            tables = get_table_sizes()
            print_table(tables[:10], "테이블 크기 (상위 10개)", 
                       ['table_name', 'total_size', 'table_size', 'index_size', 'row_count'])
            
            # 느린 쿼리
            slow_queries = get_slow_queries()
            if slow_queries:
                print_table(slow_queries[:5], "느린 쿼리 (상위 5개)", 
                           ['avg_time_ms', 'calls', 'total_time_ms', 'query'])
            
            # 사용되지 않는 인덱스
            unused_indexes = get_unused_indexes()
            if unused_indexes:
                print_table(unused_indexes[:5], "사용되지 않는 인덱스 (상위 5개)", 
                           ['table_name', 'index_name', 'index_size'])
            
            # VACUUM 통계
            vacuum_stats = get_vacuum_stats()
            print_table(vacuum_stats[:5], "VACUUM 통계 (상위 5개)", 
                       ['table_name', 'live_rows', 'dead_rows', 'dead_rows_pct', 'last_autovacuum'])
            
            if not continuous:
                break
            
            print(f"\n다음 업데이트까지 {interval}초 대기 중... (Ctrl+C로 종료)")
            time.sleep(interval)
    
    except KeyboardInterrupt:
        print("\n모니터링이 중지되었습니다.")


def generate_report(output_file=None):
    """데이터베이스 상태 보고서 생성"""
    report = []
    report.append(f"# PostgreSQL 데이터베이스 상태 보고서 - {DB_NAME}")
    report.append(f"생성 시간: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # 데이터베이스 크기
    db_size = get_database_size()
    if db_size:
        report.append(f"## 데이터베이스 크기: {db_size}\n")
    
    # 테이블 크기
    tables = get_table_sizes()
    if tables:
        report.append("## 테이블 크기 (상위 20개)")
        table_data = []
        for table in tables[:20]:
            table_data.append([table['table_name'], table['total_size'], table['table_size'], 
                              table['index_size'], table['row_count']])
        report.append(tabulate(table_data, 
                             headers=['테이블명', '전체 크기', '테이블 크기', '인덱스 크기', '행 수'], 
                             tablefmt="pipe"))
        report.append("")
    
    # 인덱스 사용 통계
    indexes = get_index_usage()
    if indexes:
        report.append("## 인덱스 사용 통계 (상위 20개)")
        index_data = []
        for index in indexes[:20]:
            index_data.append([index['table_name'], index['index_name'], index['index_scans'], 
                              index['tuples_read'], index['tuples_fetched'], index['index_size']])
        report.append(tabulate(index_data, 
                             headers=['테이블명', '인덱스명', '스캔 횟수', '읽은 튜플', '가져온 튜플', '크기'], 
                             tablefmt="pipe"))
        report.append("")
    
    # 사용되지 않는 인덱스
    unused_indexes = get_unused_indexes()
    if unused_indexes:
        report.append("## 사용되지 않는 인덱스")
        unused_index_data = []
        for index in unused_indexes:
            unused_index_data.append([index['table_name'], index['index_name'], index['index_size']])
        report.append(tabulate(unused_index_data, 
                             headers=['테이블명', '인덱스명', '크기'], 
                             tablefmt="pipe"))
        report.append("")
    
    # 블로트 정보
    bloat_info = get_bloat_info()
    if bloat_info:
        report.append("## 테이블 및 인덱스 블로트(Bloat) 정보")
        bloat_data = []
        for item in bloat_info:
            bloat_data.append([item['table_name'], item['object_type'], item['table_size'], 
                              f"{item['bloat_pct']}%", item['bloat_size'], item['actual_size']])
        report.append(tabulate(bloat_data, 
                             headers=['이름', '유형', '크기', '블로트 %', '블로트 크기', '실제 크기'], 
                             tablefmt="pipe"))
        report.append("")
    
    # VACUUM 통계
    vacuum_stats = get_vacuum_stats()
    if vacuum_stats:
        report.append("## VACUUM 통계 (상위 20개)")
        vacuum_data = []
        for item in vacuum_stats[:20]:
            vacuum_data.append([item['table_name'], item['live_rows'], item['dead_rows'], 
                               f"{item['dead_rows_pct']}%", item['last_autovacuum']])
        report.append(tabulate(vacuum_data, 
                             headers=['테이블명', '라이브 행', '데드 행', '데드 행 %', '마지막 자동 VACUUM'], 
                             tablefmt="pipe"))
        report.append("")
    
    # 느린 쿼리
    slow_queries = get_slow_queries()
    if slow_queries:
        report.append("## 느린 쿼리 (상위 10개)")
        query_data = []
        for query in slow_queries[:10]:
            # 쿼리 텍스트 줄임
            query_text = query['query']
            if len(query_text) > 100:
                query_text = query_text[:97] + '...'
            query_data.append([query['avg_time_ms'], query['calls'], query['total_time_ms'], query_text])
        report.append(tabulate(query_data, 
                             headers=['평균 시간(ms)', '호출 수', '총 시간(ms)', '쿼리'], 
                             tablefmt="pipe"))
        report.append("")
    
    # 보고서 저장 또는 출력
    report_text = "\n".join(report)
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(report_text)
        print(f"보고서가 {output_file}에 저장되었습니다.")
    else:
        print(report_text)
    
    return report_text


def main():
    parser = argparse.ArgumentParser(description="PostgreSQL 데이터베이스 모니터링 도구")
    parser.add_argument("-m", "--monitor", action="store_true", help="실시간 모니터링 모드")
    parser.add_argument("-c", "--continuous", action="store_true", help="연속 모니터링 모드")
    parser.add_argument("-i", "--interval", type=int, default=5, help="모니터링 갱신 간격(초)")
    parser.add_argument("-r", "--report", action="store_true", help="상태 보고서 생성")
    parser.add_argument("-o", "--output", help="보고서 출력 파일")
    parser.add_argument("-t", "--tables", action="store_true", help="테이블 크기 정보 표시")
    parser.add_argument("-q", "--queries", action="store_true", help="느린 쿼리 정보 표시")
    parser.add_argument("-i", "--indexes", action="store_true", help="인덱스 사용 정보 표시")
    parser.add_argument("-u", "--unused-indexes", action="store_true", help="사용되지 않는 인덱스 표시")
    parser.add_argument("-b", "--bloat", action="store_true", help="블로트(bloat) 정보 표시")
    parser.add_argument("-v", "--vacuum", action="store_true", help="VACUUM 통계 표시")
    
    args = parser.parse_args()
    
    # 기본 모드 설정
    if not any([args.monitor, args.report, args.tables, args.queries, args.indexes, 
                args.unused_indexes, args.bloat, args.vacuum]):
        args.monitor = True
    
    if args.monitor:
        monitor_database(args.interval, args.continuous)
    
    elif args.report:
        generate_report(args.output)
    
    else:
        # 개별 정보 표시
        if args.tables:
            tables = get_table_sizes()
            print_table(tables, "테이블 크기")
        
        if args.queries:
            queries = get_slow_queries()
            print_table(queries, "느린 쿼리")
        
        if args.indexes:
            indexes = get_index_usage()
            print_table(indexes, "인덱스 사용 통계")
        
        if args.unused_indexes:
            unused_indexes = get_unused_indexes()
            print_table(unused_indexes, "사용되지 않는 인덱스")
        
        if args.bloat:
            bloat_info = get_bloat_info()
            print_table(bloat_info, "테이블 및 인덱스 블로트(Bloat) 정보")
        
        if args.vacuum:
            vacuum_stats = get_vacuum_stats()
            print_table(vacuum_stats, "VACUUM 통계")


if __name__ == "__main__":
    main()