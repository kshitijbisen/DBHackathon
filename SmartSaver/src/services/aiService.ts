import { Expense } from '../types';

interface AIResponse {
  advice: string;
}

interface FinancialAnalysisRequest {
  message: string;
  expenses: Expense[];
  income?: number;
  goals?: string[];
}

export const generateAIFinancialAdvice = async (
  message: string,
  expenses: Expense[],
  income?: number,
  goals?: string[]
): Promise<string> => {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-financial-advisor`;
    
    const headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    const requestData: FinancialAnalysisRequest = {
      message,
      expenses,
      income,
      goals
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const data: AIResponse = await response.json();
    return data.advice;
  } catch (error) {
    console.error('AI service error:', error);
    
    // Fallback to enhanced local AI if service fails
    return generateFallbackAdvice(message, expenses);
  }
};

// Enhanced fallback AI with your prompt structure
const generateFallbackAdvice = (message: string, expenses: Expense[]): string => {
  const lowerMessage = message.toLowerCase();
  
  // Calculate financial metrics
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categorySpending = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });
  
  const topCategory = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)[0];

  if (lowerMessage.includes('analyze') || lowerMessage.includes('spending')) {
    return `**Spending Analysis:**

📊 **Your Top Category:** ${topCategory?.[0] || 'Food'} - $${topCategory?.[1]?.toFixed(2) || '0'}

💡 **Key Insight:** This represents ${topCategory ? (topCategory[1] / totalSpent * 100).toFixed(1) : '0'}% of your total spending.

🎯 **Action Steps:**
1. Set a weekly limit of $${topCategory ? (topCategory[1] / 4).toFixed(0) : '50'} for this category
2. Track daily expenses for 2 weeks to identify patterns
3. Use the envelope method for discretionary spending

**Potential Savings:** Reducing this category by 20% could save you $${topCategory ? (topCategory[1] * 0.2).toFixed(2) : '0'} monthly!`;
  }

  if (lowerMessage.includes('budget') || lowerMessage.includes('plan')) {
    return `**Personalized Budget Plan:**

📋 **50/30/20 Rule for Your Finances:**
• **Needs (50%):** $${(totalSpent * 0.5).toFixed(2)} - Essentials like rent, groceries
• **Wants (30%):** $${(totalSpent * 0.3).toFixed(2)} - Entertainment, dining out  
• **Savings (20%):** $${(totalSpent * 0.2).toFixed(2)} - Emergency fund, investments

🎯 **Implementation Steps:**
1. Automate $${(totalSpent * 0.05).toFixed(0)} weekly transfers to savings
2. Set category limits based on the 50/30/20 split
3. Use separate accounts for needs vs. wants
4. Review weekly to stay on track`;
  }

  if (lowerMessage.includes('save') || lowerMessage.includes('savings')) {
    const potentialSavings = totalSpent * 0.15; // 15% potential savings
    return `**Savings Strategy:**

💰 **Immediate Opportunities:**
• Reduce top spending by 15% = $${potentialSavings.toFixed(2)}/month saved
• Annual impact: $${(potentialSavings * 12).toFixed(2)} additional savings

📊 **Goal Timeline:**
• Emergency Fund: ${Math.ceil((totalSpent * 3) / potentialSavings)} months
• Vacation Fund ($3,000): ${Math.ceil(3000 / potentialSavings)} months

🚀 **Action Plan:**
1. Automate savings transfers right after payday
2. Use cashback apps for groceries (2-5% back)
3. Review and cancel unused subscriptions
4. Try the 24-hour rule for purchases over $50`;
  }

  // Default advice
  return `**Smart Financial Guidance:**

📈 **Your Snapshot:** $${totalSpent.toFixed(2)} tracked across ${Object.keys(categorySpending).length} categories

💡 **Quick Wins:**
1. **Automate Success:** Set up automatic savings transfers
2. **Track Everything:** Monitor expenses for 30 days to identify patterns  
3. **Focus on Big Categories:** Your top 3 spending areas have the most savings potential
4. **Build Emergency Buffer:** Aim for 3-6 months of expenses saved

🎯 **This Week:** Try reducing your biggest expense category by just 10% - small changes create big results over time!`;
};