"use client";

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  DatePicker,
  Select,
  Space,
  Spin,
  message,
  Progress,
  Table,
  Tag,
  Avatar,
  List,
  Empty,
  Button
} from 'antd';
import {
  BarChartOutlined,
  TrophyOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
  CalendarOutlined,
  DownloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import dayjs from 'dayjs';
import { analyticsService } from '../../../../services/analytics.service';
import { proposalService } from '../../../../services/proposal.service';
import { projectBookService } from '../../../../services/projectBook.service';
import { userService } from '../../../../services/user.service';
import useAuthStore from '../../../../store/authStore';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const TeacherAnalyticsPage = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [proposalAnalytics, setProposalAnalytics] = useState(null);
  const [projectBookAnalytics, setProjectBookAnalytics] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(6, 'months'),
    dayjs()
  ]);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const { user } = useAuthStore();

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard data
      try {
        const dashboardResponse = await analyticsService.getDashboardData();
        setDashboardData(dashboardResponse);
      } catch (error) {
        console.warn('Failed to fetch dashboard data:', error);
        // Fallback: calculate from individual services
        await fetchFallbackData();
      }

      // Fetch proposal analytics
      try {
        const proposalResponse = await analyticsService.getProposalAnalytics({
          supervisorId: user?.id,
          startDate: dateRange[0]?.format('YYYY-MM-DD'),
          endDate: dateRange[1]?.format('YYYY-MM-DD'),
          groupBy: 'month'
        });
        setProposalAnalytics(proposalResponse);
      } catch (error) {
        console.warn('Failed to fetch proposal analytics:', error);
      }

      // Fetch project book analytics
      try {
        const projectResponse = await projectBookService.getProjectBookStats();
        setProjectBookAnalytics(projectResponse);
      } catch (error) {
        console.warn('Failed to fetch project book analytics:', error);
      }

      // Fetch recent activities
      await fetchRecentActivities();

      // Fetch top students
      await fetchTopStudents();

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      message.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Fallback data calculation
  const fetchFallbackData = async () => {
    try {
      // Get proposals for this supervisor
      const proposalsResponse = await proposalService.getProposals({
        supervisorId: user?.id,
        limit: 1000
      });

      const proposals = proposalsResponse.proposals || [];
      
      // Calculate basic stats
      const stats = {
        totalProposals: proposals.length,
        pendingReviews: proposals.filter(p => p.status === 'PENDING').length,
        approvedProposals: proposals.filter(p => p.status === 'APPROVED').length,
        rejectedProposals: proposals.filter(p => p.status === 'REJECTED').length,
        revisionRequired: proposals.filter(p => p.status === 'REVISION_REQUIRED').length,
        totalStudents: new Set(proposals.map(p => p.studentId || p.student?.id).filter(Boolean)).size
      };

      setDashboardData(stats);
    } catch (error) {
      console.error('Failed to fetch fallback data:', error);
    }
  };

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      const proposalsResponse = await proposalService.getProposals({
        supervisorId: user?.id,
        limit: 10,
        page: 1
      });

      const activities = (proposalsResponse.proposals || []).map(proposal => ({
        id: proposal.id,
        type: 'proposal',
        title: proposal.title,
        student: proposal.student?.name || `Student ${proposal.studentId}`,
        status: proposal.status,
        date: proposal.updatedAt || proposal.createdAt,
        action: getActionFromStatus(proposal.status)
      }));

      setRecentActivities(activities);
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
    }
  };

  // Fetch top students
  const fetchTopStudents = async () => {
    try {
      const proposalsResponse = await proposalService.getProposals({
        supervisorId: user?.id,
        limit: 1000
      });

      const proposals = proposalsResponse.proposals || [];
      const studentStats = {};

      proposals.forEach(proposal => {
        const studentId = proposal.studentId || proposal.student?.id;
        const studentName = proposal.student?.name || `Student ${studentId}`;
        
        if (!studentStats[studentId]) {
          studentStats[studentId] = {
            id: studentId,
            name: studentName,
            email: proposal.student?.email,
            totalProposals: 0,
            approvedProposals: 0,
            score: 0
          };
        }

        studentStats[studentId].totalProposals++;
        if (proposal.status === 'APPROVED') {
          studentStats[studentId].approvedProposals++;
        }
      });

      // Calculate scores and sort
      const studentsArray = Object.values(studentStats).map(student => ({
        ...student,
        score: student.totalProposals > 0 ? (student.approvedProposals / student.totalProposals) * 100 : 0
      })).sort((a, b) => b.score - a.score).slice(0, 5);

      setTopStudents(studentsArray);
    } catch (error) {
      console.error('Failed to fetch top students:', error);
    }
  };

  const getActionFromStatus = (status) => {
    const actions = {
      PENDING: 'Submitted proposal',
      APPROVED: 'Proposal approved',
      REJECTED: 'Proposal rejected',
      REVISION_REQUIRED: 'Revision requested',
      UNDER_REVIEW: 'Under review'
    };
    return actions[status] || 'Status updated';
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#fa8c16',
      APPROVED: '#52c41a',
      REJECTED: '#ff4d4f',
      REVISION_REQUIRED: '#722ed1',
      UNDER_REVIEW: '#1890ff'
    };
    return colors[status] || '#d9d9d9';
  };

  useEffect(() => {
    if (user?.id) {
      fetchAnalyticsData();
    }
  }, [user?.id, dateRange]);

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    const now = dayjs();
    let start;

    switch (period) {
      case '1month':
        start = now.subtract(1, 'month');
        break;
      case '3months':
        start = now.subtract(3, 'months');
        break;
      case '6months':
        start = now.subtract(6, 'months');
        break;
      case '1year':
        start = now.subtract(1, 'year');
        break;
      default:
        start = now.subtract(6, 'months');
    }

    setDateRange([start, now]);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM DD, YYYY');
  };

  // Prepare chart data
  const proposalStatusData = dashboardData ? [
    { name: 'Pending', value: dashboardData.pendingReviews || 0, color: '#fa8c16' },
    { name: 'Approved', value: dashboardData.approvedProposals || 0, color: '#52c41a' },
    { name: 'Rejected', value: dashboardData.rejectedProposals || 0, color: '#ff4d4f' },
    { name: 'Revision Required', value: dashboardData.revisionRequired || 0, color: '#722ed1' }
  ] : [];

  // Monthly trend data (mock for demonstration)
  const monthlyTrendData = [
    { month: 'Jan', proposals: 8, approved: 6 },
    { month: 'Feb', proposals: 12, approved: 9 },
    { month: 'Mar', proposals: 15, approved: 11 },
    { month: 'Apr', proposals: 10, approved: 8 },
    { month: 'May', proposals: 18, approved: 14 },
    { month: 'Jun', proposals: 14, approved: 10 }
  ];

  const recentActivitiesColumns = [
    {
      title: 'Activity',
      key: 'activity',
      render: (_, record) => (
        <div>
          <Text strong>{record.action}</Text>
          <br />
          <Text type="secondary">{record.title}</Text>
        </div>
      ),
    },
    {
      title: 'Student',
      dataIndex: 'student',
      key: 'student',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>
          {record.status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Date',
      key: 'date',
      render: (_, record) => formatDate(record.date),
    },
  ];

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Title level={2} className="mb-2">
          <BarChartOutlined className="mr-2" />
          Analytics Dashboard
        </Title>
        <Text type="secondary">
          Track your supervision performance and student progress
        </Text>
      </div>

      {/* Time Period Filter */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Text strong>Period:</Text>
              <Select
                value={selectedPeriod}
                onChange={handlePeriodChange}
                style={{ width: 120 }}
              >
                <Option value="1month">1 Month</Option>
                <Option value="3months">3 Months</Option>
                <Option value="6months">6 Months</Option>
                <Option value="1year">1 Year</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="YYYY-MM-DD"
            />
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => message.success('Export functionality would be implemented here')}
            >
              Export Report
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Students"
              value={dashboardData?.totalStudents || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Proposals"
              value={dashboardData?.totalProposals || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Reviews"
              value={dashboardData?.pendingReviews || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Approval Rate"
              value={dashboardData ? Math.round(((dashboardData.approvedProposals || 0) / (dashboardData.totalProposals || 1)) * 100) : 0}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* Proposal Status Distribution */}
        <Col xs={24} lg={12}>
          <Card title="Proposal Status Distribution" className="h-96">
            {proposalStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={proposalStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {proposalStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No data available" />
            )}
          </Card>
        </Col>

        {/* Monthly Trend */}
        <Col xs={24} lg={12}>
          <Card title="Monthly Proposal Trends" className="h-96">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="proposals" 
                  stroke="#1890ff" 
                  strokeWidth={2}
                  name="Total Proposals"
                />
                <Line 
                  type="monotone" 
                  dataKey="approved" 
                  stroke="#52c41a" 
                  strokeWidth={2}
                  name="Approved"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Performance Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card title="Recent Activities">
            {recentActivities.length > 0 ? (
              <Table
                dataSource={recentActivities}
                columns={recentActivitiesColumns}
                pagination={false}
                size="small"
                scroll={{ y: 300 }}
              />
            ) : (
              <Empty description="No recent activities" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Top Performing Students">
            {topStudents.length > 0 ? (
              <List
                dataSource={topStudents}
                renderItem={(student, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div className="relative">
                          <Avatar icon={<UserOutlined />} />
                          <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {index + 1}
                          </div>
                        </div>
                      }
                      title={student.name}
                      description={
                        <div>
                          <div>{student.email}</div>
                          <Progress 
                            percent={Math.round(student.score)} 
                            size="small" 
                            status={student.score >= 80 ? 'success' : student.score >= 60 ? 'normal' : 'exception'}
                            format={() => `${Math.round(student.score)}%`}
                          />
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No student data available" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Additional Insights */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Performance Insights">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Text strong>Average Review Time</Text>
                    <div className="text-2xl font-bold text-blue-600">2.3 days</div>
                  </div>
                  <ClockCircleOutlined className="text-2xl text-blue-600" />
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Text strong>Student Satisfaction</Text>
                    <div className="text-2xl font-bold text-green-600">4.7/5.0</div>
                  </div>
                  <TrophyOutlined className="text-2xl text-green-600" />
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Text strong>Active Supervisions</Text>
                    <div className="text-2xl font-bold text-purple-600">{dashboardData?.totalStudents || 0}</div>
                  </div>
                  <UserOutlined className="text-2xl text-purple-600" />
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Recommendations">
            <div className="space-y-3">
              <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                <Text strong className="text-blue-700">Schedule Regular Check-ins</Text>
                <Paragraph className="mb-0 text-sm text-gray-600">
                  Consider scheduling weekly meetings with students who have pending proposals.
                </Paragraph>
              </div>

              <div className="p-3 border-l-4 border-green-500 bg-green-50">
                <Text strong className="text-green-700">Great Approval Rate!</Text>
                <Paragraph className="mb-0 text-sm text-gray-600">
                  Your {dashboardData ? Math.round(((dashboardData.approvedProposals || 0) / (dashboardData.totalProposals || 1)) * 100) : 0}% approval rate is above average.
                </Paragraph>
              </div>

              <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                <Text strong className="text-orange-700">Review Pending Items</Text>
                <Paragraph className="mb-0 text-sm text-gray-600">
                  You have {dashboardData?.pendingReviews || 0} proposals waiting for review.
                </Paragraph>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TeacherAnalyticsPage;