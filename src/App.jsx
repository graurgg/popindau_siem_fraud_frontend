import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TransactionList from './components/TransactionList';
import KpiOverview from './components/KpiOverview';
import { getTransactions } from './services/api';
import worldMap from './assets/world_map_2D.png';
import './App.css';

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
        transaction_id: transactionData.transaction_id || generateUniqueId(),
        trans_num: transactionData.trans_num,
        
        // Amount fields
        amount: transactionData.amt || transactionData.amount || 0,
        
        // Status field (from your transaction example)
        status: transactionData.status,
        
        // Fraud detection data
        fraud_detection: transactionData.fraud_detection,
        
        // Personal info for KPI calculations
        dob: transactionData.dob || (transactionData.raw_data && transactionData.raw_data.dob),
        first: transactionData.first || (transactionData.raw_data && transactionData.raw_data.first),
        last: transactionData.last || (transactionData.raw_data && transactionData.raw_data.last),
        gender: transactionData.gender || (transactionData.raw_data && transactionData.raw_data.gender),
        customer_name: transactionData.customer_name,
        
        // Transaction details
        trans_date: transactionData.trans_date || (transactionData.raw_data && transactionData.raw_data.trans_date),
        trans_time: transactionData.trans_time || (transactionData.raw_data && transactionData.raw_data.trans_time),
        timestamp: transactionData.timestamp || transactionData.created_at,
        category: transactionData.category || (transactionData.raw_data && transactionData.raw_data.category),
        merchant: transactionData.merchant || (transactionData.raw_data && transactionData.raw_data.merchant),
        
        // Location data
        city: transactionData.city || (transactionData.raw_data && transactionData.raw_data.city),
        state: transactionData.state || (transactionData.raw_data && transactionData.raw_data.state),
        city_pop: transactionData.city_pop || (transactionData.raw_data && transactionData.raw_data.city_pop),
        
        // Keep original transaction for reference
        _original: tx
    };
};

// Updated Fraud detection logic based on fraud_detection data
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

// === Funcție Ajutătoare pentru Calculul Vârstei ===
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

// === Mercator Projection Functions ===
const longitudeToX = (longitude, mapWidth) => {
    return ((longitude + 180) / 360) * mapWidth;
};

const latitudeToY = (latitude, mapHeight, mapWidth) => {
    const latRad = (latitude * Math.PI) / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    return (mapHeight / 2) - (mapWidth * mercN / (2 * Math.PI));
};

const latLngToMercator = (lat, lng, mapWidth, mapHeight) => {
    const boundedLat = Math.max(-85, Math.min(85, lat));
    const boundedLng = Math.max(-180, Math.min(180, lng));
    
    const x = longitudeToX(boundedLng, mapWidth);
    const y = latitudeToY(boundedLat, mapHeight, mapWidth);
    
    return { x, y };
};

// === Componenta pentru Harta cu Fraude ===
const FraudWorldMap = ({ transactions }) => {
    const mapWidth = 1000;  // Increased width to accommodate offset
    const mapHeight = 450; // Increased height for better proportions

    const fraudPoints = useMemo(() => {
        return transactions
            .filter(tx => {
                const status = getTransactionStatus(tx);
                return status === 'FRAUDA';
            })
            .map(tx => {
                const lat = parseFloat(tx.lat);
                const lng = parseFloat(tx.lng);
                
                if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                    return null;
                }
                
                // Apply offset to shift points to the right
                const position = latLngToMercator(lat, lng, mapWidth, mapHeight);
                position.x -= 10;
                position.y += 70;
                
                const boundedX = Math.max(5, Math.min(mapWidth - 5, position.x));
                const boundedY = Math.max(5, Math.min(mapHeight - 5, position.y));
                
                return {
                    x: boundedX,
                    y: boundedY,
                    amount: parseFloat(tx.amount).toFixed(2),
                    latitude: lat,
                    longitude: lng,
                    city: tx.city || 'N/A',
                    state: tx.state || 'N/A',
                };
            })
            .filter(point => point !== null);
    }, [transactions]);

    return (
        <div className="card" style={{ height: 'fit-content' }}>
            <h3>Global Fraud Distribution</h3>
            <div style={{ 
                position: 'relative', 
                width: `${mapWidth}px`, 
                height: `${mapHeight}px`, 
                borderRadius: '12px',
                overflow: 'hidden',
                border: '3px solid #e2e8f0',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                backgroundColor: '#f8fafc', // Background color for the frame
                padding: '0', // Remove any padding
                margin: '0 auto' // Center the map container
            }}>
                {/* World Map Background - Centered with offset */}
                <div style={{
                    position: 'absolute',
                    width: '100%', // Slightly smaller to show frame
                    height: '100%', // Slightly smaller to show frame
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img 
                        src={worldMap} 
                        alt="World Map" 
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain', // Changed to contain to show full map
                            display: 'block'
                        }} 
                    />
                </div>
                
                {/* Fraud Dots Overlay */}
                <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%' 
                }}>
                    {fraudPoints.map((point) => (
                        <div
                            key={point.id}
                            style={{
                                position: 'absolute',
                                left: `${point.x}px`,
                                top: `${point.y}px`,
                                width: '12px',
                                height: '12px',
                                backgroundColor: '#dc2626',
                                borderRadius: '50%',
                                border: '2px solid #7f1d1d',
                                transform: 'translate(-50%, -50%)',
                                cursor: 'pointer',
                                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.4)',
                                transition: 'all 0.3s ease',
                                zIndex: 10
                            }}
                            title={`$"Amount: "${point.amount}\n"Latitude: "${point.latitude}\n"Longitude: " ${point.longitude}\n"City: "${point.city}\n"State: "${point.state}`}
                            onMouseEnter={(e) => {
                                e.target.style.width = '18px';
                                e.target.style.height = '18px';
                                e.target.style.backgroundColor = '#ef4444';
                                e.target.style.boxShadow = '0 0 0 6px rgba(239, 68, 68, 0.3)';
                                e.target.style.zIndex = 20;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.width = '12px';
                                e.target.style.height = '12px';
                                e.target.style.backgroundColor = '#dc2626';
                                e.target.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.4)';
                                e.target.style.zIndex = 10;
                            }}
                        />
                    ))}
                </div>

                {/* Decorative frame elements */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    borderRadius: '10px',
                    pointerEvents: 'none'
                }} />
            </div>
            
            {/* Legend */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginTop: '1.5rem',
                fontSize: '0.9rem',
                padding: '0.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: '#dc2626', 
                    borderRadius: '50%', 
                    border: '2px solid #7f1d1d',
                    marginRight: '0.75rem'
                }}></div>
                <span style={{ fontWeight: '600', color: '#374151' }}>
                    Fraud Locations: {Math.min(fraudPoints.length, 100)}
                </span>
            </div>
        </div>
    );
};

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
                                backgroundColor: '#f7afafff',
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

const App = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTransactions();
            setTransactions(prev => [...prev, ...data]);
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

    const ageFraudData = useMemo(() => {
        if (transactions.length === 0) return [];

        const ageGroups = {
            '18-25': { min: 18, max: 25, fraudCount: 0 },
            '26-35': { min: 26, max: 35, fraudCount: 0 },
            '36-45': { min: 36, max: 45, fraudCount: 0 },
            '46-55': { min: 46, max: 55, fraudCount: 0 },
            '56-65': { min: 56, max: 65, fraudCount: 0 },
            '65+': { min: 66, max: 200, fraudCount: 0 }
        };

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

        return Object.entries(ageGroups).map(([ageRange, data]) => ({
            ageRange,
            fraudCount: data.fraudCount
        }));
    }, [transactions]);

    const fraudAnalysis = useMemo(() => {
        if (transactions.length === 0) {
            return { totalCount: 0, fraudCount: 0, fraudValue: 0, fraudRate: 0, alertCount: 0 };
        }

        let fraudCount = 0;
        let fraudValue = 0;
        let alertCount = 0;

        transactions.forEach(tx => {
            const status = getTransactionStatus(tx);
            
            if (status === 'FRAUD') {
                fraudCount++;
                const amountValue = parseFloat(tx.amount);
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

    return (
        <div className="app">
            <header className="header">
            <h1>SIEM Fraud Detection Dashboard</h1>
            <p>Real-time transaction monitoring and fraud analysis</p>
            </header>

            <div
            className="dashboard"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2.5rem',
                padding: '2rem',
            }}
            >
            {/* === TOP SECTION: KPI + AGE CHART === */}
            <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem', // micșorăm spațiul vertical dintre rânduri
                width: '100%',
                marginBottom: '1rem',
            }}
            >
            {/* Container comun pentru KPI-uri + Chart */}
            <div
                style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                gap: '1.5rem', // distanța mică între KPI-uri și grafic
                flexWrap: 'wrap',
                maxWidth: '1200px',
                width: '100%',
                }}
            >
                {/* Stânga: KPI 2x2 */}
                <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flex: '1 1 600px',
                }}
                >
                <KpiOverview analysis={fraudAnalysis} transactions={transactions} />
                </div>

                {/* Dreapta: Distribuția Fraudelor pe Vârste */}
                <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flex: '0 1 400px',
                }}
                >
                <AgeFraudChart data={ageFraudData} />
                </div>
            </div>
            </div>


            {/* === FRAUD MAP === */}
            <div
                style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                }}
            >
                <FraudWorldMap transactions={transactions} />
            </div>

            {/* === TRANSACTIONS LIST === */}
            <div
                style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                }}
            >
                <div
                className="card"
                style={{
                    width: '95%',
                    maxWidth: '1200px',
                }}
                >
                <TransactionList transactions={transactions} loading={loading} error={error} />
                </div>
            </div>
            </div>

            {error && (
            <div className="error">
                {error} <button onClick={() => setError(null)}>OK</button>
            </div>
            )}
        </div>
    );
};

export default App;