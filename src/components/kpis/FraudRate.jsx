import React from 'react';
import KpiCard from './KpiCard';

const FraudRate = ({ fraudRate }) => {
    const rate = Number(fraudRate) || 0;
    const isFraudulent = rate > 0;
    
    return (
        <KpiCard 
            title="Rata de Fraudă" 
            value={rate} 
            iconProp="%" 
            unit="%" 
            isFraud={isFraudulent}
            formatFn={(val) => val.toFixed(2)}
        />
    );
};

export default FraudRate;