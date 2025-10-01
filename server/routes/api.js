/**
 * API Routes for Trader Workstation
 * Handles report generation and data fetching endpoints
 */

const express = require('express');
const router = express.Router();

module.exports = (ibkrConnector, reportGenerator) => {
  /**
   * GET /api/v1/health
   * Check IBKR connection and API status
   */
  router.get('/health', async (req, res) => {
    try {
      return res.json({
        status: 'healthy',
        ibkrConnected: ibkrConnector.connected,
        timestamp: new Date()
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/v1/connect
   * Establish connection to IBKR
   */
  router.post('/connect', async (req, res) => {
    try {
      const result = await ibkrConnector.connect();
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/v1/reports/portfolio-summary
   * Report 1: Portfolio Summary
   */
  router.get('/reports/portfolio-summary', async (req, res) => {
    try {
      const accountData = await ibkrConnector.getAccountSummary();
      const pnlData = await ibkrConnector.getPortfolioPnL();
      const report = reportGenerator.portfolioSummary(accountData, pnlData);
      
      return res.json(report);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/v1/reports/pnl-comparison
   * Report 2: PnL Comparison
   */
  router.get('/reports/pnl-comparison', async (req, res) => {
    try {
      const pnlData = await ibkrConnector.getPortfolioPnL();
      const report = reportGenerator.pnlComparison(pnlData);
      
      return res.json(report);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/v1/reports/risk-exposure
   * Report 3: Risk Exposure
   */
  router.get('/reports/risk-exposure', async (req, res) => {
    try {
      const accountData = await ibkrConnector.getAccountSummary();
      const pnlData = await ibkrConnector.getPortfolioPnL();
      const report = reportGenerator.riskExposure(accountData, pnlData);
      
      return res.json(report);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/v1/positions
   * Get all current positions
   */
  router.get('/positions', async (req, res) => {
    try {
      const positions = await ibkrConnector.getPositions();
      return res.json({
        positions,
        count: positions.length,
        timestamp: new Date()
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/v1/account-summary
   * Get account metrics
   */
  router.get('/account-summary', async (req, res) => {
    try {
      const accountData = await ibkrConnector.getAccountSummary();
      return res.json(accountData);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
};
