const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * API service for handling communication with the backend
 */
const api = {
  /**
   * Submit a new transaction for fraud detection
   * @param {Object} transactionData - Transaction data to submit
   * @returns {Promise} Response from the API
   */
  submitTransaction: async (transactionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting transaction:', error);
      throw error;
    }
  },

  /**
   * Fetch all transactions
   * @returns {Promise} List of transactions
   */
  getTransactions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  /**
   * Get fraud statistics
   * @returns {Promise} Fraud statistics data
   */
  getFraudStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching fraud stats:', error);
      throw error;
    }
  },
};

export default api;
