import React, { useMemo, useState } from 'react';
import { TrendingUp, DollarSign, Target, Calendar, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Filter, Download, CurrencyIcon } from 'lucide-react';
import PieChart from '../components/PieChart';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import DonutChart from '../components/charts/DonutChart';
import SpendingInsights from '../components/analytics/SpendingInsights';
import DrillDownModal from '../components/analytics/DrillDownModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getFinancialTip } from '../utils/mockAI';
import { useExpenses } from '../hooks/useExpenses';
import { getCurrencySymbol,getCurrencyIcon } from '../utils/currency';

const Dashboard: React.FC = () => {
  const { expenses, loading } = useExpenses();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [chartType, setChartType] = useState<'pie' | 'donut' | 'bar'>('donut');

  const summary = useMemo(() => {
    const now = new Date();
    const ranges = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      quarter: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    };



    const filteredExpenses = expenses.filter(expense => 
      new Date(expense.date) >= ranges[timeRange]
    );

    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const weeklySpent = expenses
      .filter(expense => new Date(expense.date) >= oneWeekAgo)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const monthlySpent = expenses
      .filter(expense => new Date(expense.date) >= oneMonthAgo)
      .reduce((sum, expense) => sum + expense.amount, 0);

    const categoryBreakdown = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });

    // Daily spending trend
    const dailySpending = filteredExpenses.reduce((acc, expense) => {
      const date = expense.date;
      acc[date] = (acc[date] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });

    const trendData = Object.entries(dailySpending)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, amount]) => ({ date, amount }));

    return { 
      totalSpent, 
      weeklySpent, 
      monthlySpent, 
      categoryBreakdown, 
      trendData,
      filteredExpenses,
    
    };
  }, [expenses, timeRange]);

  const chartColors = [
    '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5A2B', '#6B46C1', '#059669', '#DC2626', '#7C2D12'
  ];
  const currencyIcon = getCurrencyIcon();
const currencySymbol = getCurrencySymbol();
  const financialTip = getFinancialTip(summary);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Category', 'Amount', 'Notes'],
      ...summary.filteredExpenses.map(expense => [
        expense.date,
        expense.category,
        expense.amount.toString(),
        expense.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Dashboard</h1>
            <p className="text-gray-600">Your comprehensive spending insights and analytics</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 lg:mt-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{currencySymbol}{summary.totalSpent.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Last {timeRange}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
             {currencyIcon}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{currencySymbol}{summary.weeklySpent.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">7 days</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{currencySymbol}{summary.monthlySpent.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">30 days</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(summary.categoryBreakdown).length}</p>
                <p className="text-xs text-gray-500 mt-1">Active</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Spending Trend Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <LineChartIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Spending Trend
                </h2>
                <div className="text-sm text-gray-500">
                  Last {timeRange}
                </div>
              </div>
              {summary.trendData.length > 0 ? (
                <LineChart data={summary.trendData} color="#3B82F6" height={250} />
              ) : (
                <div className="text-center py-12">
                  <LineChartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No trend data available</p>
                </div>
              )}
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <PieChartIcon className="w-5 h-5 mr-2 text-purple-500" />
                  Spending by Category
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setChartType('donut')}
                    className={`p-2 rounded-lg transition-colors ${
                      chartType === 'donut' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <PieChartIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`p-2 rounded-lg transition-colors ${
                      chartType === 'bar' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {Object.keys(summary.categoryBreakdown).length > 0 ? (
                <div className="flex justify-center">
                  {chartType === 'donut' ? (
                    <DonutChart 
                      data={Object.entries(summary.categoryBreakdown).map(([category, amount], index) => ({
                        category,
                        amount,
                        color: chartColors[index % chartColors.length]
                      }))}
                      size={300}
                      onSegmentClick={handleCategoryClick}
                    />
                  ) : (
                    <div className="w-full">
                      <BarChart 
                        data={Object.entries(summary.categoryBreakdown).map(([category, amount], index) => ({
                          category,
                          amount,
                          color: chartColors[index % chartColors.length]
                        }))}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <PieChartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No expenses to display yet</p>
                  <p className="text-gray-400 text-sm">Add some expenses to see your spending breakdown</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Insights Sidebar */}
          <div className="space-y-6">
            <SpendingInsights expenses={summary.filteredExpenses} />

            {/* AI Financial Tip */}
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                💡 AI Financial Insight
              </h2>
              <p className="text-purple-100 mb-6 leading-relaxed">{financialTip}</p>
              
              <div className="bg-white/20 rounded-xl p-4">
                <h3 className="font-semibold mb-3">Quick Tips:</h3>
                <ul className="space-y-2 text-sm text-purple-100">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    <span>Set weekly spending limits for your top categories</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    <span>Review your expenses weekly to stay on track</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    <span>Use the AI assistant for personalized advice</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Transactions</h2>
          {summary.filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet. Start by adding your first expense!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.filteredExpenses.slice(0, 10).map((expense) => (
                    <tr key={expense.id} className="border-b hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-3 px-4 text-gray-600">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleCategoryClick(expense.category)}
                          className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          {expense.category}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{currencySymbol}{expense.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-gray-600">{expense.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Drill Down Modal */}
        <DrillDownModal
          isOpen={!!selectedCategory}
          onClose={() => setSelectedCategory(null)}
          category={selectedCategory || ''}
          expenses={expenses}
        />
      </div>
    </div>
  );
};

export default Dashboard;