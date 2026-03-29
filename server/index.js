const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`서버가 모든 네트워크(0.0.0.0:${port})에서 실행 중입니다.`);
});

// --------------------

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

// API: 모든 음식 목록 조회 (소비기한 순 정렬)
app.get('/api/foods', (req, res) => {
  const foods = db.prepare('SELECT * FROM foods ORDER BY expiry_date ASC').all();
  res.json(foods);
});

// API: 음식 추가
app.get('/api/foods/add', (req, res) => {
  const { name, expiry_date } = req.query;
  if (!name || !expiry_date) {
    return res.status(400).json({ error: '이름과 소비기한이 필요합니다.' });
  }
  const info = db.prepare('INSERT INTO foods (name, expiry_date) VALUES (?, ?)').run(name, expiry_date);
  res.json({ id: info.lastInsertRowid, name, expiry_date });
});

// 실제 POST 방식도 추가 (안정성)
app.post('/api/foods', (req, res) => {
  const { name, expiry_date } = req.body;
  if (!name || !expiry_date) {
    return res.status(400).json({ error: '이름과 소비기한이 필요합니다.' });
  }
  const info = db.prepare('INSERT INTO foods (name, expiry_date) VALUES (?, ?)').run(name, expiry_date);
  res.json({ id: info.lastInsertRowid, name, expiry_date });
});

// API: 음식 삭제
app.delete('/api/foods/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM foods WHERE id = ?').run(id);
  res.json({ success: true });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`서버가 모든 네트워크(0.0.0.0:${port})에서 실행 중입니다.`);
});
