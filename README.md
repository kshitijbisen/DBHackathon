# Personal Finance Manager with Investment Tracker

A comprehensive financial management application built with React, Node.js, and SQLite, featuring real-time investment tracking, expense management, and financial goal setting.

![Dashboard Preview](https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1200)

## Features

- 📊 Real-time financial dashboard
- 💰 Income and expense tracking
- 📈 Investment portfolio management
- 🎯 Financial goal setting and tracking
- 📱 Responsive design for all devices
- 🔄 Real-time data updates
- 📊 Visual data representation with charts

## Quick Start

### Local Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd personal-finance-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Cloud Deployment

#### Deploy to Netlify

1. Fork this repository
2. Sign up for [Netlify](https://www.netlify.com)
3. Create new site from Git
4. Connect to your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Deploy!

## Project Structure

```
personal-finance-manager/
├── src/
│   ├── components/         # React components
│   ├── api/               # API integration
│   ├── types/             # TypeScript types
│   └── assets/            # Static assets
├── server/                # Backend server
└── public/                # Public assets
```

## Tech Stack

- **Frontend**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Recharts
  - React Query
  - Lucide Icons

- **Backend**
  - Node.js
  - Express
  - SQLite (via @vlcn.io/crsqlite-wasm)

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Environment Setup

No additional environment variables are required for local development.

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
```

## API Documentation

### Transactions

- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction

### Investments

- `GET /api/investments` - Get all investments
- `POST /api/investments` - Add new investment

### Goals

- `GET /api/goals` - Get all financial goals
- `POST /api/goals` - Create new goal

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository.