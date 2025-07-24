import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, TrendingUp, DollarSign, MessageCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { generateAIFinancialAdvice } from '../services/aiService';
import { useExpenses } from '../hooks/useExpenses';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getCurrencyIcon,getCurrencySymbol } from '../utils/currency';

const AIAssistant: React.FC = () => {
  const { expenses } = useExpenses();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! I'm your AI financial advisor powered by advanced analytics. I can analyze your spending patterns, create personalized budget plans, and provide data-driven financial advice. What would you like to explore about your finances?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currencySymbol = getCurrencySymbol();
  const currencyIcon = getCurrencyIcon();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simplified formatter for unstructured messages
  const formatAIMessage = (text: string) => {
    return (
      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
        {text}
      </p>
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIFinancialAdvice(inputText);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or ask a different question about your finances.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Analyze my spending patterns",
    "Create a personalized budget plan",
    "How can I save more money?",
    "What's my biggest expense category?",
    "Help me reduce my spending",
    "Show me savings projections"
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoriesCount = new Set(expenses.map(exp => exp.category)).size;
  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-6 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                <Bot className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900">AI Financial Advisor</h1>
              <p className="text-gray-600 mt-1">Your personal finance expert powered by advanced AI</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Online & Ready to Help</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Financial Analysis Chat</h3>
                    <p className="text-purple-100 text-sm">Get personalized insights and recommendations</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.isUser
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                          : 'bg-gradient-to-r from-purple-500 to-blue-500'
                      }`}
                    >
                      {message.isUser ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>

                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.isUser
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                          : 'bg-gray-50 text-gray-900'
                      }`}
                    >
                      <div className={`text-sm ${
                        message.isUser ? 'text-white' : 'text-gray-900'
                      }`}>
                        {message.isUser ? (
                          <div className="whitespace-pre-line">{message.text}</div>
                        ) : (
                          formatAIMessage(message.text)
                        )}
                      </div>
                      <p className={`text-xs mt-2 ${
                        message.isUser ? 'text-purple-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-2xl flex items-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span className="text-gray-600 text-sm">Analyzing your finances...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="border-t bg-gray-50 px-6 py-4">
                <p className="text-sm text-gray-600 mb-3">Quick questions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="text-sm bg-white text-gray-700 px-3 py-2 rounded-lg border hover:bg-gray-50 transition-colors duration-200 text-left hover:border-purple-300"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t p-6">
                <form onSubmit={handleSendMessage} className="flex space-x-4">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask me anything about your finances..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" color="text-white" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Your AI Advisor</h3>
                <p className="text-sm text-gray-600">Specialized in personal finance optimization</p>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Expertise:</span>
                  <span className="text-green-600 font-medium">Financial Planning</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Experience:</span>
                  <span className="text-blue-600 font-medium">Advanced AI</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Specialization:</span>
                  <span className="text-purple-600 font-medium">Budget Analysis</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                AI Capabilities
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Advanced spending pattern analysis</li>
                <li>• Personalized budget optimization</li>
                <li>• Savings projection modeling</li>
                <li>• Category-specific recommendations</li>
                <li>• Goal-based financial planning</li>
                <li>• Real-time expense insights</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Your Financial Data
              </h3>
              <div className="space-y-3 text-sm text-purple-100">
                <div className="flex justify-between">
                  <span>Total Expenses:</span>
                  <span className="font-semibold text-white">{currencySymbol}{totalSpent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transactions:</span>
                  <span className="font-semibold text-white">{expenses.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Categories:</span>
                  <span className="font-semibold text-white">{categoriesCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                
                Recent Expenses
              </h3>
              {recentExpenses.length === 0 ? (
                <p className="text-gray-500 text-sm">No expenses tracked yet</p>
              ) : (
                <div className="space-y-3">
                  {recentExpenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{expense.category}</p>
                        <p className="text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                      <span className="font-semibold text-gray-900">{currencySymbol}{expense.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
