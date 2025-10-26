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

// === Componenta pentru Graficul Vârstă vs Fraud ===
const AgeFraudChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="card">
                <h3>Distribuția Fraudelor pe Vârste</h3>
                <p>Nu există date disponibile pentru afișare.</p>
            </div>
        );
    }

    // Găsim valoarea maximă pentru scalare
    const maxCount = Math.max(...data.map(item => item.fraudCount));
    
    return (
        <div className="card">
            <h3>Distribuția Fraudelor pe Vârste</h3>
            <div style={{ marginTop: '1rem' }}>
                {data.map((item, index) => {
                    const barWidth = maxCount > 0 ? (item.fraudCount / maxCount) * 100 : 0;
                    return (
                        <div key={index} style={{ 
                            marginBottom: '0.5rem',
                            display: 'flex', 
                            alignItems: 'center' 
                        }}>
                            <span style={{ 
                                width: '60px', 
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}>
                                {item.ageRange}
                            </span>
                            <div style={{ 
                                flex: 1, 
                                marginLeft: '1rem',
                                backgroundColor: '#ff6b6b',
                                height: '30px',
                                borderRadius: '4px',
                                position: 'relative',
                                minWidth: '30px'
                            }}>
                                <div style={{
                                    width: `${barWidth}%`,
                                    backgroundColor: '#e74c3c',
                                    height: '100%',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    paddingRight: '8px',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem'
                                }}>
                                    {item.fraudCount}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
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

    // --- Analiza Vârstelor pentru Fraud ---
    const ageFraudData = useMemo(() => {
        if (transactions.length === 0) return [];

        // Grupăm vârstele în intervale
        const ageGroups = {
            '18-25': { min: 18, max: 25, fraudCount: 0 },
            '26-35': { min: 26, max: 35, fraudCount: 0 },
            '36-45': { min: 36, max: 45, fraudCount: 0 },
            '46-55': { min: 46, max: 55, fraudCount: 0 },
            '56-65': { min: 56, max: 65, fraudCount: 0 },
            '65+': { min: 66, max: 200, fraudCount: 0 }
        };

        // Numărăm fraudele pe intervale de vârstă
        transactions.forEach(tx => {
            const status = getTransactionStatus(tx);
            if (status === 'FRAUDA') {
                const age = calculateAge(tx.dob);
                
                for (const groupKey in ageGroups) {
                    const group = ageGroups[groupKey];
                    if (age >= group.min && age <= group.max) {
                        group.fraudCount += 1;
                        break;
                    }
                }
            }
        });

        // Convertim în array pentru afișare
        return Object.entries(ageGroups).map(([ageRange, data]) => ({
            ageRange,
            fraudCount: data.fraudCount
        }));
    }, [transactions]);

    // --- Logica de Analiză (KPI) ---
    const fraudAnalysis = useMemo(() => {
        if (transactions.length === 0) {
            return { totalCount: 0, fraudCount: 0, fraudValue: 0, fraudRate: 0, alertCount: 0 };
        }

        let fraudCount = 0;
        let fraudValue = 0;
        let alertCount = 0;

        transactions.forEach(tx => {
            const status = getTransactionStatus(tx);
            
            if (status === 'FRAUDA') {
                fraudCount++;
                // === CALCUL SUMĂ FRAUDĂ (ROBUST) ===
                const amountValue = parseFloat(tx.amount);
                // Adunăm suma doar dacă este un număr valid (protecție împotriva NaN)
                fraudValue += isNaN(amountValue) ? 0 : amountValue;
            }
            if (status === 'ALERT') {
                alertCount++;
            }
        });

        const totalCount = transactions.length;
        const fraudRate = (totalCount > 0) ? (fraudCount / totalCount) * 100 : 0;

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
                {/* SECȚIUNEA SUPERIOARĂ: KPI-uri (via KpiOverview) */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '2rem',
                        alignItems: 'start',
                    }}
                    className="top-section-layout"
                >
                    <KpiOverview analysis={fraudAnalysis} />
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SECȚIUNEA CHART: Graficul Vârstă vs Fraud */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '2rem',
                        marginTop: '1rem',
                    }}
                >
                    <AgeFraudChart data={ageFraudData} />
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