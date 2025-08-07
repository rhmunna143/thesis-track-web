'use client'

import { Row, Col, Card, Statistic, Table, Tag, Button, Progress } from 'antd'
import { 
  FileTextOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  TeamOutlined,
  EyeOutlined,
  BarChartOutlined 
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'

const mockProposals = [
  {
    key: '1',
    title: 'AI-Based Student Performance Prediction',
    student: 'John Doe',
    department: 'Computer Science',
    submittedAt: '2024-01-15',
    status: 'PENDING',
    daysWaiting: 2,
  },
  {
    key: '2',
    title: 'Blockchain Academic Verification',
    student: 'Jane Smith',
    department: 'Computer Science', 
    submittedAt: '2024-01-12',
    status: 'PENDING',
    daysWaiting: 5,
  },
  {
    key: '3',
    title: 'IoT Smart Campus System',
    student: 'Mike Johnson',
    department: 'Computer Science',
    submittedAt: '2024-01-10',
    status: 'APPROVED',
    daysWaiting: 0,
  },
]

const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING': return 'orange'
    case 'APPROVED': return 'green'
    case 'REJECTED': return 'red'
    case 'REVISION_REQUIRED': return 'blue'
    default: return 'default'
  }
}

export default function TeacherDashboard() {
  const router = useRouter()

  const columns = [
    {
      title: 'Proposal Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Student',
      dataIndex: 'student',
      key: 'student',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Submitted',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
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
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<EyeOutlined />}
          onClick={() => router.push(`/teacher/proposals/${record.key}`)}
        >
          Review
        </Button>
      ),
    },
  ]

  const stats = {
    total: mockProposals.length,
    pending: mockProposals.filter(p => p.status === 'PENDING').length,
    approved: mockProposals.filter(p => p.status === 'APPROVED').length,
    students: 8,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600">Review student proposals and manage your supervised students</p>
      </div>

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
              <Button type="link" size="small" onClick={() => router.push('/teacher/proposals')}>
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
              value={stats.students}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

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
          >
            <Table
              columns={columns}
              dataSource={mockProposals.filter(p => p.status === 'PENDING')}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Performance Metrics">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Average Review Time</span>
                  <span className="font-medium">2.5 days</span>
                </div>
                <Progress percent={75} strokeColor="#52c41a" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>Approval Rate</span>
                  <span className="font-medium">85%</span>
                </div>
                <Progress percent={85} strokeColor="#1890ff" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>Student Satisfaction</span>
                  <span className="font-medium">4.7/5</span>
                </div>
                <Progress percent={94} strokeColor="#faad14" />
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