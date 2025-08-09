import api from './api'

export const sessionService = {
  // Get current active session (Public endpoint)
  getActiveSession: async () => {
    try {
      const response = await api.get('/sessions/active')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get all sessions
  getAllSessions: async () => {
    try {
      const response = await api.get('/sessions')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Create new session (Admin only)
  createSession: async (sessionData) => {
    try {
      const response = await api.post('/sessions', sessionData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Update session (Admin only)
  updateSession: async (sessionId, sessionData) => {
    try {
      const response = await api.put(`/sessions/${sessionId}`, sessionData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Delete session (Admin only)
  deleteSession: async (sessionId) => {
    try {
      const response = await api.delete(`/sessions/${sessionId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Activate session (Admin only)
  activateSession: async (sessionId) => {
    try {
      const response = await api.patch(`/sessions/${sessionId}/activate`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Deactivate session (Admin only)
  deactivateSession: async (sessionId) => {
    try {
      const response = await api.patch(`/sessions/${sessionId}/deactivate`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get session by ID
  getSessionById: async (sessionId) => {
    try {
      const response = await api.get(`/sessions/${sessionId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get session statistics
  getSessionStats: async (sessionId) => {
    try {
      const response = await api.get(`/sessions/${sessionId}/stats`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get proposals for a specific session
  getSessionProposals: async (sessionId, params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.status) queryParams.append('status', params.status)

      const response = await api.get(`/sessions/${sessionId}/proposals?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Archive session (Admin only)
  archiveSession: async (sessionId) => {
    try {
      const response = await api.patch(`/sessions/${sessionId}/archive`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Clone session for new academic period (Admin only)
  cloneSession: async (sessionId, newSessionName) => {
    try {
      const response = await api.post(`/sessions/${sessionId}/clone`, {
        name: newSessionName
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}