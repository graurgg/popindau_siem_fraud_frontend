import React, { useState } from 'react';

/**
 * Componentă pentru afișarea listei de tranzacții.
 * Include ID-ul tranzacției, statusul de fraudă/legitim și funcționalitatea de a închide/deschide lista.
 * @param {object} props
 * @param {Array<object>} props.transactions - Lista de tranzacții. Presupusă a fi în ordine cronologică crescătoare (cea mai veche prima).
 * @param {boolean} props.loading - Starea de încărcare.
 * @param {string | null} props.error - Mesajul de eroare.
 */
const TransactionList = ({ transactions, loading, error }) => {
    // Stare pentru a gestiona dacă lista este închisă (collapsed)
    const [isCollapsed, setIsCollapsed] = useState(true);
    
    // Numărul maxim de tranzacții recente de afișat
    const MAX_DISPLAY_COUNT = 20;
    
    // Handler pentru închiderea/deschiderea listei
    const handleToggle = () => {
        setIsCollapsed(!isCollapsed);
    }

    /**
     * Determină statusul tranzacției folosind datele disponibile sau regula de bază.
     * @param {object} tx - Obiectul tranzacției.
     * @returns {string} Statusul tranzacției (ex: 'FRAUDA', 'LEGITIM', 'ALERT').
     */
    const getTransactionStatus = (tx) => {
        // 1. Verifică câmpul 'status' (prioritate maximă)
        if (tx.status) {
            return tx.status.toUpperCase();
        }
        
        // 2. Verifică câmpul 'fraud_flag' (dacă e 1 sau 0)
        if (tx.fraud_flag !== undefined) {
            return tx.fraud_flag === 1 ? 'FRAUDA' : 'LEGITIM';
        }
        
        // 3. Fallback: Folosește regula ta de bază (suma > $100)
        return (parseFloat(tx.amount) > 100) ? 'FRAUDA' : 'LEGITIM';
    }

    /**
     * Returnează codul de culoare CSS în funcție de status.
     * @param {string} status - Statusul tranzacției.
     * @returns {string} Codul HEX al culorii.
     */
    const getStatusColor = (status) => {
        const s = status.toUpperCase();
        if (s === 'FRAUDULENT' || s === 'FRAUDA') {
            return '#ef4444'; // Roșu aprins pentru Fraudă
        }
        if (s === 'ALERT') {
            return '#f59e0b'; // Galben/Portocaliu pentru Alertă/Revizuire
        }
        return '#4CAF50'; // Verde pentru Legitim
    };
    
    // 1. Facem o copie a array-ului și îl inversăm pentru a avea cele mai recente tranzacții primele.
    // (Presupunem că tranzacțiile vin în ordine cronologică crescătoare).
    const reversedTransactions = [...transactions].reverse();

    // 2. Limităm lista la ultimele MAX_DISPLAY_COUNT (cele mai recente) pentru afișare.
    const recentTransactions = reversedTransactions.slice(0, MAX_DISPLAY_COUNT);

    return (
        <div style={{ padding: '15px', backgroundColor: '#202230', borderRadius: '8px' }}>
            {/* Header-ul interactiv */}
            <div
                onClick={handleToggle}
                style={{ 
                    color: '#e0e0e0', 
                    marginBottom: '15px', 
                    // Neutralizare CSS pentru a elimina săgeata albastră (marker de listă moștenit)
                    listStyleType: 'none', 
                    paddingLeft: '0px', 
                    margin: '0',
                    
                    fontSize: '1.5rem', 
                    borderBottom: '2px solid #3b3d52', 
                    paddingBottom: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                {/* Săgeata (pictograma) care se rotește */}
                <span style={{ 
                    transition: 'transform 0.2s',
                    transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)', // Rotație de 90 de grade când e deschis
                    marginRight: '10px',
                    color: '#4299e1' // Culoarea accent blue din CSS-ul tău
                }}>
                    ► 
                </span>
                
                {/* Titlul */}
                <h2 style={{ 
                    margin: 0, 
                    flexGrow: 1, 
                    fontSize: '1.5rem',
                    // Asigurăm că nu este stilizat ca un element de listă
                    listStyleType: 'none', 
                }}>
                    Tranzacții Recente ({recentTransactions.length})
                </h2>
            </div>
            
            {loading && <p style={{ color: '#6366f1' }}>Se încarcă tranzacțiile...</p>}
            
            {error && <p style={{ color: '#ef4444' }}>Eroare la încărcarea datelor: {error}</p>}

            {/* Conținutul listei, afișat doar dacă NU este închis */}
            {!isCollapsed && !loading && !error && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {/* Antetul Coloanelor */}
                    <li style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '3fr 1fr 1fr', 
                        fontWeight: 'bold', 
                        color: '#a0a0a0',
                        padding: '10px 0'
                    }}>
                        <span>ID Tranzacție</span>
                        <span style={{textAlign: 'right'}}>Suma</span>
                        <span style={{textAlign: 'right'}}>Status</span>
                    </li>
                    {/* Lista de Tranzacții */}
                    {recentTransactions.length === 0 ? (
                        <p style={{ color: '#a0a0a0', paddingTop: '10px' }}>Nu există tranzacții de afișat.</p>
                    ) : (
                        recentTransactions.map((tx, index) => {
                            const status = getTransactionStatus(tx);
                            return (
                                <li 
                                    key={tx.trans_num || index} 
                                    style={{ 
                                        padding: '12px 0', 
                                        borderBottom: '1px dashed #3b3d52',
                                        display: 'grid',
                                        gridTemplateColumns: '3fr 1fr 1fr',
                                        alignItems: 'center',
                                        color: '#ffffff',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#252735'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <span style={{ fontFamily: 'monospace', fontSize: '0.9em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {tx.trans_num || `Tranzacție #${index + 1}`}
                                    </span>
                                    <span style={{textAlign: 'right'}}>
                                        ${parseFloat(tx.amount).toFixed(2)}
                                    </span>
                                    <span style={{ 
                                        textAlign: 'right',
                                        color: getStatusColor(status),
                                        fontWeight: '600',
                                        fontSize: '0.9em'
                                    }}>
                                        {status}
                                    </span>
                                </li>
                            );
                        })
                    )}
                </ul>
            )}
        </div>
    );
};

export default TransactionList;
