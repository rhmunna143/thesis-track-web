// Backend health check utility for session management

import { config } from '../lib/config'

export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${config.api.baseUrl}/health`, {
      method: 'GET',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      return { available: true, status: 'healthy' }
    } else {
      return { available: false, status: 'unhealthy', statusCode: response.status }
    }
  } catch (error) {
    return { 
      available: false, 
      status: 'unavailable', 
      error: error.message 
    }
  }
}

export const testSessionEndpoints = async () => {
  const endpoints = [
    '/sessions',
    '/sessions/active'
  ]
  
  const results = {}
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
        method: 'GET',
        timeout: 3000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      results[endpoint] = {
        available: response.ok,
        status: response.status,
        statusText: response.statusText
      }
    } catch (error) {
      results[endpoint] = {
        available: false,
        error: error.message
      }
    }
  }
  
  return results
}

export const getBackendStatus = async () => {
  const health = await checkBackendHealth()
  const endpoints = await testSessionEndpoints()
  
  return {
    backend: health,
    endpoints,
    isFullyAvailable: health.available && Object.values(endpoints).every(e => e.available),
    timestamp: new Date().toISOString()
  }
}

// Helper to log backend status for debugging
export const logBackendStatus = async () => {
  const status = await getBackendStatus()
  
  console.group('🔍 Backend Status Check')
  console.log('Overall Health:', status.backend)
  console.log('Session Endpoints:', status.endpoints)
  console.log('Fully Available:', status.isFullyAvailable)
  console.log('Checked at:', status.timestamp)
  console.groupEnd()
  
  return status
}

// Demo mode indicator
export const isDemoMode = (error) => {
  const demoIndicators = [
    'Cannot GET',
    'Network Error',
    'ECONNREFUSED',
    'ERR_CONNECTION_REFUSED',
    'fetch failed',
    'Failed to fetch'
  ]
  
  const errorMessage = error?.message || error?.toString() || ''
  return demoIndicators.some(indicator => 
    errorMessage.toLowerCase().includes(indicator.toLowerCase())
  )
}
