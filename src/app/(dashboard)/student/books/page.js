'use client'

import { useState, useEffect } from 'react'
import { 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Statistic, 
  Progress, 
  Modal, 
  Form, 
  Input, 
  Upload, 
  Select, 
  message, 
  Spin, 
  Alert, 
  Descriptions, 
  Divider,
  Tooltip,
  Empty,
  Popconfirm
} from 'antd'
import {
  BookOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  UploadOutlined,
  SendOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { projectBookService } from '@/services/projectBook.service'
import { proposalService } from '@/services/proposal.service'
import { uploadService } from '@/services/upload.service'
import { format, parseISO, isValid } from 'date-fns'
import { config } from '@/lib/config'

const { TextArea } = Input
const { Option } = Select

const getStatusColor = (status) => {
  switch (status) {
    case 'DRAFT': return 'default'
    case 'SUBMITTED': return 'processing'
    case 'UNDER_REVIEW': return 'orange'
    case 'APPROVED': return 'success'
    case 'REJECTED': return 'error'
    case 'REVISION_REQUIRED': return 'warning'
    default: return 'default'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'DRAFT': return <EditOutlined />
    case 'SUBMITTED': return <ClockCircleOutlined />
    case 'UNDER_REVIEW': return <ClockCircleOutlined />
    case 'APPROVED': return <CheckCircleOutlined />
    case 'REJECTED': return <ExclamationCircleOutlined />
    case 'REVISION_REQUIRED': return <ExclamationCircleOutlined />
    default: return <ClockCircleOutlined />
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

export default function StudentProjectBooksPage() {
  const router = useRouter()
  const [form] = Form.useForm()

  // State management
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState({})
  const [refreshing, setRefreshing] = useState(false)
  
  // Data states
  const [projectBooks, setProjectBooks] = useState([])
  const [approvedProposals, setApprovedProposals] = useState([])
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  // Modal states
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedProjectBook, setSelectedProjectBook] = useState(null)

  // Upload states
  const [documentFile, setDocumentFile] = useState(null)
  const [presentationFile, setPresentationFile] = useState(null)
  const [documentUploading, setDocumentUploading] = useState(false)
  const [presentationUploading, setPresentationUploading] = useState(false)

  // Error state
  const [error, setError] = useState(null)

  // Fetch data
  const fetchProjectBooks = async (page = 1, pageSize = 10) => {
    try {
      setError(null)
      const response = await projectBookService.getMyProjectBooks({
        page,
        limit: pageSize
      })
      
      const booksData = response.data || response.projectBooks || response || []
      setProjectBooks(Array.isArray(booksData) ? booksData : [])
      
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
          total: Array.isArray(booksData) ? booksData.length : 0
        }))
      }
    } catch (error) {
      console.error('Failed to fetch project books:', error)
      setError('Failed to load project books')
      setProjectBooks([])
    }
  }

  const fetchApprovedProposals = async () => {
    try {
      const response = await proposalService.getProposals({ status: 'APPROVED' })
      const proposalsData = response.data || response.proposals || response || []
      setApprovedProposals(Array.isArray(proposalsData) ? proposalsData : [])
    } catch (error) {
      console.warn('Failed to fetch approved proposals:', error)
      setApprovedProposals([])
    }
  }

  const fetchStats = async () => {
    try {
      const response = await projectBookService.getProjectBookStats()
      setStats(response || {})
    } catch (error) {
      console.warn('Failed to fetch project book stats:', error)
      setStats({})
    }
  }

  const fetchAllData = async () => {
    await Promise.all([
      fetchProjectBooks(),
      fetchApprovedProposals(),
      fetchStats()
    ])
    setLoading(false)
    setRefreshing(false)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAllData()
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // Table pagination handler
  const handleTableChange = (paginationInfo) => {
    fetchProjectBooks(paginationInfo.current, paginationInfo.pageSize)
  }

  // File upload handlers
  const handleDocumentUpload = async (file) => {
    setDocumentUploading(true)
    try {
      const response = await uploadService.uploadDocument(file)
      setDocumentFile(response)
      message.success('Document uploaded successfully')
      return false // Prevent default upload
    } catch (error) {
      message.error('Failed to upload document: ' + error.message)
      return false
    } finally {
      setDocumentUploading(false)
    }
  }

  const handlePresentationUpload = async (file) => {
    setPresentationUploading(true)
    try {
      const response = await uploadService.uploadDocument(file)
      setPresentationFile(response)
      message.success('Presentation uploaded successfully')
      return false // Prevent default upload
    } catch (error) {
      message.error('Failed to upload presentation: ' + error.message)
      return false
    } finally {
      setPresentationUploading(false)
    }
  }

  // CRUD operations
  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      const projectBookData = {
        proposalId: values.proposalId,
        documentUrl: documentFile?.url || values.documentUrl,
        presentationUrl: presentationFile?.url || values.presentationUrl,
        sourceCodeUrl: values.sourceCodeUrl,
        description: values.description
      }

      if (editMode && selectedProjectBook) {
        await projectBookService.updateProjectBook(selectedProjectBook.id, projectBookData)
        message.success('Project book updated successfully')
      } else {
        await projectBookService.submitProjectBook(projectBookData)
        message.success('Project book submitted successfully')
      }

      handleModalClose()
      fetchProjectBooks()
    } catch (error) {
      message.error('Failed to submit project book: ' + (error.message || 'Unknown error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (projectBookId) => {
    setDeleting(prev => ({ ...prev, [projectBookId]: true }))
    try {
      await projectBookService.deleteProjectBook(projectBookId)
      message.success('Project book deleted successfully')
      fetchProjectBooks()
    } catch (error) {
      message.error('Failed to delete project book: ' + (error.message || 'Unknown error'))
    } finally {
      setDeleting(prev => ({ ...prev, [projectBookId]: false }))
    }
  }

  const handleSubmitForReview = async (projectBookId) => {
    try {
      await projectBookService.submitForReview(projectBookId)
      message.success('Project book submitted for review')
      fetchProjectBooks()
    } catch (error) {
      message.error('Failed to submit for review: ' + (error.message || 'Unknown error'))
    }
  }

  // Modal handlers
  const handleModalClose = () => {
    setModalVisible(false)
    setDetailModalVisible(false)
    setEditMode(false)
    setSelectedProjectBook(null)
    setDocumentFile(null)
    setPresentationFile(null)
    form.resetFields()
  }

  const handleEdit = (record) => {
    setSelectedProjectBook(record)
    setEditMode(true)
    setModalVisible(true)
    
    form.setFieldsValue({
      proposalId: record.proposal?.id,
      documentUrl: record.documentUrl,
      presentationUrl: record.presentationUrl,
      sourceCodeUrl: record.sourceCodeUrl,
      description: record.description
    })
  }

  const handleViewDetails = (record) => {
    setSelectedProjectBook(record)
    setDetailModalVisible(true)
  }

  // Download handlers
  const handleDownloadDocument = (record) => {
    if (record.documentUrl) {
      const fullUrl = record.documentUrl.startsWith('http') 
        ? record.documentUrl 
        : `${config.api.baseUrl}${record.documentUrl}`
      window.open(fullUrl, '_blank')
    }
  }

  const handleDownloadPresentation = (record) => {
    if (record.presentationUrl) {
      const fullUrl = record.presentationUrl.startsWith('http') 
        ? record.presentationUrl 
        : `${config.api.baseUrl}${record.presentationUrl}`
      window.open(fullUrl, '_blank')
    }
  }

  // Calculate statistics
  const calculateStats = () => {
    const total = projectBooks.length
    const drafts = projectBooks.filter(book => book.status === 'DRAFT').length
    const submitted = projectBooks.filter(book => ['SUBMITTED', 'UNDER_REVIEW'].includes(book.status)).length
    const approved = projectBooks.filter(book => book.status === 'APPROVED').length
    const needsRevision = projectBooks.filter(book => ['REJECTED', 'REVISION_REQUIRED'].includes(book.status)).length

    return { total, drafts, submitted, approved, needsRevision }
  }

  const bookStats = calculateStats()

  // Table columns
  const columns = [
    {
      title: 'Proposal Title',
      dataIndex: ['proposal', 'title'],
      key: 'proposalTitle',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text || 'Untitled Proposal'}</div>
          <div className="text-sm text-gray-500">
            Supervisor: {record.proposal?.supervisor?.name || 'Not assigned'}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {(status || 'DRAFT').replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Submitted',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDate(date),
      sorter: true,
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => formatDate(date),
    },
    {
      title: 'Score',
      dataIndex: 'reviewScore',
      key: 'reviewScore',
      render: (score) => score ? `${score}%` : 'Not graded',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          
          {record.status === 'DRAFT' && (
            <>
              <Tooltip title="Edit">
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              <Tooltip title="Submit for Review">
                <Button 
                  type="text" 
                  icon={<SendOutlined />} 
                  onClick={() => handleSubmitForReview(record.id)}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Popconfirm
                  title="Delete Project Book"
                  description="Are you sure you want to delete this project book?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />}
                    loading={deleting[record.id]}
                  />
                </Popconfirm>
              </Tooltip>
            </>
          )}
          
          {record.documentUrl && (
            <Tooltip title="Download Document">
              <Button 
                type="text" 
                icon={<FilePdfOutlined />} 
                onClick={() => handleDownloadDocument(record)}
              />
            </Tooltip>
          )}
          
          {record.presentationUrl && (
            <Tooltip title="Download Presentation">
              <Button 
                type="text" 
                icon={<FileTextOutlined />} 
                onClick={() => handleDownloadPresentation(record)}
              />
            </Tooltip>
          )}
          
          {record.sourceCodeUrl && (
            <Tooltip title="View Source Code">
              <Button 
                type="text" 
                icon={<LinkOutlined />} 
                onClick={() => window.open(record.sourceCodeUrl, '_blank')}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" tip="Loading project books..." />
      </div>
    )
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

      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Project Books</h1>
          <p className="text-gray-600">
            Submit and track your final project documentation
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={refreshing}
          >
            Refresh
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
            disabled={approvedProposals.length === 0}
          >
            Submit Project Book
          </Button>
        </div>
      </div>

      {/* Information Alert */}
      {approvedProposals.length === 0 && (
        <Alert
          message="No Approved Proposals"
          description="You need to have at least one approved proposal before you can submit a project book."
          type="info"
          showIcon
          action={
            <Link href="/student/proposals">
              <Button size="small" type="primary">
                View Proposals
              </Button>
            </Link>
          }
        />
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Project Books"
              value={bookStats.total}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Drafts"
              value={bookStats.drafts}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Under Review"
              value={bookStats.submitted}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Approved"
              value={bookStats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Project Books Table */}
      <Card title="Project Books">
        <Table
          columns={columns}
          dataSource={projectBooks}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} project books`,
          }}
          onChange={handleTableChange}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No project books submitted yet"
              >
                {approvedProposals.length > 0 && (
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setModalVisible(true)}
                  >
                    Submit Your First Project Book
                  </Button>
                )}
              </Empty>
            )
          }}
        />
      </Card>

      {/* Submit/Edit Project Book Modal */}
      <Modal
        title={editMode ? "Edit Project Book" : "Submit Project Book"}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="proposalId"
            label="Select Approved Proposal"
            rules={[
              { required: true, message: 'Please select a proposal' }
            ]}
          >
            <Select
              placeholder="Choose an approved proposal"
              disabled={editMode}
              showSearch
              optionFilterProp="children"
            >
              {approvedProposals.map(proposal => (
                <Option key={proposal.id} value={proposal.id}>
                  {proposal.title} (Supervisor: {proposal.supervisor?.name || 'Not assigned'})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Project Documentation (PDF)"
            required
          >
            <Upload
              beforeUpload={handleDocumentUpload}
              showUploadList={false}
              accept=".pdf"
            >
              <Button 
                icon={<UploadOutlined />} 
                loading={documentUploading}
                block
              >
                {documentFile ? 'Document Uploaded ✓' : 'Upload Project Document'}
              </Button>
            </Upload>
            {documentFile && (
              <div className="mt-2 text-sm text-green-600">
                ✓ {documentFile.originalName || 'Document uploaded successfully'}
              </div>
            )}
          </Form.Item>

          <Form.Item
            label="Presentation Slides (PDF)"
          >
            <Upload
              beforeUpload={handlePresentationUpload}
              showUploadList={false}
              accept=".pdf,.ppt,.pptx"
            >
              <Button 
                icon={<UploadOutlined />} 
                loading={presentationUploading}
                block
              >
                {presentationFile ? 'Presentation Uploaded ✓' : 'Upload Presentation (Optional)'}
              </Button>
            </Upload>
            {presentationFile && (
              <div className="mt-2 text-sm text-green-600">
                ✓ {presentationFile.originalName || 'Presentation uploaded successfully'}
              </div>
            )}
          </Form.Item>

          <Form.Item
            name="sourceCodeUrl"
            label="Source Code Repository URL"
            rules={[
              { type: 'url', message: 'Please enter a valid URL' }
            ]}
          >
            <Input 
              placeholder="https://github.com/username/repository"
              prefix={<LinkOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Project Description"
            rules={[
              { max: 1000, message: 'Description cannot exceed 1000 characters' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Brief description of your project and its key features..."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={handleModalClose}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                disabled={!editMode && !documentFile}
              >
                {editMode ? 'Update Project Book' : 'Submit Project Book'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Project Book Details Modal */}
      <Modal
        title="Project Book Details"
        open={detailModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedProjectBook && (
          <div className="space-y-4">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Proposal Title">
                {selectedProjectBook.proposal?.title || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Supervisor">
                {selectedProjectBook.proposal?.supervisor?.name || 'Not assigned'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedProjectBook.status)} icon={getStatusIcon(selectedProjectBook.status)}>
                  {(selectedProjectBook.status || 'DRAFT').replace('_', ' ')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Submitted">
                {formatDateTime(selectedProjectBook.created_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {formatDateTime(selectedProjectBook.updated_at)}
              </Descriptions.Item>
              {selectedProjectBook.reviewScore && (
                <Descriptions.Item label="Score">
                  <Progress 
                    percent={selectedProjectBook.reviewScore} 
                    size="small" 
                    status={selectedProjectBook.reviewScore >= 70 ? 'success' : 'exception'}
                  />
                </Descriptions.Item>
              )}
              {selectedProjectBook.description && (
                <Descriptions.Item label="Description">
                  {selectedProjectBook.description}
                </Descriptions.Item>
              )}
              {selectedProjectBook.reviewComments && (
                <Descriptions.Item label="Review Comments">
                  <div className="bg-gray-50 p-3 rounded border">
                    {selectedProjectBook.reviewComments}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider>Files & Resources</Divider>
            
            <Space wrap>
              {selectedProjectBook.documentUrl && (
                <Button 
                  icon={<FilePdfOutlined />}
                  onClick={() => handleDownloadDocument(selectedProjectBook)}
                >
                  Download Document
                </Button>
              )}
              {selectedProjectBook.presentationUrl && (
                <Button 
                  icon={<FileTextOutlined />}
                  onClick={() => handleDownloadPresentation(selectedProjectBook)}
                >
                  Download Presentation
                </Button>
              )}
              {selectedProjectBook.sourceCodeUrl && (
                <Button 
                  icon={<LinkOutlined />}
                  onClick={() => window.open(selectedProjectBook.sourceCodeUrl, '_blank')}
                >
                  View Source Code
                </Button>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  )
}