import React from 'react';
import TotalFraudTransactions from './kpis/TotalFraudTransactions';
import FraudRate from './kpis/FraudRate';
import VulnerableAge from './kpis/VulnerableAge';
import TotalFraudRate from './kpis/TotalFraudRate';
import TotalTransactions from './kpis/TotalTransactions';

/**
 * Componenta care aranjează cele 4 carduri KPI într-o grilă 2x2.
 * @param {object} props
 * @param {object} props.analysis - Obiectul de analiză conținând totalCount, fraudRate, etc.
 */
const KpiOverview = ({ analysis }) => {
  if (!analysis || analysis.totalCount === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          backgroundColor: 'rgba(45, 55, 72, 0.7)',
          borderRadius: '16px',
          color: '#a0a0a0'
        }}
      >
        Așteptând datele din tranzacții pentru a calcula KPI-urile...
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)', // 2 coloane
        gridTemplateRows: 'repeat(2, auto)',   // 2 rânduri
        gap: '1.5rem',
        width: '100%',
        padding: '1rem'
      }}
      className="kpi-grid"
    >
      <TotalTransactions totalCount={analysis.totalCount} />
      <FraudRate fraudRate={analysis.fraudRate} />
      <TotalFraudRate fraudValue={analysis.fraudValue} />
      <TotalFraudTransactions fraudCount={analysis.fraudCount} />
    </div>
  );
};

export default KpiOverview;
