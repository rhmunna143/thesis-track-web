import api from './api'

export const userService = {
  // Get detailed current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get all users with pagination and filtering (Admin only)
  getAllUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      // Add pagination parameters
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      
      // Add filtering parameters
      if (params.role) queryParams.append('role', params.role)
      if (params.department) queryParams.append('department', params.department)
      if (params.search) queryParams.append('search', params.search)

      const response = await api.get(`/users?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Alias for getAllUsers to maintain compatibility
  getUsers: async (params = {}) => {
    return await userService.getAllUsers(params)
  },

  // Update user role (Admin only)
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.patch(`/users/${userId}/role`, { role })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get teachers/supervisors list
  getTeachers: async () => {
    try {
      console.log('Calling getTeachers via /users?role=TEACHER')
      const response = await api.get('/users?role=TEACHER&limit=100')
      console.log('getTeachers response:', response.data)
      return response.data?.data || []
    } catch (error) {
      console.error('Failed to get teachers via users endpoint:', error.response?.status, error.response?.data)
      throw error.response?.data || error
    }
  },

  // Get teachers from dedicated endpoint
  getAllTeachers: async (params = {}) => {
    try {
      console.log('Calling getAllTeachers with params:', params)
      const queryParams = new URLSearchParams()
      
      // Add filtering parameters as shown in Postman collection
      if (params.department) queryParams.append('department', params.department)
      if (params.search) queryParams.append('search', params.search)

      const queryString = queryParams.toString()
      const url = queryString ? `/teachers?${queryString}` : '/teachers'
      
      console.log(`Calling GET ${url}`)
      const response = await api.get(url)
      console.log(`GET ${url} response:`, response.data)
      return response.data
    } catch (error) {
      console.error('Failed to get teachers:', error.response?.status, error.response?.data)
      throw error.response?.data || error
    }
  },

  // Get students list (for teachers/admins)
  getStudents: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('role', 'STUDENT')
      
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.department) queryParams.append('department', params.department)
      if (params.search) queryParams.append('search', params.search)

      const response = await api.get(`/users?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Search users by name or email
  searchUsers: async (query, role = null) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('search', query)
      queryParams.append('limit', '50')
      
      if (role) queryParams.append('role', role)

      const response = await api.get(`/users?${queryParams.toString()}`)
      return response.data?.data || []
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Update user profile by ID (Admin only)
  updateUserProfile: async (userId, profileData) => {
    try {
      const response = await api.put(`/users/${userId}`, profileData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Delete user (Admin only)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Create new user (Admin only)
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Reset user password (Admin only)
  resetUserPassword: async (userId, newPassword) => {
    try {
      const response = await api.patch(`/users/${userId}/password`, { password: newPassword })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Toggle user status (Admin only)
  toggleUserStatus: async (userId, isActive) => {
    try {
      const response = await api.patch(`/users/${userId}/status`, { isActive })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Bulk import users (Admin only)
  bulkImportUsers: async (userData) => {
    try {
      const response = await api.post('/users/bulk-import', { users: userData })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get user statistics (Admin only)
  getUserStats: async () => {
    try {
      const response = await api.get('/users/stats')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}