const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database');
const treeNodesRouter = require('./routes/treeNodes');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 라우트 설정
app.use('/api/tree-nodes', treeNodesRouter);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: '트리노드 API 서버가 실행 중입니다.' });
});

// 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 초기화
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`API 엔드포인트: http://localhost:${PORT}/api/tree-nodes`);
    });
  } catch (error) {
    console.error('서버 시작 오류:', error);
    process.exit(1);
  }
};

startServer();