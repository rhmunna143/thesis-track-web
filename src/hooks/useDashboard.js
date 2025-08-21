import { useState, useCallback } from 'react'
import { message } from 'antd'

export const useDashboard = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const executeAsync = useCallback(async (asyncFunction, errorMessage = 'Operation failed') => {
    try {
      setLoading(true)
      setError(null)
      const result = await asyncFunction()
      return result
    } catch (err) {
      console.error('Dashboard operation error:', err)
      
      // Only show error message for non-network errors or if it's a critical operation
      if (!err.message?.includes('Network Error') && !err.code === 'ERR_NETWORK') {
        const errorMsg = err.message || errorMessage
        setError(errorMsg)
        message.error(errorMsg)
      } else {
        // For network errors, just log and continue with fallback
        console.warn('Backend unavailable, using fallback data')
      }
      
      // Don't throw the error, let the calling function handle it
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    executeAsync,
    clearError
  }
}
