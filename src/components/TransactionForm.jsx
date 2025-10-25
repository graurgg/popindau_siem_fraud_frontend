import React, { useState } from 'react'
import { createTransaction } from '../services/api'

const TransactionForm = ({ onTransactionCreated }) => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    merchant: '',
    customer_id: '',
    location: '',
    device: '',
    ip_address: '192.168.1.1' // Default value for demo
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const transaction = await createTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
        timestamp: new Date().toISOString()
      })
      onTransactionCreated(transaction)
      
      // Reset form but keep some values
      setFormData({
        amount: '',
        currency: formData.currency,
        merchant: formData.merchant,
        customer_id: formData.customer_id,
        location: formData.location,
        device: formData.device,
        ip_address: formData.ip_address
      })
      
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to create transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label>Amount *</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          min="0.01"
          required
          placeholder="Enter amount"
        />
      </div>

      <div className="form-group">
        <label>Currency</label>
        <select
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          required
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="JPY">JPY</option>
        </select>
      </div>

      <div className="form-group">
        <label>Merchant *</label>
        <input
          type="text"
          name="merchant"
          value={formData.merchant}
          onChange={handleChange}
          required
          placeholder="e.g., Amazon, Starbucks"
        />
      </div>

      <div className="form-group">
        <label>Customer ID *</label>
        <input
          type="text"
          name="customer_id"
          value={formData.customer_id}
          onChange={handleChange}
          required
          placeholder="e.g., CUST-001"
        />
      </div>

      <div className="form-group">
        <label>Location *</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g., New York, USA or International"
          required
        />
      </div>

      <div className="form-group">
        <label>Device *</label>
        <input
          type="text"
          name="device"
          value={formData.device}
          onChange={handleChange}
          placeholder="e.g., iPhone, Chrome Browser, New Device"
          required
        />
      </div>

      <div className="form-group">
        <label>IP Address</label>
        <input
          type="text"
          name="ip_address"
          value={formData.ip_address}
          onChange={handleChange}
          placeholder="e.g., 192.168.1.1"
        />
      </div>

      <button 
        type="submit" 
        className="btn" 
        disabled={loading}
        style={{opacity: loading ? 0.7 : 1}}
      >
        {loading ? 'Processing...' : 'Submit Transaction'}
      </button>
    </form>
  )
}

export default TransactionForm