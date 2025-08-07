'use client'

import { Row, Col, Card, Statistic, Progress, Timeline, Button, List, Tag } from 'antd'
import { 
  FileTextOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  PlusOutlined,
  EyeOutlined 
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const mockProposals = [
  {
    id: 1,
    title: 'AI-Based Student Performance Prediction System',
    status: 'PENDING',
    submittedAt: '2024-01-15',
    supervisor: 'Dr. Smith',
  },
  {
    id: 2,
    title: 'Blockchain-Based Academic Credential Verification',
    status: 'APPROVED',
    submittedAt: '2024-01-10',
    supervisor: 'Dr. Johnson',
  },
  {
    id: 3,
    title: 'IoT-Based Smart Campus Management System',
    status: 'REVISION_REQUIRED',
    submittedAt: '2024-01-08',
    supervisor: 'Dr. Wilson',
  },
]

const recentActivities = [
  {
    time: '2024-01-16',
    title: 'Proposal submitted for review',
    description: 'AI-Based Student Performance Prediction System',
    status: 'pending',
  },
  {
    time: '2024-01-15',
    title: 'Proposal approved',
    description: 'Blockchain-Based Academic Credential Verification',
    status: 'success',
  },
  {
    time: '2024-01-14',
    title: 'Revision requested',
    description: 'IoT-Based Smart Campus Management System',
    status: 'warning',
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

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending': return <ClockCircleOutlined className="text-orange-500" />
    case 'success': return <CheckCircleOutlined className="text-green-500" />
    case 'warning': return <ExclamationCircleOutlined className="text-yellow-500" />
    default: return <ClockCircleOutlined />
  }
}

export default function StudentDashboard() {
  const router = useRouter()
  
  const stats = {
    total: mockProposals.length,
    pending: mockProposals.filter(p => p.status === 'PENDING').length,
    approved: mockProposals.filter(p => p.status === 'APPROVED').length,
    revision: mockProposals.filter(p => p.status === 'REVISION_REQUIRED').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your proposal overview.</p>
        </div>
        <Link href="/student/proposals/new">
          <Button type="primary" icon={<PlusOutlined />} size="large">
            New Proposal
          </Button>
        </Link>
      </div>

      <Row gutter={[16, 16]}>
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
              title="Pending Review"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
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
              title="Need Revision"
              value={stats.revision}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Recent Proposals" className="h-full">
            <List
              itemLayout="horizontal"
              dataSource={mockProposals}
              renderItem={(proposal) => (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => router.push(`/student/proposals/${proposal.id}`)}
                    >
                      View
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div className="flex items-center gap-2">
                        <span>{proposal.title}</span>
                        <Tag color={getStatusColor(proposal.status)}>
                          {proposal.status.replace('_', ' ')}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="text-sm text-gray-500">
                        Supervisor: {proposal.supervisor} • Submitted: {proposal.submittedAt}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            <div className="mt-4 text-center">
              <Link href="/student/proposals">
                <Button type="link">View All Proposals</Button>
              </Link>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Recent Activity" className="h-full">
            <Timeline
              items={recentActivities.map(activity => ({
                dot: getStatusIcon(activity.status),
                children: (
                  <div>
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-gray-500 mb-1">{activity.description}</div>
                    <div className="text-xs text-gray-400">{activity.time}</div>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Progress Overview">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div className="text-center">
              <div className="text-lg font-medium mb-2">Submission Progress</div>
              <Progress
                type="circle"
                percent={75}
                strokeColor="#52c41a"
                format={() => '3/4'}
              />
              <div className="text-sm text-gray-500 mt-2">
                3 out of 4 required proposals submitted
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="text-center">
              <div className="text-lg font-medium mb-2">Approval Rate</div>
              <Progress
                type="circle"
                percent={67}
                strokeColor="#1890ff"
                format={() => '67%'}
              />
              <div className="text-sm text-gray-500 mt-2">
                2 out of 3 proposals approved
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="text-center">
              <div className="text-lg font-medium mb-2">Profile Completion</div>
              <Progress
                type="circle"
                percent={85}
                strokeColor="#faad14"
                format={() => '85%'}
              />
              <div className="text-sm text-gray-500 mt-2">
                Complete your profile for better matching
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}