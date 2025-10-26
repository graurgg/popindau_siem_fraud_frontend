import React from 'react';
import KpiCard from './KpiCard';

const TotalTransactions = ({ totalCount }) => {
    // Ensure we have a valid number
    const count = Number(totalCount) || 0;
    
    return (
        <KpiCard 
            title="Total Tranzacții" 
            value={count} 
            iconProp="📈" 
            unit="" 
        />
    );
};

export default TotalTransactions;