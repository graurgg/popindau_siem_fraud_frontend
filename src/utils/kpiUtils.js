// Voi defini funcția aici pentru a rezolva eroarea de import (presupunând că 'transactionUtils.js' lipsește)
const getTransactionStatusLocal = (tx) => {
    // Încercăm să obținem valoarea sumei ca număr
    const amountValue = parseFloat(tx.amount);
    const isValidAmount = !isNaN(amountValue) && amountValue > 0;

    // 1. Verifică câmpul 'status' (prioritate maximă)
    if (tx.status) {
        return tx.status.toUpperCase();
    }
    
    // 2. Verifică câmpul 'fraud_flag' (dacă e 1 sau 0)
    // Folosim comparația strictă pentru 1
    if (tx.fraud_flag === 1) {
        return 'FRAUDA';
    } else if (tx.fraud_flag === 0) {
        return 'LEGITIM';
    }

    // 3. Regula de bază: suma > $100
    if (isValidAmount && amountValue > 100) {
        return 'FRAUDA';
    }

    // Default: dacă nu este etichetat explicit sau nu îndeplinește nicio regulă
    return 'LEGITIM';
}


/**
 * Calculează metricile cheie de performanță (KPI) din lista de tranzacții.
 * @param {Array<object>} transactions - Lista de tranzacții.
 * @returns {{
 * totalCount: number,
 * fraudRate: number,
 * totalFraudValue: number,
 * totalFraudTransactions: number, // Noul KPI
 * }}
 */
export const calculateKpis = (transactions) => {
    if (!transactions || transactions.length === 0) {
        return {
            totalCount: 0,
            fraudRate: 0,
            totalFraudValue: 0,
            totalFraudTransactions: 0,
        };
    }

    let totalCount = transactions.length;
    let fraudCount = 0;
    let totalFraudValue = 0;

    transactions.forEach(tx => {
        // Folosim funcția locală pentru a evita eroarea de import
        const status = getTransactionStatusLocal(tx); 

        // Verificăm dacă este o fraudă detectată
        if (status === 'FRAUDA' || status === 'FRAUDULENT') {
            fraudCount++;
            // Asigurăm că adunăm o sumă numerică validă
            totalFraudValue += parseFloat(tx.amount) || 0;
        } 
    });

    const fraudRate = totalCount > 0 ? (fraudCount / totalCount) * 100 : 0;

    return {
        totalCount: totalCount,
        fraudRate: parseFloat(fraudRate.toFixed(2)),
        totalFraudValue: parseFloat(totalFraudValue.toFixed(2)),
        fraudCount: fraudCount,
    };
};
