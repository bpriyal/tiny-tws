# Tiny Trader Workstation
A minimal, modular trader workstation built with IBKR API integration. For portfolio presentation and exploring real-time trading data visualization.

## Features

- Portfolio Summary, PnL Comparison, Risk Exposure
- Fetch positions, account metrics, and valuations from IBKR
- Separated connectors, services, and routes for extensibility
- Chart.js visualizations and responsive design

## Project Structure

```
tiny-tws/
├── server/
│   ├── index.js                 # Express server entry point
│   ├── connectors/
│   │   └── IBKRConnector.js     # IBKR API integration
│   ├── services/
│   │   └── ReportGenerator.js   # Report business logic
│   └── routes/
│       └── api.js               # API endpoints
├── public/
│   ├── index.html               # Frontend UI
│   ├── app.js                   # Client-side logic
│   └── styles.css               # Styling
├── package.json
├── .env.example
└── README.md
```

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript + Chart.js
- **Integration**: IBKR Gateway API
- **Styling**: CSS3 (Dark theme)

## Getting Started

### Prerequisites

1. Install [Node.js](https://nodejs.org/) (v14+)
2. Download and run [IBKR Gateway](https://www.interactivebrokers.com/en/trading/tws.php)
   - Configure to listen on `localhost:4002`
   - Use default client ID: `1`

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/tiny-tws.git
cd tiny-tws

# Install dependencies
npm install

# Setup environment
cp .env.example .env
```

### Running the Application

```bash
# Terminal 1: Start backend server
npm start

# Terminal 2: Open frontend in browser
open http://localhost:5000
```

### Development Mode

```bash
npm run dev  # Uses nodemon for auto-reload
```

## API Endpoints

### Health & Connection
- `POST /api/v1/connect` - Establish IBKR connection
- `GET /api/v1/health` - Check API status

### Account Data
- `GET /api/v1/account-summary` - Account metrics
- `GET /api/v1/positions` - Current positions

### Reports
- `GET /api/v1/reports/portfolio-summary` - Account allocation
- `GET /api/v1/reports/pnl-comparison` - Realized vs. unrealized PnL
- `GET /api/v1/reports/risk-exposure` - Position concentration & risk

## Configuration

Edit `.env` file to customize:


```env
IBKR_HOST=127.0.0.1      # IBKR Gateway host
IBKR_PORT=4002           # IBKR Gateway port
IBKR_CLIENT_ID=1         # Client identifier
SERVER_PORT=5000         # Backend server port
NODE_ENV=development     # Development/production
```
