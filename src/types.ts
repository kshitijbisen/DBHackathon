export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface Investment {
  id: string;
  symbol: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}