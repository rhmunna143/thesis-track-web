import api from './api'

export const proposalService = {
  // Get all proposals based on user role
  getProposals: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      // Add pagination parameters
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      
      // Add filtering parameters
      if (params.status) queryParams.append('status', params.status)
      if (params.search) queryParams.append('search', params.search)
      if (params.supervisorId) queryParams.append('supervisorId', params.supervisorId)
      if (params.studentId) queryParams.append('studentId', params.studentId)

      const response = await api.get(`/proposals?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get proposal by ID
  getProposalById: async (proposalId) => {
    try {
      const response = await api.get(`/proposals/${proposalId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Submit new proposal (Students only)
  submitProposal: async (proposalData) => {
    try {
      const response = await api.post('/proposals', proposalData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Update proposal (Students - only if not submitted)
  updateProposal: async (proposalId, proposalData) => {
    try {
      const response = await api.put(`/proposals/${proposalId}`, proposalData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Update proposal status (Teachers only)
  updateProposalStatus: async (proposalId, status) => {
    try {
      const response = await api.patch(`/proposals/${proposalId}/status`, { status })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Assign supervisor to proposal (Admin only)
  assignSupervisor: async (proposalId, supervisorId) => {
    try {
      const response = await api.patch(`/proposals/${proposalId}/assign`, { supervisorId })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get proposals by status
  getProposalsByStatus: async (status, params = {}) => {
    try {
      return await proposalService.getProposals({ ...params, status })
    } catch (error) {
      throw error
    }
  },

  // Get pending proposals (for teachers/admins)
  getPendingProposals: async (params = {}) => {
    try {
      return await proposalService.getProposalsByStatus('PENDING', params)
    } catch (error) {
      throw error
    }
  },

  // Get approved proposals
  getApprovedProposals: async (params = {}) => {
    try {
      return await proposalService.getProposalsByStatus('APPROVED', params)
    } catch (error) {
      throw error
    }
  },

  // Get user's own proposals (Students)
  getMyProposals: async (params = {}) => {
    try {
      return await proposalService.getProposals(params)
    } catch (error) {
      throw error
    }
  },

  // Get proposals assigned to current teacher
  getAssignedProposals: async (params = {}) => {
    try {
      return await proposalService.getProposals(params)
    } catch (error) {
      throw error
    }
  },

  // Delete proposal (Students - only drafts)
  deleteProposal: async (proposalId) => {
    try {
      const response = await api.delete(`/proposals/${proposalId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get proposal statistics for dashboard
  getProposalStats: async () => {
    try {
      const response = await api.get('/proposals/stats')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Search proposals
  searchProposals: async (query, params = {}) => {
    try {
      return await proposalService.getProposals({ ...params, search: query })
    } catch (error) {
      throw error
    }
  },

  // Submit proposal for review (change from DRAFT to SUBMITTED)
  submitForReview: async (proposalId) => {
    try {
      const response = await api.patch(`/proposals/${proposalId}/submit`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Export proposals (Admin/Teachers)
  exportProposals: async (format = 'csv', filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters)
      queryParams.append('format', format)
      
      const response = await api.get(`/proposals/export?${queryParams.toString()}`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}