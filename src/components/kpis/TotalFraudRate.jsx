import React from 'react';
import KpiCard from './KpiCard';

const TotalFraudRate = ({ fraudValue }) => {
    const isFraudulent = fraudValue > 0;
    return (
        <KpiCard 
            title="Valoarea Totală Fraudă" 
            value={`$${fraudValue.toFixed(2).toLocaleString()}`} 
            icon="$" 
            unit="" 
            isFraud={isFraudulent}
        />
    );
};

export default TotalFraudRate;
