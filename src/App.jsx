import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import TransactionList from './components/TransactionList';
import KpiOverview from './components/KpiOverview';
import { getTransactions } from './services/api';
import './App.css';

// === Transaction Normalization Function ===
// === Transaction Normalization Function ===
const normalizeTransaction = (tx) => {
    console.log('Raw transaction:', tx); // Debug log
    
    // Handle both direct transactions and transactions with data wrapper
    const transactionData = tx.data || tx;
    
    // Generate unique ID using trans_num + timestamp + random suffix
    const generateUniqueId = () => {
        const baseId = transactionData.trans_num || 'unknown';
        const timestamp = transactionData.timestamp || Date.now();
        const randomSuffix = Math.random().toString(36).substr(2, 9);
        return `${baseId}-${timestamp}-${randomSuffix}`;
    };
    
    return {
        // ID fields - generate unique ID to prevent duplicates
        transaction_id: generateUniqueId(),
        trans_num: transactionData.trans_num,
        
        // Amount fields
        amount: transactionData.amt || transactionData.amount || 0,
        
        // Status field (from your transaction example)
        status: transactionData.status,
        
        // Personal info for KPI calculations
        dob: transactionData.dob,
        first: transactionData.first,
        last: transactionData.last,
        gender: transactionData.gender,
        customer_name: transactionData.customer_name,
        
        // Transaction details
        trans_date: transactionData.trans_date,
        trans_time: transactionData.trans_time,
        timestamp: transactionData.timestamp,
        category: transactionData.category,
        merchant: transactionData.merchant,
        
        // Location data
        city: transactionData.city,
        state: transactionData.state,
        city_pop: transactionData.city_pop,
        
        // Keep original transaction for reference
        _original: tx
    };
};

// Fraud detection logic based on your transaction data
const getTransactionStatus = (tx) => {
    // Use the status from transaction data if available
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

// === Age Calculation Function ===
const calculateAge = (dobString) => {
    if (!dobString) return 0;
    try {
        const birthDate = new Date(dobString);
        const today = new Date();
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age > 0 ? age : 0;
    } catch (e) {
        console.error("Eroare la parsarea DOB:", dobString, e);
        return 0;
    }
};

import { TransactionSSE } from './services/sse';

const App = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const sseRef = useRef(null);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getTransactions();
            console.log('API Response:', data); // Debug log
            
            // Normalize all transactions from API
            const normalizedTransactions = data.map(normalizeTransaction);
            console.log('Normalized transactions:', normalizedTransactions); // Debug log
            
            setTransactions(normalizedTransactions);
        } catch (err) {
            console.error("Eroare la preluarea tranzacțiilor:", err);
            setError("Nu s-au putut încărca tranzacțiile.");
        } finally {
            setLoading(false);
        }
    }, []);

    // SSE for real-time updates
    useEffect(() => {
        const sseUrl = import.meta.env.VITE_SSE_URL || 'http://localhost:8000/sse/transactions';
        
        // Define the SSE message handler
        const handleSseMessage = (newTransaction) => {
            console.log('SSE transaction received:', newTransaction); // Debug log
            
            // Check if this is a new_transaction type
            if (newTransaction.type === 'new_transaction' && newTransaction.data) {
                // Normalize the incoming SSE transaction
                const normalizedTx = normalizeTransaction(newTransaction);
                
                setTransactions(prev => {
                    // Add new normalized transaction to the END of the array
                    return [...prev, normalizedTx];
                });
            }
        };

        // Create an async function to manage the connection flow
        const initialize = async () => {
            try {
                // 1. Wait for the initial historical data to load
                await fetchTransactions();
                
                // 2. Only AFTER history is loaded, connect to SSE
                const sse = new TransactionSSE(sseUrl, handleSseMessage);
                sse.connect();
                sseRef.current = sse; // Store in ref for cleanup
            } catch (err) {
                console.error("Failed to initialize app connection:", err);
            }
        };

        // Call the initialization function
        initialize();

        // Return cleanup function
        return () => {
            if (sseRef.current) {
                sseRef.current.disconnect();
            }
        };
    }, [fetchTransactions]);

    // --- Fraud Analysis (KPI) ---
    const fraudAnalysis = useMemo(() => {
        if (transactions.length === 0) {
            return { 
                totalCount: 0, 
                fraudCount: 0, 
                fraudValue: 0, 
                fraudRate: 0, 
                alertCount: 0, 
                averageFraudAge: 0,
                totalValue: 0,
                averageTransaction: 0
            };
        }

        let fraudCount = 0;
        let fraudValue = 0;
        let alertCount = 0;
        let totalFraudAge = 0;
        let totalValue = 0;

        transactions.forEach(tx => {
            const status = getTransactionStatus(tx);
            const amount = parseFloat(tx.amount || 0);
            totalValue += amount;
            
            if (status === 'FRAUDA') {
                fraudCount++;
                fraudValue += amount;

                // Calculate age for fraud cases
                if (tx.dob) {
                    const age = calculateAge(tx.dob);
                    totalFraudAge += age;
                }
            }
            if (status === 'ALERT') {
                alertCount++;
            }
        });

        const totalCount = transactions.length;
        const fraudRate = (totalCount > 0) ? (fraudCount / totalCount) * 100 : 0;
        const averageFraudAge = fraudCount > 0 ? Math.round(totalFraudAge / fraudCount) : 0;
        const averageTransaction = totalCount > 0 ? totalValue / totalCount : 0;

        return { 
            totalCount, 
            fraudCount, 
            fraudValue, 
            fraudRate, 
            alertCount, 
            averageFraudAge,
            totalValue,
            averageTransaction
        };
    }, [transactions]);

    // --- Rendering ---
    return (
        <div className="app">
            {/* HEADER */}
            <header className="header">
                <h1>SIEM Fraud Detection Dashboard</h1>
                <p>Real-time transaction monitoring and fraud analysis</p>
            </header>
            
            <div className="dashboard">
                
                {/* TOP SECTION: KPI Overview */}
                <div 
                    style={{ 
                        gridColumn: '1 / -1', 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 2fr', 
                        gap: '2rem',
                        alignItems: 'start'
                    }}
                    className="top-section-layout"
                >
                    <KpiOverview analysis={fraudAnalysis} />
                </div>

                {/* BOTTOM SECTION: Transaction List */}
                <div className="card full-width">
                    <TransactionList transactions={transactions} loading={loading} error={error} />
                </div>
                
            </div>
            
            {error && <div className="error">{error} <button onClick={() => setError(null)}>OK</button></div>}
        </div>
    );
};

export default App;