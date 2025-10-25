import React from 'react';

const TransactionList = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <div className="transaction-list">No transactions to display.</div>;
  }

  return (
    <div className="transaction-list">
      <h2>Transaction History</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Merchant</th>
            <th>Category</th>
            <th>Location</th>
            <th>Status</th>
            <th>Fraud Score</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr 
              key={transaction.id}
              className={transaction.isFraudulent ? 'fraud-detected' : ''}
            >
              <td>{transaction.id}</td>
              <td>${transaction.amount?.toFixed(2)}</td>
              <td>{transaction.merchant}</td>
              <td>{transaction.category}</td>
              <td>{transaction.location}</td>
              <td>
                <span className={`status ${transaction.isFraudulent ? 'fraud' : 'legitimate'}`}>
                  {transaction.isFraudulent ? 'Fraud' : 'Legitimate'}
                </span>
              </td>
              <td>{transaction.fraudScore ? `${(transaction.fraudScore * 100).toFixed(1)}%` : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
