// hooks/useTransactionPolling.js
import { useState, useEffect, useRef, useCallback } from 'react'
import { getNewTransactions, getLatestTransactionId } from '../services/api'

export const useTransactionPolling = (options = {}) => {
  const {
    interval = 5000,
    enabled = true,
    onNewTransactions = () => {},
    onError = () => {}
  } = options

  const [isPolling, setIsPolling] = useState(false)
  const [lastTransactionId, setLastTransactionId] = useState(null)
  const intervalRef = useRef(null)

  // Fetch the latest transaction ID to initialize polling
  const initializePolling = useCallback(async () => {
    try {
      const latestId = await getLatestTransactionId()
      setLastTransactionId(latestId)
    } catch (error) {
      console.error('Error initializing polling:', error)
      onError(error)
    }
  }, [onError])

  // Check for new transactions
  const checkForNewTransactions = useCallback(async () => {
    if (!enabled) return

    try {
      setIsPolling(true)
      const newTransactions = await getNewTransactions(lastTransactionId)
      
      if (newTransactions.length > 0) {
        // Update the last transaction ID
        setLastTransactionId(newTransactions[0].id)
        // Call the callback with new transactions
        onNewTransactions(newTransactions)
      }
    } catch (error) {
      console.error('Error checking for new transactions:', error)
      onError(error)
    } finally {
      setIsPolling(false)
    }
  }, [enabled, lastTransactionId, onNewTransactions, onError])

  // Start polling
  const startPolling = useCallback(() => {
    if (intervalRef.current) return

    intervalRef.current = setInterval(() => {
      checkForNewTransactions()
    }, interval)
  }, [interval, checkForNewTransactions])

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPolling(false)
  }, [])

  // Manual refresh
  const manualRefresh = useCallback(async () => {
    return checkForNewTransactions()
  }, [checkForNewTransactions])

  // Initialize and start polling when enabled
  useEffect(() => {
    if (enabled) {
      initializePolling().then(() => {
        startPolling()
      })
    } else {
      stopPolling()
    }

    return () => {
      stopPolling()
    }
  }, [enabled, initializePolling, startPolling, stopPolling])

  return {
    isPolling,
    startPolling,
    stopPolling,
    manualRefresh,
    lastTransactionId
  }
}