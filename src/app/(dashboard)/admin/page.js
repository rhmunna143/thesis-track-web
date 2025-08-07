'use client'

import { Row, Col, Card, Statistic, Table, Progress, Button } from 'antd'
import { 
  UserOutlined, 
  FileTextOutlined, 
  TeamOutlined, 
  DatabaseOutlined,
  PlusOutlined,
  SettingOutlined 
} from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { useRouter } from 'next/navigation'

const submissionData = [
  { month: 'Jan', proposals: 65 },
  { month: 'Feb', proposals: 59 },
  { month: 'Mar', proposals: 80 },
  { month: 'Apr', proposals: 81 },
  { month: 'May', proposals: 56 },
  { month: 'Jun', proposals: 55 },
]

const statusData = [
  { name: 'Pending', value: 35, color: '#faad14' },
  { name: 'Approved', value: 45, color: '#52c41a' },
  { name: 'Revision', value: 15, color: '#1890ff' },
  { name: 'Rejected', value: 5, color: '#ff4d4f' },
]

const recentUsers = [
  { key: '1', name: 'John Doe', email: 'john@university.edu', role: 'STUDENT', department: 'CS', status: 'Active' },
  { key: '2', name: 'Jane Smith', email: 'jane@university.edu', role: 'STUDENT', department: 'EE', status: 'Active' },
  { key: '3', name: 'Dr. Wilson', email: 'wilson@university.edu', role: 'TEACHER', department: 'CS', status: 'Active' },
]

export default function AdminDashboard() {
  const router = useRouter()

  const userColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management tools</p>
        </div>
        <div className="space-x-2">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => router.push('/admin/users/new')}
          >
            Add User
          </Button>
          <Button 
            icon={<SettingOutlined />}
            onClick={() => router.push('/admin/settings')}
          >
            Settings
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={1250}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Proposals"
              value={156}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Teachers"
              value={48}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Sessions"
              value={3}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Monthly Submissions">
            <BarChart width={600} height={300} data={submissionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="proposals" fill="#1890ff" />
            </BarChart>
          </Card>
        </Col>
        
        <Col xs={24} lg={10}>
          <Card title="Proposal Status Distribution">
            <PieChart width={400} height={300}>
              <Pie
                data={statusData}
                cx={200}
                cy={150}
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title="Recent Users" 
            extra={
              <Button onClick={() => router.push('/admin/users')}>
                View All
              </Button>
            }
          >
            <Table
              columns={userColumns}
              dataSource={recentUsers}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="System Health">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Server Uptime</span>
                  <span className="font-medium">99.9%</span>
                </div>
                <Progress percent={99.9} strokeColor="#52c41a" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>Database Health</span>
                  <span className="font-medium">Excellent</span>
                </div>
                <Progress percent={95} strokeColor="#52c41a" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>Active Sessions</span>
                  <span className="font-medium">342</span>
                </div>
                <Progress percent={68} strokeColor="#1890ff" />
              </div>
            </div>
          </Card>

          <Card title="Quick Actions" className="mt-4">
            <div className="space-y-2">
              <Button 
                type="text" 
                block 
                className="text-left"
                onClick={() => router.push('/admin/users')}
              >
                👥 Manage Users
              </Button>
              <Button 
                type="text" 
                block 
                className="text-left"
                onClick={() => router.push('/admin/sessions')}
              >
                🗓️ Manage Sessions
              </Button>
              <Button 
                type="text" 
                block 
                className="text-left"
                onClick={() => router.push('/admin/proposals')}
              >
                📋 View All Proposals
              </Button>
              <Button 
                type="text" 
                block 
                className="text-left"
                onClick={() => router.push('/admin/analytics')}
              >
                📊 System Analytics
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}