const API_URL = 'http://localhost:3000/api';

export async function fetchTransactions() {
  const response = await fetch(`${API_URL}/transactions`);
  return response.json();
}

export async function createTransaction(transaction: Transaction) {
  const response = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  });
  return response.json();
}

export async function fetchInvestments() {
  const response = await fetch(`${API_URL}/investments`);
  return response.json();
}

export async function createInvestment(investment: Investment) {
  const response = await fetch(`${API_URL}/investments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(investment),
  });
  return response.json();
}

export async function fetchGoals() {
  const response = await fetch(`${API_URL}/goals`);
  return response.json();
}

export async function createGoal(goal: Goal) {
  const response = await fetch(`${API_URL}/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(goal),
  });
  return response.json();
}