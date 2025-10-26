import React from 'react';
import KpiCard from './KpiCard';

const TotalFraudTransactions = ({ fraudCount }) => {
    // Ensure we have a valid number
    const displayCount = Number(fraudCount) || 0;
    
    return (
        <KpiCard 
            title="Tranzacții Frauduloase" 
            value={displayCount} 
            iconProp="❌" 
            unit="" 
            isFraud={displayCount > 0}
        />
    );
};

export default TotalFraudTransactions;