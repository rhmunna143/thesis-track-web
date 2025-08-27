"use client";

import React, { useState, useEffect } from 'react';
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
  Upload,
  Spin,
  Empty,
  Avatar,
  Divider,
  Progress
} from 'antd';
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
  CommentOutlined
} from '@ant-design/icons';
import { projectBookService } from '../../../../services/projectBook.service';
import useAuthStore from '../../../../store/authStore';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const TeacherProjectBooksPage = () => {
  const [projectBooks, setProjectBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjectBook, setSelectedProjectBook] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    underReview: 0
  });

  const [reviewForm] = Form.useForm();
  const { user } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Handle status change in review form
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    
    // Update form validation based on status
    if (status === 'APPROVED') {
      reviewForm.setFields([
        {
          name: 'reviewScore',
          rules: [
            { required: true, message: 'Score is required for approved projects' },
            { type: 'number', min: 60, max: 100, message: 'Approved projects must have a score of 60 or above' }
          ]
        }
      ]);
    } else if (status === 'REJECTED') {
      reviewForm.setFields([
        {
          name: 'reviewScore',
          rules: [
            { required: false },
            { type: 'number', min: 0, max: 59, message: 'Rejected projects typically have scores below 60' }
          ]
        }
      ]);
    } else {
      // For UNDER_REVIEW, REVISION_REQUIRED, etc.
      reviewForm.setFields([
        {
          name: 'reviewScore',
          rules: [
            { required: false },
            { type: 'number', min: 0, max: 100, message: 'Score must be between 0 and 100' }
          ]
        }
      ]);
    }
  };

  // Transform backend data to frontend format
  const transformProjectBookData = (backendData) => {
    return {
      id: backendData.id,
      title: backendData.proposal_title,
      status: backendData.status,
      createdAt: backendData.submitted_at || backendData.created_at,
      updatedAt: backendData.updated_at,
      reviewScore: backendData.review_score,
      reviewComments: backendData.review_comments,
      documentUrl: backendData.document_url,
      presentationUrl: backendData.presentation_url,
      sourceCodeUrl: backendData.source_code_url,
      reviewedAt: backendData.reviewed_at,
      student: {
        id: backendData.proposal_id, // Using proposal_id as student identifier
        name: backendData.student_name,
        studentId: backendData.student_email?.split('@')[0] || 'N/A', // Extract from email
        department: 'Computer Science', // Default since not provided
        email: backendData.student_email
      },
      proposal: {
        id: backendData.proposal_id,
        title: backendData.proposal_title,
        abstract: backendData.abstract
      },
      supervisor: {
        name: backendData.supervisor_name
      },
      reviewer: {
        name: backendData.reviewer_name
      }
    };
  };

  // Fetch project books
  const fetchProjectBooks = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        // Add teacher's ID for filtering if they are a teacher
        ...(user?.role === 'TEACHER' && { supervisorId: user.id })
      };

      console.log('Fetching project books with params:', params);
      const response = await projectBookService.getProjectBooks(params);
      console.log('Project books response:', response);
      
      if (response && response.projectBooks) {
        // Transform data to match frontend expectations
        const transformedData = response.projectBooks.map(book => transformProjectBookData(book));
        setProjectBooks(transformedData);
        setPagination(prev => ({
          ...prev,
          total: response.total || response.projectBooks.length
        }));
      } else if (response && Array.isArray(response)) {
        // Handle case where response is directly an array - transform each item
        const transformedData = response.map(book => transformProjectBookData(book));
        setProjectBooks(transformedData);
        setPagination(prev => ({
          ...prev,
          total: response.length
        }));
      } else {
        // If no data structure matches, set empty array
        console.warn('Unexpected response structure:', response);
        setProjectBooks([]);
        setPagination(prev => ({
          ...prev,
          total: 0
        }));
      }
    } catch (error) {
      console.error('Failed to fetch project books:', error);
      message.error(`Failed to fetch project books: ${error.message || 'Unknown error'}`);
      
      // Set empty state on error
      setProjectBooks([]);
      setPagination(prev => ({
        ...prev,
        total: 0
      }));
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await projectBookService.getProjectBookStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Calculate stats from current project books data
      if (projectBooks.length > 0) {
        const calculatedStats = {
          total: projectBooks.length,
          pending: projectBooks.filter(book => book.status === 'PENDING').length,
          approved: projectBooks.filter(book => book.status === 'APPROVED').length,
          rejected: projectBooks.filter(book => book.status === 'REJECTED').length,
          underReview: projectBooks.filter(book => book.status === 'UNDER_REVIEW').length
        };
        setStats(calculatedStats);
      }
    }
  };

  useEffect(() => {
    fetchProjectBooks();
  }, [pagination.current, pagination.pageSize, filters]);

  useEffect(() => {
    if (projectBooks.length > 0) {
      fetchStats();
    }
  }, [projectBooks]);

  // Handle review submission
  const handleReview = async (values) => {
    try {
      console.log('Submitting review with values:', values);
      
      // Prepare the review data
      const reviewData = {
        status: values.status,
        reviewScore: values.reviewScore,
        reviewComments: values.reviewComments
      };
      
      // For REVISION_REQUIRED status, ensure we have all required fields
      if (values.status === 'REVISION_REQUIRED') {
        if (!values.reviewComments || values.reviewComments.trim() === '') {
          message.error('Review comments are required for revision requests');
          return;
        }
        // Set a default score for revision required if not provided
        if (!values.reviewScore || values.reviewScore === 0) {
          reviewData.reviewScore = 50; // Default score for revision required
        }
      }
      
      console.log('Final review data:', reviewData);
      
      const response = await projectBookService.reviewProjectBook(selectedProjectBook.id, reviewData);
      console.log('Review response:', response);
      
      message.success('Review submitted successfully');
      setReviewModalVisible(false);
      reviewForm.resetFields();
      setSelectedProjectBook(null);
      setSelectedStatus(null);
      fetchProjectBooks();
    } catch (error) {
      console.error('Review submission failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit review';
      message.error(`Failed to submit review: ${errorMessage}`);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (projectBookId, newStatus) => {
    try {
      await projectBookService.updateStatus(projectBookId, newStatus);
      message.success(`Status updated to ${newStatus}`);
      fetchProjectBooks();
    } catch (error) {
      console.error('Status update failed:', error);
      message.error('Failed to update status');
    }
  };

  // Download document
  const handleDownload = async (projectBook, type = 'document') => {
    try {
      let downloadUrl;
      let fileName;
      
      if (type === 'document') {
        downloadUrl = projectBook.documentUrl;
        fileName = `${projectBook.title}_document.pdf`;
      } else if (type === 'presentation') {
        downloadUrl = projectBook.presentationUrl;
        fileName = `${projectBook.title}_presentation.pdf`;
      }
      
      if (!downloadUrl) {
        message.warning(`${type === 'document' ? 'Document' : 'Presentation'} not available`);
        return;
      }
      
      // Create a direct link to download the file
      const link = document.createElement('a');
      link.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${downloadUrl}`;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success(`${type === 'document' ? 'Document' : 'Presentation'} download started`);
    } catch (error) {
      console.error('Download failed:', error);
      message.error('Failed to download file');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'orange',
      UNDER_REVIEW: 'blue',
      APPROVED: 'green',
      REJECTED: 'red',
      REVISION_REQUIRED: 'purple'
    };
    return colors[status] || 'default';
  };

  // Get status text
  const getStatusText = (status) => {
    const statusMap = {
      PENDING: 'Pending Review',
      UNDER_REVIEW: 'Under Review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      REVISION_REQUIRED: 'Revision Required'
    };
    return statusMap[status] || status;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Table columns
  const columns = [
    {
      title: 'Project Title',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (text, record) => (
        <div>
          <Text strong className="block">{text}</Text>
          <Text type="secondary" className="text-sm">
            {record.student?.name} ({record.student?.studentId})
          </Text>
        </div>
      ),
    },
    {
      title: 'Student',
      dataIndex: ['student', 'name'],
      key: 'student',
      width: 200,
      render: (text, record) => (
        <div className="flex items-center space-x-2">
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <Text className="block">{text}</Text>
            <Text type="secondary" className="text-xs">
              {record.student?.department}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Submitted Date',
      dataIndex: 'createdAt',
      key: 'submittedDate',
      width: 120,
      render: (date) => (
        <div className="flex items-center space-x-1">
          <CalendarOutlined className="text-gray-400" />
          <Text className="text-sm">{formatDate(date)}</Text>
        </div>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'reviewScore',
      key: 'score',
      width: 100,
      align: 'center',
      render: (score) => (
        score ? (
          <div className="flex flex-col items-center">
            <Text strong className="text-lg">{score}</Text>
            <Rate disabled value={score / 20} className="text-xs" />
          </div>
        ) : (
          <Text type="secondary">Not scored</Text>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedProjectBook(record);
                setDetailsDrawerVisible(true);
              }}
            />
          </Tooltip>
          
          <Tooltip title="Review">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedProjectBook(record);
                setSelectedStatus(record.status);
                setReviewModalVisible(true);
                reviewForm.setFieldsValue({
                  status: record.status,
                  reviewScore: record.reviewScore || undefined,
                  reviewComments: record.reviewComments || ''
                });
              }}
            />
          </Tooltip>

          <Tooltip title="Download Document">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record, 'document')}
            />
          </Tooltip>

          {record.presentationUrl && (
            <Tooltip title="Download Presentation">
              <Button
                type="text"
                icon={<FileTextOutlined />}
                onClick={() => handleDownload(record, 'presentation')}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Title level={2} className="mb-2">
          <BookOutlined className="mr-2" />
          Project Books Review
        </Title>
        <Text type="secondary">
          Review and evaluate student project books
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Project Books"
              value={stats.total}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Review"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Approved"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Under Review"
              value={stats.underReview}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by title or student name"
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by status"
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              className="w-full"
            >
              <Option value="all">All Status</Option>
              <Option value="PENDING">Pending Review</Option>
              <Option value="UNDER_REVIEW">Under Review</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
              <Option value="REVISION_REQUIRED">Revision Required</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={10}>
            <div className="flex justify-end space-x-2">
              <Button
                icon={<FilterOutlined />}
                onClick={() => {
                  setFilters({ status: 'all', search: '' });
                  setPagination(prev => ({ ...prev, current: 1 }));
                }}
              >
                Reset Filters
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Project Books Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={projectBooks}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} project books`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize
              }));
            },
          }}
          locale={{
            emptyText: (
              <Empty
                description="No project books found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      {/* Review Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <EditOutlined />
            <span>Review Project Book</span>
          </div>
        }
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          reviewForm.resetFields();
          setSelectedProjectBook(null);
          setSelectedStatus(null);
        }}
        footer={null}
        width={600}
      >
        {selectedProjectBook && (
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <Title level={5}>{selectedProjectBook.title}</Title>
            <Text type="secondary">
              Student: {selectedProjectBook.student?.name} ({selectedProjectBook.student?.studentId})
            </Text>
          </div>
        )}

        <Form
          form={reviewForm}
          layout="vertical"
          onFinish={handleReview}
        >
          <Form.Item
            name="status"
            label="Review Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select 
              placeholder="Select review status"
              onChange={handleStatusChange}
            >
              <Option value="UNDER_REVIEW">Under Review</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
              <Option value="REVISION_REQUIRED">Revision Required</Option>
            </Select>
          </Form.Item>

          {selectedStatus && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <Text type="secondary">
                {selectedStatus === 'APPROVED' && 'For approved projects, a score of 60 or above is required.'}
                {selectedStatus === 'REJECTED' && 'For rejected projects, please provide detailed feedback in comments.'}
                {selectedStatus === 'REVISION_REQUIRED' && 'For revision requests, detailed comments explaining required changes are mandatory.'}
                {selectedStatus === 'UNDER_REVIEW' && 'Project is currently being reviewed. Score and comments are optional.'}
              </Text>
            </div>
          )}

          <Form.Item
            name="reviewScore"
            label="Score (0-100)"
            rules={[
              { 
                required: false, // Make it optional initially
                message: 'Please provide a score' 
              },
              { 
                type: 'number', 
                min: 0, 
                max: 100, 
                message: 'Score must be between 0 and 100' 
              }
            ]}
          >
            <InputNumber
              min={0}
              max={100}
              placeholder="Enter score (optional for some statuses)"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="reviewComments"
            label="Review Comments"
            rules={[
              { 
                required: true, 
                message: 'Please provide review comments' 
              },
              {
                min: 10,
                message: 'Review comments must be at least 10 characters long'
              }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Provide detailed feedback on the project book..."
            />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setReviewModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Submit Review
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Details Drawer */}
      <Drawer
        title={
          <div className="flex items-center space-x-2">
            <BookOutlined />
            <span>Project Book Details</span>
          </div>
        }
        placement="right"
        onClose={() => {
          setDetailsDrawerVisible(false);
          setSelectedProjectBook(null);
        }}
        open={detailsDrawerVisible}
        width={600}
      >
        {selectedProjectBook && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <Title level={4}>{selectedProjectBook.title}</Title>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text type="secondary">Status:</Text>
                  <Tag color={getStatusColor(selectedProjectBook.status)}>
                    {getStatusText(selectedProjectBook.status)}
                  </Tag>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Submitted:</Text>
                  <Text>{formatDate(selectedProjectBook.createdAt)}</Text>
                </div>
                {selectedProjectBook.reviewScore && (
                  <div className="flex justify-between">
                    <Text type="secondary">Score:</Text>
                    <div className="flex items-center space-x-2">
                      <Text strong>{selectedProjectBook.reviewScore}/100</Text>
                      <Rate disabled value={selectedProjectBook.reviewScore / 20} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Divider />

            {/* Student Information */}
            <div>
              <Title level={5}>Student Information</Title>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text type="secondary">Name:</Text>
                  <Text>{selectedProjectBook.student?.name}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Student ID:</Text>
                  <Text>{selectedProjectBook.student?.studentId}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Department:</Text>
                  <Text>{selectedProjectBook.student?.department}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Email:</Text>
                  <Text>{selectedProjectBook.student?.email}</Text>
                </div>
              </div>
            </div>

            <Divider />

            {/* Project Information */}
            <div>
              <Title level={5}>Project Information</Title>
              <div className="space-y-3">
                {selectedProjectBook.proposal && (
                  <div>
                    <Text type="secondary" className="block mb-1">Related Proposal:</Text>
                    <Text>{selectedProjectBook.proposal.title}</Text>
                  </div>
                )}
                
                {selectedProjectBook.sourceCodeUrl && (
                  <div>
                    <Text type="secondary" className="block mb-1">Source Code:</Text>
                    <Button
                      type="link"
                      icon={<LinkOutlined />}
                      href={selectedProjectBook.sourceCodeUrl}
                      target="_blank"
                      className="p-0"
                    >
                      View Repository
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Divider />

            {/* Documents */}
            <div>
              <Title level={5}>Documents</Title>
              <div className="space-y-2">
                <Button
                  type="default"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(selectedProjectBook, 'document')}
                  className="w-full"
                >
                  Download Project Book
                </Button>
                
                {selectedProjectBook.presentationUrl && (
                  <Button
                    type="default"
                    icon={<FileTextOutlined />}
                    onClick={() => handleDownload(selectedProjectBook, 'presentation')}
                    className="w-full"
                  >
                    Download Presentation
                  </Button>
                )}
              </div>
            </div>

            {/* Review Comments */}
            {selectedProjectBook.reviewComments && (
              <>
                <Divider />
                <div>
                  <Title level={5}>Review Comments</Title>
                  <div className="p-3 bg-gray-50 rounded">
                    <Paragraph>{selectedProjectBook.reviewComments}</Paragraph>
                  </div>
                </div>
              </>
            )}

            {/* Quick Actions */}
            <Divider />
            <div className="space-y-2">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setDetailsDrawerVisible(false);
                  setSelectedStatus(selectedProjectBook.status);
                  setReviewModalVisible(true);
                  reviewForm.setFieldsValue({
                    status: selectedProjectBook.status,
                    reviewScore: selectedProjectBook.reviewScore || undefined,
                    reviewComments: selectedProjectBook.reviewComments || ''
                  });
                }}
                className="w-full"
              >
                Review Project Book
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TeacherProjectBooksPage;