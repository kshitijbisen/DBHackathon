import React, { useState } from 'react';
import { X, Calendar, DollarSign, Tag, FileText, Filter } from 'lucide-react';
import { Expense } from '../../types';

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  expenses: Expense[];
}

const DrillDownModal: React.FC<DrillDownModalProps> = ({
  isOpen,
  onClose,
  category,
  expenses
}) => {
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');

  if (!isOpen) return null;

  // Filter expenses by category
  const categoryExpenses = expenses.filter(expense => expense.category === category);

  // Apply date filter
  const now = new Date();
  const filteredExpenses = categoryExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    switch (dateFilter) {
      case 'week':
        return expenseDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return expenseDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  });

  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'amount') {
      return (a.amount - b.amount) * multiplier;
    } else {
      return (new Date(a.date).getTime() - new Date(b.date).getTime()) * multiplier;
    }
  });

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageAmount = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{category} Expenses</h2>
              <p className="text-purple-100 text-sm">
                {filteredExpenses.length} transactions • Total: ${totalAmount.toFixed(2)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">${averageAmount.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{filteredExpenses.length}</div>
              <div className="text-sm text-gray-600">Transactions</div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="px-6 py-4 border-b bg-white">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Transactions List */}
        <div className="overflow-y-auto max-h-96">
          {sortedExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No transactions found for the selected filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedExpenses.map((expense) => (
                <div key={expense.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Tag className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">${expense.amount.toFixed(2)}</div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(expense.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      {expense.notes && (
                        <div className="flex items-start space-x-2 text-sm text-gray-600 ml-11">
                          <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{expense.notes}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {new Date(expense.date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {sortedExpenses.length} of {categoryExpenses.length} transactions
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrillDownModal;