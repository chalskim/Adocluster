import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PostgresDatabase } from './postgres-db';

dotenv.config(); // .env 파일 로드

const app = express();
const port = process.env.API_PORT || 4000;

app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 요청 본문 파싱

const db = new PostgresDatabase();

// 모든 DB 요청을 처리할 단일 엔드포인트
app.post('/api/query', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, message: '쿼리가 필요합니다.' });
  }

  const result = await db.query(query);
  res.json(result);
});

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});