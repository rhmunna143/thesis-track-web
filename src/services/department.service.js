import api from './api'

export const departmentService = {
  // Get all departments
  getAllDepartments: async () => {
    try {
      const response = await api.get('/departments')
      return response.data
    } catch (error) {
      // If departments endpoint doesn't exist, try getting unique departments from users
      try {
        const usersResponse = await api.get('/users?limit=1000')
        const users = usersResponse.data?.data || []
        const uniqueDepartments = [...new Set(users.map(user => user.department).filter(Boolean))]
        return uniqueDepartments.sort()
      } catch (userError) {
        // Fallback to common departments
        return [
          'Computer Science',
          'Electrical Engineering',
          'Mechanical Engineering',
          'Civil Engineering',
          'Chemical Engineering',
          'Industrial Engineering',
          'Information Technology',
          'Mathematics',
          'Physics'
        ]
      }
    }
  },

  // Create new department
  createDepartment: async (departmentData) => {
    try {
      const response = await api.post('/departments', departmentData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Update department
  updateDepartment: async (departmentId, departmentData) => {
    try {
      const response = await api.put(`/departments/${departmentId}`, departmentData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Delete department
  deleteDepartment: async (departmentId) => {
    try {
      const response = await api.delete(`/departments/${departmentId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}
