import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, Wallet, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchTransactions, fetchInvestments, fetchGoals } from '../api';
import TransactionForm from './TransactionForm';
import InvestmentTracker from './InvestmentTracker';
import GoalTracker from './GoalTracker';

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#6366F1'];

const Dashboard: React.FC = () => {
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });

  const { data: investments = [] } = useQuery({
    queryKey: ['investments'],
    queryFn: fetchInvestments,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: fetchGoals,
  });

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInvestments = investments.reduce(
    (sum, inv) => sum + inv.shares * inv.currentPrice,
    0
  );

  const pieData = [
    { name: 'Income', value: totalIncome },
    { name: 'Expenses', value: totalExpenses },
    { name: 'Investments', value: totalInvestments },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Income</dt>
                    <dd className="text-lg font-semibold text-gray-900">${totalIncome.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Wallet className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                    <dd className="text-lg font-semibold text-gray-900">${totalExpenses.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Investments Value</dt>
                    <dd className="text-lg font-semibold text-gray-900">${totalInvestments.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Net Worth</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      ${(totalIncome - totalExpenses + totalInvestments).toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Chart Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Financial Overview</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaction Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <TransactionForm />
          </div>
        </div>

        {/* Investment Tracker */}
        <div className="mt-8">
          <InvestmentTracker />
        </div>

        {/* Goal Tracker */}
        <div className="mt-8">
          <GoalTracker />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;