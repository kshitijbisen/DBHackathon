# SmartSaver - AI-Powered Personal Finance Management

A modern, comprehensive personal finance management application built with React, TypeScript, and Supabase. Track expenses, analyze spending patterns with interactive charts, and get personalized AI-powered financial advice to achieve your money goals.

## 🌟 Key Features

### 📊 Advanced Analytics & Charts
- **Interactive Charts**: Pie charts, donut charts, bar charts, and line graphs for comprehensive data visualization
- **Real-time Updates**: Charts update dynamically as new expense data is added
- **Drill-down Capabilities**: Click on chart segments to explore detailed transaction data
- **Multiple Time Ranges**: View data by week, month, quarter, or year
- **Export Functionality**: Download expense data as CSV files

### 🤖 AI-Powered Financial Intelligence
- **Smart Spending Analysis**: AI analyzes patterns and identifies trends in your expenses
- **Personalized Insights**: Get actionable recommendations based on your spending behavior
- **Budget Optimization**: AI suggests ways to optimize your budget and increase savings
- **Anomaly Detection**: Automatically identifies unusual spending patterns
- **Interactive Chat**: Ask your AI financial advisor questions in natural language

### 💰 Core Financial Management
- **Expense Tracking**: Easily categorize and track expenses with an intuitive interface
- **Smart Dashboard**: Visual spending breakdowns with interactive analytics
- **Budget Management**: Set budgets for different categories with real-time alerts
- **User Profiles**: Comprehensive profile management with financial goals and preferences

### 🔒 Security & Authentication
- **Secure Authentication**: Email/password authentication via Supabase Auth
- **Two-Factor Authentication**: Optional 2FA for enhanced account security
- **Row Level Security**: Database-level security ensuring users only access their own data
- **Session Management**: Secure session handling with automatic token refresh

### 💳 Premium Features & Subscriptions
- **Stripe Integration**: Secure payment processing for premium subscriptions
- **Tiered Plans**: Free, Pro, and Premium tiers with different feature sets
- **Subscription Management**: Full billing and subscription management interface
- **Advanced Analytics**: Enhanced insights and reporting for premium users

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS** for responsive, modern styling
- **Lucide React** for consistent iconography
- **Vite** for fast development and optimized builds
- **Custom Chart Components** for data visualization

### Backend & Database
- **Supabase** for database, authentication, and real-time features
- **PostgreSQL** with Row Level Security (RLS)
- **Supabase Edge Functions** for serverless API endpoints
- **Real-time subscriptions** for live data updates

### AI & Analytics
- **Custom AI Service** for financial advice generation
- **Advanced analytics** for spending pattern recognition
- **Personalized recommendations** based on user data
- **Interactive chat interface** for natural language queries

### Payments & Subscriptions
- **Stripe** for secure payment processing
- **Stripe Checkout** for subscription management
- **Webhook handling** for real-time subscription updates
- **Customer portal** for self-service billing management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account (for payments)

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smartsaver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations from `supabase/migrations/`
   - Configure authentication settings
   - Set up Row Level Security policies

4. **Configure Stripe**
   - Create Stripe products and prices
   - Set up webhook endpoints
   - Configure test mode for development

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📊 Database Schema

### Core Tables
- **expenses**: User expense records with categories, amounts, and dates
- **user_profiles**: Extended user information and financial preferences
- **subscriptions**: Stripe subscription management

### Key Features
- **Row Level Security**: All tables have RLS policies ensuring data privacy
- **Automatic timestamps**: Created/updated timestamps on all records
- **Foreign key constraints**: Proper data relationships and integrity
- **Indexes**: Optimized queries for better performance

## 🎯 Key Pages & Features

### 📈 Enhanced Dashboard
- **Interactive Charts**: Multiple chart types with drill-down capabilities
- **Real-time Analytics**: Live updates as new data is added
- **AI-Generated Insights**: Automated spending analysis and recommendations
- **Time Range Filtering**: View data across different time periods
- **Export Functionality**: Download data for external analysis

### 💬 AI Financial Assistant
- **Natural Language Interface**: Chat with your AI advisor in plain English
- **Contextual Responses**: AI understands your financial situation and history
- **Personalized Advice**: Recommendations tailored to your spending patterns
- **Quick Prompts**: Pre-built questions for common financial queries
- **Real-time Analysis**: Instant insights based on your latest data

### 📱 Responsive Design
- **Mobile-First**: Optimized for all device sizes
- **Touch-Friendly**: Intuitive touch interactions for mobile users
- **Adaptive Navigation**: Smart navigation that works on any screen size
- **Progressive Enhancement**: Core features work on all devices

### 🔐 Security Features
- **Two-Factor Authentication**: Optional 2FA setup with QR codes
- **Secure Sessions**: Automatic token refresh and session management
- **Data Encryption**: All sensitive data is encrypted at rest and in transit
- **Privacy Controls**: Granular control over data sharing and visibility

## 🚀 Deployment

### Frontend Deployment
The application can be deployed to any static hosting service:
- **Netlify** (recommended)
- **Vercel**
- **AWS S3 + CloudFront**

### Backend Services
- **Database**: Hosted on Supabase
- **Edge Functions**: Deployed via Supabase CLI
- **File Storage**: Supabase Storage for user avatars

## 📈 Performance & Optimization

- **Code Splitting**: Automatic code splitting with Vite
- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: Responsive images with proper sizing
- **Efficient Caching**: Smart data caching and state management
- **Bundle Optimization**: Tree shaking and minification
- **Real-time Updates**: Efficient real-time data synchronization

## 🧪 Testing

### Test Payment Cards
For testing Stripe integration:
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000 0000 0000 9995

Use any future expiry date and any 3-digit CVC.

## 📱 Mobile Experience

- **Responsive Charts**: Charts adapt to mobile screen sizes
- **Touch Interactions**: Optimized touch targets and gestures
- **Mobile Navigation**: Slide-out navigation menu for mobile
- **Offline Capability**: Core features work offline with sync when online
- **Push Notifications**: Optional notifications for spending alerts

## 🔮 Roadmap

### Upcoming Features
- **Bank Integration**: Connect bank accounts for automatic transaction import
- **Investment Tracking**: Portfolio management and investment analytics
- **Bill Reminders**: Automated bill tracking and payment reminders
- **Family Sharing**: Shared budgets and expense tracking for families
- **Advanced Reporting**: Custom reports and data export options
- **Machine Learning**: Enhanced AI predictions and recommendations

### Technical Improvements
- **Offline Support**: Full offline functionality with background sync
- **Performance Optimization**: Further speed and efficiency improvements
- **Enhanced Security**: Additional security features and compliance
- **API Development**: Public API for third-party integrations

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Contact support at support@smartsaver.com
- Check the documentation and FAQ sections

---
Live Demo : https://gleeful-heliotrope-e1d39b.netlify.app/

Built with ❤️ using React, TypeScript, Supabase, Stripe, and advanced AI analytics.

**Experience the future of personal finance management with SmartSaver!**
