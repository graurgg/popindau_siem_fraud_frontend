import React from 'react';

// === PICTOGRAME INLINE (SVG) PENTRU A EVITA DEPENDENȚA "lucide-react" ===

// Iconiță pentru Total Tranzacții (Trending Up)
const TrendingUpIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);

// Iconiță pentru Rata de Fraudă (Percent)
const PercentIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
);

// Iconiță pentru Valoarea Totală Fraudă (Dollar Sign)
const DollarSignIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);

// Iconiță generică de Alertă/Fraudă (Zap - Fulger)
const ZapIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);

// Obiect de mapare pentru a alege culoarea și pictograma în funcție de titlu
const getVisuals = (title) => {
    switch (title) {
        case "Total Tranzacții":
            return { color: '#61a561ff', icon: <TrendingUpIcon /> }; // Albastru
        case "Rata de Fraudă":
            return { color: '#ef4444', icon: <PercentIcon /> }; // Roșu - Alerte/Rată
        case "Valoarea Totală Fraudă":
            return { color: '#f59e0b', icon: <DollarSignIcon /> }; // Galben - Bani
        case "Tranzacții Frauduloase":
            // Culoare implicită, care va fi suprascrisă de isFraud
            return { color: '#3b82f6', icon: <ZapIcon /> }; 
        default:
            return { color: '#e0e0e0', icon: null };
    }
};


/**
 * @param {object} props
 * @param {string} props.title
 * @param {number|string} props.value
 * @param {string} [props.unit]
 * @param {string|React.ReactNode} [props.iconProp] - Pictogramă trimisă din exterior ("❌")
 * @param {boolean} [props.isFraud] - True dacă ar trebui să fie de culoare roșie (fraudă)
 */
const KpiCard = ({ title, value, unit = '', iconProp, isFraud, formatFn = (val) => val.toLocaleString() }) => {
    // 1. Preluăm vizualizările implicite bazate pe titlu
    const { color, icon } = getVisuals(title);

    // 2. LOGICA DE SUPRASCRIERE
    
    // Suprascriere Culoare: Forțăm roșu dacă isFraud este true, altfel folosim culoarea implicită
    const cardColor = color; 
    
    // Suprascriere Icon: Folosim iconProp ("❌") dacă este trimis, altfel icon-ul SVG implicit
    const displayIcon = iconProp || icon; 

    // Aplicăm stiluri pentru a afișa icon-ul string (ca "❌")
    const isStringIcon = typeof displayIcon === 'string';

    return (
        <div 
            style={{ 
                backgroundColor: '#2b2d3e', 
                padding: '24px', 
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                color: '#e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                // Aici se aplică culoarea roșie forțată
                borderLeft: `5px solid ${cardColor}`, 
                transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#a0a0a0' }}>
                    {title}
                </div>
                {/* Aici se aplică pictograma suprascrisă și culoarea roșie forțată */}
                <div style={{ color: cardColor, fontSize: isStringIcon ? '1.5rem' : 'initial' }}>
                    {displayIcon}
                </div>
            </div>

            <div 
                style={{ 
                    fontSize: '32px', 
                    fontWeight: 'bold', 
                    color: '#ffffff'
                }}
            >
                {unit}{formatFn(value)}
            </div>
            
        </div>
    );
};

export default KpiCard;
