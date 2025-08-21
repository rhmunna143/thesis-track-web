import api from './api'

export const authService = {
  // Public student signup
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // User login
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Admin-only user creation (TEACHER or STUDENT roles only)
  adminRegister: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/me')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Client-side logout (no API call needed)
  logout: () => {
    // Just clear client state - no API call needed
    return Promise.resolve()
  },

  // Verify token by getting current user
  verifyToken: async () => {
    try {
      const response = await api.get('/me')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },
}