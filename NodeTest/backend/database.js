const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// 데이터베이스 연결 테스트
pool.on('connect', () => {
  console.log('PostgreSQL 데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
  console.error('PostgreSQL 연결 오류:', err);
});

// 트리노드 테이블 생성
const createTreeNodeTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS tree_nodes (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      parent_id INTEGER REFERENCES tree_nodes(id) ON DELETE CASCADE,
      position INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_tree_nodes_parent_id ON tree_nodes(parent_id);
  `;
  
  try {
    await pool.query(query);
    console.log('트리노드 테이블이 생성되었습니다.');
  } catch (error) {
    console.error('테이블 생성 오류:', error);
  }
};

// 초기화 함수
const initializeDatabase = async () => {
  await createTreeNodeTable();
};

module.exports = {
  pool,
  initializeDatabase
};