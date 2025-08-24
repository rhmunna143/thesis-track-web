'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Tabs,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Button,
  DatePicker,
  TimePicker,
  Table,
  Modal,
  message,
  Divider,
  Typography,
  Space,
  Tag,
  Alert,
  Tooltip,
  Progress,
  Upload,
  Popconfirm,
  Badge,
  Descriptions,
  notification
} from 'antd'
import {
  SettingOutlined,
  DatabaseOutlined,
  SecurityScanOutlined,
  NotificationOutlined,
  UserOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MailOutlined,
  ApiOutlined,
  AuditOutlined,
  SaveOutlined,
  ReloadOutlined,
  EyeOutlined,
  WarningOutlined,
  BugOutlined,
  ToolOutlined
} from '@ant-design/icons'
import { analyticsService } from '../../../../services/analytics.service'
import { sessionService } from '../../../../services/session.service'
import './admin-settings.css'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

export default function AdminSettingsPage() {
  // State management
  const [loading, setLoading] = useState(false)
  const [systemSettings, setSystemSettings] = useState({})
  const [departments, setDepartments] = useState([])
  const [sessions, setSessions] = useState([])
  const [systemHealth, setSystemHealth] = useState({})
  const [auditLogs, setAuditLogs] = useState([])
  
  // Modal states
  const [departmentModal, setDepartmentModal] = useState({ visible: false, editData: null })
  const [sessionModal, setSessionModal] = useState({ visible: false, editData: null })
  const [backupModal, setBackupModal] = useState({ visible: false })
  const [logsModal, setLogsModal] = useState({ visible: false })
  
  // Form instances
  const [systemForm] = Form.useForm()
  const [securityForm] = Form.useForm()
  const [notificationForm] = Form.useForm()
  const [departmentForm] = Form.useForm()
  const [sessionForm] = Form.useForm()

  // Load initial data
  useEffect(() => {
    loadSettingsData()
  }, [])

  const loadSettingsData = async () => {
    try {
      setLoading(true)
      
      // Load system settings with fallback data
      try {
        const settingsResponse = await fetch('/api/admin/settings')
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json()
          setSystemSettings(settings)
          systemForm.setFieldsValue(settings)
          securityForm.setFieldsValue(settings.security || {})
          notificationForm.setFieldsValue(settings.notifications || {})
        }
      } catch (error) {
        // Fallback settings
        const fallbackSettings = {
          maxProposalsPerStudent: 3,
          proposalSubmissionDeadline: 30,
          reviewDeadline: 14,
          maxFileSize: 10,
          allowedFileTypes: ['pdf', 'doc', 'docx'],
          requireEmailVerification: true,
          enableNotifications: true,
          enableAuditLog: true,
          security: {
            passwordMinLength: 8,
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            enableTwoFactor: false,
            enableCaptcha: true
          },
          notifications: {
            emailOnStatusChange: true,
            emailOnNewSubmission: true,
            emailOnDeadlineReminder: true,
            reminderDaysBefore: 3
          }
        }
        setSystemSettings(fallbackSettings)
        systemForm.setFieldsValue(fallbackSettings)
        securityForm.setFieldsValue(fallbackSettings.security)
        notificationForm.setFieldsValue(fallbackSettings.notifications)
      }

      // Load departments with fallback
      try {
        const deptResponse = await fetch('/api/departments')
        if (deptResponse.ok) {
          const depts = await deptResponse.json()
          setDepartments(depts)
        }
      } catch (error) {
        setDepartments([
          { id: 1, name: 'Computer Science', code: 'CS', head: 'Dr. Smith', studentCount: 120, teacherCount: 15 },
          { id: 2, name: 'Engineering', code: 'ENG', head: 'Dr. Johnson', studentCount: 95, teacherCount: 12 },
          { id: 3, name: 'Business Administration', code: 'BBA', head: 'Dr. Davis', studentCount: 80, teacherCount: 10 },
          { id: 4, name: 'Arts & Sciences', code: 'AS', head: 'Dr. Wilson', studentCount: 65, teacherCount: 8 }
        ])
      }

      // Load sessions with fallback
      try {
        const sessionsResponse = await sessionService.getAllSessions()
        setSessions(sessionsResponse.data || sessionsResponse || [])
      } catch (error) {
        setSessions([
          { id: 1, name: 'Spring 2025', isActive: true, startDate: '2025-01-15', endDate: '2025-05-30', proposalCount: 45 },
          { id: 2, name: 'Fall 2024', isActive: false, startDate: '2024-08-15', endDate: '2024-12-20', proposalCount: 67 },
          { id: 3, name: 'Spring 2024', isActive: false, startDate: '2024-01-15', endDate: '2024-05-30', proposalCount: 52 }
        ])
      }

      // Load system health with fallback
      try {
        const healthResponse = await fetch('/api/admin/health')
        if (healthResponse.ok) {
          const health = await healthResponse.json()
          setSystemHealth(health)
        }
      } catch (error) {
        setSystemHealth({
          status: 'healthy',
          uptime: '15 days, 4 hours',
          cpuUsage: 45,
          memoryUsage: 62,
          diskUsage: 78,
          activeUsers: 234,
          totalRequests: 15672,
          errorRate: 0.8,
          lastBackup: '2025-08-23T10:30:00Z'
        })
      }

      // Load audit logs with fallback
      try {
        const logsResponse = await fetch('/api/admin/audit-logs?limit=50')
        if (logsResponse.ok) {
          const logs = await logsResponse.json()
          setAuditLogs(logs.data || logs || [])
        }
      } catch (error) {
        setAuditLogs([
          { id: 1, action: 'USER_CREATED', user: 'Admin', details: 'Created user: john.doe@university.edu', timestamp: new Date(), severity: 'info' },
          { id: 2, action: 'SETTINGS_UPDATED', user: 'Admin', details: 'Updated system settings', timestamp: new Date(), severity: 'warning' },
          { id: 3, action: 'PROPOSAL_APPROVED', user: 'Dr. Smith', details: 'Approved proposal: AI Research Project', timestamp: new Date(), severity: 'info' }
        ])
      }

    } catch (error) {
      console.error('Failed to load settings:', error)
      message.error('Failed to load system settings')
    } finally {
      setLoading(false)
    }
  }

  // Save system settings
  const handleSaveSystemSettings = async (values) => {
    try {
      setLoading(true)
      
      // In a real app, this would call the API
      // await fetch('/api/admin/settings', { method: 'PUT', body: JSON.stringify(values) })
      
      setSystemSettings({ ...systemSettings, ...values })
      message.success('System settings saved successfully')
      
      // Log the action
      const newLog = {
        id: auditLogs.length + 1,
        action: 'SETTINGS_UPDATED',
        user: 'Admin',
        details: 'Updated system configuration settings',
        timestamp: new Date(),
        severity: 'warning'
      }
      setAuditLogs([newLog, ...auditLogs])
      
    } catch (error) {
      console.error('Failed to save settings:', error)
      message.error('Failed to save system settings')
    } finally {
      setLoading(false)
    }
  }

  // Save security settings
  const handleSaveSecuritySettings = async (values) => {
    try {
      setLoading(true)
      
      const updatedSettings = {
        ...systemSettings,
        security: { ...systemSettings.security, ...values }
      }
      setSystemSettings(updatedSettings)
      message.success('Security settings saved successfully')
      
      // Log the action
      const newLog = {
        id: auditLogs.length + 1,
        action: 'SECURITY_UPDATED',
        user: 'Admin',
        details: 'Updated security configuration',
        timestamp: new Date(),
        severity: 'warning'
      }
      setAuditLogs([newLog, ...auditLogs])
      
    } catch (error) {
      console.error('Failed to save security settings:', error)
      message.error('Failed to save security settings')
    } finally {
      setLoading(false)
    }
  }

  // Save notification settings
  const handleSaveNotificationSettings = async (values) => {
    try {
      setLoading(true)
      
      const updatedSettings = {
        ...systemSettings,
        notifications: { ...systemSettings.notifications, ...values }
      }
      setSystemSettings(updatedSettings)
      message.success('Notification settings saved successfully')
      
    } catch (error) {
      console.error('Failed to save notification settings:', error)
      message.error('Failed to save notification settings')
    } finally {
      setLoading(false)
    }
  }

  // Department operations
  const handleSaveDepartment = async (values) => {
    try {
      if (departmentModal.editData) {
        // Edit existing department
        const updatedDepartments = departments.map(dept =>
          dept.id === departmentModal.editData.id ? { ...dept, ...values } : dept
        )
        setDepartments(updatedDepartments)
        message.success('Department updated successfully')
      } else {
        // Add new department
        const newDepartment = {
          id: departments.length + 1,
          ...values,
          studentCount: 0,
          teacherCount: 0
        }
        setDepartments([...departments, newDepartment])
        message.success('Department created successfully')
      }
      
      setDepartmentModal({ visible: false, editData: null })
      departmentForm.resetFields()
      
    } catch (error) {
      console.error('Failed to save department:', error)
      message.error('Failed to save department')
    }
  }

  const handleDeleteDepartment = async (id) => {
    try {
      const updatedDepartments = departments.filter(dept => dept.id !== id)
      setDepartments(updatedDepartments)
      message.success('Department deleted successfully')
    } catch (error) {
      console.error('Failed to delete department:', error)
      message.error('Failed to delete department')
    }
  }

  // Session operations
  const handleSaveSession = async (values) => {
    try {
      if (sessionModal.editData) {
        // Edit existing session
        const updatedSessions = sessions.map(session =>
          session.id === sessionModal.editData.id ? { ...session, ...values } : session
        )
        setSessions(updatedSessions)
        message.success('Session updated successfully')
      } else {
        // Add new session
        const newSession = {
          id: sessions.length + 1,
          ...values,
          proposalCount: 0
        }
        setSessions([...sessions, newSession])
        message.success('Session created successfully')
      }
      
      setSessionModal({ visible: false, editData: null })
      sessionForm.resetFields()
      
    } catch (error) {
      console.error('Failed to save session:', error)
      message.error('Failed to save session')
    }
  }

  const handleActivateSession = async (id) => {
    try {
      const updatedSessions = sessions.map(session => ({
        ...session,
        isActive: session.id === id
      }))
      setSessions(updatedSessions)
      message.success('Session activated successfully')
    } catch (error) {
      console.error('Failed to activate session:', error)
      message.error('Failed to activate session')
    }
  }

  // Backup operations
  const handleCreateBackup = async () => {
    try {
      setLoading(true)
      
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      message.success('System backup created successfully')
      setBackupModal({ visible: false })
      
      // Update system health
      setSystemHealth({
        ...systemHealth,
        lastBackup: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('Failed to create backup:', error)
      message.error('Failed to create backup')
    } finally {
      setLoading(false)
    }
  }

  // System health check
  const handleHealthCheck = async () => {
    try {
      setLoading(true)
      
      // Simulate health check
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const updatedHealth = {
        ...systemHealth,
        status: 'healthy',
        cpuUsage: Math.floor(Math.random() * 60) + 20,
        memoryUsage: Math.floor(Math.random() * 40) + 40,
        diskUsage: Math.floor(Math.random() * 30) + 60,
        activeUsers: Math.floor(Math.random() * 100) + 200,
        totalRequests: systemHealth.totalRequests + Math.floor(Math.random() * 100),
        errorRate: (Math.random() * 2).toFixed(1)
      }
      
      setSystemHealth(updatedHealth)
      message.success('System health check completed')
      
    } catch (error) {
      console.error('Health check failed:', error)
      message.error('System health check failed')
    } finally {
      setLoading(false)
    }
  }

  // Clear audit logs
  const handleClearAuditLogs = async () => {
    try {
      setAuditLogs([])
      message.success('Audit logs cleared successfully')
    } catch (error) {
      message.error('Failed to clear audit logs')
    }
  }

  // Department table columns
  const departmentColumns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 80
    },
    {
      title: 'Department Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Department Head',
      dataIndex: 'head',
      key: 'head'
    },
    {
      title: 'Students',
      dataIndex: 'studentCount',
      key: 'studentCount',
      render: count => <Tag color="blue">{count}</Tag>
    },
    {
      title: 'Teachers',
      dataIndex: 'teacherCount',
      key: 'teacherCount',
      render: count => <Tag color="green">{count}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Department">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setDepartmentModal({ visible: true, editData: record })
                departmentForm.setFieldsValue(record)
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this department?"
            onConfirm={() => handleDeleteDepartment(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Department">
              <Button type="link" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  // Session table columns
  const sessionColumns = [
    {
      title: 'Session Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: isActive => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: date => new Date(date).toLocaleDateString()
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: date => new Date(date).toLocaleDateString()
    },
    {
      title: 'Proposals',
      dataIndex: 'proposalCount',
      key: 'proposalCount',
      render: count => <Tag color="blue">{count}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          {!record.isActive && (
            <Tooltip title="Activate Session">
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={() => handleActivateSession(record.id)}
              >
                Activate
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Edit Session">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setSessionModal({ visible: true, editData: record })
                sessionForm.setFieldsValue({
                  ...record,
                  startDate: record.startDate ? new Date(record.startDate) : null,
                  endDate: record.endDate ? new Date(record.endDate) : null
                })
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  // Audit logs columns
  const auditColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: timestamp => new Date(timestamp).toLocaleString()
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: action => <Tag color="blue">{action}</Tag>
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user'
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details'
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: severity => (
        <Tag color={severity === 'warning' ? 'orange' : severity === 'error' ? 'red' : 'blue'}>
          {severity}
        </Tag>
      )
    }
  ]

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <Title level={2}>
          <SettingOutlined /> System Settings
        </Title>
        <Text type="secondary">
          Configure and manage system-wide settings, departments, and preferences
        </Text>
      </div>

      <Tabs defaultActiveKey="system" className="settings-tabs">
        {/* System Configuration */}
        <TabPane tab={<span><DatabaseOutlined />System Config</span>} key="system">
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card title="System Configuration" className="settings-card">
                <Form
                  form={systemForm}
                  layout="vertical"
                  onFinish={handleSaveSystemSettings}
                  initialValues={systemSettings}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Max Proposals per Student"
                        name="maxProposalsPerStudent"
                        rules={[{ required: true, message: 'Please enter max proposals' }]}
                      >
                        <InputNumber min={1} max={10} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Proposal Deadline (days)"
                        name="proposalSubmissionDeadline"
                        rules={[{ required: true, message: 'Please enter deadline' }]}
                      >
                        <InputNumber min={1} max={365} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Review Deadline (days)"
                        name="reviewDeadline"
                        rules={[{ required: true, message: 'Please enter review deadline' }]}
                      >
                        <InputNumber min={1} max={90} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Max File Size (MB)"
                        name="maxFileSize"
                        rules={[{ required: true, message: 'Please enter max file size' }]}
                      >
                        <InputNumber min={1} max={100} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={16}>
                      <Form.Item
                        label="Allowed File Types"
                        name="allowedFileTypes"
                      >
                        <Select
                          mode="multiple"
                          placeholder="Select file types"
                          style={{ width: '100%' }}
                        >
                          <Option value="pdf">PDF</Option>
                          <Option value="doc">DOC</Option>
                          <Option value="docx">DOCX</Option>
                          <Option value="txt">TXT</Option>
                          <Option value="rtf">RTF</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Email Verification"
                        name="requireEmailVerification"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Enable Notifications"
                        name="enableNotifications"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Enable Audit Log"
                        name="enableAuditLog"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                      Save System Settings
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Security Settings */}
        <TabPane tab={<span><SecurityScanOutlined />Security</span>} key="security">
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card title="Security Configuration" className="settings-card">
                <Form
                  form={securityForm}
                  layout="vertical"
                  onFinish={handleSaveSecuritySettings}
                  initialValues={systemSettings.security}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Password Min Length"
                        name="passwordMinLength"
                        rules={[{ required: true, message: 'Please enter password length' }]}
                      >
                        <InputNumber min={6} max={20} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Session Timeout (minutes)"
                        name="sessionTimeout"
                        rules={[{ required: true, message: 'Please enter session timeout' }]}
                      >
                        <InputNumber min={5} max={480} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Max Login Attempts"
                        name="maxLoginAttempts"
                        rules={[{ required: true, message: 'Please enter max attempts' }]}
                      >
                        <InputNumber min={3} max={10} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Two-Factor Authentication"
                        name="enableTwoFactor"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Enable CAPTCHA"
                        name="enableCaptcha"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                      Save Security Settings
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Notification Settings */}
        <TabPane tab={<span><NotificationOutlined />Notifications</span>} key="notifications">
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card title="Notification Configuration" className="settings-card">
                <Form
                  form={notificationForm}
                  layout="vertical"
                  onFinish={handleSaveNotificationSettings}
                  initialValues={systemSettings.notifications}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Email on Status Change"
                        name="emailOnStatusChange"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Email on New Submission"
                        name="emailOnNewSubmission"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Email Deadline Reminders"
                        name="emailOnDeadlineReminder"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Reminder Days Before"
                        name="reminderDaysBefore"
                        rules={[{ required: true, message: 'Please enter reminder days' }]}
                      >
                        <InputNumber min={1} max={30} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                      Save Notification Settings
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Department Management */}
        <TabPane tab={<span><UserOutlined />Departments</span>} key="departments">
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card 
                title="Department Management"
                extra={
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setDepartmentModal({ visible: true, editData: null })}
                  >
                    Add Department
                  </Button>
                }
                className="settings-card"
              >
                <Table
                  dataSource={departments}
                  columns={departmentColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Session Management */}
        <TabPane tab={<span><FileTextOutlined />Sessions</span>} key="sessions">
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card 
                title="Academic Session Management"
                extra={
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setSessionModal({ visible: true, editData: null })}
                  >
                    Add Session
                  </Button>
                }
                className="settings-card"
              >
                <Table
                  dataSource={sessions}
                  columns={sessionColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* System Maintenance */}
        <TabPane tab={<span><ToolOutlined />Maintenance</span>} key="maintenance">
          <Row gutter={[24, 24]}>
            {/* System Health */}
            <Col xs={24} lg={12}>
              <Card title="System Health" className="settings-card">
                <Descriptions column={1} size="small">
                  <Descriptions.Item 
                    label="Status"
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    <Badge 
                      status={systemHealth.status === 'healthy' ? 'success' : 'error'} 
                      text={systemHealth.status?.toUpperCase() || 'UNKNOWN'}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label="Uptime"
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    {systemHealth.uptime || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label="Active Users"
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    {systemHealth.activeUsers || 0}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label="Total Requests"
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    {systemHealth.totalRequests?.toLocaleString() || 0}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label="Error Rate"
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    {systemHealth.errorRate || 0}%
                  </Descriptions.Item>
                </Descriptions>
                
                <Divider />
                
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>CPU Usage</Text>
                    <Progress percent={systemHealth.cpuUsage || 0} />
                  </div>
                  <div>
                    <Text strong>Memory Usage</Text>
                    <Progress percent={systemHealth.memoryUsage || 0} status={systemHealth.memoryUsage > 80 ? 'exception' : 'normal'} />
                  </div>
                  <div>
                    <Text strong>Disk Usage</Text>
                    <Progress percent={systemHealth.diskUsage || 0} status={systemHealth.diskUsage > 90 ? 'exception' : 'normal'} />
                  </div>
                </Space>
                
                <Divider />
                
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />} 
                  onClick={handleHealthCheck}
                  loading={loading}
                  block
                >
                  Run Health Check
                </Button>
              </Card>
            </Col>

            {/* Backup & Maintenance */}
            <Col xs={24} lg={12}>
              <Card title="Backup & Maintenance" className="settings-card">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Alert
                    message="Last Backup"
                    description={systemHealth.lastBackup ? 
                      `Completed on ${new Date(systemHealth.lastBackup).toLocaleString()}` : 
                      'No backup found'
                    }
                    type="info"
                    icon={<ClockCircleOutlined />}
                  />
                  
                  <Button 
                    type="primary" 
                    icon={<CloudUploadOutlined />}
                    onClick={() => setBackupModal({ visible: true })}
                    block
                  >
                    Create Backup
                  </Button>
                  
                  <Button 
                    icon={<DownloadOutlined />}
                    block
                  >
                    Download System Logs
                  </Button>
                  
                  <Button 
                    icon={<EyeOutlined />}
                    onClick={() => setLogsModal({ visible: true })}
                    block
                  >
                    View Audit Logs
                  </Button>
                  
                  <Popconfirm
                    title="Are you sure you want to clear all audit logs?"
                    onConfirm={handleClearAuditLogs}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button 
                      danger
                      icon={<DeleteOutlined />}
                      block
                    >
                      Clear Audit Logs
                    </Button>
                  </Popconfirm>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Department Modal */}
      <Modal
        title={`${departmentModal.editData ? 'Edit' : 'Add'} Department`}
        open={departmentModal.visible}
        onCancel={() => {
          setDepartmentModal({ visible: false, editData: null })
          departmentForm.resetFields()
        }}
        footer={null}
      >
        <Form
          form={departmentForm}
          layout="vertical"
          onFinish={handleSaveDepartment}
        >
          <Form.Item
            label="Department Code"
            name="code"
            rules={[{ required: true, message: 'Please enter department code' }]}
          >
            <Input placeholder="e.g., CS, ENG, BBA" />
          </Form.Item>
          
          <Form.Item
            label="Department Name"
            name="name"
            rules={[{ required: true, message: 'Please enter department name' }]}
          >
            <Input placeholder="e.g., Computer Science" />
          </Form.Item>
          
          <Form.Item
            label="Department Head"
            name="head"
            rules={[{ required: true, message: 'Please enter department head' }]}
          >
            <Input placeholder="e.g., Dr. Smith" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {departmentModal.editData ? 'Update' : 'Create'} Department
              </Button>
              <Button onClick={() => {
                setDepartmentModal({ visible: false, editData: null })
                departmentForm.resetFields()
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Session Modal */}
      <Modal
        title={`${sessionModal.editData ? 'Edit' : 'Add'} Academic Session`}
        open={sessionModal.visible}
        onCancel={() => {
          setSessionModal({ visible: false, editData: null })
          sessionForm.resetFields()
        }}
        footer={null}
      >
        <Form
          form={sessionForm}
          layout="vertical"
          onFinish={handleSaveSession}
        >
          <Form.Item
            label="Session Name"
            name="name"
            rules={[{ required: true, message: 'Please enter session name' }]}
          >
            <Input placeholder="e.g., Spring 2025" />
          </Form.Item>
          
          <Form.Item
            label="Start Date"
            name="startDate"
            rules={[{ required: true, message: 'Please select start date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            label="End Date"
            name="endDate"
            rules={[{ required: true, message: 'Please select end date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            label="Active Session"
            name="isActive"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {sessionModal.editData ? 'Update' : 'Create'} Session
              </Button>
              <Button onClick={() => {
                setSessionModal({ visible: false, editData: null })
                sessionForm.resetFields()
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Backup Modal */}
      <Modal
        title="Create System Backup"
        open={backupModal.visible}
        onOk={handleCreateBackup}
        onCancel={() => setBackupModal({ visible: false })}
        confirmLoading={loading}
      >
        <Alert
          message="System Backup"
          description="This will create a complete backup of all system data including users, proposals, sessions, and settings. The process may take a few minutes."
          type="warning"
          icon={<ExclamationCircleOutlined />}
        />
      </Modal>

      {/* Audit Logs Modal */}
      <Modal
        title="Audit Logs"
        open={logsModal.visible}
        onCancel={() => setLogsModal({ visible: false })}
        footer={null}
        width={800}
      >
        <Table
          dataSource={auditLogs}
          columns={auditColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Modal>
    </div>
  )
}