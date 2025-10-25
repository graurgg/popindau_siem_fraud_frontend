import React, { useState } from 'react';

const TransactionForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    merchant: '',
    category: '',
    location: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      amount: '',
      merchant: '',
      category: '',
      location: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <h2>New Transaction</h2>
      <div className="form-group">
        <label htmlFor="amount">Amount:</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          step="0.01"
          min="0"
        />
      </div>
      <div className="form-group">
        <label htmlFor="merchant">Merchant:</label>
        <input
          type="text"
          id="merchant"
          name="merchant"
          value={formData.merchant}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="category">Category:</label>
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="location">Location:</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Submit Transaction</button>
    </form>
  );
};

export default TransactionForm;
