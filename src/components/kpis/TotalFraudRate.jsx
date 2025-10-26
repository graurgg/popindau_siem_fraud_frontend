import React from 'react';
import KpiCard from './KpiCard';

const TotalFraudRate = ({ fraudValue }) => {
  // Ensure we have a valid number
  const value = Number(fraudValue) || 0;
  
  return (
    <KpiCard
      title="Valoarea Totală Fraudă"
      value={value}
      unit="$"
      formatFn={(val) => val.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    />
  );
};

export default TotalFraudRate;