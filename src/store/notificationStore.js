import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { notificationService } from '../services/notification.service'

const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },
      loading: false,
      error: null,
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        proposalUpdates: true,
        commentNotifications: true,
        systemNotifications: true
      },

      // Set notifications
      setNotifications: (notifications) => set({ notifications }),

      // Set unread count
      setUnreadCount: (count) => set({ unreadCount: count }),

      // Set pagination
      setPagination: (pagination) => set({ pagination }),

      // Set loading state
      setLoading: (loading) => set({ loading }),

      // Set error
      setError: (error) => set({ error }),

      // Clear error
      clearError: () => set({ error: null }),

      // Fetch all notifications
      fetchNotifications: async (params = {}) => {
        set({ loading: true, error: null })
        try {
          const { pagination } = get()
          
          const queryParams = {
            page: params.page || pagination.page,
            limit: params.limit || pagination.limit,
            ...params
          }

          const response = await notificationService.getNotifications(queryParams)
          
          set({
            notifications: response.data || response,
            pagination: response.pagination || pagination,
            loading: false,
            error: null
          })

          return response
        } catch (error) {
          set({
            loading: false,
            error: error.message || 'Failed to fetch notifications'
          })
          throw error
        }
      },

      // Fetch unread notifications only
      fetchUnreadNotifications: async (params = {}) => {
        set({ loading: true, error: null })
        try {
          const response = await notificationService.getUnreadNotifications(params)
          
          set({
            notifications: response.data || response,
            unreadCount: response.data ? response.data.length : 0,
            loading: false,
            error: null
          })

          return response
        } catch (error) {
          set({
            loading: false,
            error: error.message || 'Failed to fetch unread notifications'
          })
          throw error
        }
      },

      // Get unread count
      fetchUnreadCount: async () => {
        try {
          const count = await notificationService.getUnreadCount()
          set({ unreadCount: count })
          return count
        } catch (error) {
          console.error('Failed to fetch unread count:', error)
          return 0
        }
      },

      // Mark notification as read
      markAsRead: async (notificationId) => {
        try {
          await notificationService.markAsRead(notificationId)
          
          set((state) => ({
            notifications: state.notifications.map(notif =>
              notif.id === notificationId ? { ...notif, is_read: true } : notif
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }))

          return true
        } catch (error) {
          set({ error: error.message || 'Failed to mark notification as read' })
          throw error
        }
      },

      // Mark all notifications as read
      markAllAsRead: async () => {
        set({ loading: true, error: null })
        try {
          await notificationService.markAllAsRead()
          
          set((state) => ({
            notifications: state.notifications.map(notif => ({ ...notif, is_read: true })),
            unreadCount: 0,
            loading: false,
            error: null
          }))

          return true
        } catch (error) {
          set({
            loading: false,
            error: error.message || 'Failed to mark all notifications as read'
          })
          throw error
        }
      },

      // Delete notification
      deleteNotification: async (notificationId) => {
        try {
          await notificationService.deleteNotification(notificationId)
          
          set((state) => {
            const deletedNotif = state.notifications.find(n => n.id === notificationId)
            const wasUnread = deletedNotif && !deletedNotif.is_read
            
            return {
              notifications: state.notifications.filter(notif => notif.id !== notificationId),
              unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
            }
          })

          return true
        } catch (error) {
          set({ error: error.message || 'Failed to delete notification' })
          throw error
        }
      },

      // Delete all notifications
      deleteAllNotifications: async () => {
        set({ loading: true, error: null })
        try {
          await notificationService.deleteAllNotifications()
          
          set({
            notifications: [],
            unreadCount: 0,
            loading: false,
            error: null
          })

          return true
        } catch (error) {
          set({
            loading: false,
            error: error.message || 'Failed to delete all notifications'
          })
          throw error
        }
      },

      // Get notifications by type
      getNotificationsByType: (type) => {
        const { notifications } = get()
        return notifications.filter(notif => notif.type === type)
      },

      // Get unread notifications
      getUnreadNotifications: () => {
        const { notifications } = get()
        return notifications.filter(notif => !notif.is_read)
      },

      // Add new notification (for real-time updates)
      addNotification: (notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: !notification.is_read ? state.unreadCount + 1 : state.unreadCount
        }))
      },

      // Update notification preferences
      updatePreferences: async (newPreferences) => {
        set({ loading: true, error: null })
        try {
          const updatedPreferences = await notificationService.updatePreferences(newPreferences)
          
          set({
            preferences: { ...get().preferences, ...updatedPreferences },
            loading: false,
            error: null
          })

          return updatedPreferences
        } catch (error) {
          set({
            loading: false,
            error: error.message || 'Failed to update preferences'
          })
          throw error
        }
      },

      // Get notification preferences
      fetchPreferences: async () => {
        set({ loading: true, error: null })
        try {
          const preferences = await notificationService.getPreferences()
          
          set({
            preferences: preferences,
            loading: false,
            error: null
          })

          return preferences
        } catch (error) {
          set({
            loading: false,
            error: error.message || 'Failed to fetch preferences'
          })
          throw error
        }
      },

      // Format notifications for display
      getFormattedNotifications: () => {
        const { notifications } = get()
        return notifications.map(notif => notificationService.formatNotification(notif))
      },

      // Group notifications by date
      getGroupedNotifications: () => {
        const { notifications } = get()
        return notificationService.groupByDate(notifications)
      },

      // Reset store
      reset: () => set({
        notifications: [],
        unreadCount: 0,
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        },
        loading: false,
        error: null
      })
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        unreadCount: state.unreadCount,
        preferences: state.preferences
      }),
    }
  )
)

export default useNotificationStore