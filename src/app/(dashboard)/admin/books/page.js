'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  InputNumber,
  message,
  Tooltip,
  Drawer,
  Typography,
  Rate,
  Badge,
  Spin,
  Empty,
  Avatar,
  Divider,
  Progress,
  Descriptions,
  DatePicker,
  Dropdown,
  Popconfirm,
  Upload
} from 'antd'
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
  SearchOutlined,
  FilterOutlined,
  StarOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  LinkOutlined,
  CommentOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ExportOutlined,
  TeamOutlined,
  MoreOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  PrinterOutlined
} from '@ant-design/icons'
import { projectBookService } from '../../../../services/projectBook.service'
import { userService } from '../../../../services/user.service'
import { config } from '../../../../lib/config'
import useAuthStore from '../../../../store/authStore'
import { format, parseISO } from 'date-fns'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input
const { Search } = Input

export default function AdminProjectBooksPage() {
  const { user } = useAuthStore()
  
  // State management
  const [projectBooks, setProjectBooks] = useState([])
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Modal states
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false)
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [selectedProjectBook, setSelectedProjectBook] = useState(null)
  
  // Form instances
  const [reviewForm] = Form.useForm()
  const [assignForm] = Form.useForm()
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    status: 'all',
    supervisor: 'all',
    department: 'all',
    search: '',
    dateRange: null
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    revisionRequired: 0,
    averageScore: 0
  })

  // Transform project book data from backend format to frontend format
  const transformProjectBookData = (bookData) => {
    if (!bookData) return bookData

    return {
      ...bookData,
      proposalTitle: bookData.proposal_title || bookData.proposalTitle || bookData.proposal?.title,
      studentName: bookData.student_name || bookData.student?.name,
      studentId: bookData.student_id || bookData.student?.id,
      supervisorName: bookData.supervisor_name || bookData.supervisor?.name,
      supervisorId: bookData.supervisor_id || bookData.supervisor?.id,
      reviewScore: bookData.review_score || bookData.reviewScore,
      reviewComments: bookData.review_comments || bookData.reviewComments,
      reviewedBy: bookData.reviewed_by || bookData.reviewedBy,
      submittedAt: bookData.submitted_at || bookData.submittedAt,
      reviewedAt: bookData.reviewed_at || bookData.reviewedAt,
      createdAt: bookData.created_at || bookData.createdAt,
      updatedAt: bookData.updated_at || bookData.updatedAt,
      // Keep nested objects for detailed view
      proposal: bookData.proposal,
      student: bookData.student,
      supervisor: bookData.supervisor
    }
  }

  // Fetch project books
  const fetchProjectBooks = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true)
      const response = await projectBookService.getProjectBooks({
        page,
        limit: pageSize,
        ...filters
      })
      
      const booksData = response.data || response.projectBooks || response || []
      const transformedBooks = Array.isArray(booksData) 
        ? booksData.map(transformProjectBookData) 
        : []
      
      setProjectBooks(transformedBooks)
      
      if (response.pagination) {
        setPagination({
          current: response.pagination.page || page,
          pageSize: response.pagination.limit || pageSize,
          total: response.pagination.total || 0
        })
      } else {
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize: pageSize,
          total: transformedBooks.length
        }))
      }
      
      // Calculate stats
      calculateStats(transformedBooks)
      
    } catch (error) {
      console.error('Failed to fetch project books:', error)
      message.error('Failed to load project books')
      setProjectBooks([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
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

  // Calculate statistics
  const calculateStats = (books) => {
    const total = books.length
    const pending = books.filter(book => book.status === 'PENDING').length
    const underReview = books.filter(book => book.status === 'UNDER_REVIEW').length
    const approved = books.filter(book => book.status === 'APPROVED').length
    const rejected = books.filter(book => book.status === 'REJECTED').length
    const revisionRequired = books.filter(book => book.status === 'REVISION_REQUIRED').length
    
    const scoredBooks = books.filter(book => book.reviewScore && book.reviewScore > 0)
    const averageScore = scoredBooks.length > 0 
      ? scoredBooks.reduce((sum, book) => sum + book.reviewScore, 0) / scoredBooks.length 
      : 0

    setStats({
      total,
      pending,
      underReview,
      approved,
      rejected,
      revisionRequired,
      averageScore: Math.round(averageScore * 10) / 10
    })
  }

  // Handle review submission
  const handleReviewSubmit = async (values) => {
    try {
      setLoading(true)
      await projectBookService.reviewProjectBook(selectedProjectBook.id, values)
      message.success('Review submitted successfully')
      setReviewModalVisible(false)
      reviewForm.resetFields()
      setSelectedProjectBook(null)
      fetchProjectBooks(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Failed to submit review:', error)
      message.error('Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  // Handle supervisor assignment
  const handleAssignSupervisor = async (values) => {
    try {
      setLoading(true)
      // Assuming there's an API endpoint to reassign supervisor
      await projectBookService.updateProjectBook(selectedProjectBook.id, {
        supervisorId: values.supervisorId
      })
      message.success('Supervisor assigned successfully')
      setAssignModalVisible(false)
      assignForm.resetFields()
      setSelectedProjectBook(null)
      fetchProjectBooks(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Failed to assign supervisor:', error)
      message.error('Failed to assign supervisor')
    } finally {
      setLoading(false)
    }
  }

  // Handle status update
  const handleStatusUpdate = async (projectBookId, status) => {
    try {
      await projectBookService.updateStatus(projectBookId, status)
      message.success(`Status updated to ${status}`)
      fetchProjectBooks(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Failed to update status:', error)
      message.error('Failed to update status')
    }
  }

  // Handle delete
  const handleDelete = async (projectBookId) => {
    try {
      await projectBookService.deleteProjectBook(projectBookId)
      message.success('Project book deleted successfully')
      fetchProjectBooks(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Failed to delete project book:', error)
      message.error('Failed to delete project book')
    }
  }

  // Handle file download
  const handleDownload = (url, filename) => {
    if (url) {
      const fullUrl = url.startsWith('http') 
        ? url 
        : `${config.api.baseUrl}${url}`
      window.open(fullUrl, '_blank')
    } else {
      message.warning(`${filename} not available`)
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true)
    fetchProjectBooks(pagination.current, pagination.pageSize)
  }

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await projectBookService.exportProjectBooks('csv', filters)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `project-books-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      message.success('Export completed successfully')
    } catch (error) {
      console.error('Failed to export:', error)
      message.error('Failed to export data')
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'orange'
      case 'UNDER_REVIEW': return 'blue'
      case 'APPROVED': return 'green'
      case 'REJECTED': return 'red'
      case 'REVISION_REQUIRED': return 'purple'
      default: return 'default'
    }
  }

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Pending'
      case 'UNDER_REVIEW': return 'Under Review'
      case 'APPROVED': return 'Approved'
      case 'REJECTED': return 'Rejected'
      case 'REVISION_REQUIRED': return 'Revision Required'
      default: return status
    }
  }

  // Filter project books
  const filteredProjectBooks = projectBooks.filter(book => {
    const matchesStatus = filters.status === 'all' || book.status === filters.status
    const matchesSupervisor = filters.supervisor === 'all' || book.supervisorId === filters.supervisor
    const matchesSearch = !filters.search || 
      book.proposalTitle?.toLowerCase().includes(filters.search.toLowerCase()) ||
      book.studentName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      book.supervisorName?.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesStatus && matchesSupervisor && matchesSearch
  })

  // Table columns
  const columns = [
    {
      title: 'Student',
      key: 'student',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} size="small" />
          <div className="flex flex-col">
            <Text strong>{record.studentName || 'Unknown Student'}</Text>
            <Text type="secondary" className="text-xs">
              ID: {record.studentId || 'N/A'}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Proposal Title',
      dataIndex: 'proposalTitle',
      key: 'proposalTitle',
      width: 300,
      render: (title, record) => (
        <div className="flex flex-col">
          <Tooltip title={title}>
            <Text strong className="line-clamp-2">
              {title || 'Untitled Project'}
            </Text>
          </Tooltip>
          <Text type="secondary" className="text-xs">
            Submitted: {record.submittedAt ? format(parseISO(record.submittedAt), 'MMM dd, yyyy') : 'N/A'}
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
        { text: 'Under Review', value: 'UNDER_REVIEW' },
        { text: 'Approved', value: 'APPROVED' },
        { text: 'Rejected', value: 'REJECTED' },
        { text: 'Revision Required', value: 'REVISION_REQUIRED' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Supervisor',
      key: 'supervisor',
      width: 180,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.supervisorName ? (
            <>
              <Avatar icon={<UserOutlined />} size="small" />
              <Text>{record.supervisorName}</Text>
            </>
          ) : (
            <Tag color="orange">Unassigned</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Score',
      dataIndex: 'reviewScore',
      key: 'reviewScore',
      width: 100,
      render: (score) => {
        if (!score) return <Text type="secondary">Not graded</Text>
        return (
          <div className="flex items-center gap-2">
            <Text strong>{score}%</Text>
            <Rate disabled value={Math.ceil(score / 20)} />
          </div>
        )
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
            onClick: () => {
              setSelectedProjectBook(record)
              setDetailsDrawerVisible(true)
            }
          },
          {
            key: 'review',
            icon: <EditOutlined />,
            label: 'Review/Grade',
            onClick: () => {
              setSelectedProjectBook(record)
              reviewForm.setFieldsValue({
                status: record.status,
                reviewScore: record.reviewScore,
                reviewComments: record.reviewComments
              })
              setReviewModalVisible(true)
            }
          },
          {
            key: 'assign',
            icon: <TeamOutlined />,
            label: 'Assign Supervisor',
            onClick: () => {
              setSelectedProjectBook(record)
              assignForm.setFieldsValue({ supervisorId: record.supervisorId })
              setAssignModalVisible(true)
            }
          },
          {
            type: 'divider'
          },
          {
            key: 'download-doc',
            icon: <DownloadOutlined />,
            label: 'Download Document',
            onClick: () => handleDownload(record.documentUrl, 'Document')
          },
          {
            key: 'download-presentation',
            icon: <FileTextOutlined />,
            label: 'Download Presentation',
            onClick: () => handleDownload(record.presentationUrl, 'Presentation')
          },
          {
            type: 'divider'
          },
          {
            key: 'approve',
            icon: <CheckCircleOutlined />,
            label: 'Quick Approve',
            onClick: () => handleStatusUpdate(record.id, 'APPROVED'),
            disabled: record.status === 'APPROVED'
          },
          {
            key: 'reject',
            icon: <CloseCircleOutlined />,
            label: 'Quick Reject',
            onClick: () => handleStatusUpdate(record.id, 'REJECTED'),
            disabled: record.status === 'REJECTED'
          },
          {
            type: 'divider'
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Delete',
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: 'Delete Project Book',
                content: 'Are you sure you want to delete this project book? This action cannot be undone.',
                onOk: () => handleDelete(record.id)
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
                onClick={() => {
                  setSelectedProjectBook(record)
                  setDetailsDrawerVisible(true)
                }}
                size="small"
              />
            </Tooltip>
            
            <Tooltip title="Review/Grade">
              <Button 
                type="text" 
                icon={<EditOutlined />}
                onClick={() => {
                  setSelectedProjectBook(record)
                  reviewForm.setFieldsValue({
                    status: record.status,
                    reviewScore: record.reviewScore,
                    reviewComments: record.reviewComments
                  })
                  setReviewModalVisible(true)
                }}
                size="small"
              />
            </Tooltip>
            
            <Dropdown
              menu={{ items: actionMenuItems }}
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
    fetchProjectBooks()
    fetchTeachers()
    fetchStudents()
  }, [])

  // Update data when filters change
  useEffect(() => {
    fetchProjectBooks(1, pagination.pageSize)
  }, [filters])

  return (
    <div className="admin-project-books-page space-y-6 p-1 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-2">Project Books Management</Title>
          <Text type="secondary">Manage and review all student project books</Text>
        </div>
        <div className="flex gap-2">
          <Button 
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button 
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={refreshing}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Total Books"
              value={stats.total}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Pending Review"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Under Review"
              value={stats.underReview}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Approved"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Rejected"
              value={stats.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Average Score"
              value={stats.averageScore}
              suffix="%"
              prefix={<StarOutlined />}
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
              placeholder="Search by title, student, or supervisor..."
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
              <Option value="UNDER_REVIEW">Under Review</Option>
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
                supervisor: 'all',
                department: 'all',
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

      {/* Project Books Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredProjectBooks}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} project books`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize }))
              fetchProjectBooks(page, pageSize)
            }
          }}
          scroll={{ x: 1400 }}
          size="middle"
        />
      </Card>

      {/* Review Modal */}
      <Modal
        title={`Review Project Book: ${selectedProjectBook?.proposalTitle}`}
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false)
          reviewForm.resetFields()
          setSelectedProjectBook(null)
        }}
        footer={null}
        width={700}
      >
        <Form
          form={reviewForm}
          layout="vertical"
          onFinish={handleReviewSubmit}
          className="mt-4"
        >
          <Form.Item
            name="status"
            label="Review Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select placeholder="Select review status" size="large">
              <Option value="UNDER_REVIEW">Under Review</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
              <Option value="REVISION_REQUIRED">Revision Required</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reviewScore"
            label="Score (0-100)"
            rules={[
              { type: 'number', min: 0, max: 100, message: 'Score must be between 0 and 100' }
            ]}
          >
            <InputNumber 
              min={0} 
              max={100} 
              style={{ width: '100%' }}
              placeholder="Enter score"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="reviewComments"
            label="Review Comments"
            rules={[
              { min: 10, message: 'Comments must be at least 10 characters long' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter detailed review comments..."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setReviewModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit Review
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Supervisor Modal */}
      <Modal
        title={`Assign Supervisor: ${selectedProjectBook?.proposalTitle}`}
        open={assignModalVisible}
        onCancel={() => {
          setAssignModalVisible(false)
          assignForm.resetFields()
          setSelectedProjectBook(null)
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
            rules={[{ required: true, message: 'Please select a supervisor' }]}
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
              <Button type="primary" htmlType="submit" loading={loading}>
                Assign Supervisor
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Drawer */}
      <Drawer
        title="Project Book Details"
        placement="right"
        onClose={() => {
          setDetailsDrawerVisible(false)
          setSelectedProjectBook(null)
        }}
        open={detailsDrawerVisible}
        width={600}
      >
        {selectedProjectBook && (
          <div className="space-y-6">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Proposal Title">
                {selectedProjectBook.proposalTitle || 'Untitled'}
              </Descriptions.Item>
              <Descriptions.Item label="Student">
                <div className="flex items-center gap-2">
                  <Avatar icon={<UserOutlined />} size="small" />
                  {selectedProjectBook.studentName || 'Unknown Student'}
                  <Text type="secondary">({selectedProjectBook.studentId})</Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Supervisor">
                {selectedProjectBook.supervisorName || (
                  <Tag color="orange">Unassigned</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedProjectBook.status)}>
                  {getStatusText(selectedProjectBook.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Score">
                {selectedProjectBook.reviewScore ? (
                  <div className="flex items-center gap-2">
                    <Text strong>{selectedProjectBook.reviewScore}%</Text>
                    <Rate disabled value={Math.ceil(selectedProjectBook.reviewScore / 20)} />
                  </div>
                ) : (
                  <Text type="secondary">Not graded</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Submitted">
                {selectedProjectBook.submittedAt ? 
                  format(parseISO(selectedProjectBook.submittedAt), 'MMMM dd, yyyy HH:mm') : 
                  'N/A'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {selectedProjectBook.updatedAt ? 
                  format(parseISO(selectedProjectBook.updatedAt), 'MMMM dd, yyyy HH:mm') : 
                  'N/A'
                }
              </Descriptions.Item>
            </Descriptions>

            {selectedProjectBook.description && (
              <div>
                <Title level={5}>Description</Title>
                <Paragraph>
                  {selectedProjectBook.description}
                </Paragraph>
              </div>
            )}

            {selectedProjectBook.reviewComments && (
              <div>
                <Title level={5}>Review Comments</Title>
                <Paragraph>
                  {selectedProjectBook.reviewComments}
                </Paragraph>
              </div>
            )}

            <div>
              <Title level={5}>Downloads</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                {selectedProjectBook.documentUrl && (
                  <Button 
                    block 
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(selectedProjectBook.documentUrl, 'Document')}
                  >
                    Download Project Document
                  </Button>
                )}
                {selectedProjectBook.presentationUrl && (
                  <Button 
                    block 
                    icon={<FileTextOutlined />}
                    onClick={() => handleDownload(selectedProjectBook.presentationUrl, 'Presentation')}
                  >
                    Download Presentation
                  </Button>
                )}
                {selectedProjectBook.sourceCodeUrl && (
                  <Button 
                    block 
                    icon={<LinkOutlined />}
                    onClick={() => window.open(selectedProjectBook.sourceCodeUrl, '_blank')}
                  >
                    View Source Code
                  </Button>
                )}
              </Space>
            </div>

            <div className="flex gap-2">
              <Button 
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setDetailsDrawerVisible(false)
                  reviewForm.setFieldsValue({
                    status: selectedProjectBook.status,
                    reviewScore: selectedProjectBook.reviewScore,
                    reviewComments: selectedProjectBook.reviewComments
                  })
                  setReviewModalVisible(true)
                }}
              >
                Review/Grade
              </Button>
              <Button 
                icon={<TeamOutlined />}
                onClick={() => {
                  setDetailsDrawerVisible(false)
                  assignForm.setFieldsValue({ supervisorId: selectedProjectBook.supervisorId })
                  setAssignModalVisible(true)
                }}
              >
                Assign Supervisor
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}