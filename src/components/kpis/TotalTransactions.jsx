import React from 'react';
import KpiCard from './KpiCard';

const TotalTransactions = ({ totalCount }) => {
    return (
        <KpiCard 
            title="Total Tranzacții" 
            value={totalCount.toLocaleString()} 
            icon="📈" 
            unit="" 
        />
    );
};

export default TotalTransactions;
