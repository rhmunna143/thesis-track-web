import api from './api'

export const projectBookService = {
  // Submit project book (Students only - with approved proposals)
  submitProjectBook: async (projectBookData) => {
    try {
      const response = await api.post('/project-books', projectBookData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get all project books based on user role
  getProjectBooks: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.status) queryParams.append('status', params.status)
      if (params.search) queryParams.append('search', params.search)
      if (params.studentId) queryParams.append('studentId', params.studentId)
      if (params.supervisorId) queryParams.append('supervisorId', params.supervisorId)

      const response = await api.get(`/project-books?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get project book by ID
  getProjectBookById: async (projectBookId) => {
    try {
      const response = await api.get(`/project-books/${projectBookId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Update project book (Students - only if not submitted)
  updateProjectBook: async (projectBookId, projectBookData) => {
    try {
      const response = await api.put(`/project-books/${projectBookId}`, projectBookData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Review project book (Teachers and Admins only)
  reviewProjectBook: async (projectBookId, reviewData) => {
    try {
      const response = await api.patch(`/project-books/${projectBookId}/review`, reviewData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get project books by status
  getProjectBooksByStatus: async (status, params = {}) => {
    try {
      return await projectBookService.getProjectBooks({ ...params, status })
    } catch (error) {
      throw error
    }
  },

  // Get pending project books (for teachers/admins)
  getPendingProjectBooks: async (params = {}) => {
    try {
      return await projectBookService.getProjectBooksByStatus('PENDING', params)
    } catch (error) {
      throw error
    }
  },

  // Get approved project books
  getApprovedProjectBooks: async (params = {}) => {
    try {
      return await projectBookService.getProjectBooksByStatus('APPROVED', params)
    } catch (error) {
      throw error
    }
  },

  // Get user's own project books (Students)
  getMyProjectBooks: async (params = {}) => {
    try {
      return await projectBookService.getProjectBooks(params)
    } catch (error) {
      throw error
    }
  },

  // Get project books assigned to current teacher
  getAssignedProjectBooks: async (params = {}) => {
    try {
      return await projectBookService.getProjectBooks(params)
    } catch (error) {
      throw error
    }
  },

  // Delete project book (Students - only drafts, Admin - any)
  deleteProjectBook: async (projectBookId) => {
    try {
      const response = await api.delete(`/project-books/${projectBookId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Submit project book for review
  submitForReview: async (projectBookId) => {
    try {
      const response = await api.patch(`/project-books/${projectBookId}/submit`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Download project book document
  downloadDocument: async (projectBookId) => {
    try {
      const response = await api.get(`/project-books/${projectBookId}/download`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Download presentation file
  downloadPresentation: async (projectBookId) => {
    try {
      const response = await api.get(`/project-books/${projectBookId}/presentation`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get project book statistics
  getProjectBookStats: async () => {
    try {
      const response = await api.get('/project-books/stats')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Search project books
  searchProjectBooks: async (query, params = {}) => {
    try {
      return await projectBookService.getProjectBooks({ ...params, search: query })
    } catch (error) {
      throw error
    }
  },

  // Export project books (Admin/Teachers)
  exportProjectBooks: async (format = 'csv', filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters)
      queryParams.append('format', format)
      
      const response = await api.get(`/project-books/export?${queryParams.toString()}`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Update project book status (Admin only)
  updateStatus: async (projectBookId, status) => {
    try {
      const response = await api.patch(`/project-books/${projectBookId}/status`, { status })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Grade project book (Teachers/Admins)
  gradeProjectBook: async (projectBookId, gradeData) => {
    try {
      const response = await api.patch(`/project-books/${projectBookId}/grade`, gradeData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}