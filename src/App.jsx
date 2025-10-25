import React, { useState, useEffect } from 'react'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import FraudChart from './components/FraudChart'
import { getTransactions } from './services/api'
import './App.css'

function App() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const data = await getTransactions()
      setTransactions(data)
      setError('')
    } catch (err) {
      setError('Failed to fetch transactions. Make sure backend is running on port 8000.')
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
    
    // Refresh transactions every 10 seconds
    const interval = setInterval(fetchTransactions, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleTransactionCreated = (newTransaction) => {
    setTransactions(prev => [newTransaction, ...prev])
    // Refresh the list to get any updates
    setTimeout(fetchTransactions, 1000)
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Popindau Fraud Detection System</h1>
        <p>Real-time transaction monitoring and fraud detection</p>
      </div>

      <div className="dashboard">
        {error && (
          <div className="error">
            {error}
            <button onClick={fetchTransactions} style={{marginLeft: '10px'}}>
              Retry
            </button>
          </div>
        )}
        
        <div className="card">
          <h2>New Transaction</h2>
          <TransactionForm onTransactionCreated={handleTransactionCreated} />
        </div>

        <div className="card">
          <h2>Recent Transactions</h2>
          {loading ? (
            <div className="loading">Loading transactions...</div>
          ) : (
            <TransactionList transactions={transactions} />
          )}
        </div>

        <div className="card full-width">
          <h2>Fraud Analytics</h2>
          <FraudChart transactions={transactions} />
        </div>
      </div>
    </div>
  )
}

export default App