'use client'

import { useState, useEffect } from 'react'
import './student-proposals.css'
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Upload,
  Select,
  Steps,
  message,
  Tag,
  Space,
  Typography,
  Divider,
  Badge,
  Tooltip,
  Popconfirm,
  Timeline,
  Descriptions,
  Alert,
  Progress,
  notification
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  SendOutlined,
  CommentOutlined,
  HistoryOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { proposalService } from '../../../../services/proposal.service'
import { userService } from '../../../../services/user.service'
import { uploadService } from '../../../../services/upload.service'
import { commentService } from '../../../../services/comment.service'
import { config } from '../../../../lib/config'
import './student-proposals.css'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Step } = Steps
const { Option } = Select

export default function StudentProposalsPage() {
  // State management
  const [loading, setLoading] = useState(false)
  const [proposals, setProposals] = useState([])
  const [teachers, setTeachers] = useState([])
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [fileList, setFileList] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  // Modal states
  const [newProposalModal, setNewProposalModal] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [statusModal, setStatusModal] = useState(false)
  const [commentsModal, setCommentsModal] = useState(false)
  
  // Form instances
  const [newProposalForm] = Form.useForm()
  const [editForm] = Form.useForm()
  
  // Load initial data
  useEffect(() => {
    console.log('Component mounted, loading initial data...')
    loadProposals()
    loadTeachers()
  }, [])

  // Debug: Track proposals state changes
  useEffect(() => {
    console.log('Proposals state updated:', proposals)
    console.log('Total proposals count:', proposals.length)
  }, [proposals])

  const loadProposals = async () => {
    try {
      setLoading(true)
      let proposalsData = []
      
      try {
        const response = await proposalService.getProposals()
        proposalsData = response.data || response || []
        console.log('Loaded proposals from API:', proposalsData)
      } catch (serviceError) {
        console.error('Proposal service failed:', serviceError)
        message.error('Failed to load proposals from server')
        setProposals([])
      }
      
      setProposals(proposalsData)
      console.log('Final proposals state:', proposalsData)
      
    } catch (error) {
      console.error('Failed to load proposals:', error)
      message.error('Failed to load proposals')
      setProposals([])
    } finally {
      setLoading(false)
    }
  }

  const loadTeachers = async () => {
    try {
      // Use the dedicated teachers endpoint
      console.log('Loading teachers from /teachers endpoint...')
      const response = await userService.getAllTeachers()
      const teachersData = response.data || response || []
      setTeachers(teachersData)
      console.log('Teachers loaded successfully:', teachersData)
      console.log('Sample teacher object:', teachersData[0])
    } catch (error) {
      console.error('Failed to load teachers from /teachers endpoint:', error)
      
      // Fallback to users endpoint with role filter
      try {
        console.log('Trying fallback teachers endpoint (/users?role=TEACHER)...')
        const fallbackResponse = await userService.getUsers({ role: 'TEACHER' })
        const fallbackData = fallbackResponse.data || fallbackResponse || []
        setTeachers(fallbackData)
        console.log('Teachers loaded from fallback:', fallbackData)
        console.log('Sample fallback teacher object:', fallbackData[0])
      } catch (fallbackError) {
        console.error('Failed to load teachers from fallback endpoint:', fallbackError)
        message.error('Failed to load teachers from server. Please check your backend connection.')
        setTeachers([])
      }
    }
  }

  // Handle file upload
  const handleFileUpload = async (file) => {
    // Validate file type
    if (!file.type.includes('pdf')) {
      message.error('Please upload a PDF file only')
      return false
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      message.error('File size must be less than 10MB')
      return false
    }
    
    try {
      setIsUploading(true)
      setUploadProgress(0)
      setUploadSuccess(false)
      
      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)
      
      let response
      try {
        // Use upload service - no fallback, live backend only
        response = await uploadService.uploadDocument(file)
      } catch (uploadError) {
        console.error('Upload service failed:', uploadError)
        throw uploadError // Re-throw the error to be handled in the outer catch
      }
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (response && (response.url || response.data?.url)) {
        const fileUrl = response.url || response.data.url
        setFileList([{
          uid: file.uid || '-1',
          name: file.name,
          status: 'done',
          url: fileUrl,
          response: response
        }])
        
        setUploadSuccess(true)
        message.success('Document uploaded successfully!')
        
        // Return false to prevent default upload behavior
        return false
      } else {
        throw new Error('Invalid response from upload service')
      }
      
    } catch (error) {
      console.error('Upload failed:', error)
      
      // More detailed error handling
      let errorMessage = 'Unknown error'
      if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      message.error(`Document upload failed: ${errorMessage}`)
      setFileList([])
      setUploadSuccess(false)
      setUploadProgress(0)
      return false
    } finally {
      setIsUploading(false)
    }
  }

  // Handle file removal
  const handleFileRemove = () => {
    setFileList([])
    setUploadSuccess(false)
    setUploadProgress(0)
    message.info('File removed')
  }

  // Validate current step before proceeding
  const validateCurrentStep = () => {
    const currentValues = newProposalForm.getFieldsValue()
    
    switch (currentStep) {
      case 0: // Basic Info
        if (!currentValues.title) {
          message.error('Please enter a project title')
          return false
        }
        break
      case 1: // Details  
        if (!currentValues.abstract) {
          message.error('Please provide an abstract')
          return false
        }
        break
      case 2: // Documentation
        if (!uploadSuccess || fileList.length === 0) {
          message.error('Please upload a proposal document before proceeding')
          return false
        }
        break
      case 3: // Supervisor
        if (!currentValues.supervisorId) {
          message.error('Please select a supervisor')
          return false
        }
        break
      default:
        return true
    }
    return true
  }

  // Handle next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Submit new proposal
  const handleSubmitProposal = async (values) => {
    try {
      setLoading(true)
      
      console.log('HandleSubmitProposal called with values:', values)
      
      // Get fresh form values if values object is empty or missing title
      let formValues = values
      if (!formValues || !formValues.title) {
        console.log('Getting fresh form values...')
        formValues = newProposalForm.getFieldsValue(true)
        console.log('Fresh form values:', formValues)
      }
      
      // Validate required fields before submission
      if (!formValues.title) {
        console.error('Title validation failed. Form values:', formValues)
        message.error('Project title is required. Please go back to Step 1 and enter a title.')
        setCurrentStep(0)
        return
      }
      
      if (!formValues.abstract) {
        console.error('Abstract validation failed. Form values:', formValues)
        message.error('Abstract is required. Please go back to Step 2 and enter an abstract.')
        setCurrentStep(1)
        return
      }
      
      if (!formValues.supervisorId) {
        console.error('Supervisor validation failed. Form values:', formValues)
        message.error('Primary supervisor is required. Please go back to Step 4 and select a supervisor.')
        setCurrentStep(3)
        return
      }
      
      // Validate document upload - check both fileList state and form field
      let documentUrl = null
      
      // First try to get from fileList state (upload component)
      if (fileList.length > 0 && fileList[0].response) {
        documentUrl = fileList[0].response.url || fileList[0].response.data?.url
      }
      
      // If not found, try to extract from form document field
      if (!documentUrl && formValues.document) {
        if (formValues.document.fileList && formValues.document.fileList.length > 0) {
          const uploadedFile = formValues.document.fileList[0]
          if (uploadedFile.response) {
            documentUrl = uploadedFile.response.url || uploadedFile.response.data?.url
          }
        }
      }
      
      console.log('Document URL extraction:', {
        fileListState: fileList,
        formDocumentField: formValues.document,
        extractedUrl: documentUrl
      })
      
      if (!documentUrl) {
        message.error('Document upload is required')
        setCurrentStep(2) // Go back to document upload step
        return
      }
      
      const proposalData = {
        title: formValues.title,
        abstract: formValues.abstract,
        methodology: formValues.methodology || '',
        supervisorId: formValues.supervisorId,
        coSupervisorId: formValues.coSupervisorId || null,
        documentUrl: documentUrl,
        teamMembers: formValues.teamMembers || [],
        references: formValues.references || ''
      }
      
      console.log('Submitting proposal data:', proposalData)
      
      let response
      try {
        response = await proposalService.createProposal(proposalData)
        console.log('Proposal created via API:', response)
      } catch (serviceError) {
        console.error('Proposal service failed:', serviceError)
        throw serviceError // Re-throw the error to be handled in the outer catch
      }
      
      message.success('Proposal submitted successfully!')
      notification.success({
        message: 'Proposal Submitted',
        description: 'Your proposal has been submitted for review. You will be notified once it\'s reviewed.',
        duration: 5
      })

      // Reset modal and form state
      setNewProposalModal(false)
      newProposalForm.resetFields()
      setFileList([])
      setUploadSuccess(false)
      setUploadProgress(0)
      setCurrentStep(0)
      
      // Reload proposals to get updated list
      console.log('Reloading proposals after successful submission...')
      await loadProposals()
      console.log('Current proposals after reload:', proposals)
      
    } catch (error) {
      console.error('Failed to submit proposal:', error)
      
      // More detailed error message
      let errorMessage = 'Failed to submit proposal'
      if (error.message) {
        errorMessage = `Failed to submit proposal: ${error.message}`
      } else if (error.response?.data?.message) {
        errorMessage = `Failed to submit proposal: ${error.response.data.message}`
      }
      
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Update proposal - DISABLED: Backend doesn't support proposal updates
  // Students must delete and recreate proposals for changes
  const handleUpdateProposal = async (values) => {
    message.error('Proposal updates are not supported. Please delete and create a new proposal if changes are needed.')
    return
    /*
    try {
      setLoading(true)
      
      let documentUrl = selectedProposal.documentUrl
      if (fileList.length > 0 && fileList[0].response) {
        documentUrl = fileList[0].response.url
      }
      
      const updateData = {
        ...values,
        documentUrl
      }
      
      console.log('Attempting to update proposal with ID:', selectedProposal.id, 'Data:', updateData)
      await proposalService.updateProposal(selectedProposal.id, updateData)
      
      message.success('Proposal updated successfully!')
      setEditModal(false)
      editForm.resetFields()
      setFileList([])
      setUploadSuccess(false)
      setUploadProgress(0)
      loadProposals()
      
    } catch (error) {
      console.error('Failed to update proposal:', error)
      const errorMessage = error.message || error.response?.data?.message || 'Failed to update proposal'
      message.error(`Update failed: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
    */
  }

  // Delete proposal
  const handleDeleteProposal = async (id) => {
    try {
      setLoading(true)
      console.log('Attempting to delete proposal with ID:', id)
      await proposalService.deleteProposal(id)
      message.success('Proposal deleted successfully!')
      loadProposals()
    } catch (error) {
      console.error('Failed to delete proposal:', error)
      const errorMessage = error.message || error.response?.data?.message || 'Failed to delete proposal'
      message.error(`Delete failed: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // View proposal details
  const handleViewProposal = async (proposal) => {
    try {
      setLoading(true)
      console.log('Loading full proposal details for ID:', proposal.id)
      const response = await proposalService.getProposal(proposal.id)
      const fullProposal = response.data || response
      
      console.log('Full proposal details loaded:', fullProposal)
      setSelectedProposal(fullProposal)
      setViewModal(true)
    } catch (error) {
      console.error('Failed to load proposal details:', error)
      const errorMessage = error.message || error.response?.data?.message || 'Failed to load proposal details'
      message.error(`View failed: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Edit proposal - DISABLED: Backend doesn't support updates
  const handleEditProposal = (proposal) => {
    message.info('Proposal editing is not available. Delete and create a new proposal if changes are needed.')
    return
    /*
    setSelectedProposal(proposal)
    editForm.setFieldsValue(proposal)
    setEditModal(true)
    */
  }

  // Load comments - Comments are included in proposal details response
  const handleViewComments = async (proposal) => {
    try {
      setLoading(true)
      console.log('Loading comments for proposal ID:', proposal.id)
      
      // Check if proposal already has comments loaded
      if (proposal.comments && Array.isArray(proposal.comments)) {
        console.log('Using existing comments from proposal object:', proposal.comments)
        setSelectedProposal(proposal)
        setCommentsModal(true)
        return
      }
      
      // If no comments in the proposal object, fetch full proposal details
      // which includes comments according to the API response structure
      console.log('Fetching full proposal details to get comments...')
      const response = await proposalService.getProposal(proposal.id)
      const fullProposal = response.data || response
      
      console.log('Full proposal response with comments:', fullProposal)
      setSelectedProposal(fullProposal)
      setCommentsModal(true)
      
    } catch (error) {
      console.error('Failed to load proposal details for comments:', error)
      const errorMessage = error.message || error.response?.data?.message || 'Failed to load comments'
      message.error(`Comments failed: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
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

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <ClockCircleOutlined />
      case 'APPROVED': return <CheckCircleOutlined />
      case 'REJECTED': return <CloseCircleOutlined />
      case 'REVISION_REQUIRED': return <ExclamationCircleOutlined />
      default: return <InfoCircleOutlined />
    }
  }

  // Helper function to get full document URL
  const getFullDocumentUrl = (documentUrl) => {
    if (!documentUrl) return null
    
    // If already a full URL, return as is
    if (documentUrl.startsWith('http://') || documentUrl.startsWith('https://')) {
      return documentUrl
    }
    
    // If relative path, prepend backend base URL
    return `${config.api.baseUrl}${documentUrl}`
  }

  // Table columns
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <div>
          <Text strong style={{ color: '#1e293b' }}>{title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ID: {record.id}
          </Text>
        </div>
      )
    },
    {
      title: 'Supervisor',
      dataIndex: 'supervisor',
      key: 'supervisor',
      render: (supervisor) => (
        <div>
          <UserOutlined style={{ marginRight: 4, color: '#3b82f6' }} />
          {supervisor?.name || 'Not Assigned'}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          icon={getStatusIcon(status)} 
          color={getStatusColor(status)}
          style={{ fontWeight: '500' }}
        >
          {status?.replace('_', ' ')}
        </Tag>
      )
    },
    {
      title: 'Submitted',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <div>
          <Text style={{ color: '#64748b' }}>
            {new Date(date).toLocaleDateString()}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {new Date(date).toLocaleTimeString()}
          </Text>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewProposal(record)}
            />
          </Tooltip>
          
          {record.status === 'PENDING' || record.status === 'REVISION_REQUIRED' ? (
            <Tooltip title="Edit not supported - Delete and recreate if needed">
              <Button
                type="link"
                icon={<EditOutlined />}
                disabled
                style={{ color: '#d1d5db' }}
              />
            </Tooltip>
          ) : null}
          
          <Tooltip title="View Comments">
            <Button
              type="link"
              icon={<CommentOutlined />}
              onClick={() => handleViewComments(record)}
            />
          </Tooltip>
          
          {record.status === 'PENDING' ? (
            <Popconfirm
              title="Are you sure you want to delete this proposal?"
              onConfirm={() => handleDeleteProposal(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete Proposal">
                <Button
                  type="link"
                  icon={<DeleteOutlined />}
                  danger
                />
              </Tooltip>
            </Popconfirm>
          ) : null}
        </Space>
      )
    }
  ]

  // Steps for new proposal
  const proposalSteps = [
    {
      title: 'Basic Info',
      description: 'Project title and team'
    },
    {
      title: 'Details',
      description: 'Abstract and methodology'
    },
    {
      title: 'Documentation',
      description: 'Upload proposal document'
    },
    {
      title: 'Supervisor',
      description: 'Select supervisor'
    },
    {
      title: 'Review',
      description: 'Review and submit'
    }
  ]

  return (
    <div className="student-proposals">
      <div className="proposals-header">
        <Title level={2}>
          <FileTextOutlined /> My Proposals
        </Title>
        <Text type="secondary">
          Submit and track your thesis proposals
        </Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="summary-card">
            <div className="summary-content">
              <div className="summary-icon total">
                <FileTextOutlined />
              </div>
              <div className="summary-text">
                <Text type="secondary">Total Proposals</Text>
                <Title level={3}>{proposals.length}</Title>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className="summary-card">
            <div className="summary-content">
              <div className="summary-icon pending">
                <ClockCircleOutlined />
              </div>
              <div className="summary-text">
                <Text type="secondary">Pending Review</Text>
                <Title level={3}>
                  {proposals.filter(p => p.status === 'PENDING').length}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className="summary-card">
            <div className="summary-content">
              <div className="summary-icon approved">
                <CheckCircleOutlined />
              </div>
              <div className="summary-text">
                <Text type="secondary">Approved</Text>
                <Title level={3}>
                  {proposals.filter(p => p.status === 'APPROVED').length}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className="summary-card">
            <div className="summary-content">
              <div className="summary-icon revision">
                <ExclamationCircleOutlined />
              </div>
              <div className="summary-text">
                <Text type="secondary">Need Revision</Text>
                <Title level={3}>
                  {proposals.filter(p => p.status === 'REVISION_REQUIRED').length}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Alert
            message="Proposal Management Information"
            description="Once submitted, proposals cannot be directly edited. If you need to make changes to a PENDING proposal, you can delete it and create a new one. For REVISION_REQUIRED proposals, please delete the current one and submit a new proposal with the requested changes."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            closable
          />
          <Card 
            title="Proposals List"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setNewProposalModal(true)}
                size="large"
              >
                New Proposal
              </Button>
            }
            className="proposals-card"
          >
            <Table
              dataSource={proposals}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} proposals`
              }}
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
      </Row>

      {/* New Proposal Modal */}
      <Modal
        title={
          <div style={{ textAlign: 'center' }}>
            <FileTextOutlined style={{ marginRight: 8, color: '#3b82f6' }} />
            Submit New Proposal
          </div>
        }
        open={newProposalModal}
        onCancel={() => {
          setNewProposalModal(false)
          newProposalForm.resetFields()
          setFileList([])
          setUploadSuccess(false)
          setUploadProgress(0)
          setCurrentStep(0)
        }}
        footer={null}
        width={800}
        className="proposal-modal"
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          {proposalSteps.map(step => (
            <Step key={step.title} title={step.title} description={step.description} />
          ))}
        </Steps>

        <Form
          form={newProposalForm}
          layout="vertical"
          onFinishFailed={(errorInfo) => {
            console.log('Form validation failed:', errorInfo)
            message.error('Please check all required fields')
          }}
        >
          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <div>
              <Form.Item
                label="Project Title"
                name="title"
                rules={[
                  { required: true, message: 'Please enter project title' },
                  { max: 200, message: 'Title must be less than 200 characters' }
                ]}
              >
                <Input 
                  placeholder="Enter your project title"
                  showCount
                  maxLength={200}
                />
              </Form.Item>
              
              <Form.Item
                label="Team Members (Optional)"
                name="teamMembers"
              >
                <Select
                  mode="tags"
                  placeholder="Add team member names"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 1 && (
            <div>
              <Form.Item
                label="Abstract"
                name="abstract"
                rules={[
                  { required: true, message: 'Please enter abstract' },
                  { min: 100, message: 'Abstract must be at least 100 characters' },
                  { max: 1000, message: 'Abstract must be less than 1000 characters' }
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="Describe your project abstract (100-1000 words)"
                  showCount
                  maxLength={1000}
                />
              </Form.Item>
              
              <Form.Item
                label="Research Methodology"
                name="methodology"
              >
                <TextArea
                  rows={4}
                  placeholder="Describe your research methodology (optional)"
                />
              </Form.Item>
              
              <Form.Item
                label="References/Bibliography"
                name="references"
              >
                <TextArea
                  rows={3}
                  placeholder="Add references or bibliography (optional)"
                />
              </Form.Item>
            </div>
          )}

          {/* Step 3: Documentation */}
          {currentStep === 2 && (
            <div>
              <Form.Item
                label="Proposal Document"
                name="document"
                rules={[{ required: true, message: 'Please upload a proposal document' }]}
              >
                <Upload
                  accept=".pdf"
                  fileList={fileList}
                  beforeUpload={handleFileUpload}
                  onRemove={handleFileRemove}
                  maxCount={1}
                  disabled={isUploading}
                >
                  <Button 
                    icon={<UploadOutlined />}
                    loading={isUploading}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload PDF Document (Max 10MB)'}
                  </Button>
                </Upload>
                
                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Progress 
                    percent={uploadProgress} 
                    style={{ marginTop: 8 }}
                    status={isUploading ? 'active' : 'normal'}
                  />
                )}
                
                {/* Upload Success Indicator */}
                {uploadSuccess && fileList.length > 0 && (
                  <Alert
                    message="Document uploaded successfully!"
                    description={`File: ${fileList[0].name}`}
                    type="success"
                    showIcon
                    style={{ marginTop: 8 }}
                  />
                )}
                
                {/* Upload Failed Indicator */}
                {!uploadSuccess && !isUploading && uploadProgress > 0 && (
                  <Alert
                    message="Upload failed"
                    description="Please try uploading the document again"
                    type="error"
                    showIcon
                    style={{ marginTop: 8 }}
                  />
                )}
              </Form.Item>
              
              <Alert
                message="Document Requirements"
                description="Please upload your complete proposal document in PDF format. Maximum file size is 10MB. This is required to proceed to the next step."
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            </div>
          )}

          {/* Step 4: Supervisor */}
          {currentStep === 3 && (
            <div>
              <Form.Item
                label="Primary Supervisor"
                name="supervisorId"
                rules={[{ required: true, message: 'Please select a supervisor' }]}
              >
                <Select
                  placeholder="Select primary supervisor"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {teachers.map(teacher => (
                    <Option key={teacher.id} value={teacher.id}>
                      {teacher.name}{teacher.department ? ` - ${teacher.department}` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                label="Co-Supervisor (Optional)"
                name="coSupervisorId"
              >
                <Select
                  placeholder="Select co-supervisor (optional)"
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {teachers.map(teacher => (
                    <Option key={teacher.id} value={teacher.id}>
                      {teacher.name}{teacher.department ? ` - ${teacher.department}` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 4 && (
            <div>
              <Alert
                message="Review Your Proposal"
                description="Please review all information before submitting. Once submitted, you can only edit if revision is requested."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              {/* Debug information - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <Alert
                  message="Debug Info"
                  description={`Form Values: ${JSON.stringify(newProposalForm.getFieldsValue(true), null, 2)}`}
                  type="info"
                  style={{ marginBottom: 16, whiteSpace: 'pre-wrap' }}
                />
              )}
              
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Title">
                  {newProposalForm.getFieldValue('title') || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Abstract">
                  {newProposalForm.getFieldValue('abstract') || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Methodology">
                  {newProposalForm.getFieldValue('methodology') || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Supervisor">
                  {teachers.find(t => t.id === newProposalForm.getFieldValue('supervisorId'))?.name || 'Not selected'}
                </Descriptions.Item>
                <Descriptions.Item label="Co-Supervisor">
                  {teachers.find(t => t.id === newProposalForm.getFieldValue('coSupervisorId'))?.name || 'Not selected'}
                </Descriptions.Item>
                <Descriptions.Item label="Document">{uploadSuccess && fileList.length > 0 ? (
                    <span style={{ color: '#10b981' }}>
                      ✓ {fileList[0].name}
                    </span>
                  ) : (
                    <span style={{ color: '#ef4444' }}>
                      ✗ No document uploaded
                    </span>
                  )}
                </Descriptions.Item>
              </Descriptions>
              
              {(!uploadSuccess || fileList.length === 0) && (
                <Alert
                  message="Missing Document"
                  description="Please go back to step 3 and upload a proposal document before submitting."
                  type="error"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </div>
          )}

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Space>
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
                  Previous
                </Button>
              )}
              
              {currentStep < proposalSteps.length - 1 ? (
                <Button 
                  type="primary" 
                  onClick={handleNextStep}
                  disabled={currentStep === 2 && (!uploadSuccess || isUploading)}
                >
                  {currentStep === 2 && !uploadSuccess ? 'Upload Document First' : 'Next'}
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  icon={<SendOutlined />}
                  onClick={async () => {
                    try {
                      // Get all form values including untouched fields
                      const values = newProposalForm.getFieldsValue(true)
                      console.log('Form values before submission:', values)
                      
                      // Additional validation with detailed logging
                      if (!values.title) {
                        console.log('Title missing - all form values:', values)
                        message.error('Project title is required. Please go back to Step 1 and enter a title.')
                        setCurrentStep(0)
                        return
                      }
                      
                      await handleSubmitProposal(values)
                    } catch (error) {
                      console.error('Submit error:', error)
                    }
                  }}
                  loading={loading}
                  disabled={!uploadSuccess || fileList.length === 0}
                >
                  {!uploadSuccess || fileList.length === 0 ? 'Upload Document Required' : 'Submit Proposal'}
                </Button>
              )}
            </Space>
          </div>
        </Form>
      </Modal>

      {/* View Proposal Modal */}
      <Modal
        title="Proposal Details"
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={[
          <Button key="close" onClick={() => setViewModal(false)}>
            Close
          </Button>,
          selectedProposal?.documentUrl && (
            <Button 
              key="download"
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => {
                const fullUrl = getFullDocumentUrl(selectedProposal.documentUrl)
                console.log('Opening document URL:', fullUrl)
                window.open(fullUrl, '_blank')
              }}
            >
              Download Document
            </Button>
          )
        ]}
        width={800}
      >
        {selectedProposal && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Title">
                {selectedProposal.title}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag icon={getStatusIcon(selectedProposal.status)} color={getStatusColor(selectedProposal.status)}>
                  {selectedProposal.status?.replace('_', ' ')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Supervisor">
                {selectedProposal.supervisor?.name || 'Not assigned'}
              </Descriptions.Item>
              <Descriptions.Item label="Submitted">
                {new Date(selectedProposal.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Abstract">
                {selectedProposal.abstract}
              </Descriptions.Item>
              {selectedProposal.documentUrl && (
                <Descriptions.Item label="Document">
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Stored path: {selectedProposal.documentUrl}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Full URL: {getFullDocumentUrl(selectedProposal.documentUrl)}
                    </Text>
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
            
            {selectedProposal.comments && selectedProposal.comments.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Title level={5}>Recent Comments</Title>
                <Timeline>
                  {selectedProposal.comments.slice(-3).map(comment => (
                    <Timeline.Item key={comment.id}>
                      <div>
                        <Text strong>{comment.commenter?.name}</Text>
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          {new Date(comment.createdAt).toLocaleString()}
                        </Text>
                        <Paragraph style={{ marginTop: 4 }}>
                          {comment.content}
                        </Paragraph>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Proposal Modal */}
      <Modal
        title="Edit Proposal"
        open={editModal}
        onCancel={() => {
          setEditModal(false)
          editForm.resetFields()
          setFileList([])
          setUploadSuccess(false)
          setUploadProgress(0)
        }}
        footer={null}
        width={700}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateProposal}
        >
          <Form.Item
            label="Project Title"
            name="title"
            rules={[
              { required: true, message: 'Please enter project title' },
              { max: 200, message: 'Title must be less than 200 characters' }
            ]}
          >
            <Input 
              placeholder="Enter your project title"
              showCount
              maxLength={200}
            />
          </Form.Item>
          
          <Form.Item
            label="Abstract"
            name="abstract"
            rules={[
              { required: true, message: 'Please enter abstract' },
              { min: 100, message: 'Abstract must be at least 100 characters' },
              { max: 1000, message: 'Abstract must be less than 1000 characters' }
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Describe your project abstract"
              showCount
              maxLength={1000}
            />
          </Form.Item>
          
          <Form.Item
            label="Update Document (Optional)"
            name="document"
          >
            <Upload
              accept=".pdf"
              fileList={fileList}
              beforeUpload={handleFileUpload}
              onRemove={handleFileRemove}
              maxCount={1}
              disabled={isUploading}
            >
              <Button 
                icon={<UploadOutlined />}
                loading={isUploading}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload New PDF Document'}
              </Button>
            </Upload>
            
            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Progress 
                percent={uploadProgress} 
                style={{ marginTop: 8 }}
                status={isUploading ? 'active' : 'normal'}
              />
            )}
            
            {/* Upload Success Indicator */}
            {uploadSuccess && fileList.length > 0 && (
              <Alert
                message="Document uploaded successfully!"
                description={`File: ${fileList[0].name}`}
                type="success"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
            
            <Alert
              message="Document Update"
              description="Upload a new PDF document to replace the existing one. If no new document is uploaded, the existing document will be kept."
              type="info"
              showIcon
              style={{ marginTop: 8 }}
            />
          </Form.Item>
          
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditModal(false)}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
              >
                Update Proposal
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Comments Modal */}
      <Modal
        title="Proposal Comments & History"
        open={commentsModal}
        onCancel={() => setCommentsModal(false)}
        footer={[
          <Button key="close" onClick={() => setCommentsModal(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedProposal && (
          <div>
            <Alert
              message={`Comments for: ${selectedProposal.title}`}
              type="info"
              style={{ marginBottom: 16 }}
            />
            
            {selectedProposal.comments && selectedProposal.comments.length > 0 ? (
              <Timeline>
                {selectedProposal.comments.map(comment => (
                  <Timeline.Item 
                    key={comment.id}
                    dot={<CommentOutlined style={{ color: '#3b82f6' }} />}
                  >
                    <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 6 }}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ color: '#1e293b' }}>
                          {comment.commenter?.name}
                        </Text>
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          {new Date(comment.createdAt).toLocaleString()}
                        </Text>
                      </div>
                      <Paragraph style={{ margin: 0, color: '#334155' }}>
                        {comment.content}
                      </Paragraph>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <CommentOutlined style={{ fontSize: 48, color: '#d1d5db', marginBottom: 16 }} />
                <Text type="secondary">No comments yet</Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}