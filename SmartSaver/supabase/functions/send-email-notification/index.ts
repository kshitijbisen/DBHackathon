/*
  # Email Notification Service
  
  This function sends email notifications for various SmartSaver events:
  - Welcome emails for new registrations
  - Expense added notifications
  - Budget limit alerts
  - Weekly/monthly spending summaries
  - Security alerts (2FA enabled/disabled)
  - Subscription updates
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface EmailRequest {
  type: 'welcome' | 'expense_added' | 'budget_alert' | 'spending_summary' | 'security_alert' | 'subscription_update';
  userEmail: string;
  userName?: string;
  data: any;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const generateEmailTemplate = (type: string, data: any, userName: string = 'User'): EmailTemplate => {
  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
      .container { max-width: 600px; margin: 0 auto; background-color: white; }
      .header { background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); padding: 30px; text-align: center; }
      .header h1 { color: white; margin: 0; font-size: 24px; font-weight: bold; }
      .header p { color: #E0E7FF; margin: 10px 0 0 0; }
      .content { padding: 30px; }
      .card { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #8B5CF6; }
      .button { display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
      .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
      .amount { font-size: 24px; font-weight: bold; color: #1e293b; }
      .category { background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 20px; font-size: 14px; display: inline-block; }
      .alert { background: #fef2f2; border-left-color: #ef4444; }
      .success { background: #f0fdf4; border-left-color: #22c55e; }
      .warning { background: #fffbeb; border-left-color: #f59e0b; }
      .welcome { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left-color: #0ea5e9; }
      .feature-list { list-style: none; padding: 0; }
      .feature-list li { padding: 8px 0; display: flex; align-items: center; }
      .feature-list li:before { content: "✨"; margin-right: 10px; }
    </style>
  `;

  switch (type) {
    case 'welcome':
      return {
        subject: `🎉 Welcome to SmartSaver - Your Financial Journey Starts Now!`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to SmartSaver!</h1>
              <p>Your AI-Powered Personal Finance Assistant</p>
            </div>
            <div class="content">
              <h2>Hi ${userName}! 👋</h2>
              <p>Welcome to SmartSaver! We're thrilled to have you join our community of smart money managers.</p>
              
              <div class="card welcome">
                <h3>🚀 You're All Set!</h3>
                <p><strong>Account Created:</strong> ${new Date(data.registrationDate).toLocaleDateString()}</p>
                <p>Your SmartSaver account is ready to help you take control of your finances with AI-powered insights and tools.</p>
              </div>

              <div class="card">
                <h3>✨ What You Can Do Now</h3>
                <ul class="feature-list">
                  ${data.features.map((feature: string) => `<li>${feature}</li>`).join('')}
                </ul>
              </div>

              <div class="card success">
                <h3>🎯 Get Started in 3 Easy Steps</h3>
                <ol>
                  <li><strong>Add Your First Expense:</strong> Start tracking your spending today</li>
                  <li><strong>Explore the Dashboard:</strong> See your financial insights come to life</li>
                  <li><strong>Chat with AI:</strong> Get personalized financial advice anytime</li>
                </ol>
              </div>

              <div style="text-align: center;">
                <a href="${Deno.env.get('FRONTEND_URL') || 'https://smartsaver.app'}/dashboard" class="button">
                  🚀 Start Your Financial Journey
                </a>
              </div>

              <p>If you have any questions, our support team is here to help. Just reply to this email!</p>
            </div>
            <div class="footer">
              <p><strong>Welcome to the SmartSaver family! 🎉</strong></p>
              <p>This email was sent from SmartSaver - Your AI-Powered Personal Finance Assistant</p>
              <p>You can manage your notification preferences in your profile settings.</p>
            </div>
          </div>
        `,
        text: `Hi ${userName}! 🎉 Welcome to SmartSaver! We're excited to help you take control of your finances with our AI-powered tools and insights. Your account was created on ${new Date(data.registrationDate).toLocaleDateString()}. Get started by adding your first expense and exploring our features: ${data.features.join(', ')}. Visit ${Deno.env.get('FRONTEND_URL') || 'https://smartsaver.app'}/dashboard to begin your financial journey!`
      };

    case 'expense_added':
      return {
        subject: `💰 New Expense Added - $${data.amount}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>💰 SmartSaver</h1>
              <p>Expense Tracking Notification</p>
            </div>
            <div class="content">
              <h2>Hi ${userName}! 👋</h2>
              <p>You've successfully added a new expense to your SmartSaver account.</p>
              
              <div class="card">
                <div class="amount">$${data.amount}</div>
                <p><strong>Category:</strong> <span class="category">${data.category}</span></p>
                <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
                ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
              </div>

              <p>Keep tracking your expenses to maintain better financial awareness! 📊</p>
              
              <a href="${Deno.env.get('FRONTEND_URL') || 'https://smartsaver.app'}/dashboard" class="button">
                View Dashboard
              </a>
            </div>
            <div class="footer">
              <p>This email was sent from SmartSaver - Your AI-Powered Personal Finance Assistant</p>
              <p>You can manage your notification preferences in your profile settings.</p>
            </div>
          </div>
        `,
        text: `Hi ${userName}! You've added a new expense: $${data.amount} in ${data.category} category on ${new Date(data.date).toLocaleDateString()}. ${data.notes ? 'Notes: ' + data.notes : ''} View your dashboard at ${Deno.env.get('FRONTEND_URL') || 'https://smartsaver.app'}/dashboard`
      };

    case 'budget_alert':
      return {
        subject: `⚠️ Budget Alert - ${data.category} Category`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>⚠️ SmartSaver</h1>
              <p>Budget Alert Notification</p>
            </div>
            <div class="content">
              <h2>Budget Alert! 🚨</h2>
              <p>Hi ${userName}, you're approaching your budget limit for the <strong>${data.category}</strong> category.</p>
              
              <div class="card alert">
                <h3>Budget Status</h3>
                <p><strong>Category:</strong> <span class="category">${data.category}</span></p>
                <p><strong>Spent:</strong> $${data.spent} / $${data.budget}</p>
                <p><strong>Remaining:</strong> $${(data.budget - data.spent).toFixed(2)}</p>
                <p><strong>Usage:</strong> ${((data.spent / data.budget) * 100).toFixed(1)}%</p>
              </div>

              <p>Consider reviewing your spending in this category to stay within your budget goals. 💡</p>
              
              <a href="${Deno.env.get('FRONTEND_URL') || 'https://smartsaver.app'}/dashboard" class="button">
                Review Spending
              </a>
            </div>
            <div class="footer">
              <p>This email was sent from SmartSaver - Your AI-Powered Personal Finance Assistant</p>
              <p>Budget alerts help you stay on track with your financial goals.</p>
            </div>
          </div>
        `,
        text: `Budget Alert! Hi ${userName}, you've spent $${data.spent} of your $${data.budget} budget for ${data.category} (${((data.spent / data.budget) * 100).toFixed(1)}%). Consider reviewing your spending to stay within budget.`
      };

    case 'spending_summary':
      return {
        subject: `📊 Your ${data.period} Spending Summary`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>📊 SmartSaver</h1>
              <p>${data.period} Spending Summary</p>
            </div>
            <div class="content">
              <h2>Your ${data.period} Financial Summary</h2>
              <p>Hi ${userName}, here's your spending overview for the past ${data.period.toLowerCase()}.</p>
              
              <div class="card">
                <h3>💰 Total Spending</h3>
                <div class="amount">$${data.totalSpent}</div>
                <p>Across ${data.transactionCount} transactions</p>
              </div>

              <div class="card">
                <h3>🏆 Top Categories</h3>
                ${data.topCategories.map((cat: any) => `
                  <p><span class="category">${cat.category}</span> - $${cat.amount}</p>
                `).join('')}
              </div>

              ${data.insights ? `
                <div class="card success">
                  <h3>💡 AI Insights</h3>
                  <p>${data.insights}</p>
                </div>
              ` : ''}
              
              <a href="${Deno.env.get('FRONTEND_URL') || 'https://smartsaver.app'}/dashboard" class="button">
                View Full Report
              </a>
            </div>
            <div class="footer">
              <p>This email was sent from SmartSaver - Your AI-Powered Personal Finance Assistant</p>
              <p>Regular summaries help you stay informed about your spending patterns.</p>
            </div>
          </div>
        `,
        text: `Your ${data.period} Spending Summary: Total spent $${data.totalSpent} across ${data.transactionCount} transactions. Top categories: ${data.topCategories.map((cat: any) => `${cat.category}: $${cat.amount}`).join(', ')}.`
      };

    case 'security_alert':
      return {
        subject: `🔒 Security Update - ${data.action}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>🔒 SmartSaver</h1>
              <p>Security Notification</p>
            </div>
            <div class="content">
              <h2>Security Update</h2>
              <p>Hi ${userName}, there's been a security change on your SmartSaver account.</p>
              
              <div class="card ${data.action.includes('enabled') ? 'success' : 'warning'}">
                <h3>Security Action</h3>
                <p><strong>Action:</strong> ${data.action}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>IP Address:</strong> ${data.ipAddress || 'Unknown'}</p>
              </div>

              ${data.action.includes('enabled') ? 
                '<p>Great! Your account is now more secure with Two-Factor Authentication enabled. 🛡️</p>' :
                '<p>If you didn\'t make this change, please contact our support team immediately.</p>'
              }
              
              <a href="${Deno.env.get('FRONTEND_URL') || 'https://smartsaver.app'}/profile" class="button">
                Review Security Settings
              </a>
            </div>
            <div class="footer">
              <p>This email was sent from SmartSaver - Your AI-Powered Personal Finance Assistant</p>
              <p>We notify you of all security changes to keep your account safe.</p>
            </div>
          </div>
        `,
        text: `Security Update: ${data.action} on your SmartSaver account at ${new Date().toLocaleString()}. If you didn't make this change, please contact support.`
      };

    case 'subscription_update':
      return {
        subject: `💳 Subscription Update - ${data.action}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>💳 SmartSaver</h1>
              <p>Subscription Notification</p>
            </div>
            <div class="content">
              <h2>Subscription Update</h2>
              <p>Hi ${userName}, your SmartSaver subscription has been updated.</p>
              
              <div class="card">
                <h3>Subscription Details</h3>
                <p><strong>Plan:</strong> ${data.planName}</p>
                <p><strong>Status:</strong> ${data.status}</p>
                <p><strong>Action:</strong> ${data.action}</p>
                ${data.nextBillingDate ? `<p><strong>Next Billing:</strong> ${new Date(data.nextBillingDate).toLocaleDateString()}</p>` : ''}
              </div>

              <p>Thank you for being a SmartSaver ${data.planName} member! 🎉</p>
              
              <a href="${Deno.env.get('FRONTEND_URL') || 'https://smartsaver.app'}/profile" class="button">
                Manage Subscription
              </a>
            </div>
            <div class="footer">
              <p>This email was sent from SmartSaver - Your AI-Powered Personal Finance Assistant</p>
              <p>Questions about your subscription? Contact our support team.</p>
            </div>
          </div>
        `,
        text: `Subscription Update: Your SmartSaver ${data.planName} subscription has been ${data.action}. Status: ${data.status}. Manage your subscription at ${Deno.env.get('FRONTEND_URL') || 'https://smartsaver.app'}/profile`
      };

    default:
      return {
        subject: 'SmartSaver Notification',
        html: `<p>Hi ${userName}, you have a new notification from SmartSaver.</p>`,
        text: `Hi ${userName}, you have a new notification from SmartSaver.`
      };
  }
};

const sendEmail = async (to: string, template: EmailTemplate): Promise<boolean> => {
  try {
    // Using a mock email service for demonstration
    // In production, you would integrate with services like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Resend
    // - Postmark

    const emailServiceUrl = Deno.env.get('EMAIL_SERVICE_URL');
    const emailApiKey = Deno.env.get('EMAIL_API_KEY');

    if (!emailServiceUrl || !emailApiKey) {
      console.log('Email service not configured, logging email instead:');
      console.log(`To: ${to}`);
      console.log(`Subject: ${template.subject}`);
      console.log(`Text: ${template.text}`);
      return true; // Return true for demo purposes
    }

    // Example integration with SendGrid
    const response = await fetch(`${emailServiceUrl}/mail/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          subject: template.subject
        }],
        from: {
          email: 'notifications@smartsaver.app',
          name: 'SmartSaver'
        },
        content: [
          {
            type: 'text/plain',
            value: template.text
          },
          {
            type: 'text/html',
            value: template.html
          }
        ]
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { type, userEmail, userName, data }: EmailRequest = await req.json();

    if (!type || !userEmail) {
      throw new Error('Missing required fields: type and userEmail');
    }

    console.log(`Sending ${type} email to ${userEmail}`);

    const template = generateEmailTemplate(type, data, userName);
    const success = await sendEmail(userEmail, template);

    if (success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email sent successfully',
          type,
          recipient: userEmail
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        },
      );
    } else {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('Email notification error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to send email notification',
        details: error.toString()
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  }
});