'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react'
import { Badge, Button, Dropdown, Empty, Spin, message } from 'antd'
import useNotificationStore from '../../store/notificationStore'
import { formatDistanceToNow } from 'date-fns'

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)

  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadNotifications,
    getFormattedNotifications,
    clearError
  } = useNotificationStore()

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
    
    // Set up polling for new notifications
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [fetchNotifications, fetchUnreadCount])

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError()
  }, [clearError])

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id)
        message.success('Notification marked as read')
      } catch (error) {
        message.error('Failed to mark notification as read')
      }
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      message.success('All notifications marked as read')
    } catch (error) {
      message.error('Failed to mark all notifications as read')
    }
  }

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation()
    try {
      await deleteNotification(notificationId)
      message.success('Notification deleted')
    } catch (error) {
      message.error('Failed to delete notification')
    }
  }

  const displayedNotifications = showOnlyUnread 
    ? getUnreadNotifications() 
    : getFormattedNotifications()

  const getNotificationIcon = (type) => {
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
  }

  const getNotificationColor = (type, isRead) => {
    const baseColors = {
      PROPOSAL_SUBMITTED: 'bg-blue-50 border-blue-200',
      PROPOSAL_APPROVED: 'bg-green-50 border-green-200',
      PROPOSAL_REJECTED: 'bg-red-50 border-red-200',
      PROPOSAL_NEEDS_REVISION: 'bg-orange-50 border-orange-200',
      COMMENT_ADDED: 'bg-purple-50 border-purple-200',
      PROJECT_BOOK_SUBMITTED: 'bg-blue-50 border-blue-200',
      PROJECT_BOOK_REVIEWED: 'bg-green-50 border-green-200',
      USER_REGISTERED: 'bg-cyan-50 border-cyan-200',
      SESSION_CREATED: 'bg-yellow-50 border-yellow-200',
      REMINDER: 'bg-orange-50 border-orange-200',
      SYSTEM: 'bg-gray-50 border-gray-200'
    }
    
    const unreadSuffix = isRead ? '' : ' ring-2 ring-blue-500 ring-opacity-50'
    return (baseColors[type] || 'bg-gray-50 border-gray-200') + unreadSuffix
  }

  const notificationDropdownItems = [
    {
      key: 'header',
      label: (
        <div className="flex items-center justify-between p-2 border-b">
          <span className="font-semibold">Notifications</span>
          <div className="flex items-center gap-2">
            <Button 
              type="text" 
              size="small"
              onClick={() => setShowOnlyUnread(!showOnlyUnread)}
              className={showOnlyUnread ? 'text-blue-600' : ''}
            >
              {showOnlyUnread ? 'Show All' : 'Unread Only'}
            </Button>
            {unreadCount > 0 && (
              <Button 
                type="text" 
                size="small" 
                icon={<CheckCheck size={14} />}
                onClick={handleMarkAllAsRead}
              >
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      ),
      disabled: true
    },
    {
      key: 'content',
      label: (
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Spin size="large" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              <p>Failed to load notifications</p>
              <Button 
                type="link" 
                size="small" 
                onClick={() => fetchNotifications()}
              >
                Retry
              </Button>
            </div>
          ) : displayedNotifications.length === 0 ? (
            <Empty 
              description={showOnlyUnread ? 'No unread notifications' : 'No notifications'}
              className="py-8"
            />
          ) : (
            <div className="space-y-2">
              {displayedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${getNotificationColor(notification.type, notification.is_read)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm font-medium truncate ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className={`text-xs mb-2 line-clamp-2 ${!notification.is_read ? 'text-gray-700' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          {!notification.is_read && (
                            <Button
                              type="text"
                              size="small"
                              icon={<Check size={12} />}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleNotificationClick(notification)
                              }}
                              className="text-gray-400 hover:text-blue-500"
                            />
                          )}
                          <Button
                            type="text"
                            size="small"
                            icon={<Trash2 size={12} />}
                            onClick={(e) => handleDeleteNotification(notification.id, e)}
                            className="text-gray-400 hover:text-red-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
      disabled: true
    }
  ]

  return (
    <Dropdown
      menu={{ items: notificationDropdownItems }}
      trigger={['click']}
      open={isOpen}
      onOpenChange={setIsOpen}
      placement="bottomRight"
      overlayClassName="w-96"
    >
      <Button 
        type="text" 
        icon={
          <Badge count={unreadCount} size="small" offset={[-2, 2]}>
            <Bell size={20} className="text-gray-600" />
          </Badge>
        }
        className="flex items-center justify-center"
      />
    </Dropdown>
  )
}

export default NotificationCenter