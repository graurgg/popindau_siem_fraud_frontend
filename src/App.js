import React, { useState, useEffect } from 'react';
import './App.css';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import FraudChart from './components/FraudChart';
import api from './services/api';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTransactions();
      setTransactions(data);
    } catch (err) {
      setError('Failed to fetch transactions. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSubmit = async (transactionData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.submitTransaction(transactionData);
      setTransactions(prevTransactions => [result, ...prevTransactions]);
    } catch (err) {
      setError('Failed to submit transaction. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fraud Detection System</h1>
        <p>Real-time Transaction Monitoring</p>
      </header>
      
      <main className="App-main">
        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading-message">Loading...</div>}
        
        <div className="content-grid">
          <div className="form-section">
            <TransactionForm onSubmit={handleTransactionSubmit} />
          </div>
          
          <div className="chart-section">
            <FraudChart data={transactions} />
          </div>
        </div>
        
        <div className="list-section">
          <TransactionList transactions={transactions} />
        </div>
      </main>
      
      <footer className="App-footer">
        <p>&copy; 2025 Fraud Detection System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
