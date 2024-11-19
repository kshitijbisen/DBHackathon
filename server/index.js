import express from 'express';
import cors from 'cors';
import { initWasm, DB } from '@vlcn.io/crsqlite-wasm';

const app = express();
let db;

app.use(cors());
app.use(express.json());

async function initDB() {
  await initWasm();
  db = await DB.open('finance.db');
  
  // Initialize database tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS investments (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      shares REAL NOT NULL,
      purchasePrice REAL NOT NULL,
      currentPrice REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      targetAmount REAL NOT NULL,
      currentAmount REAL NOT NULL,
      deadline TEXT NOT NULL
    );
  `);
}

// Transactions endpoints
app.get('/api/transactions', async (req, res) => {
  const transactions = await db.execO('SELECT * FROM transactions ORDER BY date DESC');
  res.json(transactions);
});

app.post('/api/transactions', async (req, res) => {
  const { id, type, category, amount, date, description } = req.body;
  await db.exec(
    'INSERT INTO transactions (id, type, category, amount, date, description) VALUES (?, ?, ?, ?, ?, ?)',
    [id, type, category, amount, date, description]
  );
  res.status(201).json({ id });
});

// Investments endpoints
app.get('/api/investments', async (req, res) => {
  const investments = await db.execO('SELECT * FROM investments');
  res.json(investments);
});

app.post('/api/investments', async (req, res) => {
  const { id, symbol, shares, purchasePrice, currentPrice } = req.body;
  await db.exec(
    'INSERT INTO investments (id, symbol, shares, purchasePrice, currentPrice) VALUES (?, ?, ?, ?, ?)',
    [id, symbol, shares, purchasePrice, currentPrice]
  );
  res.status(201).json({ id });
});

// Goals endpoints
app.get('/api/goals', async (req, res) => {
  const goals = await db.execO('SELECT * FROM goals');
  res.json(goals);
});

app.post('/api/goals', async (req, res) => {
  const { id, name, targetAmount, currentAmount, deadline } = req.body;
  await db.exec(
    'INSERT INTO goals (id, name, targetAmount, currentAmount, deadline) VALUES (?, ?, ?, ?, ?)',
    [id, name, targetAmount, currentAmount, deadline]
  );
  res.status(201).json({ id });
});

initDB().then(() => {
  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
}).catch(console.error);