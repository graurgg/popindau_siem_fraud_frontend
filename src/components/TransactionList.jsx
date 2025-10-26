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

  // === Updated Fraud detection logic based on fraud_detection data ===
  const getTransactionStatus = (tx) => {
    // Use the fraud_detection data if available
    if (tx.fraud_detection) {
      const fraudProbability = tx.fraud_detection.fraud_probability || 0;
      
      if (fraudProbability >= 0.15) return 'FRAUD';
      if (fraudProbability >= 0.1) return 'ALERT';
      return 'LEGITIMATE';
    }
    
    // Fallback to old logic if no fraud_detection data
    const amount = parseFloat(tx.amount || 0);
    
    // Rule 1: High amount transactions
    if (amount > 500) return 'FRAUD';
    
    // Rule 2: Specific fraudulent merchants
    if (tx.merchant && tx.merchant.toLowerCase().includes('fraud')) return 'FRAUD';
    
    // Rule 3: Suspicious categories
    const suspiciousCategories = ['gambling', 'cash_advance'];
    if (tx.category && suspiciousCategories.includes(tx.category)) return 'ALERT';
    
    // Rule 4: Shopping net with high amount
    if (tx.category === 'shopping_net' && amount > 300) return 'ALERT';
    
    return 'LEGITIMATE';
  };

  const getStatusColor = (status) => {
    const s = status?.toUpperCase();
    if (s === 'FRAUD') return '#ef4444';
    if (s === 'ALERT') return '#f59e0b';
    if (s === 'LEGITIMATE') return '#4CAF50';
    return '#a0a0a0'; // Default color for unknown status
  };

  const formatTransactionId = (tx) => {
    return tx.transaction_id || tx.trans_num || 'Unknown ID';
  };

  const formatCustomerName = (tx) => {
    if (tx.first && tx.last) return `${tx.first} ${tx.last}`;
    if (tx.customer_name) return tx.customer_name;
    return 'Unknown Customer';
  };

  const formatDateTime = (tx) => {
    if (tx.timestamp) {
      // Handle both string timestamps and numeric timestamps
      const date = typeof tx.timestamp === 'string' 
        ? new Date(tx.timestamp) 
        : new Date(tx.timestamp * 1000);
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
    if (tx.created_at) {
      const date = new Date(tx.created_at);
      return date.toLocaleString('ro-RO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'Unknown Date';
  };

  const formatAmount = (tx) => {
    const amount = parseFloat(tx.amount || 0);
    return `$${amount.toFixed(2)}`;
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
            <span>Client / Merchant</span>
            <span>Data/Ora</span>
            <span style={{ textAlign: 'right' }}>Suma</span>
            <span style={{ textAlign: 'right' }}>Status</span>
          </li>

          {/* Transaction Rows */}
          {recentTransactions.map((tx, index) => {
            const status = getTransactionStatus(tx);

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
                {/* Customer, Merchant and Transaction ID */}
                <div>
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: '0.95em',
                    marginBottom: '4px'
                  }}>
                    {formatCustomerName(tx)}
                  </div>
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: '0.9em',
                    color: '#e0e0e0',
                    marginBottom: '4px'
                  }}>
                    {formatMerchant(tx)}
                  </div>
                  <div style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.75em', 
                    color: '#a0a0a0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    ID: {formatTransactionId(tx)}
                  </div>
                </div>

                {/* Date/Time */}
                <span style={{ fontSize: '0.9em', color: '#c0c0c0' }}>
                  {formatDateTime(tx)}
                </span>

                {/* Amount */}
                <span style={{ 
                  textAlign: 'right', 
                  fontWeight: '600',
                  fontSize: '1em'
                }}>
                  {formatAmount(tx)}
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