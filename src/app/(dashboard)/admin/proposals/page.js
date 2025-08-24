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
  Tag, 
  Space,
  Tooltip,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Dropdown,
  Badge,
  Typography,
  Divider,
  Avatar,
  Descriptions,
  Upload,
  Progress,
  Tabs
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  FilterOutlined,
  ExportOutlined,
  TeamOutlined,
  CalendarOutlined,
  SearchOutlined,
  MoreOutlined,
  MessageOutlined,
  BookOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { proposalService } from '../../../../services/proposal.service'
import { commentService } from '../../../../services/comment.service'
import { userService } from '../../../../services/user.service'
import useAuthStore from '../../../../store/authStore'
import useErrorHandler from '../../../../hooks/useErrorHandler'
import '../../../../styles/proposals-management.css'
import { format, parseISO } from 'date-fns'

const { Search } = Input
const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

export default function AdminProposalsPage() {
  const { user: currentUser } = useAuthStore()
  const { handleError } = useErrorHandler()
  
  // State management
  const [proposals, setProposals] = useState([])
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalProposals: 0,
    pendingProposals: 0,
    approvedProposals: 0,
    rejectedProposals: 0,
    revisionRequiredProposals: 0
  })
  
  // Modal states
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [commentsModalVisible, setCommentsModalVisible] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [proposalComments, setProposalComments] = useState([])
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    supervisor: 'all',
    search: '',
    dateRange: null
  })
  
  // Forms
  const [assignForm] = Form.useForm()
  const [commentForm] = Form.useForm()

  // Fetch proposals
  const fetchProposals = async () => {
    setLoading(true)
    try {
      const response = await proposalService.getAllProposals()
      setProposals(response.data || response || [])
      
      // Calculate stats
      const data = response.data || response || []
      setStats({
        totalProposals: data.length,
        pendingProposals: data.filter(p => p.status === 'PENDING').length,
        approvedProposals: data.filter(p => p.status === 'APPROVED').length,
        rejectedProposals: data.filter(p => p.status === 'REJECTED').length,
        revisionRequiredProposals: data.filter(p => p.status === 'REVISION_REQUIRED').length
      })
      
    } catch (error) {
      console.error('Failed to fetch proposals:', error)
      message.error('Failed to load proposals. Please try again.')
    }
    setLoading(false)
  }

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      const response = await userService.getAllUsers({ role: 'TEACHER' })
      setTeachers(response.data || response || [])
    } catch (error) {
      console.error('Failed to fetch teachers:', error)
    }
  }

  // Fetch students
  const fetchStudents = async () => {
    try {
      const response = await userService.getAllUsers({ role: 'STUDENT' })
      setStudents(response.data || response || [])
    } catch (error) {
      console.error('Failed to fetch students:', error)
    }
  }

  // Update proposal status
  const handleUpdateStatus = async (proposalId, status) => {
    try {
      await proposalService.updateProposalStatus(proposalId, status)
      message.success(`Proposal ${status.toLowerCase()} successfully`)
      fetchProposals()
    } catch (error) {
      console.error('Failed to update proposal status:', error)
      message.error('Failed to update proposal status')
    }
  }

  // Assign supervisor
  const handleAssignSupervisor = async (values) => {
    try {
      await proposalService.assignSupervisor(selectedProposal.id, values.supervisorId)
      message.success('Supervisor assigned successfully')
      setAssignModalVisible(false)
      assignForm.resetFields()
      setSelectedProposal(null)
      fetchProposals()
    } catch (error) {
      console.error('Failed to assign supervisor:', error)
      message.error('Failed to assign supervisor')
    }
  }

  // View proposal details
  const handleViewDetails = (proposal) => {
    setSelectedProposal(proposal)
    setDetailsModalVisible(true)
  }

  // View comments
  const handleViewComments = async (proposal) => {
    setSelectedProposal(proposal)
    try {
      const comments = await commentService.getProposalComments(proposal.id)
      setProposalComments(comments.data || comments || [])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      setProposalComments([])
    }
    setCommentsModalVisible(true)
  }

  // Add comment
  const handleAddComment = async (values) => {
    try {
      await commentService.addComment({
        proposalId: selectedProposal.id,
        content: values.content
      })
      message.success('Comment added successfully')
      commentForm.resetFields()
      // Refresh comments
      const comments = await commentService.getProposalComments(selectedProposal.id)
      setProposalComments(comments.data || comments || [])
    } catch (error) {
      console.error('Failed to add comment:', error)
      message.error('Failed to add comment')
    }
  }

  // Delete proposal
  const handleDeleteProposal = async (proposalId) => {
    Modal.confirm({
      title: 'Delete Proposal',
      content: 'Are you sure you want to delete this proposal? This action cannot be undone.',
      icon: <ExclamationCircleOutlined />,
      okType: 'danger',
      onOk: async () => {
        try {
          await proposalService.deleteProposal(proposalId)
          message.success('Proposal deleted successfully')
          fetchProposals()
        } catch (error) {
          console.error('Failed to delete proposal:', error)
          message.error('Failed to delete proposal')
        }
      }
    })
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'orange'
      case 'APPROVED': return 'green'
      case 'REJECTED': return 'red'
      case 'REVISION_REQUIRED': return 'blue'
      default: return 'default'
    }
  }

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Pending'
      case 'APPROVED': return 'Approved'
      case 'REJECTED': return 'Rejected'
      case 'REVISION_REQUIRED': return 'Revision Required'
      default: return status
    }
  }

  // Filter proposals
  const filteredProposals = proposals.filter(proposal => {
    const matchesStatus = filters.status === 'all' || proposal.status === filters.status
    const matchesSearch = !filters.search || 
      proposal.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      proposal.studentName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      proposal.supervisorName?.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  // Table columns
  const columns = [
    {
      title: 'Student',
      dataIndex: 'studentName',
      key: 'student',
      width: 180,
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} size="small" />
          <div className="flex flex-col">
            <Text strong className="text-gray-900">{name || 'Unknown Student'}</Text>
            <Text type="secondary" className="text-xs">
              ID: {record.studentId || 'N/A'}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Proposal Title',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (title, record) => (
        <div className="flex flex-col">
          <Tooltip title={title}>
            <Text strong className="text-gray-900 line-clamp-2">
              {title || 'Untitled Proposal'}
            </Text>
          </Tooltip>
          <Text type="secondary" className="text-xs">
            Type: {record.type || 'Not specified'}
          </Text>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => (
        <Tag color={getStatusColor(status)} className="font-medium">
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'PENDING' },
        { text: 'Approved', value: 'APPROVED' },
        { text: 'Rejected', value: 'REJECTED' },
        { text: 'Revision Required', value: 'REVISION_REQUIRED' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Supervisor',
      dataIndex: 'supervisorName',
      key: 'supervisor',
      width: 160,
      render: (name, record) => (
        <div className="flex items-center gap-2">
          {name ? (
            <>
              <Avatar icon={<UserOutlined />} size="small" />
              <Text>{name}</Text>
            </>
          ) : (
            <Tag color="orange">Unassigned</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Submitted',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => {
        if (!date) return <Text type="secondary">N/A</Text>
        try {
          const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date)
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
        const dateA = a.createdAt || a.created_at
        const dateB = b.createdAt || b.created_at
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
            key: 'comments',
            icon: <MessageOutlined />,
            label: 'View Comments',
            onClick: () => handleViewComments(record)
          },
          {
            key: 'assign',
            icon: <TeamOutlined />,
            label: 'Assign Supervisor',
            onClick: () => {
              setSelectedProposal(record)
              assignForm.setFieldsValue({ supervisorId: record.supervisorId })
              setAssignModalVisible(true)
            }
          },
          {
            type: 'divider'
          },
          {
            key: 'approve',
            icon: <CheckCircleOutlined />,
            label: 'Approve',
            onClick: () => handleUpdateStatus(record.id, 'APPROVED'),
            disabled: record.status === 'APPROVED'
          },
          {
            key: 'reject',
            icon: <CloseCircleOutlined />,
            label: 'Reject',
            onClick: () => handleUpdateStatus(record.id, 'REJECTED'),
            disabled: record.status === 'REJECTED'
          },
          {
            key: 'revision',
            icon: <EditOutlined />,
            label: 'Request Revision',
            onClick: () => handleUpdateStatus(record.id, 'REVISION_REQUIRED'),
            disabled: record.status === 'REVISION_REQUIRED'
          },
          {
            type: 'divider'
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Delete Proposal',
            danger: true,
            onClick: () => handleDeleteProposal(record.id)
          }
        ]

        return (
          <div className="flex items-center gap-2">
            <Tooltip title="View Details">
              <Button 
                type="text" 
                icon={<EyeOutlined />}
                onClick={() => handleViewDetails(record)}
                size="small"
              />
            </Tooltip>
            
            <Tooltip title="Quick Approve">
              <Button 
                type="text" 
                icon={<CheckCircleOutlined />}
                onClick={() => handleUpdateStatus(record.id, 'APPROVED')}
                disabled={record.status === 'APPROVED'}
                className="text-green-600"
                size="small"
              />
            </Tooltip>
            
            <Tooltip title="Quick Reject">
              <Button 
                type="text" 
                icon={<CloseCircleOutlined />}
                onClick={() => handleUpdateStatus(record.id, 'REJECTED')}
                disabled={record.status === 'REJECTED'}
                className="text-red-600"
                size="small"
              />
            </Tooltip>
            
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
                size="small"
              />
            </Dropdown>
          </div>
        )
      }
    }
  ]

  // Load data on component mount
  useEffect(() => {
    fetchProposals()
    fetchTeachers()
    fetchStudents()
  }, [])

  return (
    <div className="proposals-management-page space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-2">Proposals Management</Title>
          <Text type="secondary">Manage and review all student thesis proposals</Text>
        </div>
        <div className="flex gap-2">
          <Button 
            icon={<ExportOutlined />}
            onClick={() => message.info('Export functionality will be implemented')}
          >
            Export
          </Button>
          <Button 
            icon={<ReloadOutlined />}
            onClick={fetchProposals}
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
              title="Total Proposals"
              value={stats.totalProposals}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Review"
              value={stats.pendingProposals}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Approved"
              value={stats.approvedProposals}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Needs Revision"
              value={stats.revisionRequiredProposals}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search proposals..."
              allowClear
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Status"
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              style={{ width: '100%' }}
            >
              <Option value="all">All Status</Option>
              <Option value="PENDING">Pending</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
              <Option value="REVISION_REQUIRED">Revision Required</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Supervisor"
              value={filters.supervisor}
              onChange={(value) => setFilters(prev => ({ ...prev, supervisor: value }))}
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
            >
              <Option value="all">All Supervisors</Option>
              <Option value="unassigned">Unassigned</Option>
              {teachers.map(teacher => (
                <Option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <DatePicker.RangePicker
              placeholder={['Start Date', 'End Date']}
              value={filters.dateRange}
              onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFilters({
                status: 'all',
                department: 'all',
                supervisor: 'all',
                search: '',
                dateRange: null
              })}
              block
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Proposals Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredProposals}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} proposals`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* Proposal Details Modal */}
      <Modal
        title={`Proposal Details: ${selectedProposal?.title}`}
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false)
          setSelectedProposal(null)
        }}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              if (selectedProposal?.documentUrl) {
                window.open(selectedProposal.documentUrl, '_blank')
              } else {
                message.warning('No document available for download')
              }
            }}
          >
            Download Document
          </Button>
        ]}
        width={800}
      >
        {selectedProposal && (
          <div className="space-y-6">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Student" span={1}>
                {selectedProposal.studentName || 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="Student ID" span={1}>
                {selectedProposal.studentId || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Title" span={2}>
                {selectedProposal.title || 'Untitled'}
              </Descriptions.Item>
              <Descriptions.Item label="Type" span={1}>
                {selectedProposal.type || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={1}>
                <Tag color={getStatusColor(selectedProposal.status)}>
                  {getStatusText(selectedProposal.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Supervisor" span={1}>
                {selectedProposal.supervisorName || 'Unassigned'}
              </Descriptions.Item>
              <Descriptions.Item label="Submitted" span={1}>
                {selectedProposal.createdAt ? 
                  format(parseISO(selectedProposal.createdAt), 'MMMM dd, yyyy HH:mm') : 
                  'N/A'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Abstract" span={2}>
                <Paragraph ellipsis={{ rows: 4, expandable: true }}>
                  {selectedProposal.abstract || 'No abstract provided'}
                </Paragraph>
              </Descriptions.Item>
            </Descriptions>

            {selectedProposal.keywords && (
              <div>
                <Text strong>Keywords:</Text>
                <div className="mt-2">
                  {selectedProposal.keywords.split(',').map((keyword, index) => (
                    <Tag key={index} className="mb-1">{keyword.trim()}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Assign Supervisor Modal */}
      <Modal
        title="Assign Supervisor"
        open={assignModalVisible}
        onCancel={() => {
          setAssignModalVisible(false)
          assignForm.resetFields()
          setSelectedProposal(null)
        }}
        footer={null}
        width={500}
      >
        <Form
          form={assignForm}
          layout="vertical"
          onFinish={handleAssignSupervisor}
          className="mt-4"
        >
          <Form.Item
            name="supervisorId"
            label="Select Supervisor"
            rules={[
              { required: true, message: 'Please select a supervisor' }
            ]}
          >
            <Select
              placeholder="Choose a supervisor"
              showSearch
              optionFilterProp="children"
              size="large"
            >
              {teachers.map(teacher => (
                <Option key={teacher.id} value={teacher.id}>
                  <div className="flex items-center gap-2">
                    <Avatar icon={<UserOutlined />} size="small" />
                    <div>
                      <div>{teacher.name}</div>
                      <Text type="secondary" className="text-xs">
                        {teacher.department || 'No department'}
                      </Text>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setAssignModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Assign Supervisor
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Comments Modal */}
      <Modal
        title={`Comments: ${selectedProposal?.title}`}
        open={commentsModalVisible}
        onCancel={() => {
          setCommentsModalVisible(false)
          setSelectedProposal(null)
          setProposalComments([])
        }}
        footer={null}
        width={700}
      >
        <div className="space-y-4">
          {/* Existing Comments */}
          <div className="max-h-400 overflow-y-auto space-y-3">
            {proposalComments.length > 0 ? (
              proposalComments.map((comment, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar icon={<UserOutlined />} size="small" />
                    <Text strong>{comment.authorName || 'Unknown'}</Text>
                    <Text type="secondary" className="text-xs">
                      {comment.createdAt ? 
                        format(parseISO(comment.createdAt), 'MMM dd, yyyy HH:mm') : 
                        'Unknown date'
                      }
                    </Text>
                  </div>
                  <Paragraph className="mb-0">
                    {comment.content}
                  </Paragraph>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Text type="secondary">No comments yet</Text>
              </div>
            )}
          </div>

          <Divider />

          {/* Add Comment Form */}
          <Form
            form={commentForm}
            layout="vertical"
            onFinish={handleAddComment}
          >
            <Form.Item
              name="content"
              label="Add Comment"
              rules={[
                { required: true, message: 'Please enter a comment' },
                { min: 10, message: 'Comment must be at least 10 characters' }
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Enter your comment here..."
                showCount
                maxLength={1000}
              />
            </Form.Item>

            <Form.Item className="mb-0 text-right">
              <Button type="primary" htmlType="submit" icon={<MessageOutlined />}>
                Add Comment
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  )
}