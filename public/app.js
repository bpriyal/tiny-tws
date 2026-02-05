/**
 * Frontend Application Logic
 * Handles UI interactions and API calls
 */

const API_BASE_URL = 'http://localhost:5000/api/v1';
let isConnected = false;
let allocationChart = null;

// DOM Elements
const connectBtn = document.getElementById('connectBtn');
const connectionStatus = document.getElementById('connectionStatus');
const reportButtons = document.querySelectorAll('[data-report]');
const loadingSpinner = document.getElementById('loadingSpinner');
const lastUpdateSpan = document.getElementById('lastUpdate');

// Event Listeners
connectBtn.addEventListener('click', handleConnect);
reportButtons.forEach(btn => {
  btn.addEventListener('click', handleReportSelect);
});

/**
 * Handle IBKR Connection
 */
async function handleConnect() {
  try {
    connectBtn.disabled = true;
    connectBtn.textContent = 'Connecting...';
    
    const response = await fetch(`${API_BASE_URL}/connect`, { method: 'POST' });
    const data = await response.json();
    
    if (response.ok) {
      isConnected = true;
      updateConnectionStatus(true);
      await loadReport('portfolio-summary');
    }
  } catch (error) {
    console.error('Connection error:', error);
    alert('Failed to connect. Ensure IBKR Gateway is running on localhost:4002');
  } finally {
    connectBtn.disabled = false;
    connectBtn.textContent = 'Connected';
  }
}

/**
 * Update Connection Status UI
 */
function updateConnectionStatus(connected) {
  isConnected = connected;
  connectionStatus.classList.toggle('disconnected', !connected);
  connectionStatus.classList.toggle('connected', connected);
  connectionStatus.textContent = connected ? '✓ Connected' : '✗ Disconnected';
  connectBtn.textContent = connected ? '✓ Connected' : 'Connect to IBKR';
}

/**
 * Handle Report Selection
 */
async function handleReportSelect(e) {
  const reportType = e.target.dataset.report;
  
  // Update active button
  reportButtons.forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
  
  // Load and display report
  await loadReport(reportType);
}

/**
 * Load Report Data
 */
async function loadReport(reportType) {
  if (!isConnected) {
    alert('Please connect to IBKR first');
    return;
  }

  showLoading(true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/reports/${reportType}`);
    const data = await response.json();
    
    // Hide all reports, show selected one
    document.querySelectorAll('.report').forEach(r => r.classList.remove('active'));
    document.getElementById(reportType).classList.add('active');
    
    // Render based on report type
    if (reportType === 'portfolio-summary') {
      renderPortfolioSummary(data);
    } else if (reportType === 'pnl-comparison') {
      renderPnLComparison(data);
    } else if (reportType === 'risk-exposure') {
      renderRiskExposure(data);
    }
    
    updateLastUpdate();
  } catch (error) {
    console.error('Error loading report:', error);
    alert('Failed to load report. Check console for details.');
  } finally {
    showLoading(false);
  }
}

/**
 * Render Portfolio Summary Report
 */
function renderPortfolioSummary(data) {
  const summary = data.summary;
  
  // Update metrics
  document.getElementById('netLiq').textContent = formatCurrency(summary.totalAccountValue);
  document.getElementById('totalCash').textContent = formatCurrency(summary.cashAvailable);
  document.getElementById('buyingPower').textContent = formatCurrency(summary.buyingPower);
  
  // Update allocation table
  const tbody = document.querySelector('#allocationTable tbody');
  tbody.innerHTML = summary.allocation.map(item => `
    <tr>
      <td>${item.symbol}</td>
      <td>${formatCurrency(item.value)}</td>
      <td>${item.percentage.toFixed(2)}%</td>
    </tr>
  `).join('');
  
  // Update chart
  const labels = summary.allocation.map(a => a.symbol);
  const values = summary.allocation.map(a => a.percentage);
  
  if (allocationChart) allocationChart.destroy();
  
  const ctx = document.getElementById('allocationChart').getContext('2d');
  allocationChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

/**
 * Render PnL Comparison Report
 */
function renderPnLComparison(data) {
  const summary = data.summary;
  
  // Update metrics
  const unrealizedStyle = summary.unrealizedPnL >= 0 ? 'positive' : 'negative';
  const realizedStyle = summary.realizedPnL >= 0 ? 'positive' : 'negative';
  const combinedStyle = summary.combinedPnL >= 0 ? 'positive' : 'negative';
  
  document.getElementById('unrealizedPnL').textContent = formatCurrency(summary.unrealizedPnL);
  document.getElementById('unrealizedPnL').className = `metric-value ${unrealizedStyle}`;
  
  document.getElementById('realizedPnL').textContent = formatCurrency(summary.realizedPnL);
  document.getElementById('realizedPnL').className = `metric-value ${realizedStyle}`;
  
  document.getElementById('combinedPnL').textContent = formatCurrency(summary.combinedPnL);
  document.getElementById('combinedPnL').className = `metric-value ${combinedStyle}`;
  
  // Update gainers table
  const gainersBody = document.querySelector('#gainersTable tbody');
  gainersBody.innerHTML = summary.topGainers.map(item => `
    <tr>
      <td>${item.symbol}</td>
      <td class="positive">${formatCurrency(item.unrealizedPnL)}</td>
      <td class="positive">${item.unrealizedPnLPct.toFixed(2)}%</td>
    </tr>
  `).join('');
  
  // Update losers table
  const losersBody = document.querySelector('#losersTable tbody');
  losersBody.innerHTML = summary.topLosers.map(item => `
    <tr>
      <td>${item.symbol}</td>
      <td class="negative">${formatCurrency(item.unrealizedPnL)}</td>
      <td class="negative">${item.unrealizedPnLPct.toFixed(2)}%</td>
    </tr>
  `).join('');
}

/**
 * Render Risk Exposure Report
 */
function renderRiskExposure(data) {
  const metrics = data.summary.metrics;
  
  // Update metrics
  document.getElementById('overallRisk').textContent = metrics.overallRiskLevel;
  document.getElementById('maxConcentration').textContent = `${metrics.maxConcentration.toFixed(2)}%`;
  document.getElementById('highRiskCount').textContent = metrics.highRiskCount;
  
  // Update exposure table
  const tbody = document.querySelector('#exposureTable tbody');
  tbody.innerHTML = data.summary.exposure.map(item => `
    <tr>
      <td>${item.symbol}</td>
      <td>${item.weight.toFixed(2)}%</td>
      <td>${formatCurrency(item.notional)}</td>
      <td><span class="badge ${item.leverage.toLowerCase()}">${item.leverage}</span></td>
    </tr>
  `).join('');
}

/**
 * Utility: Format currency
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Show/Hide Loading Spinner
 */
function showLoading(show) {
  loadingSpinner.classList.toggle('hidden', !show);
}

/**
 * Update Last Updated Timestamp
 */
function updateLastUpdate() {
  const now = new Date();
  lastUpdateSpan.textContent = now.toLocaleTimeString();
}

// Auto-connect on page load (optional)
window.addEventListener('load', () => {
  console.log('🚀 Trader Workstation UI loaded');
  console.log('Click "Connect to IBKR" to get started');
});
