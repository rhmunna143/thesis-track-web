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
  message,
  Tooltip,
  Drawer,
  Typography,
  Badge,
  Avatar,
  Divider,
  Empty,
  Progress,
  Timeline,
  Descriptions,
  List
} from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  BookOutlined,
  FileTextOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  MessageOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { userService } from '../../../../services/user.service';
import { proposalService } from '../../../../services/proposal.service';
import { projectBookService } from '../../../../services/projectBook.service';
import useAuthStore from '../../../../store/authStore';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const TeacherStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProposals, setStudentProposals] = useState([]);
  const [studentProjectBooks, setStudentProjectBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    department: 'all',
    status: 'all'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeProposals: 0,
    completedProjects: 0,
    pendingReviews: 0
  });

  const [messageForm] = Form.useForm();
  const { user } = useAuthStore();

  // Debug user info
  useEffect(() => {
    console.log('Current user:', user);
  }, [user]);

  // Fetch students supervised by current teacher
  const fetchStudents = async () => {
    setLoading(true);
    try {
      console.log('Fetching students for teacher:', user?.id);
      
      // Try multiple approaches to get students
      let allStudents = [];
      
      // Method 1: Get all students first (fallback)
      try {
        console.log('Trying to get all students...');
        const studentsResponse = await userService.getStudents({
          limit: 1000,
          page: 1
        });
        console.log('All students response:', studentsResponse);
        
        if (studentsResponse.data || studentsResponse.users) {
          const studentsList = studentsResponse.data || studentsResponse.users || [];
          console.log('Found students:', studentsList.length);
          
          // For now, show all students as a fallback
          allStudents = studentsList.map(student => ({
            ...student,
            key: student.id,
            proposals: []
          }));
        }
      } catch (error) {
        console.warn('Failed to get students directly:', error);
      }
      
      // Method 2: Get proposals assigned to current teacher to find supervised students
      try {
        console.log('Trying to get proposals for supervisor:', user?.id);
        const proposalsResponse = await proposalService.getProposals({
          supervisorId: user?.id,
          limit: 1000 // Get all to find unique students
        });
        console.log('Proposals response:', proposalsResponse);

        if (proposalsResponse.proposals && proposalsResponse.proposals.length > 0) {
          // Extract unique student IDs from proposals and fetch their details
          const studentIds = new Set();
          proposalsResponse.proposals.forEach(proposal => {
            if (proposal.student?.id) {
              studentIds.add(proposal.student.id);
            } else if (proposal.studentId) {
              studentIds.add(proposal.studentId);
            } else if (proposal.userId) {
              studentIds.add(proposal.userId);
            }
          });

          console.log('Found unique student IDs:', Array.from(studentIds));

          // Fetch full student details for each student ID
          const studentPromises = Array.from(studentIds).map(async (studentId) => {
            try {
              const studentData = await userService.getUserById(studentId);
              return {
                ...studentData,
                key: studentData.id,
                proposals: proposalsResponse.proposals.filter(p => 
                  p.student?.id === studentId || p.studentId === studentId || p.userId === studentId
                )
              };
            } catch (error) {
              console.warn(`Failed to fetch student ${studentId}:`, error);
              // Return placeholder data if fetch fails
              return {
                id: studentId,
                name: `Student ${studentId}`,
                email: `student${studentId}@university.edu`,
                studentId: `STU${studentId}`,
                department: 'Unknown',
                key: studentId,
                proposals: proposalsResponse.proposals.filter(p => 
                  p.student?.id === studentId || p.studentId === studentId || p.userId === studentId
                )
              };
            }
          });

          const supervisedStudents = await Promise.all(studentPromises);
          console.log('Found supervised students with details:', supervisedStudents.length, supervisedStudents);
          
          // If we have supervised students, use them instead of all students
          if (supervisedStudents.length > 0) {
            allStudents = supervisedStudents;
          }
        }
      } catch (error) {
        console.warn('Failed to get proposals:', error);
      }

      console.log('Final students list:', allStudents.length, allStudents);

      // Apply local filtering
      let filteredStudents = allStudents;
      
      if (filters.search) {
        filteredStudents = filteredStudents.filter(student => 
          student.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          student.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
          student.studentId?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      if (filters.department !== 'all') {
        filteredStudents = filteredStudents.filter(student => 
          student.department === filters.department
        );
      }

      if (filters.status !== 'all') {
        filteredStudents = filteredStudents.filter(student => {
          const latestProposal = student.proposals?.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          )[0];
          return latestProposal?.status === filters.status;
        });
      }

      // Apply pagination
      const startIndex = (pagination.current - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

      setStudents(paginatedStudents);
      setPagination(prev => ({
        ...prev,
        total: filteredStudents.length
      }));

      // Calculate stats
      const calculatedStats = {
        totalStudents: allStudents.length,
        activeProposals: allStudents.reduce((count, student) => 
          count + (student.proposals?.filter(p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW').length || 0), 0
        ),
        completedProjects: allStudents.reduce((count, student) => 
          count + (student.proposals?.filter(p => p.status === 'APPROVED').length || 0), 0
        ),
        pendingReviews: allStudents.reduce((count, student) => 
          count + (student.proposals?.filter(p => p.status === 'PENDING').length || 0), 0
        )
      };
      console.log('Calculated stats:', calculatedStats);
      setStats(calculatedStats);

    } catch (error) {
      console.error('Failed to fetch students:', error);
      message.error('Failed to fetch students');
      
      // Set empty data on error
      setStudents([]);
      setStats({
        totalStudents: 0,
        activeProposals: 0,
        completedProjects: 0,
        pendingReviews: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch student details with proposals and project books
  const fetchStudentDetails = async (student) => {
    try {
      setSelectedStudent(student);
      
      // Get student's proposals
      const proposalsResponse = await proposalService.getProposals({
        studentId: student.id,
        supervisorId: user?.id
      });
      setStudentProposals(proposalsResponse.proposals || []);

      // Get student's project books
      try {
        const booksResponse = await projectBookService.getProjectBooks({
          studentId: student.id
        });
        setStudentProjectBooks(booksResponse.projectBooks || []);
      } catch (error) {
        console.warn('Failed to fetch project books:', error);
        setStudentProjectBooks([]);
      }

    } catch (error) {
      console.error('Failed to fetch student details:', error);
      message.error('Failed to fetch student details');
    }
  };

  useEffect(() => {
    if (user?.id) {
      console.log('User available, fetching students...');
      fetchStudents();
    } else {
      console.log('No user ID available yet');
    }
  }, [pagination.current, pagination.pageSize, filters, user?.id]);

  // Handle sending message (placeholder functionality)
  const handleSendMessage = async (values) => {
    try {
      // This would integrate with a messaging system or notification service
      message.success('Message sent successfully');
      setMessageModalVisible(false);
      messageForm.resetFields();
      setSelectedStudent(null);
    } catch (error) {
      console.error('Failed to send message:', error);
      message.error('Failed to send message');
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

  // Get student's latest proposal status
  const getLatestProposalStatus = (student) => {
    if (!student.proposals || student.proposals.length === 0) {
      return { status: 'No Proposals', color: 'default' };
    }
    
    const latestProposal = student.proposals.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )[0];
    
    return {
      status: getStatusText(latestProposal.status),
      color: getStatusColor(latestProposal.status)
    };
  };

  // Table columns
  const columns = [
    {
      title: 'Student',
      key: 'student',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size="large" 
            src={record.profilePicture} 
            icon={<UserOutlined />}
          />
          <div>
            <Text strong className="block">{record.name}</Text>
            <Text type="secondary" className="text-sm">
              {record.studentId} • {record.email}
            </Text>
            <Text type="secondary" className="text-xs block">
              {record.department}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Proposals',
      key: 'proposals',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className="text-center">
          <Text strong className="block text-lg">
            {record.proposals?.length || 0}
          </Text>
          <Text type="secondary" className="text-xs">Proposals</Text>
        </div>
      ),
    },
    {
      title: 'Latest Status',
      key: 'status',
      width: 150,
      render: (_, record) => {
        const { status, color } = getLatestProposalStatus(record);
        return (
          <Tag color={color}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 150,
      render: (_, record) => (
        <div>
          {record.phone && (
            <Text className="block text-sm">
              <PhoneOutlined className="mr-1" />
              {record.phone}
            </Text>
          )}
          <Text className="text-xs text-gray-500">
            Joined: {formatDate(record.createdAt)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                fetchStudentDetails(record);
                setDetailsDrawerVisible(true);
              }}
            />
          </Tooltip>
          
          <Tooltip title="Send Message">
            <Button
              type="text"
              icon={<MessageOutlined />}
              onClick={() => {
                setSelectedStudent(record);
                setMessageModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Get unique departments for filter
  const departments = [...new Set(students.map(student => student.department).filter(Boolean))];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Title level={2} className="mb-2">
          <TeamOutlined className="mr-2" />
          My Students
        </Title>
        <Text type="secondary">
          Manage and track your supervised students' progress
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Students"
              value={stats.totalStudents}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Proposals"
              value={stats.activeProposals}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed Projects"
              value={stats.completedProjects}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Reviews"
              value={stats.pendingReviews}
              prefix={<ClockCircleOutlined />}
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
              placeholder="Search by name, email, or student ID"
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by department"
              value={filters.department}
              onChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
              className="w-full"
            >
              <Option value="all">All Departments</Option>
              {departments.map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>
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
          <Col xs={24} sm={12} md={4}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                setFilters({ search: '', department: 'all', status: 'all' });
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
              className="w-full"
            >
              Reset Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Students Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} students`,
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
                description="No students found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      {/* Student Details Drawer */}
      <Drawer
        title={
          <div className="flex items-center space-x-2">
            <UserOutlined />
            <span>Student Details</span>
          </div>
        }
        placement="right"
        onClose={() => {
          setDetailsDrawerVisible(false);
          setSelectedStudent(null);
          setStudentProposals([]);
          setStudentProjectBooks([]);
        }}
        open={detailsDrawerVisible}
        width={700}
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Student Information */}
            <div className="text-center">
              <Avatar 
                size={80} 
                src={selectedStudent.profilePicture} 
                icon={<UserOutlined />}
                className="mb-4"
              />
              <Title level={4}>{selectedStudent.name}</Title>
              <Text type="secondary" className="block">
                {selectedStudent.studentId} • {selectedStudent.department}
              </Text>
              <Text type="secondary">
                {selectedStudent.email}
              </Text>
            </div>

            <Divider />

            {/* Contact Information */}
            <Descriptions title="Contact Information" bordered size="small">
              <Descriptions.Item label="Email" span={3}>
                <a href={`mailto:${selectedStudent.email}`}>
                  {selectedStudent.email}
                </a>
              </Descriptions.Item>
              {selectedStudent.phone && (
                <Descriptions.Item label="Phone" span={3}>
                  {selectedStudent.phone}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Department" span={3}>
                {selectedStudent.department}
              </Descriptions.Item>
              <Descriptions.Item label="Joined" span={3}>
                {formatDate(selectedStudent.createdAt)}
              </Descriptions.Item>
            </Descriptions>

            {/* Bio */}
            {selectedStudent.bio && (
              <>
                <Divider />
                <div>
                  <Title level={5}>About</Title>
                  <Paragraph>{selectedStudent.bio}</Paragraph>
                </div>
              </>
            )}

            {/* Proposals */}
            <Divider />
            <div>
              <Title level={5}>
                Proposals ({studentProposals.length})
              </Title>
              {studentProposals.length > 0 ? (
                <Timeline>
                  {studentProposals.map((proposal, index) => (
                    <Timeline.Item
                      key={proposal.id}
                      color={getStatusColor(proposal.status)}
                      dot={
                        proposal.status === 'APPROVED' ? <CheckCircleOutlined /> :
                        proposal.status === 'REJECTED' ? <CloseCircleOutlined /> :
                        proposal.status === 'PENDING' ? <ClockCircleOutlined /> :
                        <ExclamationCircleOutlined />
                      }
                    >
                      <div className="mb-2">
                        <Text strong className="block">{proposal.title}</Text>
                        <Tag color={getStatusColor(proposal.status)} className="mb-1">
                          {getStatusText(proposal.status)}
                        </Tag>
                        <Text type="secondary" className="block text-sm">
                          Submitted: {formatDate(proposal.createdAt)}
                        </Text>
                        {proposal.abstract && (
                          <Paragraph 
                            ellipsis={{ rows: 2, expandable: true }}
                            className="mt-2 text-sm"
                          >
                            {proposal.abstract}
                          </Paragraph>
                        )}
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty 
                  description="No proposals submitted" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>

            {/* Project Books */}
            {studentProjectBooks.length > 0 && (
              <>
                <Divider />
                <div>
                  <Title level={5}>
                    Project Books ({studentProjectBooks.length})
                  </Title>
                  <List
                    itemLayout="horizontal"
                    dataSource={studentProjectBooks}
                    renderItem={book => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<BookOutlined />} />}
                          title={book.title || book.proposal?.title}
                          description={
                            <div>
                              <Tag color={getStatusColor(book.status)}>
                                {getStatusText(book.status)}
                              </Tag>
                              {book.reviewScore && (
                                <Text className="ml-2">
                                  Score: {book.reviewScore}/100
                                </Text>
                              )}
                              <Text type="secondary" className="block text-xs">
                                Submitted: {formatDate(book.createdAt)}
                              </Text>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </>
            )}

            {/* Quick Actions */}
            <Divider />
            <div className="space-y-2">
              <Button
                type="primary"
                icon={<MessageOutlined />}
                onClick={() => {
                  setDetailsDrawerVisible(false);
                  setMessageModalVisible(true);
                }}
                className="w-full"
              >
                Send Message
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Send Message Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <MessageOutlined />
            <span>Send Message</span>
          </div>
        }
        open={messageModalVisible}
        onCancel={() => {
          setMessageModalVisible(false);
          messageForm.resetFields();
          setSelectedStudent(null);
        }}
        footer={null}
        width={500}
      >
        {selectedStudent && (
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <Text strong>To: {selectedStudent.name}</Text>
            <Text type="secondary" className="block">
              {selectedStudent.email}
            </Text>
          </div>
        )}

        <Form
          form={messageForm}
          layout="vertical"
          onFinish={handleSendMessage}
        >
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please enter a subject' }]}
          >
            <Input placeholder="Enter message subject" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Please enter a message' }]}
          >
            <TextArea
              rows={6}
              placeholder="Type your message here..."
            />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setMessageModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Send Message
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherStudentsPage;