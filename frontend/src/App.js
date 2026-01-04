import React, { useState, useEffect } from 'react';
import './App.css';
import tradesApi from './api/tradesApi';
import TradeList from './components/TradeList';
import TradeForm from './components/TradeForm';

function App() {
  const [trades, setTrades] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);

  // Load trades on component mount
  useEffect(() => {
    loadTrades();
    loadStatistics();
  }, []);

  const loadTrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tradesApi.getAllTrades();
      setTrades(data);
    } catch (err) {
      console.error('Error loading trades:', err);
      setError('Fehler beim Laden der Trades. Stelle sicher, dass das Backend läuft.');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await tradesApi.getStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  const handleCreateTrade = () => {
    setEditingTrade(null);
    setShowForm(true);
  };

  const handleEditTrade = (trade) => {
    setEditingTrade(trade);
    setShowForm(true);
  };

  const handleDeleteTrade = async (id) => {
    if (!window.confirm('Möchtest du diesen Trade wirklich löschen?')) {
      return;
    }

    try {
      await tradesApi.deleteTrade(id);
      await loadTrades();
      await loadStatistics();
    } catch (err) {
      console.error('Error deleting trade:', err);
      alert('Fehler beim Löschen des Trades.');
    }
  };

  const handleSubmitTrade = async (tradeData) => {
    try {
      if (editingTrade) {
        await tradesApi.updateTrade(editingTrade.id, tradeData);
      } else {
        await tradesApi.createTrade(tradeData);
      }
      
      setShowForm(false);
      setEditingTrade(null);
      await loadTrades();
      await loadStatistics();
    } catch (err) {
      console.error('Error saving trade:', err);
      alert('Fehler beim Speichern des Trades.');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTrade(null);
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '-';
    return `${parseFloat(value).toFixed(2)} €`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>📊 Trading Journal</h1>
          <button onClick={handleCreateTrade} className="btn-primary">
            + Neuer Trade
          </button>
        </div>
      </header>

      <main className="main-content">
        {/* Statistics Dashboard */}
        {statistics && (
          <div className="statistics-grid">
            <div className="stat-card">
              <div className="stat-label">Gesamt Trades</div>
              <div className="stat-value">{statistics.total_trades || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Gewinn Trades</div>
              <div className="stat-value stat-positive">
                {statistics.winning_trades || 0}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Verlust Trades</div>
              <div className="stat-value stat-negative">
                {statistics.losing_trades || 0}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Gesamt P&L</div>
              <div className={`stat-value ${(statistics.total_pnl || 0) >= 0 ? 'stat-positive' : 'stat-negative'}`}>
                {formatCurrency(statistics.total_pnl)}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Ø P&L pro Trade</div>
              <div className={`stat-value ${(statistics.avg_pnl || 0) >= 0 ? 'stat-positive' : 'stat-negative'}`}>
                {formatCurrency(statistics.avg_pnl)}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Win Rate</div>
              <div className="stat-value">
                {statistics.total_trades > 0
                  ? `${((statistics.winning_trades / statistics.total_trades) * 100).toFixed(1)}%`
                  : '0%'}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <button onClick={loadTrades} className="btn-retry">
              Erneut versuchen
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading">
            <p>Lade Trades...</p>
          </div>
        )}

        {/* Trades Table */}
        {!loading && !error && (
          <TradeList
            trades={trades}
            onEdit={handleEditTrade}
            onDelete={handleDeleteTrade}
          />
        )}
      </main>

      {/* Trade Form Modal */}
      {showForm && (
        <TradeForm
          trade={editingTrade}
          onSubmit={handleSubmitTrade}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
}

export default App;
