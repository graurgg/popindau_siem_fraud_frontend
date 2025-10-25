import React from 'react';
import KpiCard from './KpiCard';

const FraudRate = ({ fraudRate }) => {
    const isFraudulent = fraudRate > 0;
    return (
        <KpiCard 
            title="Rata de Fraudă" 
            value={fraudRate.toFixed(2)} 
            icon="%" 
            unit="%" 
            isFraud={isFraudulent}
        />
    );
};

export default FraudRate;
