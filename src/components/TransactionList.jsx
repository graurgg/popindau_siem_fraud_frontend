import React from 'react'

const TransactionList = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="loading" style={{textAlign: 'center', padding: '40px'}}>
        No transactions found. Submit a transaction to get started.
      </div>
    )
  }

  return (
    <div className="transaction-list">
      {transactions.map((transaction) => (
        <div
          key={transaction.id || transaction.transaction_id}
          className={`transaction-item ${
            transaction.is_fraud ? 'fraud' : 'legitimate'
          }`}
        >
          <div className="transaction-info">
            <div className="transaction-amount">
              {transaction.amount} {transaction.currency}
            </div>
            <div className="transaction-merchant">
              {transaction.merchant} • Customer: {transaction.customer_id}
            </div>
            <div className="transaction-location">
              {transaction.location} • {transaction.device}
            </div>
            <div className="transaction-time">
              {new Date(transaction.timestamp || transaction.processed_at).toLocaleString()}
            </div>
          </div>
          <div
            className={`transaction-status ${
              transaction.is_fraud ? 'status-fraud' : 'status-legitimate'
            }`}
          >
            {transaction.is_fraud ? 'FRAUD' : 'OK'}
            {transaction.confidence && (
              <div style={{fontSize: '12px', marginTop: '5px'}}>
                {Math.round(transaction.confidence * 100)}% confidence
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TransactionList