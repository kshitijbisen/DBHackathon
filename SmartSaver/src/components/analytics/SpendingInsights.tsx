import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Calendar, DollarSign } from 'lucide-react';
import { Expense } from '../../types';

interface SpendingInsightsProps {
  expenses: Expense[];
  className?: string;
}

const SpendingInsights: React.FC<SpendingInsightsProps> = ({ expenses, className = '' }) => {
  // Calculate insights
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeekExpenses = expenses.filter(e => new Date(e.date) >= lastWeek);
  const lastWeekExpenses = expenses.filter(e => {
    const date = new Date(e.date);
    return date >= twoWeeksAgo && date < lastWeek;
  });
  
  const thisWeekTotal = thisWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
  const lastWeekTotal = lastWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
  const weeklyChange = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;

  // Category analysis
  const categorySpending = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  const topCategories = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Spending patterns
  const dailySpending = expenses.reduce((acc, expense) => {
    const date = expense.date;
    acc[date] = (acc[date] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  const avgDailySpending = Object.values(dailySpending).reduce((sum, amount) => sum + amount, 0) / Math.max(Object.keys(dailySpending).length, 1);
  
  // Recent high spending days
  const highSpendingDays = Object.entries(dailySpending)
    .filter(([, amount]) => amount > avgDailySpending * 1.5)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2);

  // Generate insights
  const insights = [
    {
      type: weeklyChange > 10 ? 'warning' : weeklyChange < -10 ? 'positive' : 'neutral',
      icon: weeklyChange > 0 ? TrendingUp : TrendingDown,
      title: 'Weekly Spending Trend',
      description: `Your spending ${weeklyChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(weeklyChange).toFixed(1)}% this week`,
      value: `$${thisWeekTotal.toFixed(2)}`,
      change: `${weeklyChange > 0 ? '+' : ''}${weeklyChange.toFixed(1)}%`
    },
    {
      type: 'info',
      icon: Target,
      title: 'Top Spending Category',
      description: `${topCategories[0]?.[0] || 'No data'} accounts for most of your expenses`,
      value: `$${topCategories[0]?.[1]?.toFixed(2) || '0'}`,
      change: `${topCategories.length > 0 ? ((topCategories[0][1] / Object.values(categorySpending).reduce((a, b) => a + b, 0)) * 100).toFixed(1) : 0}%`
    },
    {
      type: avgDailySpending > 50 ? 'warning' : 'positive',
      icon: Calendar,
      title: 'Daily Average',
      description: 'Your average daily spending pattern',
      value: `$${avgDailySpending.toFixed(2)}`,
      change: `${Object.keys(dailySpending).length} days tracked`
    }
  ];

  if (highSpendingDays.length > 0) {
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'High Spending Alert',
      description: `You had unusually high spending on ${new Date(highSpendingDays[0][0]).toLocaleDateString()}`,
      value: `$${highSpendingDays[0][1].toFixed(2)}`,
      change: `${((highSpendingDays[0][1] / avgDailySpending - 1) * 100).toFixed(0)}% above average`
    });
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'from-green-500 to-emerald-500';
      case 'warning': return 'from-orange-500 to-red-500';
      case 'info': return 'from-blue-500 to-purple-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getInsightBg = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
      </div>

      <div className="grid gap-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${getInsightBg(insight.type)}`}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-10 h-10 bg-gradient-to-r ${getInsightColor(insight.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{insight.title}</h4>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{insight.value}</div>
                      <div className={`text-xs ${
                        insight.type === 'positive' ? 'text-green-600' : 
                        insight.type === 'warning' ? 'text-orange-600' : 'text-gray-600'
                      }`}>
                        {insight.change}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-4 text-white">
        <h4 className="font-semibold mb-3 flex items-center">
          <DollarSign className="w-4 h-4 mr-2" />
          Smart Recommendations
        </h4>
        <div className="space-y-2 text-sm">
          {weeklyChange > 20 && (
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <span>Consider setting a weekly spending limit to control expenses</span>
            </div>
          )}
          {topCategories[0] && topCategories[0][1] > avgDailySpending * 7 && (
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <span>Focus on reducing {topCategories[0][0]} expenses for maximum impact</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            <span>Track expenses daily for better financial awareness</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpendingInsights;