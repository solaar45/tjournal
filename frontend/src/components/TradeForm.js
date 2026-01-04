import React, { useState, useEffect } from 'react';
import './TradeForm.css';

const TradeForm = ({ trade, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    symbol: '',
    type: 'Aktie',
    status: 'open',
    shares: '',
    side: 'Long',
    entrydate: '',
    entryprice: '',
    exitdate: '',
    exitprice: '',
    notes: ''
  });

  useEffect(() => {
    if (trade) {
      setFormData({
        symbol: trade.symbol || '',
        type: trade.type || 'Aktie',
        status: trade.status || 'open',
        shares: trade.shares || '',
        side: trade.side || 'Long',
        entrydate: trade.entrydate || '',
        entryprice: trade.entryprice || '',
        exitdate: trade.exitdate || '',
        exitprice: trade.exitprice || '',
        notes: trade.notes || ''
      });
    }
  }, [trade]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert numeric fields
    const submitData = {
      ...formData,
      shares: parseInt(formData.shares, 10),
      entryprice: parseFloat(formData.entryprice),
      exitprice: formData.exitprice ? parseFloat(formData.exitprice) : null,
      exitdate: formData.exitdate || null
    };

    onSubmit(submitData);
  };

  return (
    <div className="trade-form-overlay">
      <div className="trade-form-container">
        <h2>{trade ? 'Trade bearbeiten' : 'Neuen Trade erstellen'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="symbol">Symbol *</label>
              <input
                type="text"
                id="symbol"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                required
                placeholder="z.B. AAPL"
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Typ *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="Aktie">Aktie</option>
                <option value="Zertifikat">Zertifikat</option>
                <option value="Optionsschein">Optionsschein</option>
                <option value="Krypto">Krypto</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="side">Seite *</label>
              <select
                id="side"
                name="side"
                value={formData.side}
                onChange={handleChange}
                required
              >
                <option value="Long">Long</option>
                <option value="Short">Short</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="open">Offen</option>
                <option value="closed">Geschlossen</option>
                <option value="pending">Ausstehend</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="shares">Anzahl *</label>
              <input
                type="number"
                id="shares"
                name="shares"
                value={formData.shares}
                onChange={handleChange}
                required
                min="1"
                placeholder="100"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="entrydate">Einstiegsdatum *</label>
              <input
                type="date"
                id="entrydate"
                name="entrydate"
                value={formData.entrydate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="entryprice">Einstiegspreis *</label>
              <input
                type="number"
                id="entryprice"
                name="entryprice"
                value={formData.entryprice}
                onChange={handleChange}
                required
                step="0.01"
                min="0.01"
                placeholder="150.50"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="exitdate">Ausstiegsdatum</label>
              <input
                type="date"
                id="exitdate"
                name="exitdate"
                value={formData.exitdate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="exitprice">Ausstiegspreis</label>
              <input
                type="number"
                id="exitprice"
                name="exitprice"
                value={formData.exitprice}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                placeholder="160.00"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notizen</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Optionale Notizen zum Trade..."
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Abbrechen
            </button>
            <button type="submit" className="btn-submit">
              {trade ? 'Speichern' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeForm;
