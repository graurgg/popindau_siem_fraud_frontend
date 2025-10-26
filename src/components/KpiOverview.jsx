import React from 'react';
// Importăm toate componentele individuale pe care le-ai definit în structură
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
    // Verificăm dacă există tranzacții pentru a calcula KPI-urile.
    if (!analysis || analysis.totalCount === 0) {
        return (
            <div 
                style={{ 
                    gridColumn: '1 / -1', 
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
                gridTemplateColumns: 'repeat(4, 1fr)', // always 4 equal columns
                gap: '2rem',
                width: '175%',
                padding: '0 1rem',
            }}
            className="kpi-container"
        >
            <TotalTransactions totalCount={analysis.totalCount} />
            <FraudRate fraudRate={analysis.fraudRate} />
            <TotalFraudRate fraudValue={analysis.fraudValue} />
            <TotalFraudTransactions fraudCount={analysis.fraudCount} />
        </div>
    );
};

export default KpiOverview;
