from fastapi import APIRouter, Request, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.client_ip import ClientIP
from pydantic import BaseModel
import json
import os
from datetime import datetime
from typing import List, Optional

router = APIRouter(prefix="/api/client-ip", tags=["Client IP Management"])

class IPRecord(BaseModel):
    ip_address: str
    user_agent: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None

class IPResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

# 파일 저장 경로 설정
IP_FILE_PATH = "client_ips.json"

@router.post("/record", response_model=IPResponse)
async def record_client_ip(request: Request):
    """클라이언트 IP를 데이터베이스와 파일에 모두 저장"""
    db = None
    try:
        client_ip = request.client.host
        user_agent = request.headers.get("user-agent", "")
        
        db = next(get_db())
        
        # 데이터베이스에 저장
        existing_ip = db.query(ClientIP).filter(ClientIP.ip_address == client_ip).first()
        
        if existing_ip:
            existing_ip.access_count += 1
            existing_ip.user_agent = user_agent
            db.commit()
            ip_record = existing_ip
        else:
            new_ip = ClientIP(
                ip_address=client_ip,
                user_agent=user_agent
            )
            db.add(new_ip)
            db.commit()
            db.refresh(new_ip)
            ip_record = new_ip
        
        # 파일에도 저장
        save_ip_to_file(client_ip, user_agent)
        
        return IPResponse(
            success=True,
            message="IP 주소가 성공적으로 저장되었습니다",
            data=ip_record.to_dict()
        )
    
    except Exception as e:
        if db:
            db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if db:
            db.close()

@router.get("/list", response_model=List[dict])
async def get_client_ips():
    """데이터베이스에 저장된 모든 클라이언트 IP 목록 조회"""
    db = None
    try:
        db = next(get_db())
        ips = db.query(ClientIP).order_by(ClientIP.last_seen.desc()).all()
        return [ip.to_dict() for ip in ips]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if db:
            db.close()

@router.get("/list-file")
async def get_client_ips_from_file():
    """파일에 저장된 클라이언트 IP 목록 조회"""
    try:
        if not os.path.exists(IP_FILE_PATH):
            return []
        
        with open(IP_FILE_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_ip_stats():
    """IP 통계 정보 조회"""
    try:
        db = next(get_db())
        total_ips = db.query(ClientIP).count()
        total_access = db.query(ClientIP).with_entities(func.sum(ClientIP.access_count)).scalar() or 0
        file_records = await get_client_ips_from_file()
        
        return {
            "total_unique_ips": total_ips,
            "total_access_count": total_access,
            "file_records_count": len(file_records)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

def save_ip_to_file(ip_address: str, user_agent: str = ""):
    """IP 주소를 JSON 파일에 저장"""
    try:
        # 기존 파일 읽기
        ip_records = []
        if os.path.exists(IP_FILE_PATH):
            with open(IP_FILE_PATH, 'r', encoding='utf-8') as f:
                try:
                    ip_records = json.load(f)
                except json.JSONDecodeError:
                    ip_records = []
        
        # 중복 확인 및 업데이트
        existing_record = None
        for record in ip_records:
            if record.get('ip_address') == ip_address:
                existing_record = record
                break
        
        current_time = datetime.now().isoformat()
        
        if existing_record:
            existing_record['access_count'] = existing_record.get('access_count', 0) + 1
            existing_record['last_seen'] = current_time
            existing_record['user_agent'] = user_agent
        else:
            ip_records.append({
                'ip_address': ip_address,
                'user_agent': user_agent,
                'first_seen': current_time,
                'last_seen': current_time,
                'access_count': 1
            })
        
        # 파일에 저장
        with open(IP_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(ip_records, f, ensure_ascii=False, indent=2)
    
    except Exception as e:
        print(f"파일 저장 오류: {e}")

# 자동으로 IP 기록하는 미들웨어용 함수
def record_ip_middleware(request: Request):
    """미들웨어에서 호출할 IP 기록 함수"""
    try:
        client_ip = request.client.host
        user_agent = request.headers.get("user-agent", "")
        save_ip_to_file(client_ip, user_agent)
    except Exception as e:
        print(f"IP 기록 오류: {e}")