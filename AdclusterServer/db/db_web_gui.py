import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import json
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # GUI 없이 이미지 생성 가능하게 설정
import io
import base64
from flask import Flask, render_template, request, jsonify, send_file, Response, redirect, url_for, session
import csv
import tempfile
import uuid
import datetime

# .env 파일에서 환경 변수 로드
load_dotenv()

# 데이터베이스 설정
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "nicchals")
DB_PASSWORD = os.getenv("DB_PASSWORD", "a770405z")
DB_NAME = os.getenv("DB_NAME", "adcluster_db")

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", str(uuid.uuid4()))

# 임시 저장소 (실제 애플리케이션에서는 데이터베이스에 저장하는 것이 좋음)
SAVED_QUERIES = {}
QUERY_RESULTS = {}

# 데이터베이스 연결 함수
def connect_to_db():
    try:
        connection = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        return connection, None
    except Exception as e:
        return None, str(e)

# 쿼리 실행 함수
def execute_query(query, fetch=True):
    connection, error = connect_to_db()
    if error:
        return None, error
    
    try:
        cursor = connection.cursor(cursor_factory=RealDictCursor)
        cursor.execute(query)
        
        if fetch and query.strip().upper().startswith("SELECT"):
            results = cursor.fetchall()
            return results, None
        else:
            connection.commit()
            return {"affected_rows": cursor.rowcount}, None
    except Exception as e:
        return None, str(e)
    finally:
        if connection:
            connection.close()

# 테이블 목록 가져오기
def get_tables():
    query = """
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
    """
    results, error = execute_query(query)
    if error:
        return None, error
    return [record["table_name"] for record in results], None

# 테이블 구조 가져오기
def get_table_structure(table_name):
    query = f"""
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = '{table_name}'
    ORDER BY ordinal_position;
    """
    return execute_query(query)

# 테이블 데이터 샘플 가져오기
def get_table_data(table_name, limit=100):
    query = f"SELECT * FROM {table_name} LIMIT {limit};"
    return execute_query(query)

# 차트 생성 함수
def create_chart(data, chart_type, x_column, y_column):
    if not data:
        return None, "데이터가 없습니다."
    
    try:
        # 데이터프레임 생성
        df = pd.DataFrame(data)
        
        plt.figure(figsize=(10, 6))
        
        if chart_type == "bar":
            df.plot(kind='bar', x=x_column, y=y_column, ax=plt.gca())
        elif chart_type == "line":
            df.plot(kind='line', x=x_column, y=y_column, ax=plt.gca())
        elif chart_type == "pie":
            df.plot(kind='pie', y=y_column, labels=df[x_column], ax=plt.gca())
        else:
            return None, "지원하지 않는 차트 유형입니다."
        
        plt.tight_layout()
        
        # 이미지를 바이트로 변환
        img_bytes = io.BytesIO()
        plt.savefig(img_bytes, format='png')
        img_bytes.seek(0)
        plt.close()
        
        # Base64로 인코딩
        img_base64 = base64.b64encode(img_bytes.read()).decode('utf-8')
        return img_base64, None
    except Exception as e:
        return None, str(e)

# 라우트 정의
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/execute', methods=['POST'])
def execute():
    query = request.form.get('query', '')
    if not query.strip():
        return jsonify({'error': '쿼리가 비어있습니다.'})
    
    results, error = execute_query(query)
    if error:
        return jsonify({'error': error})
    
    # 결과 저장
    result_id = str(uuid.uuid4())
    QUERY_RESULTS[result_id] = {
        'query': query,
        'results': results,
        'timestamp': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    return jsonify({
        'success': True,
        'result_id': result_id,
        'results': results,
        'is_select': isinstance(results, list)
    })

@app.route('/tables')
def tables():
    tables, error = get_tables()
    if error:
        return jsonify({'error': error})
    return jsonify({'tables': tables})

@app.route('/table_structure/<table_name>')
def table_structure(table_name):
    structure, error = get_table_structure(table_name)
    if error:
        return jsonify({'error': error})
    return jsonify({'structure': structure})

@app.route('/table_data/<table_name>')
def table_data(table_name):
    limit = request.args.get('limit', 100, type=int)
    data, error = get_table_data(table_name, limit)
    if error:
        return jsonify({'error': error})
    return jsonify({'data': data})

@app.route('/chart', methods=['POST'])
def chart():
    result_id = request.form.get('result_id')
    chart_type = request.form.get('chart_type')
    x_column = request.form.get('x_column')
    y_column = request.form.get('y_column')
    
    if not all([result_id, chart_type, x_column, y_column]):
        return jsonify({'error': '필수 파라미터가 누락되었습니다.'})
    
    if result_id not in QUERY_RESULTS:
        return jsonify({'error': '결과를 찾을 수 없습니다.'})
    
    results = QUERY_RESULTS[result_id]['results']
    
    img_base64, error = create_chart(results, chart_type, x_column, y_column)
    if error:
        return jsonify({'error': error})
    
    return jsonify({'image': img_base64})

@app.route('/save_query', methods=['POST'])
def save_query():
    name = request.form.get('name')
    query = request.form.get('query')
    
    if not name or not query:
        return jsonify({'error': '이름과 쿼리가 필요합니다.'})
    
    SAVED_QUERIES[name] = query
    return jsonify({'success': True})

@app.route('/load_queries')
def load_queries():
    return jsonify({'queries': SAVED_QUERIES})

@app.route('/export_csv/<result_id>')
def export_csv(result_id):
    if result_id not in QUERY_RESULTS:
        return jsonify({'error': '결과를 찾을 수 없습니다.'})
    
    results = QUERY_RESULTS[result_id]['results']
    if not isinstance(results, list):
        return jsonify({'error': '내보낼 수 있는 결과가 아닙니다.'})
    
    # 임시 파일 생성
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.csv')
    
    try:
        with open(temp_file.name, 'w', newline='') as csvfile:
            if results:
                fieldnames = results[0].keys()
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(results)
        
        return send_file(
            temp_file.name,
            as_attachment=True,
            download_name=f'query_results_{result_id[:8]}.csv',
            mimetype='text/csv'
        )
    except Exception as e:
        return jsonify({'error': str(e)})
    finally:
        # 임시 파일 삭제 예약
        os.unlink(temp_file.name)

@app.route('/export_json/<result_id>')
def export_json(result_id):
    if result_id not in QUERY_RESULTS:
        return jsonify({'error': '결과를 찾을 수 없습니다.'})
    
    results = QUERY_RESULTS[result_id]['results']
    
    # JSON 응답 생성
    response = Response(
        json.dumps(results, default=str, indent=2),
        mimetype='application/json'
    )
    response.headers["Content-Disposition"] = f"attachment; filename=query_results_{result_id[:8]}.json"
    return response

if __name__ == '__main__':
    # templates 디렉토리가 없으면 생성
    templates_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
    os.makedirs(templates_dir, exist_ok=True)
    
    # index.html 파일 생성
    index_html_path = os.path.join(templates_dir, 'index.html')
    if not os.path.exists(index_html_path):
        with open(index_html_path, 'w') as f:
            f.write('''
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PostgreSQL 웹 쿼리 실행기</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { padding-top: 20px; }
        .query-editor { font-family: monospace; height: 200px; }
        .result-container { margin-top: 20px; }
        .table-container { overflow-x: auto; }
        .chart-container { margin-top: 20px; text-align: center; }
        .chart-img { max-width: 100%; }
        .sidebar { border-right: 1px solid #dee2e6; height: 100vh; }
        .saved-query { cursor: pointer; }
        .table-list-item { cursor: pointer; }
    </style>
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- 사이드바 -->
            <div class="col-md-3 sidebar p-3">
                <h4>데이터베이스 탐색기</h4>
                <div class="accordion" id="dbExplorer">
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#tablesList">
                                테이블 목록
                            </button>
                        </h2>
                        <div id="tablesList" class="accordion-collapse collapse show">
                            <div class="accordion-body">
                                <div class="d-grid gap-2">
                                    <button id="loadTablesBtn" class="btn btn-sm btn-outline-primary">테이블 목록 불러오기</button>
                                </div>
                                <ul id="tableListItems" class="list-group mt-2"></ul>
                            </div>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#savedQueries">
                                저장된 쿼리
                            </button>
                        </h2>
                        <div id="savedQueries" class="accordion-collapse collapse">
                            <div class="accordion-body">
                                <div id="savedQueriesList"></div>
                                <div class="mt-3">
                                    <div class="input-group">
                                        <input type="text" id="queryName" class="form-control form-control-sm" placeholder="쿼리 이름">
                                        <button id="saveQueryBtn" class="btn btn-sm btn-outline-success">저장</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 메인 콘텐츠 -->
            <div class="col-md-9 p-3">
                <h2>PostgreSQL 웹 쿼리 실행기</h2>
                
                <!-- 쿼리 에디터 -->
                <div class="card mb-3">
                    <div class="card-header bg-primary text-white">SQL 쿼리</div>
                    <div class="card-body">
                        <textarea id="queryEditor" class="form-control query-editor" placeholder="여기에 SQL 쿼리를 입력하세요..."></textarea>
                        <div class="d-flex justify-content-between mt-2">
                            <button id="executeBtn" class="btn btn-primary">쿼리 실행</button>
                            <div>
                                <button id="clearBtn" class="btn btn-outline-secondary">지우기</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 결과 컨테이너 -->
                <div id="resultContainer" class="result-container d-none">
                    <div class="card">
                        <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                            <span>쿼리 결과</span>
                            <div>
                                <button id="exportCsvBtn" class="btn btn-sm btn-outline-light">CSV 내보내기</button>
                                <button id="exportJsonBtn" class="btn btn-sm btn-outline-light ms-2">JSON 내보내기</button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div id="resultInfo" class="alert alert-info"></div>
                            <div id="tableContainer" class="table-container"></div>
                            
                            <!-- 차트 옵션 -->
                            <div id="chartOptions" class="mt-3 d-none">
                                <div class="card">
                                    <div class="card-header bg-info text-white">차트 생성</div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-3">
                                                <label for="chartType" class="form-label">차트 유형</label>
                                                <select id="chartType" class="form-select">
                                                    <option value="bar">막대 차트</option>
                                                    <option value="line">선 차트</option>
                                                    <option value="pie">파이 차트</option>
                                                </select>
                                            </div>
                                            <div class="col-md-3">
                                                <label for="xColumn" class="form-label">X 축</label>
                                                <select id="xColumn" class="form-select"></select>
                                            </div>
                                            <div class="col-md-3">
                                                <label for="yColumn" class="form-label">Y 축</label>
                                                <select id="yColumn" class="form-select"></select>
                                            </div>
                                            <div class="col-md-3 d-flex align-items-end">
                                                <button id="generateChartBtn" class="btn btn-info w-100">차트 생성</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 차트 컨테이너 -->
                            <div id="chartContainer" class="chart-container d-none">
                                <img id="chartImage" class="chart-img" src="" alt="차트">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 테이블 상세 정보 -->
                <div id="tableDetailContainer" class="d-none mt-3">
                    <div class="card">
                        <div class="card-header bg-secondary text-white">
                            <span id="tableDetailTitle">테이블 정보</span>
                        </div>
                        <div class="card-body">
                            <ul class="nav nav-tabs" id="tableTabs">
                                <li class="nav-item">
                                    <a class="nav-link active" data-bs-toggle="tab" href="#structureTab">구조</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" data-bs-toggle="tab" href="#dataTab">데이터</a>
                                </li>
                            </ul>
                            <div class="tab-content mt-2">
                                <div class="tab-pane fade show active" id="structureTab">
                                    <div id="structureContainer"></div>
                                </div>
                                <div class="tab-pane fade" id="dataTab">
                                    <div id="dataContainer"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 모달 -->
    <div class="modal fade" id="errorModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title">오류</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="errorModalBody"></div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // 전역 변수
        let currentResultId = null;
        let currentTableName = null;
        
        // DOM 요소
        const queryEditor = document.getElementById('queryEditor');
        const executeBtn = document.getElementById('executeBtn');
        const clearBtn = document.getElementById('clearBtn');
        const resultContainer = document.getElementById('resultContainer');
        const resultInfo = document.getElementById('resultInfo');
        const tableContainer = document.getElementById('tableContainer');
        const chartOptions = document.getElementById('chartOptions');
        const chartContainer = document.getElementById('chartContainer');
        const chartImage = document.getElementById('chartImage');
        const exportCsvBtn = document.getElementById('exportCsvBtn');
        const exportJsonBtn = document.getElementById('exportJsonBtn');
        const loadTablesBtn = document.getElementById('loadTablesBtn');
        const tableListItems = document.getElementById('tableListItems');
        const tableDetailContainer = document.getElementById('tableDetailContainer');
        const tableDetailTitle = document.getElementById('tableDetailTitle');
        const structureContainer = document.getElementById('structureContainer');
        const dataContainer = document.getElementById('dataContainer');
        const saveQueryBtn = document.getElementById('saveQueryBtn');
        const queryName = document.getElementById('queryName');
        const savedQueriesList = document.getElementById('savedQueriesList');
        const chartType = document.getElementById('chartType');
        const xColumn = document.getElementById('xColumn');
        const yColumn = document.getElementById('yColumn');
        const generateChartBtn = document.getElementById('generateChartBtn');
        
        // 오류 표시 함수
        function showError(message) {
            const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
            document.getElementById('errorModalBody').textContent = message;
            errorModal.show();
        }
        
        // 쿼리 실행
        executeBtn.addEventListener('click', async () => {
            const query = queryEditor.value.trim();
            if (!query) {
                showError('쿼리를 입력해주세요.');
                return;
            }
            
            try {
                const response = await fetch('/execute', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        query: query
                    })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    showError(data.error);
                    return;
                }
                
                // 결과 표시
                resultContainer.classList.remove('d-none');
                tableDetailContainer.classList.add('d-none');
                
                currentResultId = data.result_id;
                
                if (data.is_select) {
                    // SELECT 쿼리 결과
                    const results = data.results;
                    resultInfo.textContent = `${results.length}개의 행이 반환되었습니다.`;
                    
                    if (results.length > 0) {
                        // 테이블 생성
                        const table = document.createElement('table');
                        table.className = 'table table-striped table-bordered';
                        
                        // 헤더 생성
                        const thead = document.createElement('thead');
                        const headerRow = document.createElement('tr');
                        
                        const columns = Object.keys(results[0]);
                        columns.forEach(column => {
                            const th = document.createElement('th');
                            th.textContent = column;
                            headerRow.appendChild(th);
                        });
                        
                        thead.appendChild(headerRow);
                        table.appendChild(thead);
                        
                        // 데이터 행 생성
                        const tbody = document.createElement('tbody');
                        
                        results.forEach(row => {
                            const tr = document.createElement('tr');
                            
                            columns.forEach(column => {
                                const td = document.createElement('td');
                                td.textContent = row[column] !== null ? row[column] : 'NULL';
                                tr.appendChild(td);
                            });
                            
                            tbody.appendChild(tr);
                        });
                        
                        table.appendChild(tbody);
                        tableContainer.innerHTML = '';
                        tableContainer.appendChild(table);
                        
                        // 차트 옵션 표시
                        chartOptions.classList.remove('d-none');
                        
                        // 컬럼 옵션 설정
                        xColumn.innerHTML = '';
                        yColumn.innerHTML = '';
                        
                        columns.forEach(column => {
                            const xOption = document.createElement('option');
                            xOption.value = column;
                            xOption.textContent = column;
                            xColumn.appendChild(xOption);
                            
                            const yOption = document.createElement('option');
                            yOption.value = column;
                            yOption.textContent = column;
                            yColumn.appendChild(yOption);
                        });
                    } else {
                        tableContainer.innerHTML = '<div class="alert alert-warning">결과가 없습니다.</div>';
                        chartOptions.classList.add('d-none');
                    }
                } else {
                    // 비 SELECT 쿼리 결과
                    const affectedRows = data.results.affected_rows;
                    resultInfo.textContent = `${affectedRows}개의 행이 영향을 받았습니다.`;
                    tableContainer.innerHTML = '';
                    chartOptions.classList.add('d-none');
                }
                
                // 차트 컨테이너 숨기기
                chartContainer.classList.add('d-none');
            } catch (error) {
                showError('요청 처리 중 오류가 발생했습니다: ' + error.message);
            }
        });
        
        // 쿼리 지우기
        clearBtn.addEventListener('click', () => {
            queryEditor.value = '';
        });
        
        // 차트 생성
        generateChartBtn.addEventListener('click', async () => {
            if (!currentResultId) {
                showError('먼저 쿼리를 실행해주세요.');
                return;
            }
            
            const selectedChartType = chartType.value;
            const selectedXColumn = xColumn.value;
            const selectedYColumn = yColumn.value;
            
            try {
                const response = await fetch('/chart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        result_id: currentResultId,
                        chart_type: selectedChartType,
                        x_column: selectedXColumn,
                        y_column: selectedYColumn
                    })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    showError(data.error);
                    return;
                }
                
                // 차트 이미지 표시
                chartImage.src = `data:image/png;base64,${data.image}`;
                chartContainer.classList.remove('d-none');
            } catch (error) {
                showError('차트 생성 중 오류가 발생했습니다: ' + error.message);
            }
        });
        
        // CSV 내보내기
        exportCsvBtn.addEventListener('click', () => {
            if (!currentResultId) {
                showError('먼저 쿼리를 실행해주세요.');
                return;
            }
            
            window.location.href = `/export_csv/${currentResultId}`;
        });
        
        // JSON 내보내기
        exportJsonBtn.addEventListener('click', () => {
            if (!currentResultId) {
                showError('먼저 쿼리를 실행해주세요.');
                return;
            }
            
            window.location.href = `/export_json/${currentResultId}`;
        });
        
        // 테이블 목록 불러오기
        loadTablesBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/tables');
                const data = await response.json();
                
                if (data.error) {
                    showError(data.error);
                    return;
                }
                
                tableListItems.innerHTML = '';
                
                data.tables.forEach(table => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item table-list-item';
                    li.textContent = table;
                    li.addEventListener('click', () => loadTableDetails(table));
                    tableListItems.appendChild(li);
                });
            } catch (error) {
                showError('테이블 목록을 불러오는 중 오류가 발생했습니다: ' + error.message);
            }
        });
        
        // 테이블 상세 정보 불러오기
        async function loadTableDetails(tableName) {
            currentTableName = tableName;
            tableDetailTitle.textContent = `테이블: ${tableName}`;
            tableDetailContainer.classList.remove('d-none');
            resultContainer.classList.add('d-none');
            
            // 구조 탭 활성화
            document.querySelector('#tableTabs .nav-link[href="#structureTab"]').click();
            
            try {
                // 테이블 구조 불러오기
                const structureResponse = await fetch(`/table_structure/${tableName}`);
                const structureData = await structureResponse.json();
                
                if (structureData.error) {
                    showError(structureData.error);
                    return;
                }
                
                // 구조 테이블 생성
                const structureTable = document.createElement('table');
                structureTable.className = 'table table-striped table-bordered';
                
                const structureThead = document.createElement('thead');
                const structureHeaderRow = document.createElement('tr');
                
                ['컬럼명', '데이터 타입', 'NULL 허용', '기본값'].forEach(header => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    structureHeaderRow.appendChild(th);
                });
                
                structureThead.appendChild(structureHeaderRow);
                structureTable.appendChild(structureThead);
                
                const structureTbody = document.createElement('tbody');
                
                structureData.structure.forEach(column => {
                    const tr = document.createElement('tr');
                    
                    const tdName = document.createElement('td');
                    tdName.textContent = column.column_name;
                    tr.appendChild(tdName);
                    
                    const tdType = document.createElement('td');
                    tdType.textContent = column.data_type;
                    tr.appendChild(tdType);
                    
                    const tdNullable = document.createElement('td');
                    tdNullable.textContent = column.is_nullable === 'YES' ? '허용' : '불가';
                    tr.appendChild(tdNullable);
                    
                    const tdDefault = document.createElement('td');
                    tdDefault.textContent = column.column_default !== null ? column.column_default : '-';
                    tr.appendChild(tdDefault);
                    
                    structureTbody.appendChild(tr);
                });
                
                structureTable.appendChild(structureTbody);
                structureContainer.innerHTML = '';
                structureContainer.appendChild(structureTable);
                
                // 데이터 탭 이벤트 리스너
                document.querySelector('#tableTabs .nav-link[href="#dataTab"]').addEventListener('click', loadTableData);
            } catch (error) {
                showError('테이블 구조를 불러오는 중 오류가 발생했습니다: ' + error.message);
            }
        }
        
        // 테이블 데이터 불러오기
        async function loadTableData() {
            if (!currentTableName) return;
            
            try {
                const dataResponse = await fetch(`/table_data/${currentTableName}`);
                const dataData = await dataResponse.json();
                
                if (dataData.error) {
                    showError(dataData.error);
                    return;
                }
                
                const data = dataData.data;
                
                if (data.length > 0) {
                    // 데이터 테이블 생성
                    const dataTable = document.createElement('table');
                    dataTable.className = 'table table-striped table-bordered';
                    
                    const dataThead = document.createElement('thead');
                    const dataHeaderRow = document.createElement('tr');
                    
                    const columns = Object.keys(data[0]);
                    columns.forEach(column => {
                        const th = document.createElement('th');
                        th.textContent = column;
                        dataHeaderRow.appendChild(th);
                    });
                    
                    dataThead.appendChild(dataHeaderRow);
                    dataTable.appendChild(dataThead);
                    
                    const dataTbody = document.createElement('tbody');
                    
                    data.forEach(row => {
                        const tr = document.createElement('tr');
                        
                        columns.forEach(column => {
                            const td = document.createElement('td');
                            td.textContent = row[column] !== null ? row[column] : 'NULL';
                            tr.appendChild(td);
                        });
                        
                        dataTbody.appendChild(tr);
                    });
                    
                    dataTable.appendChild(dataTbody);
                    dataContainer.innerHTML = '';
                    dataContainer.appendChild(dataTable);
                } else {
                    dataContainer.innerHTML = '<div class="alert alert-warning">데이터가 없습니다.</div>';
                }
            } catch (error) {
                showError('테이블 데이터를 불러오는 중 오류가 발생했습니다: ' + error.message);
            }
        }
        
        // 쿼리 저장
        saveQueryBtn.addEventListener('click', async () => {
            const name = queryName.value.trim();
            const query = queryEditor.value.trim();
            
            if (!name) {
                showError('쿼리 이름을 입력해주세요.');
                return;
            }
            
            if (!query) {
                showError('저장할 쿼리를 입력해주세요.');
                return;
            }
            
            try {
                const response = await fetch('/save_query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        name: name,
                        query: query
                    })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    showError(data.error);
                    return;
                }
                
                // 저장된 쿼리 목록 갱신
                loadSavedQueries();
                queryName.value = '';
            } catch (error) {
                showError('쿼리 저장 중 오류가 발생했습니다: ' + error.message);
            }
        });
        
        // 저장된 쿼리 목록 불러오기
        async function loadSavedQueries() {
            try {
                const response = await fetch('/load_queries');
                const data = await response.json();
                
                savedQueriesList.innerHTML = '';
                
                const queries = data.queries;
                const queryNames = Object.keys(queries);
                
                if (queryNames.length === 0) {
                    savedQueriesList.innerHTML = '<div class="alert alert-info">저장된 쿼리가 없습니다.</div>';
                    return;
                }
                
                const list = document.createElement('ul');
                list.className = 'list-group';
                
                queryNames.forEach(name => {
                    const item = document.createElement('li');
                    item.className = 'list-group-item saved-query';
                    item.textContent = name;
                    item.addEventListener('click', () => {
                        queryEditor.value = queries[name];
                    });
                    list.appendChild(item);
                });
                
                savedQueriesList.appendChild(list);
            } catch (error) {
                showError('저장된 쿼리를 불러오는 중 오류가 발생했습니다: ' + error.message);
            }
        }
        
        // 초기화
        document.addEventListener('DOMContentLoaded', () => {
            loadSavedQueries();
        });
    </script>
</body>
</html>
''')
    
    # 서버 실행 (포트 3030 사용)
    app.run(host='0.0.0.0', port=3030, debug=True)