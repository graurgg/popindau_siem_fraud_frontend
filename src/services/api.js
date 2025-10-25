import axios from 'axios'

// Use environment variable or default to localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data)
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to backend server. Make sure it is running on port 8000.')
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Backend server error. Please try again later.')
    }
    
    throw error
  }
)

export const createTransaction = async (transactionData) => {
  const response = await api.post('/transactions', transactionData)
  return response.data
}

export const getTransactions = async (limit = 50) => {
  const response = await api.get(`/transactions?limit=${limit}`)
  return response.data
}

export const healthCheck = async () => {
  const response = await api.get('/health')
  return response.data
}

export default api