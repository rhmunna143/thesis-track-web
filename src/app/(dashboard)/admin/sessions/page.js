'use client'

import { useState, useEffect } from 'react'
import { 
  Table, 
  Card, 
  Button, 
  Input, 
  Modal, 
  Form, 
  message, 
  Popconfirm, 
  Tag, 
  Space,
  Tooltip,
  Row,
  Col,
  Statistic,
  Switch,
  DatePicker,
  Dropdown,
  Badge,
  Typography,
  Divider
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CopyOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  InboxOutlined,
  EyeOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { sessionService } from '../../../../services/session.service'
import { analyticsService } from '../../../../services/analytics.service'
import useAuthStore from '../../../../store/authStore'
import useErrorHandler from '../../../../hooks/useErrorHandler'
import '../../../../styles/session-management.css'
import { format, parseISO } from 'date-fns'

const { Search } = Input
const { Title, Text } = Typography

export default function SessionsManagementPage() {
  const { user: currentUser } = useAuthStore()
  const { handleError } = useErrorHandler()
  
  // State management
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    completedSessions: 0,
    totalProposals: 0,
    avgProposalsPerSession: 0
  })
  
  // Modal states
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [cloneModalVisible, setCloneModalVisible] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionAnalytics, setSessionAnalytics] = useState(null)
  
  // Forms
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()
  const [cloneForm] = Form.useForm()

  // Fetch sessions (currently only active session available from backend)
  const fetchSessions = async () => {
    setLoading(true)
    try {
      // Backend only provides active session endpoint
      const activeSessionResponse = await sessionService.getActiveSession()
      
      if (activeSessionResponse) {
        // Convert active session to array format for table
        setSessions([activeSessionResponse])
        setActiveSession(activeSessionResponse)
        
        setStats({
          totalSessions: 1,
          activeSessions: 1,
          completedSessions: 0,
          totalProposals: activeSessionResponse.totalProposals || 0,
          avgProposalsPerSession: activeSessionResponse.totalProposals || 0
        })
      } else {
        setSessions([])
        setActiveSession(null)
        setStats({
          totalSessions: 0,
          activeSessions: 0,
          completedSessions: 0,
          totalProposals: 0,
          avgProposalsPerSession: 0
        })
      }
      
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
      setSessions([])
      setActiveSession(null)
      message.error('Failed to load sessions. Please check if you are logged in.')
    }
    setLoading(false)
  }

  // Fetch active session
  const fetchActiveSession = async () => {
    try {
      const active = await sessionService.getActiveSession()
      setActiveSession(active)
    } catch (error) {
      console.error('Failed to fetch active session:', error)
      handleError(error)
    }
  }

  // Create new session
  const handleCreateSession = async (values) => {
    try {
      await sessionService.createSession({
        name: values.name,
        isActive: values.isActive || false
      })
      message.success('Session created successfully')
      setCreateModalVisible(false)
      createForm.resetFields()
      fetchSessions()
      fetchActiveSession()
    } catch (error) {
      console.error('Failed to create session:', error)
      handleError(error)
    }
  }

  // Update session (Currently not supported by backend)
  const handleUpdateSession = async (values) => {
    message.warning('Session updates are not yet supported by the backend API. Only session creation is available.')
    setEditModalVisible(false)
    editForm.resetFields()
    setSelectedSession(null)
  }

  // Delete session
  const handleDeleteSession = async (sessionId) => {
    message.warning('Session deletion is not yet supported by the backend API. Only session creation is available.')
  }

  // Activate session
  const handleActivateSession = async (sessionId) => {
    message.warning('Session activation is not yet supported by the backend API. Only session creation is available.')
  }

  // Deactivate session
  const handleDeactivateSession = async (sessionId) => {
    message.warning('Session deactivation is not yet supported by the backend API. Only session creation is available.')
  }

  // Archive session
  const handleArchiveSession = async (sessionId) => {
    message.warning('Session archiving is not yet supported by the backend API. Only session creation is available.')
  }

  // Clone session
  const handleCloneSession = async (values) => {
    message.warning('Session cloning is not yet supported by the backend API. Only session creation is available.')
    setCloneModalVisible(false)
    cloneForm.resetFields()
    setSelectedSession(null)
  }

  // View session details
  const handleViewDetails = async (session) => {
    setSelectedSession(session)
    setDetailsModalVisible(true)
    
    // Analytics service may not be available yet
    try {
      const analytics = await analyticsService.getSessionAnalytics(session.id)
      setSessionAnalytics(analytics)
    } catch (error) {
      console.warn('Session analytics not available:', error.message)
      // Set basic analytics based on session data
      setSessionAnalytics({
        totalProposals: session.totalProposals || 0,
        approvedProposals: 0,
        pendingProposals: 0,
        rejectedProposals: 0,
        departmentBreakdown: []
      })
    }
  }

  // Table columns
  const columns = [
    {
      title: 'Session Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <Text strong className="text-gray-900">{name}</Text>
            <Text type="secondary" className="text-xs">
              ID: {record.id}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'status',
      width: 120,
      render: (isActive, record) => {
        // Handle both camelCase and snake_case
        const active = isActive !== undefined ? isActive : record.isActive
        if (record.isArchived || record.is_archived) {
          return <Tag color="default">Archived</Tag>
        }
        return (
          <Badge 
            status={active ? 'processing' : 'default'} 
            text={
              <Tag color={active ? 'green' : 'orange'}>
                {active ? 'Active' : 'Inactive'}
              </Tag>
            }
          />
        )
      },
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
        { text: 'Archived', value: 'archived' }
      ],
      onFilter: (value, record) => {
        if (value === 'archived') return record.isArchived || record.is_archived
        const active = record.is_active !== undefined ? record.is_active : record.isActive
        return active === value && !record.isArchived && !record.is_archived
      }
    },
    {
      title: 'Proposals',
      dataIndex: 'proposalCount',
      key: 'proposalCount',
      width: 100,
      render: (count) => (
        <div className="text-center">
          <Text strong className="text-blue-600">{count || 0}</Text>
        </div>
      ),
      sorter: (a, b) => (a.proposalCount || 0) - (b.proposalCount || 0)
    },
    {
      title: 'Students',
      dataIndex: 'studentCount',
      key: 'studentCount',
      width: 100,
      render: (count) => (
        <div className="text-center">
          <Text strong className="text-green-600">{count || 0}</Text>
        </div>
      ),
      sorter: (a, b) => (a.studentCount || 0) - (b.studentCount || 0)
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date, record) => {
        // Handle both camelCase and snake_case
        const dateValue = date || record.createdAt
        if (!dateValue) return <Text type="secondary">N/A</Text>
        try {
          const parsedDate = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue)
          return (
            <div className="flex flex-col">
              <Text>{format(parsedDate, 'MMM dd, yyyy')}</Text>
              <Text type="secondary" className="text-xs">
                {format(parsedDate, 'HH:mm')}
              </Text>
            </div>
          )
        } catch (error) {
          return <Text type="secondary">Invalid date</Text>
        }
      },
      sorter: (a, b) => {
        const dateA = a.created_at || a.createdAt
        const dateB = b.created_at || b.createdAt
        if (!dateA || !dateB) return 0
        return new Date(dateA).getTime() - new Date(dateB).getTime()
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => {
        const actionMenuItems = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View Details',
            onClick: () => handleViewDetails(record)
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit Session',
            onClick: () => {
              setSelectedSession(record)
              editForm.setFieldsValue(record)
              setEditModalVisible(true)
            }
          },
          {
            key: 'clone',
            icon: <CopyOutlined />,
            label: 'Clone Session',
            onClick: () => {
              setSelectedSession(record)
              setCloneModalVisible(true)
            }
          },
          {
            type: 'divider'
          },
          {
            key: 'archive',
            icon: <InboxOutlined />,
            label: 'Archive Session',
            onClick: () => {
              Modal.confirm({
                title: 'Archive Session',
                content: `Are you sure you want to archive "${record.name}"?`,
                icon: <ExclamationCircleOutlined />,
                onOk: () => handleArchiveSession(record.id)
              })
            },
            disabled: record.isArchived
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Delete Session',
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: 'Delete Session',
                content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
                icon: <ExclamationCircleOutlined />,
                okType: 'danger',
                onOk: () => handleDeleteSession(record.id)
              })
            }
          }
        ]

        return (
          <div className="flex items-center gap-2">
            <Tooltip title="View Details">
              <Button 
                type="text" 
                icon={<EyeOutlined />}
                onClick={() => handleViewDetails(record)}
              />
            </Tooltip>
            
            {!record.isArchived && (
              <Tooltip title={record.isActive ? 'Deactivate' : 'Activate'}>
                <Button 
                  type="text" 
                  icon={record.isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={() => record.isActive 
                    ? handleDeactivateSession(record.id) 
                    : handleActivateSession(record.id)
                  }
                  className={record.isActive ? 'text-orange-500' : 'text-green-500'}
                />
              </Tooltip>
            )}
            
            <Dropdown
              menu={{
                items: actionMenuItems
              }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                onClick={(e) => e.preventDefault()}
              />
            </Dropdown>
          </div>
        )
      }
    }
  ]

  // Load data on component mount
  useEffect(() => {
    fetchSessions()
    fetchActiveSession()
  }, [])

  return (
    <div className="sessions-management-page space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Backend Limitation Notice */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-3">
          <Badge status="processing" />
          <div>
            <Text strong className="text-blue-800">Session Management</Text>
            <div className="text-sm text-blue-600 mt-1">
              Currently showing active session only. Full session management (update, delete, archive) will be available when backend APIs are implemented.
            </div>
          </div>
        </div>
      </Card>

      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-2">Academic Sessions Management</Title>
          <Text type="secondary">Manage academic sessions for proposal submissions and reviews</Text>
        </div>
        <div className="flex gap-2">
          <Button 
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchSessions()
              fetchActiveSession()
            }}
          >
            Refresh
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Create Session
          </Button>
        </div>
      </div>

      {/* Active Session Banner */}
      {activeSession && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge status="processing" />
              <div>
                <Text strong className="text-lg">Current Active Session: {activeSession.name}</Text>
                <div className="text-sm text-gray-600 mt-1">
                  {(activeSession.createdAt || activeSession.created_at) ? (
                    (() => {
                      try {
                        const dateStr = activeSession.createdAt || activeSession.created_at
                        const parsedDate = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
                        return `Created on ${format(parsedDate, 'MMMM dd, yyyy')}`
                      } catch (error) {
                        return 'Creation date not available'
                      }
                    })()
                  ) : (
                    'Creation date not available'
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                icon={<BarChartOutlined />}
                onClick={() => handleViewDetails(activeSession)}
              >
                View Analytics
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Sessions"
              value={stats.totalSessions}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Sessions"
              value={stats.activeSessions}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Proposals"
              value={stats.totalProposals}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg per Session"
              value={stats.avgProposalsPerSession}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Sessions Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={sessions}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} sessions`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create Session Modal */}
      <Modal
        title="Create New Academic Session"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          createForm.resetFields()
        }}
        footer={null}
        width={500}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateSession}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Session Name"
            rules={[
              { required: true, message: 'Please enter session name' },
              { min: 3, message: 'Session name must be at least 3 characters' }
            ]}
          >
            <Input 
              placeholder="e.g., Spring 2025, Fall 2024" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Session Status"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive"
            />
          </Form.Item>

          <Text type="secondary" className="text-sm">
            Note: Only one session can be active at a time. Activating this session will deactivate others.
          </Text>

          <Form.Item className="mb-0 text-right mt-6">
            <Space>
              <Button onClick={() => setCreateModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Session
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Session Modal */}
      <Modal
        title="Edit Academic Session"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          editForm.resetFields()
          setSelectedSession(null)
        }}
        footer={null}
        width={500}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateSession}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Session Name"
            rules={[
              { required: true, message: 'Please enter session name' },
              { min: 3, message: 'Session name must be at least 3 characters' }
            ]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Session Status"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive"
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setEditModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Session
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Clone Session Modal */}
      <Modal
        title={`Clone Session: ${selectedSession?.name}`}
        open={cloneModalVisible}
        onCancel={() => {
          setCloneModalVisible(false)
          cloneForm.resetFields()
          setSelectedSession(null)
        }}
        footer={null}
        width={500}
      >
        <Form
          form={cloneForm}
          layout="vertical"
          onFinish={handleCloneSession}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="New Session Name"
            rules={[
              { required: true, message: 'Please enter new session name' },
              { min: 3, message: 'Session name must be at least 3 characters' }
            ]}
          >
            <Input 
              placeholder="e.g., Spring 2026"
              size="large"
            />
          </Form.Item>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <Text type="secondary" className="text-sm">
              Cloning will create a new session with the same configuration as "{selectedSession?.name}". 
              The new session will be inactive by default.
            </Text>
          </div>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setCloneModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" icon={<CopyOutlined />}>
                Clone Session
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Session Details Modal */}
      <Modal
        title={`Session Details: ${selectedSession?.name}`}
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false)
          setSelectedSession(null)
          setSessionAnalytics(null)
        }}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedSession && (
          <div className="space-y-6">
            {/* Session Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text type="secondary">Session Name</Text>
                <div className="font-medium">{selectedSession.name}</div>
              </div>
              <div>
                <Text type="secondary">Status</Text>
                <div>
                  <Tag color={selectedSession.isActive ? 'green' : 'orange'}>
                    {selectedSession.isActive ? 'Active' : 'Inactive'}
                  </Tag>
                </div>
              </div>
              <div>
                <Text type="secondary">Created</Text>
                <div>
                  {selectedSession.createdAt || selectedSession.created_at ? 
                    (() => {
                      try {
                        const dateStr = selectedSession.createdAt || selectedSession.created_at
                        const parsedDate = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
                        return format(parsedDate, 'MMMM dd, yyyy HH:mm')
                      } catch (error) {
                        return 'Invalid date'
                      }
                    })() : 
                    'N/A'
                  }
                </div>
              </div>
              <div>
                <Text type="secondary">Last Updated</Text>
                <div>
                  {selectedSession.updatedAt || selectedSession.updated_at ? 
                    (() => {
                      try {
                        const dateStr = selectedSession.updatedAt || selectedSession.updated_at
                        const parsedDate = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
                        return format(parsedDate, 'MMMM dd, yyyy HH:mm')
                      } catch (error) {
                        return 'Invalid date'
                      }
                    })() : 
                    'N/A'
                  }
                </div>
              </div>
            </div>

            <Divider />

            {/* Analytics */}
            {sessionAnalytics ? (
              <div>
                <Title level={4}>Session Analytics</Title>
                <Row gutter={[16, 16]} className="mb-4">
                  <Col span={6}>
                    <Statistic
                      title="Total Proposals"
                      value={sessionAnalytics.totalProposals || 0}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Approved"
                      value={sessionAnalytics.approvedProposals || 0}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Pending"
                      value={sessionAnalytics.pendingProposals || 0}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Rejected"
                      value={sessionAnalytics.rejectedProposals || 0}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                </Row>

                {sessionAnalytics.departmentBreakdown && (
                  <div>
                    <Text strong className="text-gray-700">Department Breakdown:</Text>
                    <div className="mt-2 space-y-1">
                      {sessionAnalytics.departmentBreakdown.map((dept, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{dept.department}</span>
                          <span className="font-medium">{dept.proposals} proposals</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Text type="secondary">Loading session analytics...</Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}