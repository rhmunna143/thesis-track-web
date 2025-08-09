import { useCallback } from 'react'
import { message, notification } from 'antd'
import useAuthStore from '../store/authStore'

const useErrorHandler = () => {
  const { logout } = useAuthStore()

  const handleError = useCallback((error, options = {}) => {
    const {
      showNotification = true,
      showMessage = false,
      silent = false,
      title = 'Error',
      redirectOnAuth = true
    } = options

    console.error('Error handled:', error)

    // Extract error information
    const errorInfo = extractErrorInfo(error)
    const { status, message: errorMessage, code } = errorInfo

    // Handle specific HTTP status codes
    switch (status) {
      case 401:
        if (redirectOnAuth) {
          handleAuthError()
        }
        break
      
      case 403:
        handleForbiddenError(errorMessage, { showNotification, showMessage, silent, title })
        break
      
      case 404:
        handleNotFoundError(errorMessage, { showNotification, showMessage, silent, title })
        break
      
      case 422:
        handleValidationError(errorMessage, { showNotification, showMessage, silent, title })
        break
      
      case 429:
        handleRateLimitError(errorMessage, { showNotification, showMessage, silent, title })
        break
      
      case 500:
      case 502:
      case 503:
      case 504:
        handleServerError(errorMessage, { showNotification, showMessage, silent, title })
        break
      
      default:
        handleGenericError(errorMessage, { showNotification, showMessage, silent, title })
        break
    }

    // Log error for analytics/monitoring
    logError(error, errorInfo)

    return errorInfo
  }, [logout])

  const handleAuthError = useCallback(() => {
    message.error('Your session has expired. Please log in again.')
    logout()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }, [logout])

  const handleForbiddenError = useCallback((errorMessage, options) => {
    const msg = errorMessage || 'You do not have permission to perform this action'
    showErrorNotification(msg, 'Access Denied', options)
  }, [])

  const handleNotFoundError = useCallback((errorMessage, options) => {
    const msg = errorMessage || 'The requested resource was not found'
    showErrorNotification(msg, 'Not Found', options)
  }, [])

  const handleValidationError = useCallback((errorMessage, options) => {
    const msg = errorMessage || 'Please check your input and try again'
    showErrorNotification(msg, 'Validation Error', options)
  }, [])

  const handleRateLimitError = useCallback((errorMessage, options) => {
    const msg = errorMessage || 'Too many requests. Please try again later'
    showErrorNotification(msg, 'Rate Limit Exceeded', options)
  }, [])

  const handleServerError = useCallback((errorMessage, options) => {
    const msg = errorMessage || 'Server error occurred. Please try again later'
    showErrorNotification(msg, 'Server Error', options)
  }, [])

  const handleGenericError = useCallback((errorMessage, options) => {
    const msg = errorMessage || 'An unexpected error occurred'
    showErrorNotification(msg, 'Error', options)
  }, [])

  const showErrorNotification = useCallback((msg, title, options) => {
    const { showNotification, showMessage, silent } = options

    if (silent) return

    if (showMessage) {
      message.error(msg)
    }

    if (showNotification) {
      notification.error({
        message: title,
        description: msg,
        duration: 5,
        placement: 'topRight'
      })
    }
  }, [])

  // Handle async operations with automatic error handling
  const handleAsync = useCallback(async (asyncFn, options = {}) => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error, options)
      throw error
    }
  }, [handleError])

  // Wrap promises with error handling
  const wrapPromise = useCallback((promise, options = {}) => {
    return promise.catch(error => {
      handleError(error, options)
      throw error
    })
  }, [handleError])

  return {
    handleError,
    handleAsync,
    wrapPromise,
    handleAuthError,
    handleForbiddenError,
    handleNotFoundError,
    handleValidationError,
    handleRateLimitError,
    handleServerError,
    handleGenericError
  }
}

// Helper functions
const extractErrorInfo = (error) => {
  let status = null
  let message = 'An unexpected error occurred'
  let code = null
  let details = null

  if (error?.response) {
    // HTTP error response
    status = error.response.status
    message = error.response.data?.message || error.response.data?.error || error.message
    code = error.response.data?.code
    details = error.response.data?.details
  } else if (error?.message) {
    // JavaScript error or custom error
    message = error.message
    code = error.code
    details = error.details
  } else if (typeof error === 'string') {
    // String error
    message = error
  } else if (error?.data?.message) {
    // Some APIs return errors in data property
    message = error.data.message
    status = error.data.status
    code = error.data.code
  }

  return {
    status,
    message,
    code,
    details,
    originalError: error
  }
}

const logError = (error, errorInfo) => {
  // In production, you would send this to an error tracking service
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Error Details')
    console.error('Original Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Stack Trace:', error?.stack)
    console.error('Timestamp:', new Date().toISOString())
    console.error('URL:', window?.location?.href)
    console.error('User Agent:', navigator?.userAgent)
    console.groupEnd()
  }

  // Here you could send to error tracking services like Sentry, LogRocket, etc.
  // Example:
  // Sentry.captureException(error, {
  //   tags: {
  //     status: errorInfo.status,
  //     code: errorInfo.code
  //   },
  //   extra: errorInfo
  // })
}

// Network error detection
export const isNetworkError = (error) => {
  return !error?.response && (
    error?.code === 'NETWORK_ERROR' ||
    error?.message?.includes('Network Error') ||
    error?.message?.includes('fetch')
  )
}

// Timeout error detection
export const isTimeoutError = (error) => {
  return error?.code === 'ECONNABORTED' || 
         error?.message?.includes('timeout')
}

// Validation error detection
export const isValidationError = (error) => {
  return error?.response?.status === 422 ||
         error?.response?.status === 400
}

// Auth error detection
export const isAuthError = (error) => {
  return error?.response?.status === 401
}

export default useErrorHandler