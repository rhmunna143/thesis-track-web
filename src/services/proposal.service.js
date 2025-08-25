import api from './api'

export const proposalService = {
  // Get all proposals based on user role
  getProposals: async (params = {}) => {
    try {
      console.log('Calling GET /proposals with params:', params)
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
      console.log('GET /proposals response:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to get proposals:', error.response?.status, error.response?.data)
      throw error.response?.data || error
    }
  },

  // Get all proposals (Admin only)
  getAllProposals: async (params = {}) => {
    try {
      console.log('Calling GET /proposals (admin) with params:', params)
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
      console.log('GET /proposals (admin) response:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to get all proposals:', error.response?.status, error.response?.data)
      throw error.response?.data || error
    }
  },

  // Get proposal by ID
  getProposalById: async (proposalId) => {
    try {
      console.log(`Calling GET /proposals/${proposalId}`)
      const response = await api.get(`/proposals/${proposalId}`)
      console.log(`GET /proposals/${proposalId} response:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Failed to get proposal ${proposalId}:`, error.response?.status, error.response?.data)
      throw error.response?.data || error
    }
  },

  // Alias for getProposalById to maintain compatibility
  getProposal: async (proposalId) => {
    try {
      return await proposalService.getProposalById(proposalId)
    } catch (error) {
      throw error
    }
  },

  // Submit new proposal (Students only)
  submitProposal: async (proposalData) => {
    try {
      console.log('Calling POST /proposals with data:', proposalData)
      const response = await api.post('/proposals', proposalData)
      console.log('POST /proposals response:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to submit proposal:', error.response?.status, error.response?.data)
      throw error.response?.data || error
    }
  },

  // Alias for submitProposal to maintain compatibility
  createProposal: async (proposalData) => {
    try {
      return await proposalService.submitProposal(proposalData)
    } catch (error) {
      throw error
    }
  },

  // Update proposal (Students - only if not submitted)
  // NOTE: This endpoint is not available in the backend API
  // Students cannot update proposals once submitted
  updateProposal: async (proposalId, proposalData) => {
    console.warn('Update proposal endpoint is not supported by backend API')
    throw new Error('Proposal updates are not supported. Students must delete and recreate proposals for changes.')
    /*
    try {
      console.log(`Calling PATCH /proposals/${proposalId} with data:`, proposalData)
      const response = await api.patch(`/proposals/${proposalId}`, proposalData)
      console.log(`PATCH /proposals/${proposalId} response:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Failed to update proposal ${proposalId}:`, error.response?.status, error.response?.data)
      throw error.response?.data || error
    }
    */
  },

  // Update proposal status (Teachers only)
  updateProposalStatus: async (proposalId, status) => {
    try {
      console.log(`Calling PATCH /proposals/${proposalId}/status with status:`, status)
      const response = await api.patch(`/proposals/${proposalId}/status`, { status })
      console.log(`PATCH /proposals/${proposalId}/status response:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Failed to update proposal ${proposalId} status:`, error.response?.status, error.response?.data)
      throw error.response?.data || error
    }
  },

  // Assign supervisor to proposal (Admin only)
  assignSupervisor: async (proposalId, supervisorId) => {
    try {
      console.log(`Calling PATCH /proposals/${proposalId}/assign with supervisorId:`, supervisorId)
      const response = await api.patch(`/proposals/${proposalId}/assign`, { supervisorId })
      console.log(`PATCH /proposals/${proposalId}/assign response:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Failed to assign supervisor to proposal ${proposalId}:`, error.response?.status, error.response?.data)
      throw error.response?.data || error
    }
  },

  // Delete proposal (Students - only if not submitted)
  deleteProposal: async (proposalId) => {
    try {
      console.log(`Calling DELETE /proposals/${proposalId}`)
      const response = await api.delete(`/proposals/${proposalId}`)
      console.log(`DELETE /proposals/${proposalId} response:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Failed to delete proposal ${proposalId}:`, error.response?.status, error.response?.data)
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

  // Get proposal statistics for dashboard
  getProposalStats: async () => {
    try {
      console.log('Calling GET /proposals/stats')
      const response = await api.get('/proposals/stats')
      console.log('GET /proposals/stats response:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to get proposal stats:', error.response?.status, error.response?.data)
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
      console.log(`Calling PATCH /proposals/${proposalId}/submit`)
      const response = await api.patch(`/proposals/${proposalId}/submit`)
      console.log(`PATCH /proposals/${proposalId}/submit response:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Failed to submit proposal ${proposalId} for review:`, error.response?.status, error.response?.data)
      throw error.response?.data || error
    }
  },

  // Export proposals (Admin/Teachers)
  exportProposals: async (format = 'csv', filters = {}) => {
    try {
      console.log(`Calling GET /proposals/export with format: ${format}, filters:`, filters)
      const queryParams = new URLSearchParams(filters)
      queryParams.append('format', format)
      
      const response = await api.get(`/proposals/export?${queryParams.toString()}`, {
        responseType: 'blob'
      })
      console.log('GET /proposals/export response:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to export proposals:', error.response?.status, error.response?.data)
      throw error.response?.data || error
    }
  }
}