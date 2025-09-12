from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import inspect, text
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import json

from ..core.database import engine, get_db
from ..core.dependencies import get_current_active_user, get_current_admin_user
from ..models.user import User

router = APIRouter(
    prefix="/api/db",
    tags=["database"],
    dependencies=[Depends(get_current_active_user)],
    responses={404: {"description": "Not found"}},
)


class QueryRequest(BaseModel):
    query: str


class TableData(BaseModel):
    columns: List[str]
    data: List[Dict[str, Any]]


class TableSchema(BaseModel):
    table_name: str
    columns: List[Dict[str, Any]]


class TableRecord(BaseModel):
    data: Dict[str, Any]


@router.get("/tables", response_model=List[str])
async def get_tables(current_user: User = Depends(get_current_admin_user)):
    """모든 데이터베이스 테이블 목록을 조회합니다."""
    inspector = inspect(engine)
    return inspector.get_table_names()


@router.get("/tables/{table_name}", response_model=TableSchema)
async def get_table_schema(table_name: str, current_user: User = Depends(get_current_admin_user)):
    """특정 테이블의 구조(스키마)를 조회합니다."""
    inspector = inspect(engine)
    
    # 테이블이 존재하는지 확인
    if table_name not in inspector.get_table_names():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table '{table_name}' not found"
        )
    
    # 테이블 컬럼 정보 가져오기
    columns = inspector.get_columns(table_name)
    column_info = [{
        "name": column["name"],
        "type": str(column["type"]),
        "nullable": column.get("nullable", True),
        "default": str(column.get("default", "None")),
        "primary_key": column.get("primary_key", False)
    } for column in columns]
    
    return TableSchema(table_name=table_name, columns=column_info)


@router.get("/tables/{table_name}/data", response_model=TableData)
async def get_table_data(
    table_name: str, 
    limit: int = 100, 
    offset: int = 0,
    current_user: User = Depends(get_current_admin_user)
):
    """특정 테이블의 데이터를 조회합니다."""
    inspector = inspect(engine)
    
    # 테이블이 존재하는지 확인
    if table_name not in inspector.get_table_names():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table '{table_name}' not found"
        )
    
    # 테이블 컬럼 정보 가져오기
    columns = [column["name"] for column in inspector.get_columns(table_name)]
    
    # 데이터 쿼리 실행
    with engine.connect() as connection:
        query = text(f"SELECT * FROM {table_name} LIMIT :limit OFFSET :offset")
        result = connection.execute(query, {"limit": limit, "offset": offset})
        rows = result.fetchall()
        
        # 결과를 딕셔너리 리스트로 변환
        data = []
        for row in rows:
            row_dict = {}
            for i, column in enumerate(columns):
                value = row[i]
                # JSON 직렬화 가능한 형태로 변환
                if hasattr(value, "isoformat"):  # datetime 객체인 경우
                    value = value.isoformat()
                elif isinstance(value, bytes):  # 바이너리 데이터인 경우
                    value = value.hex()
                row_dict[column] = value
            data.append(row_dict)
    
    return TableData(columns=columns, data=data)


@router.post("/query", response_model=TableData)
async def execute_query(query_request: QueryRequest, current_user: User = Depends(get_current_admin_user)):
    """SQL 쿼리를 실행하고 결과를 반환합니다. (관리자 권한 필요)"""
    # 위험한 쿼리 방지 (SELECT 쿼리만 허용)
    if not query_request.query.strip().upper().startswith("SELECT"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only SELECT queries are allowed"
        )
    
    try:
        with engine.connect() as connection:
            result = connection.execute(text(query_request.query))
            columns = result.keys()
            rows = result.fetchall()
            
            # 결과를 딕셔너리 리스트로 변환
            data = []
            for row in rows:
                row_dict = {}
                for i, column in enumerate(columns):
                    value = row[i]
                    # JSON 직렬화 가능한 형태로 변환
                    if hasattr(value, "isoformat"):  # datetime 객체인 경우
                        value = value.isoformat()
                    elif isinstance(value, bytes):  # 바이너리 데이터인 경우
                        value = value.hex()
                    row_dict[column] = value
                data.append(row_dict)
        
        return TableData(columns=list(columns), data=data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Query execution failed: {str(e)}"
        )


@router.post("/tables/{table_name}", status_code=status.HTTP_201_CREATED)
async def create_record(
    table_name: str, 
    record: TableRecord, 
    current_user: User = Depends(get_current_admin_user)
):
    """특정 테이블에 새 레코드를 추가합니다. (관리자 권한 필요)"""
    inspector = inspect(engine)
    
    # 테이블이 존재하는지 확인
    if table_name not in inspector.get_table_names():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table '{table_name}' not found"
        )
    
    # 컬럼 정보 가져오기
    columns = [column["name"] for column in inspector.get_columns(table_name)]
    
    # 유효한 컬럼인지 확인
    for key in record.data.keys():
        if key not in columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Column '{key}' does not exist in table '{table_name}'"
            )
    
    # 레코드 추가
    try:
        column_names = ", ".join(record.data.keys())
        placeholders = ", ".join([f":{key}" for key in record.data.keys()])
        
        with engine.connect() as connection:
            query = text(f"INSERT INTO {table_name} ({column_names}) VALUES ({placeholders}) RETURNING id")
            result = connection.execute(query, record.data)
            connection.commit()
            inserted_id = result.fetchone()[0]
            
            return {"id": inserted_id, "message": f"Record added to {table_name} successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to add record: {str(e)}"
        )


@router.put("/tables/{table_name}/{id}", status_code=status.HTTP_200_OK)
async def update_record(
    table_name: str, 
    id: str, 
    record: TableRecord, 
    current_user: User = Depends(get_current_admin_user)
):
    """특정 테이블의 특정 레코드를 수정합니다. (관리자 권한 필요)"""
    inspector = inspect(engine)
    
    # 테이블이 존재하는지 확인
    if table_name not in inspector.get_table_names():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table '{table_name}' not found"
        )
    
    # 컬럼 정보 가져오기
    columns = [column["name"] for column in inspector.get_columns(table_name)]
    
    # 유효한 컬럼인지 확인
    for key in record.data.keys():
        if key not in columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Column '{key}' does not exist in table '{table_name}'"
            )
    
    # 레코드 수정
    try:
        set_clause = ", ".join([f"{key} = :{key}" for key in record.data.keys()])
        
        with engine.connect() as connection:
            # 먼저 레코드가 존재하는지 확인
            check_query = text(f"SELECT id FROM {table_name} WHERE id = :id")
            check_result = connection.execute(check_query, {"id": id})
            if not check_result.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Record with id '{id}' not found in table '{table_name}'"
                )
            
            # 레코드 업데이트
            query = text(f"UPDATE {table_name} SET {set_clause} WHERE id = :id")
            params = {**record.data, "id": id}
            connection.execute(query, params)
            connection.commit()
            
            return {"message": f"Record with id '{id}' updated in {table_name} successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update record: {str(e)}"
        )


@router.delete("/tables/{table_name}/{id}", status_code=status.HTTP_200_OK)
async def delete_record(
    table_name: str, 
    id: str, 
    current_user: User = Depends(get_current_admin_user)
):
    """특정 테이블의 특정 레코드를 삭제합니다. (관리자 권한 필요)"""
    inspector = inspect(engine)
    
    # 테이블이 존재하는지 확인
    if table_name not in inspector.get_table_names():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table '{table_name}' not found"
        )
    
    # 레코드 삭제
    try:
        with engine.connect() as connection:
            # 먼저 레코드가 존재하는지 확인
            check_query = text(f"SELECT id FROM {table_name} WHERE id = :id")
            check_result = connection.execute(check_query, {"id": id})
            if not check_result.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Record with id '{id}' not found in table '{table_name}'"
                )
            
            # 레코드 삭제
            query = text(f"DELETE FROM {table_name} WHERE id = :id")
            connection.execute(query, {"id": id})
            connection.commit()
            
            return {"message": f"Record with id '{id}' deleted from {table_name} successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete record: {str(e)}"
        )