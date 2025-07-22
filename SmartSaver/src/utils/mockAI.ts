import { Expense, FinancialSummary } from '../types';

export const generateAIResponse = (message: string, expenses: Expense[]): string => {
  const lowerMessage = message.toLowerCase();
  
  // Calculate summary stats
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categorySpending = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });
  
  const topCategory = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)[0];

  // Spending review
  if (lowerMessage.includes('spending') || lowerMessage.includes('review') || lowerMessage.includes('analyze')) {
    const tips = [
      `Your top spending category is ${topCategory?.[0] || 'Food'} at $${topCategory?.[1]?.toFixed(2) || '0'}. Consider setting a weekly limit for this category.`,
      `You've spent $${totalSpent.toFixed(2)} recently. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`,
      `Track your daily expenses for a week to identify unnecessary purchases and potential savings.`
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }
  
  // Budget planning
  if (lowerMessage.includes('budget') || lowerMessage.includes('plan')) {
    return `Based on your spending patterns, I recommend allocating 30% of your income to essentials like food and transport, 20% to entertainment, and saving at least 20%. Your current spending shows you spend most on ${topCategory?.[0] || 'various categories'}.`;
  }
  
  // Savings advice
  if (lowerMessage.includes('save') || lowerMessage.includes('savings')) {
    return `To boost your savings: 1) Automate transfers to savings right after payday, 2) Use the envelope method for discretionary spending, 3) Challenge yourself to reduce your biggest expense category by 10% this month.`;
  }
  
  // Food expenses
  if (lowerMessage.includes('food') || lowerMessage.includes('eat')) {
    return `To reduce food expenses: Meal prep on Sundays, buy generic brands, use grocery store apps for discounts, and limit eating out to once a week. Consider cooking at home more often!`;
  }
  
  // General advice
  const generalAdvice = [
    "Start with tracking every expense for 30 days to understand your spending patterns better.",
    "Set up automatic savings transfers - even $25/week adds up to $1,300 per year!",
    "Use the 24-hour rule: wait a day before making non-essential purchases over $50.",
    "Review and cancel unused subscriptions monthly - they can add up to hundreds per year.",
    "Create separate savings goals for different purposes (vacation, emergency fund, etc.)."
  ];
  
  return generalAdvice[Math.floor(Math.random() * generalAdvice.length)];
};

export const getFinancialTip = (summary: FinancialSummary): string => {
  const tips = [
    `Great job tracking your expenses! You've logged $${summary.totalSpent.toFixed(2)} in spending.`,
    `Your highest spending category needs attention. Consider setting a weekly limit.`,
    `You're spending $${summary.weeklySpent.toFixed(2)} per week on average. Is this sustainable?`,
    `Emergency fund tip: Aim to save 3-6 months of expenses for financial security.`
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
};