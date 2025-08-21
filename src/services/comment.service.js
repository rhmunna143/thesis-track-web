import api from './api'

export const commentService = {
  // Add comment to proposal (Teachers and Admin only)
  addComment: async (proposalId, content) => {
    try {
      const response = await api.post('/comments', {
        proposalId,
        content
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get comments for a proposal
  getCommentsByProposal: async (proposalId) => {
    try {
      const response = await api.get(`/comments/proposal/${proposalId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Update comment (only by comment author)
  updateComment: async (commentId, content) => {
    try {
      const response = await api.put(`/comments/${commentId}`, { content })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Delete comment (only by comment author or admin)
  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/comments/${commentId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get comment by ID
  getCommentById: async (commentId) => {
    try {
      const response = await api.get(`/comments/${commentId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get all comments by current user (for teachers/admins)
  getMyComments: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.proposalId) queryParams.append('proposalId', params.proposalId)

      const response = await api.get(`/comments/my?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Mark comment as resolved (for tracking)
  markAsResolved: async (commentId) => {
    try {
      const response = await api.patch(`/comments/${commentId}/resolve`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Reply to a comment (nested comments)
  replyToComment: async (commentId, content) => {
    try {
      const response = await api.post(`/comments/${commentId}/reply`, { content })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get comment replies
  getCommentReplies: async (commentId) => {
    try {
      const response = await api.get(`/comments/${commentId}/replies`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Bulk add comments (for multiple feedback points)
  addMultipleComments: async (proposalId, comments) => {
    try {
      const response = await api.post('/comments/bulk', {
        proposalId,
        comments
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}