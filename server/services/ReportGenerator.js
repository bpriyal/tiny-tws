/**
 * Report Generator Module
 * Creates different types of reports from position and account data
 */

class ReportGenerator {
  /**
   * Report 1: Portfolio Summary Report
   * Shows overall account metrics and allocation
   */
  static portfolioSummary(accountData, pnlData) {
    const totalValue = accountData.netLiquidation;
    const positionsValue = pnlData.positions.reduce(
      (sum, p) => sum + (p.currentPrice * p.quantity),
      0
    );

    const allocation = pnlData.positions.map(p => ({
      symbol: p.symbol,
      value: p.currentPrice * p.quantity,
      percentage: ((p.currentPrice * p.quantity) / totalValue) * 100
    }));

    return {
      reportType: 'PORTFOLIO_SUMMARY',
      generatedAt: new Date(),
      summary: {
        totalAccountValue: totalValue,
        positionsValue: positionsValue,
        cashAvailable: accountData.totalCashValue,
        buyingPower: accountData.buyingPower,
        allocation
      }
    };
  }

  /**
   * Report 2: PnL Comparison Report
   * Shows realized vs unrealized PnL, position-level PnL
   */
  static pnlComparison(pnlData) {
    const positions = pnlData.positions.map(p => ({
      symbol: p.symbol,
      quantity: p.quantity,
      unrealizedPnL: p.unrealizedPnL,
      unrealizedPnLPct: p.unrealizedPnLPct,
      avgEntry: p.avgCost,
      currentPrice: p.currentPrice
    }));

    const totalUnrealized = pnlData.totalUnrealizedPnL;
    const totalRealized = pnlData.totalRealizedPnL;
    const combinedPnL = totalUnrealized + totalRealized;

    return {
      reportType: 'PNL_COMPARISON',
      generatedAt: new Date(),
      summary: {
        unrealizedPnL: totalUnrealized,
        realizedPnL: totalRealized,
        combinedPnL: combinedPnL,
        topGainers: positions.sort((a, b) => b.unrealizedPnL - a.unrealizedPnL).slice(0, 3),
        topLosers: positions.sort((a, b) => a.unrealizedPnL - b.unrealizedPnL).slice(0, 3)
      }
    };
  }

  /**
   * Report 3: Risk Exposure Report
   * Shows position concentration and risk metrics
   */
  static riskExposure(accountData, pnlData) {
    const positions = pnlData.positions;
    const totalPortfolioValue = accountData.netLiquidation;

    const exposure = positions.map(p => {
      const positionValue = p.currentPrice * p.quantity;
      const weight = (positionValue / totalPortfolioValue) * 100;
      
      return {
        symbol: p.symbol,
        weight: weight,
        notional: positionValue,
        deltaValue: p.unrealizedPnL,
        leverage: weight > 10 ? 'HIGH' : weight > 5 ? 'MEDIUM' : 'LOW'
      };
    });

    const highRiskPositions = exposure.filter(e => e.leverage === 'HIGH').length;
    const concentrationRatio = Math.max(...exposure.map(e => e.weight));

    return {
      reportType: 'RISK_EXPOSURE',
      generatedAt: new Date(),
      summary: {
        exposure,
        metrics: {
          highRiskCount: highRiskPositions,
          maxConcentration: concentrationRatio,
          diversification: exposure.length > 0 ? 'ADEQUATE' : 'NONE',
          overallRiskLevel: concentrationRatio > 25 ? 'HIGH' : concentrationRatio > 15 ? 'MEDIUM' : 'LOW'
        }
      }
    };
  }
}

module.exports = ReportGenerator;
