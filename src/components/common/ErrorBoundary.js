'use client'

import { Component } from 'react'
import { Alert, Button, Result } from 'antd'
import { RefreshCw, Home, Bug } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Here you could also log to an error reporting service
    // logErrorToService(error, errorInfo)
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReportError = () => {
    const { error, errorInfo } = this.state
    const errorReport = {
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2)).then(() => {
      alert('Error report copied to clipboard. Please send this to the development team.')
    }).catch(() => {
      alert('Failed to copy error report. Please manually report this error.')
    })
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount } = this.state
      const { fallback, minimal = false } = this.props

      // Custom fallback UI
      if (fallback) {
        return fallback(error, this.handleRetry)
      }

      // Minimal error display
      if (minimal) {
        return (
          <Alert
            message="Something went wrong"
            description="An error occurred while loading this component."
            type="error"
            showIcon
            action={
              <Button size="small" onClick={this.handleRetry}>
                <RefreshCw size={14} />
                Retry
              </Button>
            }
          />
        )
      }

      // Full error page
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full">
            <Result
              status="error"
              title="Oops! Something went wrong"
              subTitle="We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists."
              extra={[
                <Button 
                  type="primary" 
                  key="retry" 
                  onClick={this.handleRetry}
                  icon={<RefreshCw size={16} />}
                  disabled={retryCount >= 3}
                >
                  {retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
                </Button>,
                <Button 
                  key="home" 
                  onClick={this.handleGoHome}
                  icon={<Home size={16} />}
                >
                  Go Home
                </Button>,
                <Button 
                  key="report" 
                  onClick={this.handleReportError}
                  icon={<Bug size={16} />}
                >
                  Report Error
                </Button>
              ]}
            />

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 space-y-4">
                <Alert
                  message="Development Error Details"
                  type="warning"
                  showIcon
                />
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Error:</h4>
                    <pre className="text-sm text-red-700 whitespace-pre-wrap break-all">
                      {error.toString()}
                    </pre>
                  </div>
                )}

                {errorInfo?.componentStack && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-2">Component Stack:</h4>
                    <pre className="text-sm text-orange-700 whitespace-pre-wrap break-all">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Hook for handling async errors
export const useErrorHandler = () => {
  const handleError = (error) => {
    console.error('Async error caught:', error)
    
    // You can dispatch to a global error state or show a notification
    // For now, we'll just log it
    if (error?.response?.status === 401) {
      // Handle authentication errors
      window.location.href = '/login'
    } else if (error?.response?.status >= 500) {
      // Handle server errors
      alert('Server error occurred. Please try again later.')
    } else {
      // Handle other errors
      console.error('Unhandled error:', error)
    }
  }

  return { handleError }
}