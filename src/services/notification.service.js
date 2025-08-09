import api from './api'

export const notificationService = {
  // Get user notifications with pagination
  getNotifications: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      // Add pagination parameters
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      
      // Add filtering parameters
      if (params.unreadOnly !== undefined) {
        queryParams.append('unreadOnly', params.unreadOnly.toString())
      }
      if (params.type) queryParams.append('type', params.type)

      const response = await api.get(`/notifications?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get only unread notifications
  getUnreadNotifications: async (params = {}) => {
    try {
      return await notificationService.getNotifications({ 
        ...params, 
        unreadOnly: true 
      })
    } catch (error) {
      throw error
    }
  },

  // Get notification by ID
  getNotificationById: async (notificationId) => {
    try {
      const response = await api.get(`/notifications/${notificationId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.patch('/notifications/mark-all-read')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Delete all notifications
  deleteAllNotifications: async () => {
    try {
      const response = await api.delete('/notifications')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get notification count (total and unread)
  getNotificationCount: async () => {
    try {
      const response = await api.get('/notifications/count')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get unread notification count only
  getUnreadCount: async () => {
    try {
      const response = await notificationService.getNotificationCount()
      return response.unread || 0
    } catch (error) {
      return 0
    }
  },

  // Get notifications by type
  getNotificationsByType: async (type, params = {}) => {
    try {
      return await notificationService.getNotifications({ 
        ...params, 
        type 
      })
    } catch (error) {
      throw error
    }
  },

  // Update notification preferences (if available)
  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/notifications/preferences', preferences)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get notification preferences
  getPreferences: async () => {
    try {
      const response = await api.get('/notifications/preferences')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Subscribe to push notifications (if available)
  subscribeToPush: async (subscription) => {
    try {
      const response = await api.post('/notifications/subscribe', { subscription })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Unsubscribe from push notifications
  unsubscribeFromPush: async () => {
    try {
      const response = await api.post('/notifications/unsubscribe')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Format notification for display
  formatNotification: (notification) => {
    return {
      ...notification,
      timeAgo: notificationService.getTimeAgo(notification.created_at),
      icon: notificationService.getNotificationIcon(notification.type),
      color: notificationService.getNotificationColor(notification.type)
    }
  },

  // Get relative time string
  getTimeAgo: (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return date.toLocaleDateString()
  },

  // Get notification icon based on type
  getNotificationIcon: (type) => {
    const icons = {
      PROPOSAL_SUBMITTED: '📝',
      PROPOSAL_APPROVED: '✅',
      PROPOSAL_REJECTED: '❌',
      PROPOSAL_NEEDS_REVISION: '🔄',
      COMMENT_ADDED: '💬',
      PROJECT_BOOK_SUBMITTED: '📖',
      PROJECT_BOOK_REVIEWED: '📋',
      USER_REGISTERED: '👥',
      SESSION_CREATED: '📅',
      REMINDER: '⏰',
      SYSTEM: '⚙️'
    }
    return icons[type] || '📢'
  },

  // Get notification color based on type
  getNotificationColor: (type) => {
    const colors = {
      PROPOSAL_SUBMITTED: 'blue',
      PROPOSAL_APPROVED: 'green',
      PROPOSAL_REJECTED: 'red',
      PROPOSAL_NEEDS_REVISION: 'orange',
      COMMENT_ADDED: 'purple',
      PROJECT_BOOK_SUBMITTED: 'blue',
      PROJECT_BOOK_REVIEWED: 'green',
      USER_REGISTERED: 'cyan',
      SESSION_CREATED: 'yellow',
      REMINDER: 'orange',
      SYSTEM: 'gray'
    }
    return colors[type] || 'blue'
  },

  // Group notifications by date
  groupByDate: (notifications) => {
    const groups = {}
    
    notifications.forEach(notification => {
      const date = new Date(notification.created_at).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(notificationService.formatNotification(notification))
    })

    return Object.entries(groups).map(([date, notifs]) => ({
      date,
      notifications: notifs
    })).sort((a, b) => new Date(b.date) - new Date(a.date))
  }
}