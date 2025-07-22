export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface FinancialSummary {
  totalSpent: number;
  weeklySpent: number;
  monthlySpent: number;
  categoryBreakdown: { [key: string]: number };
}