import React, { useState, useEffect, useRef } from 'react';

/**
 * Component for displaying transaction list with fraud detection status
 */
const TransactionList = ({ transactions = [], loading, error }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [newTransactionsCount, setNewTransactionsCount] = useState(0);
  const prevTxCountRef = useRef(0);
  const MAX_DISPLAY_COUNT = 20;

  // === Notification count handling ===
  useEffect(() => {
    if (!isCollapsed) {
      setNewTransactionsCount(0);
      prevTxCountRef.current = transactions.length;
    }
  }, [isCollapsed, transactions.length]);

  useEffect(() => {
    const currentCount = transactions.length;
    if (isCollapsed && prevTxCountRef.current > 0) {
      const newItems = currentCount - prevTxCountRef.current;
      if (newItems > 0) {
        setNewTransactionsCount(prev => prev + newItems);
      }
    }
    prevTxCountRef.current = currentCount;
  }, [transactions, isCollapsed]);

  const handleToggle = () => setIsCollapsed(!isCollapsed);

  // === Generate unique key for each transaction ===
  const generateTransactionKey = (tx, index) => {
    // Use trans_num + timestamp for uniqueness, fallback to index
    const baseKey = tx.trans_num || 'unknown';
    const timestamp = tx.timestamp || tx._original?.timestamp || index;
    return `${baseKey}-${timestamp}-${index}`;
  };

  // === Fraud detection logic ===
  const getTransactionStatus = (tx) => {
    // Use the status from transaction data if available, otherwise calculate
    if (tx.status) return tx.status;
    
    const amount = parseFloat(tx.amount || 0);
    
    // Rule 1: High amount transactions
    if (amount > 500) return 'FRAUDA';
    
    // Rule 2: Specific fraudulent merchants
    if (tx.merchant && tx.merchant.toLowerCase().includes('fraud')) return 'FRAUDA';
    
    // Rule 3: Suspicious categories
    const suspiciousCategories = ['gambling', 'cash_advance'];
    if (tx.category && suspiciousCategories.includes(tx.category)) return 'ALERT';
    
    // Rule 4: Shopping net with high amount
    if (tx.category === 'shopping_net' && amount > 300) return 'ALERT';
    
    return 'LEGITIM';
  };

  const getStatusColor = (status) => {
    const s = status?.toUpperCase();
    if (s === 'FRAUDA') return '#ef4444';
    if (s === 'ALERT') return '#f59e0b';
    if (s === 'LEGITIM') return '#4CAF50';
    return '#a0a0a0'; // Default color for unknown status
  };

  const formatTransactionId = (tx) => {
    return tx.trans_num || tx.transaction_id || 'Unknown ID';
  };

  const formatCustomerName = (tx) => {
    if (tx.first && tx.last) return `${tx.first} ${tx.last}`;
    if (tx.customer_name) return tx.customer_name;
    return 'Unknown Customer';
  };

  const formatDateTime = (tx) => {
    if (tx.timestamp) {
      const date = new Date(tx.timestamp * 1000); // Convert to milliseconds
      return date.toLocaleString('ro-RO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    if (tx.trans_date && tx.trans_time) {
      return `${tx.trans_date} ${tx.trans_time.substring(0, 5)}`;
    }
    return 'Unknown Date';
  };

  const formatAmount = (tx) => {
    const amount = parseFloat(tx.amount || 0);
    return amount.toFixed(2);
  };

  const formatCategory = (tx) => {
    return tx.category || 'Unknown';
  };

  const formatMerchant = (tx) => {
    return tx.merchant || 'Unknown Merchant';
  };

  const recentTransactions = transactions
    .slice(-MAX_DISPLAY_COUNT)
    .reverse();

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div style={{ padding: '15px', backgroundColor: '#202230', borderRadius: '8px' }}>
      {/* Header */}
      <div
        onClick={handleToggle}
        style={{
          color: '#e0e0e0',
          marginBottom: '15px',
          fontSize: '1.5rem',
          borderBottom: '2px solid #3b3d52',
          paddingBottom: '10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span
          style={{
            transition: 'transform 0.2s',
            transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
            marginRight: '10px',
            color: '#4299e1'
          }}
        >
          ►
        </span>

        <h2 style={{ margin: 0, flexGrow: 1, fontSize: '1.5rem' }}>
          Tranzacții Recente ({transactions.length})
        </h2>

        {newTransactionsCount > 0 && isCollapsed && (
          <span
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 8px',
              fontSize: '0.8rem',
              marginLeft: '10px'
            }}
          >
            {newTransactionsCount}
          </span>
        )}
      </div>

      {!isCollapsed && transactions.length === 0 && (
        <p style={{ color: '#a0a0a0', paddingTop: '10px' }}>
          Nu există tranzacții de afișat.
        </p>
      )}

      {!isCollapsed && recentTransactions.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {/* Table Header */}
          <li
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
              fontWeight: 'bold',
              color: '#a0a0a0',
              padding: '10px 0',
              borderBottom: '1px solid #3b3d52'
            }}
          >
            <span>Client / Tranzacție</span>
            <span>Data/Ora</span>
            <span style={{ textAlign: 'right' }}>Suma</span>
            <span style={{ textAlign: 'center' }}>Categorie</span>
            <span style={{ textAlign: 'right' }}>Status</span>
          </li>

          {/* Transaction Rows */}
          {recentTransactions.map((tx, index) => {
            const status = getTransactionStatus(tx);
            const amount = parseFloat(tx.amount || 0);

            return (
              <li
                key={generateTransactionKey(tx, index)}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px dashed #3b3d52',
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
                  alignItems: 'center',
                  color: '#ffffff',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#252735')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                {/* Customer and Transaction ID */}
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.95em' }}>
                    {formatCustomerName(tx)}
                  </div>
                  <div style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.8em', 
                    color: '#a0a0a0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {formatTransactionId(tx)}
                  </div>
                  <div style={{ 
                    fontSize: '0.75em', 
                    color: '#888',
                    fontStyle: 'italic'
                  }}>
                    {formatMerchant(tx)}
                  </div>
                </div>

                {/* Date/Time */}
                <span style={{ fontSize: '0.9em', color: '#c0c0c0' }}>
                  {formatDateTime(tx)}
                </span>

                {/* Amount */}
                <span style={{ textAlign: 'right', fontWeight: '600' }}>
                  ${formatAmount(tx)}
                </span>

                {/* Category */}
                <span style={{ 
                  textAlign: 'center', 
                  fontSize: '0.85em',
                  backgroundColor: '#3b3d52',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  textTransform: 'capitalize'
                }}>
                  {formatCategory(tx)}
                </span>

                {/* Status */}
                <span
                  style={{
                    textAlign: 'right',
                    color: getStatusColor(status),
                    fontWeight: '700',
                    fontSize: '0.9em',
                    textTransform: 'uppercase'
                  }}
                >
                  {status}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default TransactionList;