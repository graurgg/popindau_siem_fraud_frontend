import React from 'react';
import KpiCard from './KpiCard';

const TotalFraudRate = ({ fraudValue }) => {
  const value = Number(fraudValue); // fallback sigur
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <KpiCard
      title="Valoarea Totală Fraudă"
      value={formatted}
      unit="$"
      iconProp="💰"
    />
  );
};

export default TotalFraudRate;
