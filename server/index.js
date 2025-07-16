import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();
let db;

app.use(cors());
app.use(express.json());

function initDB() {
  db = new Database("finance.db");

  db.exec(`
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

app.get("/api/transactions", (req, res) => {
  const stmt = db.prepare("SELECT * FROM transactions ORDER BY date DESC");
  const transactions = stmt.all();
  res.json(transactions);
});

app.post("/api/transactions", (req, res) => {
  const { id, type, category, amount, date, description } = req.body;
  const stmt = db.prepare(
    "INSERT INTO transactions (id, type, category, amount, date, description) VALUES (?, ?, ?, ?, ?, ?)"
  );
  stmt.run(id, type, category, amount, date, description);
  res.status(201).json({ id });
});

// Investments endpoints

app.get("/api/investments", (req, res) => {
  const stmt = db.prepare("SELECT * FROM investments");
  const investments = stmt.all();
  res.json(investments);
});

app.post("/api/investments", (req, res) => {
  const { id, symbol, shares, purchasePrice, currentPrice } = req.body;
  const stmt = db.prepare(
    "INSERT INTO investments (id, symbol, shares, purchasePrice, currentPrice) VALUES (?, ?, ?, ?, ?)"
  );
  stmt.run(id, symbol, shares, purchasePrice, currentPrice);
  res.status(201).json({ id });
});

// Goals endpoints

app.get("/api/goals", (req, res) => {
  const stmt = db.prepare("SELECT * FROM goals");
  const goals = stmt.all();
  res.json(goals);
});

app.post("/api/goals", (req, res) => {
  const { id, name, targetAmount, currentAmount, deadline } = req.body;
  const stmt = db.prepare(
    "INSERT INTO goals (id, name, targetAmount, currentAmount, deadline) VALUES (?, ?, ?, ?, ?)"
  );
  stmt.run(id, name, targetAmount, currentAmount, deadline);
  res.status(201).json({ id });
});

initDB();
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
