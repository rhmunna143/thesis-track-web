import api from './api'

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },
}