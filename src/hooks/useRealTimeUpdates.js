import { useEffect, useCallback, useRef } from 'react'
import { message, notification } from 'antd'
import useAuthStore from '../store/authStore'
import useNotificationStore from '../store/notificationStore'
import useProposalStore from '../store/proposalStore'
import useProjectBookStore from '../store/projectBookStore'

const useRealTimeUpdates = (options = {}) => {
  const {
    enabled = true,
    pollingInterval = 30000, // 30 seconds
    enableNotifications = true,
    enableProposalUpdates = true,
    enableProjectBookUpdates = true
  } = options

  const { user, isAuthenticated } = useAuthStore()
  const { fetchUnreadCount, addNotification } = useNotificationStore()
  const { fetchProposals } = useProposalStore()
  const { fetchProjectBooks } = useProjectBookStore()

  const intervalRef = useRef(null)
  const lastUpdateRef = useRef(new Date())

  // WebSocket connection (if supported by backend)
  const wsRef = useRef(null)

  const initializeWebSocket = useCallback(() => {
    if (!user?.id || !isAuthenticated) return

    // Only initialize if WebSocket URL is configured
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws')
    
    if (!wsUrl) return

    try {
      const ws = new WebSocket(`${wsUrl}/ws?token=${useAuthStore.getState().token}`)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleRealTimeUpdate(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (wsRef.current === ws) {
            initializeWebSocket()
          }
        }, 5000)
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      wsRef.current = ws
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
      // Fall back to polling if WebSocket fails
      startPolling()
    }
  }, [user?.id, isAuthenticated])

  const startPolling = useCallback(() => {
    if (!enabled || !isAuthenticated) return

    intervalRef.current = setInterval(async () => {
      try {
        await checkForUpdates()
      } catch (error) {
        console.error('Error checking for updates:', error)
      }
    }, pollingInterval)
  }, [enabled, isAuthenticated, pollingInterval])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const closeWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const checkForUpdates = useCallback(async () => {
    if (!isAuthenticated || !user) return

    try {
      // Check for new notifications
      if (enableNotifications) {
        await fetchUnreadCount()
      }

      // Optionally refresh data if there are updates
      // This could be optimized to only fetch when there are actual changes
      const now = new Date()
      const timeSinceLastUpdate = now - lastUpdateRef.current

      // Only check for data updates every 2 minutes to avoid excessive API calls
      if (timeSinceLastUpdate > 120000) {
        if (enableProposalUpdates) {
          // You might want to add a "last modified" timestamp check here
          // to avoid unnecessary data fetching
        }

        if (enableProjectBookUpdates) {
          // Similar optimization for project books
        }

        lastUpdateRef.current = now
      }
    } catch (error) {
      console.error('Error checking for updates:', error)
    }
  }, [isAuthenticated, user, enableNotifications, enableProposalUpdates, enableProjectBookUpdates, fetchUnreadCount])

  const handleRealTimeUpdate = useCallback((data) => {
    const { type, payload } = data

    switch (type) {
      case 'NOTIFICATION':
        handleNotificationUpdate(payload)
        break
      
      case 'PROPOSAL_UPDATE':
        handleProposalUpdate(payload)
        break
      
      case 'PROJECT_BOOK_UPDATE':
        handleProjectBookUpdate(payload)
        break
      
      case 'USER_UPDATE':
        handleUserUpdate(payload)
        break
      
      default:
        console.log('Unknown real-time update type:', type)
        break
    }
  }, [])

  const handleNotificationUpdate = useCallback((notification) => {
    if (enableNotifications) {
      addNotification(notification)
      
      // Show browser notification if user has granted permission
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        })
      }

      // Show in-app notification
      notification.open({
        message: notification.title,
        description: notification.message,
        duration: 4,
        placement: 'topRight'
      })
    }
  }, [enableNotifications, addNotification])

  const handleProposalUpdate = useCallback((proposal) => {
    if (enableProposalUpdates) {
      // Update proposal store
      const { updateProposal } = useProposalStore.getState()
      updateProposal(proposal.id, proposal)

      // Show notification about the update
      message.info(`Proposal "${proposal.title}" has been updated`)
    }
  }, [enableProposalUpdates])

  const handleProjectBookUpdate = useCallback((projectBook) => {
    if (enableProjectBookUpdates) {
      // Update project book store
      const { updateProjectBook } = useProjectBookStore.getState()
      updateProjectBook(projectBook.id, projectBook)

      // Show notification about the update
      message.info(`Project book "${projectBook.title}" has been updated`)
    }
  }, [enableProjectBookUpdates])

  const handleUserUpdate = useCallback((userData) => {
    // Update auth store if it's the current user
    if (userData.id === user?.id) {
      const { updateProfile } = useAuthStore.getState()
      updateProfile(userData)
    }
  }, [user?.id])

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }, [])

  // Initialize real-time updates
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      stopPolling()
      closeWebSocket()
      return
    }

    // Request notification permission on first load
    requestNotificationPermission()

    // Try WebSocket first, fall back to polling
    initializeWebSocket()

    // Cleanup on unmount
    return () => {
      stopPolling()
      closeWebSocket()
    }
  }, [enabled, isAuthenticated, initializeWebSocket, stopPolling, closeWebSocket, requestNotificationPermission])

  // Manual refresh function
  const refresh = useCallback(async () => {
    await checkForUpdates()
    
    if (enableProposalUpdates) {
      await fetchProposals()
    }
    
    if (enableProjectBookUpdates) {
      await fetchProjectBooks()
    }
  }, [checkForUpdates, enableProposalUpdates, enableProjectBookUpdates, fetchProposals, fetchProjectBooks])

  return {
    refresh,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    requestNotificationPermission
  }
}

export default useRealTimeUpdates

// Helper hook for components that need real-time updates
export const useComponentRealTimeUpdates = (componentType, options = {}) => {
  const defaultOptions = {
    enabled: true,
    enableNotifications: true,
    enableProposalUpdates: componentType === 'proposal' || componentType === 'dashboard',
    enableProjectBookUpdates: componentType === 'project-book' || componentType === 'dashboard'
  }

  return useRealTimeUpdates({ ...defaultOptions, ...options })
}