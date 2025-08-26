'use client'

import { useState, useEffect } from 'react'
import { 
  Table, 
  Card, 
  Button, 
  Tag, 
  Space, 
  Input, 
  Select, 
  DatePicker, 
  Modal, 
  Form, 
  message, 
  Drawer, 
  Typography, 
  Row, 
  Col, 
  Statistic,
  Tooltip,
  Popconfirm,
  Badge,
  Avatar,
  Divider,
  Radio,
  Spin,
  Empty
} from 'antd'
import { 
  SearchOutlined, 
  FilterOutlined, 
  EyeOutlined, 
  EditOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  ReloadOutlined,
  DownloadOutlined,
  MessageOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ExportOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { proposalService } from '@/services/proposal.service'
import { commentService } from '@/services/comment.service'
import useAuthStore from '@/store/authStore'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input
const { Title, Text, Paragraph } = Typography

// Status color mapping
const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING': return 'orange'
    case 'APPROVED': return 'green'
    case 'REJECTED': return 'red'
    case 'REVISION_REQUIRED': return 'blue'
    default: return 'default'
  }
}

// Status text mapping
const getStatusText = (status) => {
  switch (status) {
    case 'PENDING': return 'Pending Review'
    case 'APPROVED': return 'Approved'
    case 'REJECTED': return 'Rejected'
    case 'REVISION_REQUIRED': return 'Revision Required'
    default: return status
  }
}

// Format date helper
const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy')
  } catch (error) {
    return dateString
  }
}

// Calculate days since submission
const calculateDaysAgo = (dateString) => {
  try {
    const submissionDate = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today - submissionDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  } catch (error) {
    return 0
  }
}

export default function TeacherProposalsPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [proposals, setProposals] = useState([])
  const [filteredProposals, setFilteredProposals] = useState([])
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [comments, setComments] = useState([])
  const [reviewForm] = Form.useForm()
  const [commentForm] = Form.useForm()
  
  // UI State
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [commentsModalVisible, setCommentsModalVisible] = useState(false)
  const [addCommentModalVisible, setAddCommentModalVisible] = useState(false)
  
  // Filter states
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [dateRange, setDateRange] = useState(null)
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    revisionRequired: 0
  })

  // Fetch proposals
  const fetchProposals = async (params = {}) => {
    try {
      setLoading(true)
      const response = await proposalService.getProposals(params)
      
      let proposalsData = []
      if (response && response.success && response.data) {
        proposalsData = response.data
      } else if (response && Array.isArray(response)) {
        proposalsData = response
      }

      setProposals(proposalsData)
      setFilteredProposals(proposalsData)
      
      // Calculate statistics
      const newStats = {
        total: proposalsData.length,
        pending: proposalsData.filter(p => p.status === 'PENDING').length,
        approved: proposalsData.filter(p => p.status === 'APPROVED').length,
        rejected: proposalsData.filter(p => p.status === 'REJECTED').length,
        revisionRequired: proposalsData.filter(p => p.status === 'REVISION_REQUIRED').length
      }
      setStats(newStats)
      
    } catch (error) {
      console.error('Failed to fetch proposals:', error)
      message.error('Failed to load proposals')
    } finally {
      setLoading(false)
    }
  }

  // Fetch comments for a proposal
  const fetchComments = async (proposalId) => {
    try {
      // Try to get comments from the direct comments endpoint first
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/proposals/${proposalId}/comments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data && data.success && data.data) {
            setComments(data.data)
            return
          } else if (Array.isArray(data)) {
            setComments(data)
            return
          }
        }
      } catch (directError) {
        console.log('Direct comments API failed, trying proposal details...')
      }

      // Fallback: Get comments from proposal details
      const response = await proposalService.getProposal(proposalId)
      if (response && response.success && response.data) {
        if (response.data.comments && Array.isArray(response.data.comments)) {
          setComments(response.data.comments)
        } else {
          setComments([])
        }
      } else if (response && response.comments) {
        setComments(response.comments)
      } else {
        setComments([])
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      // Don't show error message for comments as it's not critical
      setComments([])
    }
  }

  // Update proposal status
  const updateProposalStatus = async (proposalId, status, reviewComments = '') => {
    try {
      // Update the status using the correct API call
      await proposalService.updateProposalStatus(proposalId, status)
      
      // If there are comments, add them separately
      if (reviewComments && reviewComments.trim()) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/comments`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              proposalId: parseInt(proposalId),
              content: reviewComments
            })
          })
          
          if (!response.ok) {
            throw new Error('Failed to add review comments')
          }
        } catch (commentError) {
          console.error('Failed to add review comments:', commentError)
          // Don't fail the whole operation if comments fail
          message.warning('Status updated but failed to add comments')
        }
      }
      
      message.success(`Proposal ${status.toLowerCase().replace('_', ' ')} successfully`)
      fetchProposals() // Refresh the list
      setReviewModalVisible(false)
      reviewForm.resetFields()
    } catch (error) {
      console.error('Failed to update proposal status:', error)
      message.error(error.message || 'Failed to update proposal status')
    }
  }

  // Add comment to proposal
  const addComment = async (values) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          proposalId: parseInt(selectedProposal.id),
          content: values.comment
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add comment')
      }
      
      message.success('Comment added successfully')
      setAddCommentModalVisible(false)
      commentForm.resetFields()
      
      // Refresh comments if the comments modal is open
      if (commentsModalVisible) {
        fetchComments(selectedProposal.id)
      }
      
      // Also refresh the comments in the drawer if it's open
      if (drawerVisible) {
        fetchComments(selectedProposal.id)
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
      message.error(error.message || 'Failed to add comment')
    }
  }

  // Apply filters
  const applyFilters = () => {
    let filtered = [...proposals]

    // Search filter
    if (searchText) {
      filtered = filtered.filter(proposal => 
        proposal.title.toLowerCase().includes(searchText.toLowerCase()) ||
        proposal.student?.name.toLowerCase().includes(searchText.toLowerCase()) ||
        proposal.abstract.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(proposal => proposal.status === statusFilter)
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(proposal => proposal.student?.department === departmentFilter)
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange
      filtered = filtered.filter(proposal => {
        const proposalDate = new Date(proposal.createdAt)
        return proposalDate >= startDate && proposalDate <= endDate
      })
    }

    setFilteredProposals(filtered)
  }

  // Reset filters
  const resetFilters = () => {
    setSearchText('')
    setStatusFilter('all')
    setDepartmentFilter('all')
    setDateRange(null)
    setFilteredProposals(proposals)
  }

  // Open proposal details drawer
  const openProposalDetails = (proposal) => {
    setSelectedProposal(proposal)
    setDrawerVisible(true)
    fetchComments(proposal.id)
  }

  // Open review modal
  const openReviewModal = (proposal) => {
    setSelectedProposal(proposal)
    setReviewModalVisible(true)
  }

  // Download proposal document
  const downloadDocument = (documentUrl, title) => {
    if (documentUrl) {
      const link = document.createElement('a')
      link.href = documentUrl.startsWith('http') ? documentUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${documentUrl}`
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_proposal.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      message.error('Document not available')
    }
  }

  // Table columns
  const columns = [
    {
      title: 'Proposal Title',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      ellipsis: true,
      render: (text, record) => (
        <div>
          <Text strong className="text-blue-600 cursor-pointer hover:text-blue-800" 
                onClick={() => openProposalDetails(record)}>
            {text}
          </Text>
          <br />
          <Text type="secondary" className="text-xs">
            {record.abstract?.substring(0, 100)}...
          </Text>
        </div>
      ),
    },
    {
      title: 'Student',
      dataIndex: ['student', 'name'],
      key: 'student',
      width: 150,
      render: (text, record) => (
        <div className="flex items-center space-x-2">
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{text || 'Unknown Student'}</div>
            <div className="text-xs text-gray-500">{record.student?.department || 'Unknown Dept'}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'PENDING' },
        { text: 'Approved', value: 'APPROVED' },
        { text: 'Rejected', value: 'REJECTED' },
        { text: 'Revision Required', value: 'REVISION_REQUIRED' },
      ],
    },
    {
      title: 'Submitted',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => (
        <div>
          <div>{formatDate(date)}</div>
          <Text type="secondary" className="text-xs">
            {calculateDaysAgo(date)} days ago
          </Text>
        </div>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Priority',
      key: 'priority',
      width: 80,
      render: (_, record) => {
        const days = calculateDaysAgo(record.createdAt)
        const isUrgent = days > 7 && record.status === 'PENDING'
        return isUrgent ? (
          <Badge status="error" text="Urgent" />
        ) : (
          <Badge status="default" text="Normal" />
        )
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => openProposalDetails(record)}
            />
          </Tooltip>
          
          {record.status === 'PENDING' && (
            <Tooltip title="Review">
              <Button 
                type="default" 
                icon={<EditOutlined />} 
                size="small"
                onClick={() => openReviewModal(record)}
              />
            </Tooltip>
          )}
          
          <Tooltip title="Add Comment">
            <Button 
              type="default" 
              icon={<MessageOutlined />} 
              size="small"
              onClick={() => {
                setSelectedProposal(record)
                setAddCommentModalVisible(true)
              }}
            />
          </Tooltip>
          
          <Tooltip title="Download">
            <Button 
              type="default" 
              icon={<DownloadOutlined />} 
              size="small"
              onClick={() => downloadDocument(record.documentUrl, record.title)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  // Load data on component mount
  useEffect(() => {
    if (user && token) {
      if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
        message.error('Access denied. Only teachers can access this page.')
        router.push('/dashboard/student')
        return
      }
      fetchProposals()
    }
  }, [user, token, router])

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters()
  }, [searchText, statusFilter, departmentFilter, dateRange, proposals])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="mb-0">Proposal Reviews</Title>
          <Text type="secondary">Manage and review student thesis proposals</Text>
        </div>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => fetchProposals()}
            loading={loading}
          >
            Refresh
          </Button>
          <Button 
            icon={<ExportOutlined />}
            onClick={() => message.info('Export functionality coming soon')}
          >
            Export
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Proposals"
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pending Review"
              value={stats.pending}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Approved"
              value={stats.approved}
              prefix={<CheckOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Need Revision"
              value={stats.revisionRequired}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card title="Filters" className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Search
              placeholder="Search proposals, students..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={4}>
            <Select 
              value={statusFilter} 
              onChange={setStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Status</Option>
              <Option value="PENDING">Pending</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
              <Option value="REVISION_REQUIRED">Revision Required</Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Select 
              value={departmentFilter} 
              onChange={setDepartmentFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Departments</Option>
              <Option value="Computer Science">Computer Science</Option>
              <Option value="Engineering">Engineering</Option>
              <Option value="Business">Business</Option>
              <Option value="Mathematics">Mathematics</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <RangePicker 
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
          <Col xs={24} sm={2}>
            <Button onClick={resetFilters} block>
              Reset
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
            total: filteredProposals.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} proposals`,
          }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <Empty
                description="No proposals found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
        />
      </Card>

      {/* Proposal Details Drawer */}
      <Drawer
        title="Proposal Details"
        placement="right"
        width={720}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <Space>
            {selectedProposal && (
              <>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => downloadDocument(selectedProposal.documentUrl, selectedProposal.title)}
                >
                  Download
                </Button>
                {selectedProposal.status === 'PENDING' && (
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />}
                    onClick={() => {
                      setDrawerVisible(false)
                      openReviewModal(selectedProposal)
                    }}
                  >
                    Review
                  </Button>
                )}
              </>
            )}
          </Space>
        }
      >
        {selectedProposal && (
          <div className="space-y-4">
            {/* Basic Info */}
            <div>
              <Title level={4}>{selectedProposal.title}</Title>
              <Tag color={getStatusColor(selectedProposal.status)}>
                {getStatusText(selectedProposal.status)}
              </Tag>
            </div>

            {/* Student Info */}
            <div className="bg-gray-50 p-4 rounded">
              <Title level={5}>Student Information</Title>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text strong>Name: </Text>
                  <Text>{selectedProposal.student?.name || 'Unknown'}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Department: </Text>
                  <Text>{selectedProposal.student?.department || 'Unknown'}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Email: </Text>
                  <Text>{selectedProposal.student?.email || 'Unknown'}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Submitted: </Text>
                  <Text>{formatDate(selectedProposal.createdAt)}</Text>
                </Col>
              </Row>
            </div>

            {/* Abstract */}
            <div>
              <Title level={5}>Abstract</Title>
              <Paragraph>{selectedProposal.abstract}</Paragraph>
            </div>

            {/* Comments */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <Title level={5}>Comments ({comments.length})</Title>
                <Button 
                  type="link" 
                  icon={<MessageOutlined />}
                  onClick={() => setCommentsModalVisible(true)}
                >
                  View All Comments
                </Button>
              </div>
              {comments.slice(0, 3).map((comment, index) => (
                <div key={index} className="border-l-4 border-blue-200 pl-4 mb-3">
                  <div className="flex justify-between items-start">
                    <Text strong>{comment.author?.name || 'Unknown'}</Text>
                    <Text type="secondary" className="text-xs">
                      {formatDate(comment.createdAt)}
                    </Text>
                  </div>
                  <Paragraph className="mt-1 mb-0">{comment.content}</Paragraph>
                </div>
              ))}
              {comments.length === 0 && (
                <Text type="secondary">No comments yet</Text>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Review Modal */}
      <Modal
        title="Review Proposal"
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false)
          reviewForm.resetFields()
        }}
        footer={null}
        width={600}
      >
        {selectedProposal && (
          <div>
            <div className="mb-4">
              <Title level={5}>{selectedProposal.title}</Title>
              <Text type="secondary">by {selectedProposal.student?.name}</Text>
            </div>
            
            <Form form={reviewForm} layout="vertical" onFinish={(values) => {
              updateProposalStatus(selectedProposal.id, values.status, values.comments)
            }}>
              <Form.Item
                label="Decision"
                name="status"
                rules={[{ required: true, message: 'Please select a decision' }]}
              >
                <Radio.Group>
                  <Radio.Button value="APPROVED" className="text-green-600">
                    <CheckOutlined /> Approve
                  </Radio.Button>
                  <Radio.Button value="REJECTED" className="text-red-600">
                    <CloseOutlined /> Reject
                  </Radio.Button>
                  <Radio.Button value="REVISION_REQUIRED" className="text-blue-600">
                    <EditOutlined /> Request Revision
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="Comments (Optional)"
                name="comments"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Add your feedback or comments here..."
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Submit Review
                  </Button>
                  <Button onClick={() => {
                    setReviewModalVisible(false)
                    reviewForm.resetFields()
                  }}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Add Comment Modal */}
      <Modal
        title="Add Comment"
        open={addCommentModalVisible}
        onCancel={() => {
          setAddCommentModalVisible(false)
          commentForm.resetFields()
        }}
        footer={null}
      >
        <Form form={commentForm} layout="vertical" onFinish={addComment}>
          <Form.Item
            label="Comment"
            name="comment"
            rules={[{ required: true, message: 'Please enter your comment' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Enter your comment here..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Comment
              </Button>
              <Button onClick={() => {
                setAddCommentModalVisible(false)
                commentForm.resetFields()
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Comments Modal */}
      <Modal
        title="All Comments"
        open={commentsModalVisible}
        onCancel={() => setCommentsModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div key={index} className="border-b pb-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <Text strong>{comment.author?.name || 'Unknown'}</Text>
                  <Tag size="small">{comment.author?.role || 'User'}</Tag>
                </div>
                <Text type="secondary" className="text-xs">
                  {formatDate(comment.createdAt)}
                </Text>
              </div>
              <Paragraph className="ml-6">{comment.content}</Paragraph>
            </div>
          ))}
          {comments.length === 0 && (
            <Empty description="No comments yet" />
          )}
        </div>
      </Modal>
    </div>
  )
}