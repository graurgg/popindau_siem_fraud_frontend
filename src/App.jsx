import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TransactionList from './components/TransactionList';
import KpiOverview from './components/KpiOverview'; // Importăm componenta Overview
import { getTransactions } from './services/api';
import './App.css';

// Logica simplă de determinare a statusului (pentru a fi folosită în useMemo)
const getTransactionStatus = (tx) => {
    if (tx.status && tx.status.toUpperCase() === 'FRAUDA') return 'FRAUDA';
    if (tx.fraud_flag !== undefined && tx.fraud_flag === 1) return 'FRAUDA';
    // Regula simplă de test (suma > $100)
    if (parseFloat(tx.amount) > 100) return 'FRAUDA'; 
    if (tx.status && tx.status.toUpperCase() === 'ALERT') return 'ALERT';
    return 'LEGITIM';
};

// === Funcție Ajutătoare pentru Calculul Vârstei ===
const calculateAge = (dobString) => {
    if (!dobString) return 0;
    try {
        // Presupunem formatul YYYY-MM-DD
        const birthDate = new Date(dobString);
        const today = new Date();
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        
        // Ajustăm vârsta dacă ziua de naștere nu a trecut încă în acest an
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age > 0 ? age : 0;
    } catch (e) {
        console.error("Eroare la parsarea DOB:", dobString, e);
        return 0;
    }
};
// ===================================================

const App = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Preluarea Datelor ---
    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTransactions();
            setTransactions(prev => [...prev, ...data]); // pentru batch
        } catch (err) {
            console.error("Eroare la preluarea tranzacțiilor:", err);
            setError("Nu s-au putut încărca tranzacțiile.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // --- Logica de Analiză (KPI) ---
    const fraudAnalysis = useMemo(() => {
        if (transactions.length === 0) {
            return { totalCount: 0, fraudCount: 0, fraudValue: 0, fraudRate: 0, alertCount: 0, averageFraudAge: 0};
        }

        let fraudCount = 0;
        let fraudValue = 0;
        let alertCount = 0;
        let totalFraudAge = 0;

        transactions.forEach(tx => {
            const status = getTransactionStatus(tx);
            
            if (status === 'FRAUDA') {
                fraudCount++;
                // === CALCUL SUMĂ FRAUDĂ (ROBUST) ===
                const amountValue = parseFloat(tx.amount);
                // Adunăm suma doar dacă este un număr valid (protecție împotriva NaN)
                fraudValue += isNaN(amountValue) ? 0 : amountValue;

                // === CALCUL VÂRSTĂ ===
                if (tx.dob) {
                    const age = calculateAge(tx.dob);
                    totalFraudAge += age;
                }
                // =======================
            }
            if (status === 'ALERT') {
                alertCount++;
            }
        });

        const totalCount = transactions.length;
        const fraudRate = (totalCount > 0) ? (fraudCount / totalCount) * 100 : 0;
        const averageFraudAge = 5;

        return { totalCount, fraudCount, fraudValue, fraudRate, alertCount };
    }, [transactions]);


    // --- Randarea ---
    return (
        <div className="app">
            {/* 1. HEADER */}
            <header className="header">
                <h1>SIEM Fraud Detection Dashboard</h1>
                <p>Real-time transaction monitoring and fraud analysis</p>
            </header>
            
            <div className="dashboard">
                
                {/* ------------------------------------------------------------- */}
                {/* SECȚIUNEA SUPERIOARĂ: KPI-uri (via KpiOverview) + HARTĂ */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr', // full width, single column
                        gap: '2rem',
                        alignItems: 'start',
                    }}
                    className="top-section-layout"
                >
                    <KpiOverview analysis={fraudAnalysis} />
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SECȚIUNEA INFERIOARĂ: LISTA DE TRANZACȚII */}
                <div className="card full-width">
                    <TransactionList transactions={transactions} loading={loading} error={error} />
                </div>
                
            </div>
            
            {error && <div className="error">{error} <button onClick={() => setError(null)}>OK</button></div>}
        </div>
    );
};

export default App;
