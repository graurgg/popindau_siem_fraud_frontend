// components/TransactionList.jsx
import React from 'react'

const TransactionList = ({ transactions, loading, error }) => {
  if (loading) {
    return (
      <div className="loading">
        <p>Loading transactions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error">
        <span>{error}</span>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="loading">
        <p>No transactions found</p>
      </div>
    )
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleString()
  }

  return (
    <div className="transaction-list-container">
      <h2>Recent Transactions</h2>
      <div className="transaction-list">
        {transactions.map(transaction => (
          <div
            key={transaction.id}
            className={`transaction-item ${transaction.status}`}
          >
            <div className="transaction-info">
              <div className="transaction-amount">
                {formatAmount(transaction.amount)}
              </div>
              <div className="transaction-merchant">
                {transaction.merchant}
              </div>
              <div className="transaction-location">
                {transaction.location}
              </div>
              <div className="transaction-time">
                {formatTime(transaction.time)}
              </div>
            </div>
            <div className={`transaction-status status-${transaction.status}`}>
              {transaction.status === 'fraud' ? 'Fraud' : 'Legitimate'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TransactionList