/**
 * Main Express Server
 * Entry point for the Trader Workstation backend
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const IBKRConnector = require('./connectors/IBKRConnector');
const ReportGenerator = require('./services/ReportGenerator');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize IBKR Connector
const ibkrConnector = new IBKRConnector({
  host: process.env.IBKR_HOST,
  port: process.env.IBKR_PORT,
  clientId: process.env.IBKR_CLIENT_ID
});

// Initialize Report Generator
const reportGenerator = ReportGenerator;

// Routes
app.use('/api/v1', apiRoutes(ibkrConnector, reportGenerator));

// Health check
app.get('/', (req, res) => {
  res.json({
    name: 'Tiny Trader Workstation',
    version: '0.1.0',
    status: 'running',
    endpoints: [
      'POST /api/v1/connect',
      'GET /api/v1/health',
      'GET /api/v1/account-summary',
      'GET /api/v1/positions',
      'GET /api/v1/reports/portfolio-summary',
      'GET /api/v1/reports/pnl-comparison',
      'GET /api/v1/reports/risk-exposure'
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Trader Workstation API running on http://localhost:${PORT}`);
  console.log(`📊 Initial IBKR connection required: POST http://localhost:${PORT}/api/v1/connect`);
});

module.exports = app;
