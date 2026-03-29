const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 데이터베이스 초기화
const db = new Database('refrigerator.db');

// 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// API 라우트
app.get('/api/foods', (req, res) => {
  const foods = db.prepare('SELECT * FROM foods ORDER BY expiry_date ASC').all();
  res.json(foods);
});

app.post('/api/foods', (req, res) => {
  const { name, expiry_date } = req.body;
  if (!name || !expiry_date) {
    return res.status(400).json({ error: '이름과 소비기한이 필요합니다.' });
  }
  const info = db.prepare('INSERT INTO foods (name, expiry_date) VALUES (?, ?)').run(name, expiry_date);
  res.json({ id: info.lastInsertRowid, name, expiry_date });
});

app.delete('/api/foods/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM foods WHERE id = ?').run(id);
  res.json({ success: true });
});

// 프론트엔드 빌드 파일 서빙 (API 라우트 뒤에 배치)
app.use(express.static(path.join(__dirname, '../client/dist')));

// SPA를 위한 설정 (모든 요청을 index.html로 리다이렉트)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`서버가 실행 중입니다 (포트: ${port})`);
});
