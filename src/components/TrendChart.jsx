// components/TrendChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TrendChart = ({ data }) => {
  return (
    <div style={{
      backgroundColor: '#2b2d3e',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
      color: '#e0e0e0',
      height: '260px',
      width: '100%',
    }}>
      <h3 style={{ marginBottom: '10px', color: '#a0a0a0', fontWeight: '500' }}>
        Evoluția Ratei de Fraudă
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" tick={{ fill: '#aaa' }} />
          <YAxis tick={{ fill: '#aaa' }} />
          <Tooltip contentStyle={{ backgroundColor: '#1f2030', border: 'none' }} />
          <Legend />
          <Line type="monotone" dataKey="fraudRate" stroke="#6366f1" strokeWidth={3} dot={false} name="Rata de Fraudă (%)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
