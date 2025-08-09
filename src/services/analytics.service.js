import api from './api'

export const analyticsService = {
  // Get role-based dashboard data
  getDashboardData: async () => {
    try {
      const response = await api.get('/analytics/dashboard')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get proposal analytics/statistics
  getProposalAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      if (params.groupBy) queryParams.append('groupBy', params.groupBy)
      if (params.department) queryParams.append('department', params.department)
      if (params.supervisorId) queryParams.append('supervisorId', params.supervisorId)

      const response = await api.get(`/analytics/proposals?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get user analytics (Admin only)
  getUserAnalytics: async () => {
    try {
      const response = await api.get('/analytics/users')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get project book analytics
  getProjectBookAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      if (params.groupBy) queryParams.append('groupBy', params.groupBy)

      const response = await api.get(`/analytics/project-books?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get session analytics
  getSessionAnalytics: async (sessionId = null) => {
    try {
      const endpoint = sessionId 
        ? `/analytics/sessions/${sessionId}` 
        : '/analytics/sessions'
      
      const response = await api.get(endpoint)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get activity analytics (recent activity)
  getActivityAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.days) queryParams.append('days', params.days)
      if (params.userId) queryParams.append('userId', params.userId)
      if (params.type) queryParams.append('type', params.type)

      const response = await api.get(`/analytics/activity?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get performance analytics (for teachers)
  getPerformanceAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.teacherId) queryParams.append('teacherId', params.teacherId)
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)

      const response = await api.get(`/analytics/performance?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get trends analytics
  getTrendsAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.period) queryParams.append('period', params.period) // daily, weekly, monthly
      if (params.metric) queryParams.append('metric', params.metric) // proposals, users, books
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)

      const response = await api.get(`/analytics/trends?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get export analytics data
  exportAnalytics: async (type, params = {}) => {
    try {
      const queryParams = new URLSearchParams(params)
      queryParams.append('format', 'csv')
      
      const response = await api.get(`/analytics/${type}/export?${queryParams.toString()}`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get department-wise analytics
  getDepartmentAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)

      const response = await api.get(`/analytics/departments?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get supervisor-wise analytics
  getSupervisorAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      if (params.supervisorId) queryParams.append('supervisorId', params.supervisorId)

      const response = await api.get(`/analytics/supervisors?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Format data for charts
  formatChartData: (data, type = 'bar') => {
    switch (type) {
      case 'pie':
        return data.map(item => ({
          name: item.label || item.name,
          value: item.count || item.value
        }))
      
      case 'line':
      case 'area':
        return data.map(item => ({
          date: item.date || item.period,
          value: item.count || item.value
        }))
      
      case 'bar':
      default:
        return data.map(item => ({
          name: item.label || item.name,
          count: item.count || item.value
        }))
    }
  },

  // Get time range presets
  getTimeRangePresets: () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return {
      today: {
        startDate: today.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      },
      thisWeek: {
        startDate: new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      },
      thisMonth: {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      },
      thisYear: {
        startDate: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      },
      last30Days: {
        startDate: new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      }
    }
  },

  // Calculate percentage change
  calculatePercentageChange: (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  },

  // Format metrics for display
  formatMetrics: (metrics) => {
    return Object.entries(metrics).map(([key, value]) => ({
      key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      value: typeof value === 'number' ? value.toLocaleString() : value,
      change: value.change || null
    }))
  }
}