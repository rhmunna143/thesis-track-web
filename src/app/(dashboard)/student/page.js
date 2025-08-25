'use client'

import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Progress, Timeline, Button, List, Tag, Spin, message, Alert } from 'antd'
import { 
  FileTextOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  ReloadOutlined,
  BellOutlined,
  UserOutlined 
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { analyticsService } from '@/services/analytics.service'
import { proposalService } from '@/services/proposal.service'
import { notificationService } from '@/services/notification.service'
import { userService } from '@/services/user.service'
import { format, parseISO, isValid } from 'date-fns'

const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING': return 'orange'
    case 'APPROVED': return 'green'
    case 'REJECTED': return 'red'
    case 'REVISION_REQUIRED': return 'blue'
    default: return 'default'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending': return <ClockCircleOutlined className="text-orange-500" />
    case 'success': return <CheckCircleOutlined className="text-green-500" />
    case 'warning': return <ExclamationCircleOutlined className="text-yellow-500" />
    case 'error': return <ExclamationCircleOutlined className="text-red-500" />
    default: return <ClockCircleOutlined />
  }
}

const getActivityFromProposal = (proposal, index) => {
  const statusMapping = {
    'PENDING': { title: 'Proposal submitted for review', status: 'pending' },
    'APPROVED': { title: 'Proposal approved', status: 'success' },
    'REJECTED': { title: 'Proposal rejected', status: 'error' },
    'REVISION_REQUIRED': { title: 'Revision requested', status: 'warning' }
  }
  
  const mapping = statusMapping[proposal.status] || { title: 'Proposal status updated', status: 'pending' }
  
  return {
    time: proposal.updated_at || proposal.created_at,
    title: mapping.title,
    description: proposal.title,
    status: mapping.status
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = parseISO(dateString)
    return isValid(date) ? format(date, 'MMM dd, yyyy') : 'N/A'
  } catch (error) {
    return 'N/A'
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = parseISO(dateString)
    return isValid(date) ? format(date, 'MMM dd, yyyy HH:mm') : 'N/A'
  } catch (error) {
    return 'N/A'
  }
}

export default function StudentDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [proposals, setProposals] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [recentActivities, setRecentActivities] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState(null)

  const fetchDashboardData = async () => {
    try {
      setError(null)
      
      // Fetch data in parallel with error handling for each
      const results = await Promise.allSettled([
        analyticsService.getDashboardData(),
        proposalService.getProposals({ limit: 5 }),
        userService.getProfile(),
        notificationService.getUnreadNotifications({ limit: 5 })
      ])

      // Handle analytics data
      if (results[0].status === 'fulfilled') {
        setDashboardData(results[0].value)
      } else {
        console.warn('Failed to fetch analytics data:', results[0].reason)
      }

      // Handle proposals data
      if (results[1].status === 'fulfilled') {
        const proposalsData = results[1].value
        const proposalsArray = proposalsData.data || proposalsData.proposals || proposalsData || []
        setProposals(Array.isArray(proposalsArray) ? proposalsArray : [])
        
        // Generate recent activities from proposals
        const activities = proposalsArray
          .slice(0, 5)
          .map(getActivityFromProposal)
          .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
        
        setRecentActivities(activities)
      } else {
        console.warn('Failed to fetch proposals:', results[1].reason)
        setProposals([])
      }

      // Handle profile data
      if (results[2].status === 'fulfilled') {
        setUserProfile(results[2].value)
      } else {
        console.warn('Failed to fetch profile:', results[2].reason)
      }

      // Handle notifications data
      if (results[3].status === 'fulfilled') {
        const notificationData = results[3].value
        const notificationsArray = notificationData.data || notificationData.notifications || notificationData || []
        setNotifications(Array.isArray(notificationsArray) ? notificationsArray : [])
      } else {
        console.warn('Failed to fetch notifications:', results[3].reason)
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setError('Failed to load dashboard data. Please try refreshing the page.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    )
  }

  // Calculate stats from proposals or use dashboard data
  const stats = dashboardData?.student ? dashboardData.student : {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'PENDING').length,
    approved: proposals.filter(p => p.status === 'APPROVED').length,
    revision: proposals.filter(p => p.status === 'REVISION_REQUIRED').length,
  }

  // Calculate progress metrics
  const totalSubmitted = stats.total || 0
  const approvedCount = stats.approved || 0
  const submissionProgress = Math.min((totalSubmitted / 4) * 100, 100) // Assuming 4 max proposals
  const approvalRate = totalSubmitted > 0 ? Math.round((approvedCount / totalSubmitted) * 100) : 0
  const profileCompletion = calculateProfileCompletion(userProfile)

  function calculateProfileCompletion(profile) {
    if (!profile) return 0
    
    const requiredFields = ['name', 'email', 'department']
    const optionalFields = ['bio', 'expertise', 'profilePicture']
    const allFields = [...requiredFields, ...optionalFields]
    
    const completedFields = allFields.filter(field => {
      const value = profile[field]
      return value && value !== '' && (!Array.isArray(value) || value.length > 0)
    }).length
    
    return Math.round((completedFields / allFields.length) * 100)
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back{userProfile?.name ? `, ${userProfile.name}` : ''}! Here's your proposal overview.
          </p>
          {userProfile?.department && (
            <p className="text-sm text-gray-500">
              {userProfile.department} • Student ID: {userProfile.studentId || 'Not set'}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={refreshing}
            title="Refresh dashboard data"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Actions and Notifications */}
      {notifications.length > 0 && (
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 mb-3">
            <BellOutlined className="text-blue-500" />
            <span className="font-medium">Recent Notifications</span>
            <Tag color="blue">{notifications.length}</Tag>
          </div>
          <List
            size="small"
            dataSource={notifications.slice(0, 3)}
            renderItem={(notification) => (
              <List.Item className="border-none">
                <List.Item.Meta
                  title={
                    <span className="text-sm">
                      {notification.title || 'Notification'}
                    </span>
                  }
                  description={
                    <span className="text-xs text-gray-500">
                      {formatDateTime(notification.created_at)}
                    </span>
                  }
                />
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </List.Item>
            )}
          />
          {notifications.length > 3 && (
            <div className="text-center mt-2">
              <Button type="link" size="small">View All Notifications</Button>
            </div>
          )}
        </Card>
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Proposals"
              value={stats.total || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Review"
              value={stats.pending || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Approved"
              value={stats.approved || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Need Revision"
              value={stats.revision || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title="Recent Proposals" 
            className="h-full"
            extra={
              <Button 
                type="link" 
                size="small"
                onClick={handleRefresh}
                loading={refreshing}
                icon={<ReloadOutlined />}
              >
                Refresh
              </Button>
            }
          >
            {proposals.length > 0 ? (
              <>
                <List
                  itemLayout="horizontal"
                  dataSource={proposals}
                  renderItem={(proposal) => (
                    <List.Item
                      actions={[
                        <Button
                          key="view"
                          type="link"
                          icon={<EyeOutlined />}
                          onClick={() => router.push(`/student/proposals`)}
                        >
                          View
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <div className="flex items-center gap-2">
                            <span className="truncate">{proposal.title || 'Untitled Proposal'}</span>
                            <Tag color={getStatusColor(proposal.status)}>
                              {(proposal.status || 'PENDING').replace('_', ' ')}
                            </Tag>
                          </div>
                        }
                        description={
                          <div className="text-sm text-gray-500">
                            Supervisor: {proposal.supervisor?.name || 'Not assigned'} • 
                            Submitted: {formatDate(proposal.created_at)}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
                <div className="mt-4 text-center">
                  <Link href="/student/proposals">
                    <Button type="link">View All Proposals</Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <FileTextOutlined className="text-4xl text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No proposals submitted yet</p>
                <p className="text-sm text-gray-400 mb-4">
                  Start by submitting your first proposal to track your progress
                </p>
                <Link href="/student/proposals/new">
                  <Button type="primary" icon={<PlusOutlined />}>
                    Submit Your First Proposal
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title="Recent Activity" 
            className="h-full"
            extra={
              <Button 
                type="link" 
                size="small"
                onClick={handleRefresh}
                loading={refreshing}
                icon={<ReloadOutlined />}
              >
                Refresh
              </Button>
            }
          >
            {recentActivities.length > 0 ? (
              <Timeline
                items={recentActivities.map(activity => ({
                  dot: getStatusIcon(activity.status),
                  children: (
                    <div>
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-sm text-gray-500 mb-1 truncate">{activity.description}</div>
                      <div className="text-xs text-gray-400">
                        {formatDateTime(activity.time)}
                      </div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <div className="text-center py-8">
                <ClockCircleOutlined className="text-4xl text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No recent activity</p>
                <p className="text-sm text-gray-400">
                  Activity will appear here as you submit and update proposals
                </p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Progress Overview */}
      <Card title="Progress Overview">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div className="text-center">
              <div className="text-lg font-medium mb-2">Submission Progress</div>
              <Progress
                type="circle"
                percent={submissionProgress}
                strokeColor="#52c41a"
                format={() => `${totalSubmitted}/4`}
              />
              <div className="text-sm text-gray-500 mt-2">
                {totalSubmitted} out of 4 proposals submitted
              </div>
              {totalSubmitted < 4 && (
                <div className="text-xs text-blue-500 mt-1">
                  Submit more proposals to increase your chances
                </div>
              )}
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="text-center">
              <div className="text-lg font-medium mb-2">Approval Rate</div>
              <Progress
                type="circle"
                percent={approvalRate}
                strokeColor="#1890ff"
                format={() => `${approvalRate}%`}
              />
              <div className="text-sm text-gray-500 mt-2">
                {approvedCount} out of {totalSubmitted} proposals approved
              </div>
              {totalSubmitted > 0 && approvalRate < 50 && (
                <div className="text-xs text-orange-500 mt-1">
                  Consider revising your proposals based on feedback
                </div>
              )}
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="text-center">
              <div className="text-lg font-medium mb-2">Profile Completion</div>
              <Progress
                type="circle"
                percent={profileCompletion}
                strokeColor="#faad14"
                format={() => `${profileCompletion}%`}
              />
              <div className="text-sm text-gray-500 mt-2">
                {profileCompletion < 100 ? (
                  <Link href="/student/profile">
                    <Button type="link" size="small">Complete your profile</Button>
                  </Link>
                ) : (
                  'Profile completed'
                )}
              </div>
              {profileCompletion < 80 && (
                <div className="text-xs text-orange-500 mt-1">
                  Complete your profile for better supervisor matching
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Quick Tips */}
      {(totalSubmitted === 0 || profileCompletion < 80) && (
        <Card title="Quick Tips" className="bg-blue-50 border-blue-200">
          <Row gutter={[16, 16]}>
            {totalSubmitted === 0 && (
              <Col xs={24} md={12}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Submit Your First Proposal</h4>
                    <p className="text-sm text-gray-600">
                      Start your academic journey by submitting a well-researched proposal
                    </p>
                    <Link href="/student/proposals/new">
                      <Button type="link" size="small" className="px-0">
                        Get Started →
                      </Button>
                    </Link>
                  </div>
                </div>
              </Col>
            )}
            {profileCompletion < 80 && (
              <Col xs={24} md={12}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Complete Your Profile</h4>
                    <p className="text-sm text-gray-600">
                      Add your expertise and interests to get better supervisor matches
                    </p>
                    <Link href="/student/profile">
                      <Button type="link" size="small" className="px-0">
                        Update Profile →
                      </Button>
                    </Link>
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </Card>
      )}
    </div>
  )
}