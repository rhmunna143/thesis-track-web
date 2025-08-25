// Backend connectivity test
// This file helps verify if the backend is running and responsive

import api from '../services/api'

export const testBackendConnectivity = async () => {
  const tests = []
  
  try {
    // Test 1: Health check
    try {
      const healthResponse = await api.get('/health')
      tests.push({
        test: 'Health Check',
        status: 'PASS',
        message: 'Backend is healthy',
        data: healthResponse.data
      })
    } catch (error) {
      tests.push({
        test: 'Health Check',
        status: 'FAIL',
        message: 'Health endpoint not responding',
        error: error.message
      })
    }
    
    // Test 2: Authentication endpoint
    try {
      const response = await api.get('/me')
      tests.push({
        test: 'Authentication',
        status: 'PASS',
        message: 'Auth endpoint accessible',
        data: response.data
      })
    } catch (error) {
      if (error.response?.status === 401) {
        tests.push({
          test: 'Authentication',
          status: 'PASS',
          message: 'Auth endpoint working (401 expected without token)',
          error: 'Unauthorized (expected)'
        })
      } else {
        tests.push({
          test: 'Authentication',
          status: 'FAIL',
          message: 'Auth endpoint error',
          error: error.message
        })
      }
    }
    
    // Test 3: Users endpoint (requires auth)
    try {
      const response = await api.get('/users?page=1&limit=1')
      tests.push({
        test: 'Users API',
        status: 'PASS',
        message: 'Users endpoint accessible',
        data: response.data
      })
    } catch (error) {
      if (error.response?.status === 401) {
        tests.push({
          test: 'Users API',
          status: 'PASS',
          message: 'Users endpoint working (401 expected without proper auth)',
          error: 'Unauthorized (expected)'
        })
      } else {
        tests.push({
          test: 'Users API',
          status: 'FAIL',
          message: 'Users endpoint error',
          error: error.message
        })
      }
    }
    
    // Test 4: Analytics endpoint
    try {
      const response = await api.get('/analytics/dashboard')
      tests.push({
        test: 'Analytics API',
        status: 'PASS',
        message: 'Analytics endpoint accessible',
        data: response.data
      })
    } catch (error) {
      if (error.response?.status === 401) {
        tests.push({
          test: 'Analytics API',
          status: 'PASS',
          message: 'Analytics endpoint working (401 expected without proper auth)',
          error: 'Unauthorized (expected)'
        })
      } else {
        tests.push({
          test: 'Analytics API',
          status: 'FAIL',
          message: 'Analytics endpoint error',
          error: error.message
        })
      }
    }
    
    return {
      overall: tests.filter(t => t.status === 'FAIL').length === 0 ? 'HEALTHY' : 'ISSUES_DETECTED',
      timestamp: new Date().toISOString(),
      tests
    }
    
  } catch (error) {
    return {
      overall: 'CRITICAL_ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      tests: []
    }
  }
}

// Helper function to display test results in console
export const logBackendStatus = async () => {
  console.group('🔍 Backend Connectivity Test')
  
  const results = await testBackendConnectivity()
  
  console.log(`Overall Status: ${results.overall}`)
  console.log(`Timestamp: ${results.timestamp}`)
  
  if (results.tests?.length > 0) {
    results.tests.forEach(test => {
      const icon = test.status === 'PASS' ? '✅' : '❌'
      console.log(`${icon} ${test.test}: ${test.message}`)
      if (test.error) {
        console.log(`   Error: ${test.error}`)
      }
    })
  }
  
  if (results.error) {
    console.error(`Critical Error: ${results.error}`)
  }
  
  console.groupEnd()
  
  return results
}

// Configuration for backend URLs
export const backendConfig = {
  local: 'http://localhost:5000',
  development: 'http://localhost:5000',
  staging: 'https://your-staging-api.com',
  production: 'https://your-production-api.com'
}

// Helper to get current backend URL
export const getCurrentBackendUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || backendConfig.local
}

// Test specific endpoints
export const testSpecificEndpoint = async (endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method: method.toLowerCase(),
      url: endpoint
    }
    
    if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
      config.data = data
    }
    
    const response = await api.request(config)
    
    return {
      success: true,
      status: response.status,
      data: response.data,
      headers: response.headers
    }
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    }
  }
}
