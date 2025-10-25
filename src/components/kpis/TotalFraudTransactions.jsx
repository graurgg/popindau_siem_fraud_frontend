import React from 'react';
import KpiCard from './KpiCard';

const TotalFraudTransactions = ({ fraudCount }) => {
    // Aplicăm o valoare implicită de 0 pentru a preveni apelarea .toLocaleString() pe undefined
    const displayCount = fraudCount || 0; 
    
    return (
        <KpiCard 
            title="Tranzacții Frauduloase" 
            value={displayCount.toLocaleString()} 
            icon="❌" 
            unit="" 
            isFraud={displayCount > 0}
        />
    );
};

export default TotalFraudTransactions;
