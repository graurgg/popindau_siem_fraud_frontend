import React from 'react';
import KpiCard from './KpiCard';

const VulnerableAge = ({ averageFraudAge }) => {
    const isFraudulent = true;
    return (
        <KpiCard 
            title="Vârsta vulnerabilă" 
            value={averageFraudAge}
            icon="🎉" 
            unit="" 
            isFraud={isFraudulent}
        />
    );
};

export default VulnerableAge;