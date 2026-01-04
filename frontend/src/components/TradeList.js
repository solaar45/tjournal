import React from 'react';
import './TradeList.css';

const TradeList = ({ trades, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return `${parseFloat(price).toFixed(2)} €`;
  };

  const calculatePnL = (trade) => {
    if (!trade.exitprice || !trade.entryprice) return null;
    const pnl = (parseFloat(trade.exitprice) - parseFloat(trade.entryprice)) * trade.shares;
    return pnl;
  };

  const formatPnL = (pnl) => {
    if (pnl === null) return '-';
    const formatted = pnl.toFixed(2);
    const className = pnl >= 0 ? 'pnl-positive' : 'pnl-negative';
    return <span className={className}>{pnl >= 0 ? '+' : ''}{formatted} €</span>;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      open: { label: 'Offen', className: 'status-open' },
      closed: { label: 'Geschlossen', className: 'status-closed' },
      pending: { label: 'Ausstehend', className: 'status-pending' }
    };
    const { label, className } = statusMap[status] || { label: status, className: '' };
    return <span className={`status-badge ${className}`}>{label}</span>;
  };

  if (!trades || trades.length === 0) {
    return (
      <div className="no-trades">
        <p>Keine Trades vorhanden. Erstelle deinen ersten Trade!</p>
      </div>
    );
  }

  return (
    <div className="trade-list-container">
      <table className="trade-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Typ</th>
            <th>Seite</th>
            <th>Status</th>
            <th>Anzahl</th>
            <th>Einstieg</th>
            <th>Einstiegspreis</th>
            <th>Ausstieg</th>
            <th>Ausstiegspreis</th>
            <th>P&L</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id}>
              <td className="symbol-cell">{trade.symbol}</td>
              <td>{trade.type}</td>
              <td>
                <span className={`side-badge ${trade.side.toLowerCase()}`}>
                  {trade.side}
                </span>
              </td>
              <td>{getStatusBadge(trade.status)}</td>
              <td>{trade.shares}</td>
              <td>{formatDate(trade.entrydate)}</td>
              <td>{formatPrice(trade.entryprice)}</td>
              <td>{formatDate(trade.exitdate)}</td>
              <td>{formatPrice(trade.exitprice)}</td>
              <td>{formatPnL(calculatePnL(trade))}</td>
              <td className="actions-cell">
                <button
                  onClick={() => onEdit(trade)}
                  className="btn-edit"
                  title="Bearbeiten"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(trade.id)}
                  className="btn-delete"
                  title="Löschen"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradeList;
