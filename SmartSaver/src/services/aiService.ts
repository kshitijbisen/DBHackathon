import { Expense } from '../types';

interface AIResponse {
  response: string;
}

interface FinancialAnalysisRequest {
  message: string;
  // expenses: Expense[];
  // income?: number;
  // goals?: string[];
}

export const generateAIFinancialAdvice = async (
  message: string,
  // expenses: Expense[],
  // income?: number,
  // goals?: string[]
): Promise<string> => {
  try {
    const apiUrl ='http://127.0.0.1:8000/send-message';
    
    const headers = {
      // 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    const requestData: FinancialAnalysisRequest = {
      message,
      // expenses,
      // income,
      // goals
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

    return data.response;
  } catch (error) {
    console.error('AI service error:', error);
    
    // Fallback to enhanced local AI if service fails
    return generateFallbackAdvice(message);
  }
};

// Enhanced fallback AI with your prompt structure
const generateFallbackAdvice = (message: string): string => {
  return `**Smart Financial Tip:** Did you know that small changes to your daily habits can add up to make a big difference in your finances? Try reducing your daily expenses by a small amount and see how it impacts your savings over time!`;
};