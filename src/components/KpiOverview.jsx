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
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem',
                padding: '0', 
                minWidth: '280px' 
            }}
            className="kpi-container"
        >
            {/* Componentele individuale primesc datele necesare */}
            <TotalTransactions totalCount={analysis.totalCount} />
            <FraudRate fraudRate={analysis.fraudRate} />
            <TotalFraudRate fraudValue={analysis.fraudValue} />
            <TotalFraudTransactions fraudCount={analysis.fraudCount} />
            <VulnerableAge averageFraudAge={analysis.averageFraudAge} />
        </div>
    );
};

export default KpiOverview;
