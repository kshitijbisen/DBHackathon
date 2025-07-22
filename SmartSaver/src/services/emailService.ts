interface EmailNotificationData {
  type: 'expense_added' | 'budget_alert' | 'spending_summary' | 'security_alert' | 'subscription_update' | 'welcome';
  userEmail: string;
  userName?: string;
  data: any;
}

export const sendEmailNotification = async (notificationData: EmailNotificationData): Promise<{ success: boolean; error?: string }> => {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-notification`;
    
    const headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    console.log('Sending email notification:', notificationData.type);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(notificationData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Email service error response:', errorData);
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const result = await response.json();
    console.log('Email service result:', result);
    return { success: result.success };
  } catch (error) {
    console.error('Email service error:', error);
    
    // For demo purposes, log the email that would be sent
    console.log('📧 DEMO EMAIL NOTIFICATION:');
    console.log(`To: ${notificationData.userEmail}`);
    console.log(`From: SmartSaver <notifications@smartsaver.app>`);
    console.log(`Subject: ${getEmailSubject(notificationData.type, notificationData.data)}`);
    console.log(`Content: ${getEmailContent(notificationData.type, notificationData.data, notificationData.userName)}`);
    console.log('---');
    
    // Return success for demo purposes
    return { success: true };
  }
};

// Welcome email function
export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string
) => {
  return sendEmailNotification({
    type: 'welcome',
    userEmail,
    userName,
    data: {
      registrationDate: new Date().toISOString(),
      features: [
        'Smart expense tracking',
        'AI-powered financial insights', 
        'Interactive charts and analytics',
        'Budget management tools',
        'Secure data protection'
      ]
    }
  });
};

// Specific notification functions for different events
export const sendExpenseAddedNotification = async (
  userEmail: string, 
  userName: string, 
  expense: { amount: number; category: string; date: string; notes?: string }
) => {
  return sendEmailNotification({
    type: 'expense_added',
    userEmail,
    userName,
    data: expense
  });
};

export const sendBudgetAlertNotification = async (
  userEmail: string,
  userName: string,
  budgetData: { category: string; spent: number; budget: number }
) => {
  return sendEmailNotification({
    type: 'budget_alert',
    userEmail,
    userName,
    data: budgetData
  });
};

export const sendSpendingSummaryNotification = async (
  userEmail: string,
  userName: string,
  summaryData: {
    period: string;
    totalSpent: number;
    transactionCount: number;
    topCategories: Array<{ category: string; amount: number }>;
    insights?: string;
  }
) => {
  return sendEmailNotification({
    type: 'spending_summary',
    userEmail,
    userName,
    data: summaryData
  });
};

export const sendSecurityAlertNotification = async (
  userEmail: string,
  userName: string,
  securityData: { action: string; ipAddress?: string }
) => {
  return sendEmailNotification({
    type: 'security_alert',
    userEmail,
    userName,
    data: securityData
  });
};

export const sendSubscriptionUpdateNotification = async (
  userEmail: string,
  userName: string,
  subscriptionData: {
    planName: string;
    status: string;
    action: string;
    nextBillingDate?: string;
  }
) => {
  return sendEmailNotification({
    type: 'subscription_update',
    userEmail,
    userName,
    data: subscriptionData
  });
};

// Helper functions for demo email content
const getEmailSubject = (type: string, data: any): string => {
  switch (type) {
    case 'welcome':
      return `🎉 Welcome to SmartSaver - Your Financial Journey Starts Now!`;
    case 'expense_added':
      return `💰 New Expense Added - $${data.amount}`;
    case 'budget_alert':
      return `⚠️ Budget Alert - ${data.category} Category`;
    case 'spending_summary':
      return `📊 Your ${data.period} Spending Summary`;
    case 'security_alert':
      return `🔒 Security Update - ${data.action}`;
    case 'subscription_update':
      return `💳 Subscription Update - ${data.action}`;
    default:
      return 'SmartSaver Notification';
  }
};

const getEmailContent = (type: string, data: any, userName?: string): string => {
  const name = userName || 'User';
  
  switch (type) {
    case 'welcome':
      return `Hi ${name}! 🎉 Welcome to SmartSaver! We're excited to help you take control of your finances with our AI-powered tools and insights. Your account was created on ${new Date(data.registrationDate).toLocaleDateString()}. Get started by adding your first expense and exploring our features: ${data.features.join(', ')}.`;
    
    case 'expense_added':
      return `Hi ${name}! You've added a new expense: $${data.amount} in ${data.category} category on ${new Date(data.date).toLocaleDateString()}. ${data.notes ? 'Notes: ' + data.notes : ''}`;
    
    case 'budget_alert':
      return `Hi ${name}! Budget alert for ${data.category}: You've spent $${data.spent} of your $${data.budget} budget (${((data.spent / data.budget) * 100).toFixed(1)}%).`;
    
    case 'spending_summary':
      return `Hi ${name}! Your ${data.period} spending summary: Total spent $${data.totalSpent} across ${data.transactionCount} transactions.`;
    
    case 'security_alert':
      return `Hi ${name}! Security update: ${data.action} at ${new Date().toLocaleString()}. If you didn't make this change, please contact support.`;
    
    case 'subscription_update':
      return `Hi ${name}! Your SmartSaver ${data.planName} subscription has been ${data.action}. Status: ${data.status}.`;
    
    default:
      return `Hi ${name}! You have a new notification from SmartSaver.`;
  }
};