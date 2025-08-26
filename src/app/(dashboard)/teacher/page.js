'use client'

import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Button, Progress, Spin, message, Empty } from 'antd'
import { 
  FileTextOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  TeamOutlined,
  EyeOutlined,
  BarChartOutlined,
  ReloadOutlined,
  BookOutlined,
  TrophyOutlined 
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { format, differenceInDays } from 'date-fns'
import { analyticsService } from '@/services/analytics.service'
import { proposalService } from '@/services/proposal.service'
import { userService } from '@/services/user.service'
import { config } from '@/lib/config'
import useAuthStore from '@/store/authStore'

const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING': return 'orange'
    case 'APPROVED': return 'green'
    case 'REJECTED': return 'red'
    case 'REVISION_REQUIRED': return 'blue'
    default: return 'default'
  }
}

const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy')
  } catch (error) {
    return dateString
  }
}

const calculateDaysWaiting = (submittedAt, status) => {
  if (status !== 'PENDING') return 0
  try {
    return differenceInDays(new Date(), new Date(submittedAt))
  } catch (error) {
    return 0
  }
}

export default function TeacherDashboard() {
  const router = useRouter()
  const { user, token, isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [proposals, setProposals] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    revisionRequired: 0,
    supervisedStudents: 0,
    avgReviewTime: 0,
    approvalRate: 0,
    projectBooks: 0
  })

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await analyticsService.getDashboardData()
      
      const data = response.data || response
      setDashboardData(data)
      
      // Calculate statistics from dashboard data
      if (data) {
        const newStats = {
          // Map the actual field names from the API response
          total: data.assignedProposals || data.totalProposals || 0,
          pending: data.pendingReviews || data.pendingProposals || 0,
          approved: data.approvedProposals || 0,
          rejected: data.rejectedProposals || 0,
          revisionRequired: data.revisionRequiredProposals || 0,
          supervisedStudents: data.supervisedStudents || 0,
          avgReviewTime: data.avgReviewTime || 0,
          approvalRate: data.approvalRate || 0,
          projectBooks: data.booksToReview || data.totalProjectBooks || 0
        }
        setStats(newStats)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      message.error(`Failed to load dashboard data: ${error.message || 'Unknown error'}`)
    }
  }

  // Calculate additional stats from proposals data
  const calculateStatsFromProposals = (proposalsData) => {
    if (!proposalsData || proposalsData.length === 0) return

    const statusCounts = proposalsData.reduce((acc, proposal) => {
      acc[proposal.status] = (acc[proposal.status] || 0) + 1
      return acc
    }, {})

    // Update stats with calculated values, keeping existing dashboard data
    setStats(prevStats => ({
      ...prevStats,
      // If dashboard didn't provide these, calculate from proposals
      approved: prevStats.approved || statusCounts.APPROVED || 0,
      rejected: prevStats.rejected || statusCounts.REJECTED || 0,
      revisionRequired: prevStats.revisionRequired || statusCounts.REVISION_REQUIRED || 0,
      // Calculate approval rate if not provided
      approvalRate: prevStats.approvalRate || (
        proposalsData.length > 0 
          ? ((statusCounts.APPROVED || 0) / proposalsData.length * 100)
          : 0
      )
    }))
  }

  // Fetch recent proposals
  const fetchProposals = async () => {
    try {
      // Fetch all proposals for stats calculation
      const allProposalsResponse = await proposalService.getProposals({ 
        limit: 100  // Get more to calculate proper stats
      })
      
      // Fetch only pending proposals for the table
      const pendingProposalsResponse = await proposalService.getProposals({ 
        limit: 10,
        status: 'PENDING'
      })
      
      let allProposals = []
      let pendingProposals = []

      // Handle all proposals response
      if (allProposalsResponse && allProposalsResponse.success && allProposalsResponse.data) {
        allProposals = allProposalsResponse.data
      } else if (allProposalsResponse && Array.isArray(allProposalsResponse)) {
        allProposals = allProposalsResponse
      }

      // Handle pending proposals response
      if (pendingProposalsResponse && pendingProposalsResponse.success && pendingProposalsResponse.data) {
        pendingProposals = pendingProposalsResponse.data
      } else if (pendingProposalsResponse && Array.isArray(pendingProposalsResponse)) {
        pendingProposals = pendingProposalsResponse
      }

      // Format proposals for display (only pending ones)
      const formattedProposals = pendingProposals.map(proposal => ({
        key: proposal.id,
        id: proposal.id,
        title: proposal.title,
        student: proposal.student?.name || 'Unknown Student',
        department: proposal.student?.department || 'Unknown Department',
        submittedAt: proposal.createdAt,
        status: proposal.status,
        daysWaiting: calculateDaysWaiting(proposal.createdAt, proposal.status),
        studentId: proposal.student?.id
      }))
      
      setProposals(formattedProposals)

      // Calculate additional stats from all proposals data
      calculateStatsFromProposals(allProposals)

    } catch (error) {
      console.error('Failed to fetch proposals:', error)
      message.error(`Failed to load proposals: ${error.message || 'Unknown error'}`)
      setProposals([])
    }
  }

  // Load all data
  const loadData = async (showRefreshMessage = false) => {
    // Don't load data if not authenticated or not hydrated
    if (!hydrated || !isAuthenticated || !token) {
      setLoading(false)
      return
    }

    try {
      setRefreshing(true)
      
      // Fetch both dashboard data and proposals
      const [dashboardResult, proposalsResult] = await Promise.all([
        fetchDashboardData(),
        fetchProposals()
      ])
      
      if (showRefreshMessage) {
        message.success('Dashboard data refreshed')
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      message.error(`Failed to load dashboard data: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    // Wait for hydration to complete
    setHydrated(true)
  }, [])

  useEffect(() => {
    // Don't run auth checks until hydrated
    if (!hydrated) return

    // Check authentication
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Check if user is a teacher
    if (user && user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      message.error('Access denied. Teacher or Admin role required.')
      router.push('/dashboard')
      return
    }

    loadData()
  }, [hydrated, isAuthenticated, user])

  // Table columns
  const columns = [
    {
      title: 'Proposal Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span className="font-medium">{text}</span>,
      ellipsis: true,
    },
    {
      title: 'Student',
      dataIndex: 'student',
      key: 'student',
      width: 120,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Submitted',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 100,
      render: (date) => formatDate(date),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Days Waiting',
      dataIndex: 'daysWaiting',
      key: 'daysWaiting',
      width: 100,
      render: (days, record) => (
        record.status === 'PENDING' ? (
          <span className={days > 3 ? 'text-red-500 font-medium' : ''}>
            {days} days
          </span>
        ) : '-'
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<EyeOutlined />}
          onClick={() => router.push(`/teacher/proposals/${record.id}`)}
        >
          Review
        </Button>
      ),
    },
  ]

  if (!hydrated || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600">Review student proposals and manage your supervised students</p>
        </div>
        <div className="flex gap-2">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => loadData(true)}
            loading={refreshing}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Reviews"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <div className="mt-2">
              <Button 
                type="link" 
                size="small" 
                onClick={() => router.push('/teacher/proposals?status=PENDING')}
              >
                Review Now →
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Proposals"
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Approved"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Supervised Students"
              value={stats.supervisedStudents}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Statistics Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Revision Required"
              value={stats.revisionRequired}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Rejected"
              value={stats.rejected}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Project Books"
              value={stats.projectBooks}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title="Pending Reviews" 
            extra={
              <Button 
                type="primary" 
                onClick={() => router.push('/teacher/proposals')}
              >
                View All
              </Button>
            }
            loading={refreshing}
          >
            {proposals.length > 0 ? (
              <Table
                columns={columns}
                dataSource={proposals}
                pagination={false}
                size="small"
                scroll={{ x: 800 }}
              />
            ) : (
              <Empty 
                description="No pending proposals to review"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Performance Metrics">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Average Review Time</span>
                  <span className="font-medium">
                    {stats.avgReviewTime > 0 ? `${stats.avgReviewTime.toFixed(1)} days` : 'N/A'}
                  </span>
                </div>
                <Progress 
                  percent={stats.avgReviewTime > 0 ? Math.min((3 / Math.max(stats.avgReviewTime, 1)) * 100, 100) : 0} 
                  strokeColor="#52c41a" 
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>Approval Rate</span>
                  <span className="font-medium">
                    {stats.approvalRate > 0 ? `${stats.approvalRate.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <Progress 
                  percent={stats.approvalRate || 0} 
                  strokeColor="#1890ff" 
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>Response Rate</span>
                  <span className="font-medium">
                    {stats.total > 0 ? `${(((stats.approved + stats.rejected + stats.revisionRequired) / stats.total) * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <Progress 
                  percent={stats.total > 0 ? ((stats.approved + stats.rejected + stats.revisionRequired) / stats.total) * 100 : 0} 
                  strokeColor="#faad14" 
                />
              </div>
            </div>
          </Card>

          <Card title="Quick Actions" className="mt-4">
            <div className="space-y-2">
              <Button 
                type="text" 
                block 
                className="text-left"
                onClick={() => router.push('/teacher/proposals')}
              >
                📋 Review Proposals
              </Button>
              <Button 
                type="text" 
                block 
                className="text-left"
                onClick={() => router.push('/teacher/students')}
              >
                👥 View Students
              </Button>
              <Button 
                type="text" 
                block 
                className="text-left"
                onClick={() => router.push('/teacher/project-books')}
              >
                📚 Project Books
              </Button>
              <Button 
                type="text" 
                block 
                className="text-left"
                onClick={() => router.push('/teacher/analytics')}
              >
                📊 View Analytics
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}