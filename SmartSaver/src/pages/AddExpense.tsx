import React, { useState } from 'react';
import { Plus, DollarSign, Calendar, FileText, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import SuccessMessage from '../components/ui/SuccessMessage';
import ErrorMessage from '../components/ui/ErrorMessage';
import { getCurrencyIcon, getCurrencySymbol } from '../utils/currency';

const AddExpense: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const currencySymbol = getCurrencySymbol();
    const countryIcon=getCurrencyIcon();

  const { expenses, addExpense } = useExpenses();

  const categories = [
    'Food', 'Rent', 'Transport', 'Entertainment', 'Healthcare', 
    'Shopping', 'Utilities', 'Education', 'Travel', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      setShowError(true);
      return;
    }

    setIsSubmitting(true);

    const { error } = await addExpense({
      amount: parseFloat(amount),
      category,
      date,
      notes: notes.trim() || undefined
    });

    if (error) {
      setErrorMessage(error);
      setShowError(true);
    } else {
      setShowSuccess(true);
      setAmount('');
      setNotes('');
      // Reset form but keep category and date for convenience
    }

    setIsSubmitting(false);
  };

  const recentExpenses = expenses.slice(0, 5);


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Expense</h1>
          <p className="text-gray-600">Keep track of your spending with detailed categorization</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Expense Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Expense Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currencySymbol}
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  rows={3}
                  placeholder="Add any additional details..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Add Expense</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Recent Expenses */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Expenses</h2>
            {recentExpenses.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {countryIcon}
                </div>
                <p className="text-gray-500">No expenses yet. Add your first expense to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Tag className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{currencySymbol}{expense.amount.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">{expense.category}</p>
                          </div>
                        </div>
                        {expense.notes && (
                          <p className="text-sm text-gray-500 ml-11">{expense.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(expense.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Success and Error Messages */}
        <SuccessMessage
          message="Expense added successfully!"
          isVisible={showSuccess}
          onClose={() => setShowSuccess(false)}
        />
        
        <ErrorMessage
          message={errorMessage}
          isVisible={showError}
          onClose={() => setShowError(false)}
        />
      </div>
    </div>
  );
};

export default AddExpense;