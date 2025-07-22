/*
  # AI Financial Advisor Edge Function
  
  This function provides personalized financial advice using AI based on user's expense data.
  It analyzes spending patterns, provides savings projections, and offers actionable recommendations.
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ExpenseData {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

interface FinancialAnalysisRequest {
  message: string;
  expenses: ExpenseData[];
  income?: number;
  goals?: string[];
}

const generateFinancialAdvice = (data: FinancialAnalysisRequest): string => {
  const { message, expenses, income } = data;
  const lowerMessage = message.toLowerCase();
  
  // Calculate financial metrics
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categorySpending = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });
  
  const topCategories = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  const monthlySpent = totalSpent; // Assuming expenses are for current period
  const savingsRate = income ? ((income - monthlySpent) / income * 100) : 0;

  // Enhanced AI responses based on your prompt structure
  if (lowerMessage.includes('analyze') || lowerMessage.includes('spending') || lowerMessage.includes('review')) {
    const topCategory = topCategories[0];
    const categoryPercentage = topCategory ? (topCategory[1] / totalSpent * 100) : 0;
    
    return `**SmartSaver Spending Analysis:**

📊 **Top Spending Categories:**
${topCategories.map(([cat, amount], i) => `${i + 1}. ${cat}: $${amount.toFixed(2)} (${(amount/totalSpent*100).toFixed(1)}%)`).join('\n')}

💡 **Key Insights:**
• Your highest spending is on ${topCategory?.[0] || 'miscellaneous'} at ${categoryPercentage.toFixed(1)}% of total expenses
• ${savingsRate > 20 ? 'Great job! You\'re saving well.' : 'Consider increasing your savings rate to 20% of income'}

🎯 **Actionable Steps:**
1. Set a weekly limit of $${(topCategory?.[1] || 0 / 4).toFixed(0)} for ${topCategory?.[0] || 'your top category'}
2. Track daily expenses for 2 weeks to identify patterns
3. Use the envelope method for discretionary spending
4. Review and cancel unused subscriptions monthly`;
  }

  if (lowerMessage.includes('budget') || lowerMessage.includes('plan')) {
    const recommendedBudget = {
      needs: monthlySpent * 0.5,
      wants: monthlySpent * 0.3,
      savings: monthlySpent * 0.2
    };

    return `**SmartSaver Budget Plan:**

📋 **50/30/20 Rule Applied to Your Spending:**
• **Needs (50%):** $${recommendedBudget.needs.toFixed(2)} - Rent, groceries, utilities
• **Wants (30%):** $${recommendedBudget.wants.toFixed(2)} - Entertainment, dining out
• **Savings (20%):** $${recommendedBudget.savings.toFixed(2)} - Emergency fund, investments

🎯 **Your Current vs. Recommended:**
• Current spending: $${monthlySpent.toFixed(2)}
• Recommended total: $${(recommendedBudget.needs + recommendedBudget.wants).toFixed(2)}
• Potential savings: $${recommendedBudget.savings.toFixed(2)}

📈 **Implementation Steps:**
1. Automate $${(recommendedBudget.savings / 4).toFixed(0)} weekly transfers to savings
2. Allocate ${topCategories[0]?.[0] || 'food'} budget to $${(recommendedBudget.wants * 0.4).toFixed(0)}/month
3. Use separate accounts for needs vs. wants
4. Review weekly to stay on track`;
  }

  if (lowerMessage.includes('save') || lowerMessage.includes('savings') || lowerMessage.includes('goal')) {
    const potentialSavings = topCategories[0] ? topCategories[0][1] * 0.2 : 100;
    const yearlyProjection = potentialSavings * 12;

    return `**SmartSaver Savings Strategy & Projections:**

💰 **Immediate Opportunities:**
• Reduce ${topCategories[0]?.[0] || 'top category'} by 20% = $${potentialSavings.toFixed(2)}/month saved
• Annual impact: $${yearlyProjection.toFixed(2)} additional savings

📊 **Savings Timeline Projections:**
• Emergency Fund ($${(monthlySpent * 3).toFixed(2)}): ${Math.ceil((monthlySpent * 3) / potentialSavings)} months
• Vacation Fund ($3,000): ${Math.ceil(3000 / potentialSavings)} months
• Investment Goal ($10,000): ${Math.ceil(10000 / potentialSavings)} months

🚀 **Action Plan:**
1. **Week 1:** Set up automatic $${(potentialSavings / 4).toFixed(0)} weekly transfers
2. **Week 2:** Negotiate bills (phone, insurance) for $50+ monthly savings
3. **Week 3:** Use cashback apps for groceries (2-5% back)
4. **Week 4:** Review and optimize subscriptions
5. **Month 2:** Increase savings by another $${(potentialSavings * 0.5).toFixed(0)}`;
  }

  if (lowerMessage.includes('reduce') || lowerMessage.includes('cut') || lowerMessage.includes('lower')) {
    const suggestions = [
      `**${topCategories[0]?.[0] || 'Food'} Reduction Tips:**`,
      `• Current: $${topCategories[0]?.[1]?.toFixed(2) || '0'}/month`,
      `• Target: $${(topCategories[0]?.[1] || 0 * 0.8).toFixed(2)}/month (20% reduction)`,
      `• Monthly savings: $${(topCategories[0]?.[1] || 0 * 0.2).toFixed(2)}`,
      '',
      '🎯 **Specific Actions:**',
      '1. Meal prep Sundays (save $15-20/week)',
      '2. Generic brands for staples (save 20-30%)',
      '3. Limit eating out to once weekly',
      '4. Use grocery store apps for discounts',
      '5. Buy seasonal produce and freeze extras'
    ];

    return suggestions.join('\n');
  }

  // Default comprehensive advice
  return `**SmartSaver Personalized Financial Guidance:**

📈 **Your Financial Snapshot:**
• Total tracked expenses: $${totalSpent.toFixed(2)}
• Number of categories: ${Object.keys(categorySpending).length}
• Average per category: $${(totalSpent / Object.keys(categorySpending).length).toFixed(2)}

💡 **Smart Money Moves:**
1. **Automate Success:** Set up automatic transfers for savings right after payday
2. **Track Everything:** Use the 30-day rule - track every expense to identify patterns
3. **Optimize Big Wins:** Focus on your top 3 spending categories for maximum impact
4. **Emergency Buffer:** Build $${(monthlySpent * 3).toFixed(2)} emergency fund (3 months expenses)

🎯 **This Week's Challenge:**
Try the "24-hour rule" - wait a day before any non-essential purchase over $50. This simple habit can reduce impulse spending by 30-40%.

Need specific advice? Ask me about budgeting, saving for goals, or reducing expenses in any category!`;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const requestData: FinancialAnalysisRequest = await req.json();
    const advice = generateFinancialAdvice(requestData);

    return new Response(
      JSON.stringify({ advice }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate financial advice',
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  }
});