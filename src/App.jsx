// App.jsx
import React, { useState, useEffect } from 'react'
import TransactionList from './components/TransactionList'
import { getTransactions } from './services/api' // Adjust the import path
import './App.css'

function App() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getTransactions()
        setTransactions(data)
      } catch (err) {
        setError('Failed to fetch transactions')
        console.error('Error fetching transactions:', err)
      } finally {
        setLoading(false)
      }
    }
    
    loadTransactions()
  }, [])

  return (
    <div className="app">
      <header className="header">
        <h1>SIEM Fraud Detection Dashboard</h1>
        <p>Real-time transaction monitoring and fraud analysis</p>
      </header>
      
      <div className="dashboard">
        <div className="card full-width">
          <TransactionList transactions={transactions} loading={loading} error={error} />
        </div>
      </div>
    </div>
  )
}

export default App