from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.simple_todo import SimpleTodo
from app.models.user import User as UserModel
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/todos", tags=["todos"])

class TodoCreate(BaseModel):
    text: str

class TodoUpdate(BaseModel):
    text: str = None
    completed: bool = None

class TodoResponse(BaseModel):
    id: uuid.UUID
    text: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

@router.get("/", response_model=List[TodoResponse])
async def get_todos(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    todos = db.query(SimpleTodo).filter(SimpleTodo.user_id == str(current_user.uid)).order_by(SimpleTodo.created_at.desc()).all()
    return todos

@router.post("/", response_model=TodoResponse)
async def create_todo(todo: TodoCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    if not todo.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    db_todo = SimpleTodo(
        text=todo.text.strip(),
        user_id=str(current_user.uid)
    )
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(todo_id: uuid.UUID, todo: TodoUpdate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    db_todo = db.query(SimpleTodo).filter(SimpleTodo.id == todo_id, SimpleTodo.user_id == str(current_user.uid)).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    if todo.text is not None:
        db_todo.text = todo.text.strip()
    if todo.completed is not None:
        db_todo.completed = todo.completed
    
    db.commit()
    db.refresh(db_todo)
    return db_todo

@router.delete("/{todo_id}")
async def delete_todo(todo_id: uuid.UUID, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    db_todo = db.query(SimpleTodo).filter(SimpleTodo.id == todo_id, SimpleTodo.user_id == str(current_user.uid)).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    db.delete(db_todo)
    db.commit()
    return {"message": "Todo deleted successfully"}

@router.delete("/completed")
async def delete_completed_todos(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    db.query(SimpleTodo).filter(SimpleTodo.completed == True, SimpleTodo.user_id == str(current_user.uid)).delete()
    db.commit()
    return {"message": "All completed todos deleted"}