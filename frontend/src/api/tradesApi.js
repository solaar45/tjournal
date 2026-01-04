import axios from 'axios';

// In development, use the proxy configured in package.json
// In production, use the environment variable or fallback
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? (process.env.REACT_APP_API_URL || '/api')
  : '/api';

const tradesApi = {
  // Get all trades
  getAllTrades: async () => {
    const response = await axios.get(`${API_BASE_URL}/trades`);
    return response.data.data;
  },

  // Get single trade by ID
  getTrade: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/trades/${id}`);
    return response.data.data;
  },

  // Create new trade
  createTrade: async (tradeData) => {
    const response = await axios.post(`${API_BASE_URL}/trades`, {
      trade: tradeData
    });
    return response.data.data;
  },

  // Update existing trade
  updateTrade: async (id, tradeData) => {
    const response = await axios.put(`${API_BASE_URL}/trades/${id}`, {
      trade: tradeData
    });
    return response.data.data;
  },

  // Delete trade
  deleteTrade: async (id) => {
    await axios.delete(`${API_BASE_URL}/trades/${id}`);
  },

  // Get statistics
  getStatistics: async () => {
    const response = await axios.get(`${API_BASE_URL}/trades/statistics`);
    return response.data.data;
  }
};

export default tradesApi;
