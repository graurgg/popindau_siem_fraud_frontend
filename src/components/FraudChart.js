import React from 'react';

const FraudChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="fraud-chart">No data available for chart.</div>;
  }

  const fraudCount = data.filter(t => t.isFraudulent).length;
  const legitimateCount = data.length - fraudCount;
  const fraudPercentage = data.length > 0 ? (fraudCount / data.length) * 100 : 0;

  return (
    <div className="fraud-chart">
      <h2>Fraud Detection Statistics</h2>
      <div className="chart-container">
        <div className="stat-box">
          <h3>Total Transactions</h3>
          <p className="stat-number">{data.length}</p>
        </div>
        <div className="stat-box fraud">
          <h3>Fraudulent</h3>
          <p className="stat-number">{fraudCount}</p>
          <p className="stat-percentage">{fraudPercentage.toFixed(1)}%</p>
        </div>
        <div className="stat-box legitimate">
          <h3>Legitimate</h3>
          <p className="stat-number">{legitimateCount}</p>
          <p className="stat-percentage">{(100 - fraudPercentage).toFixed(1)}%</p>
        </div>
      </div>
      <div className="progress-bar">
        <div 
          className="fraud-bar" 
          style={{ width: `${fraudPercentage}%` }}
          title={`Fraud: ${fraudPercentage.toFixed(1)}%`}
        ></div>
        <div 
          className="legitimate-bar" 
          style={{ width: `${100 - fraudPercentage}%` }}
          title={`Legitimate: ${(100 - fraudPercentage).toFixed(1)}%`}
        ></div>
      </div>
    </div>
  );
};

export default FraudChart;
