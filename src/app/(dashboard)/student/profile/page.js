'use client'

import { useState } from 'react'
import { Form, Input, Select, Upload, Button, Card, Avatar, Row, Col, message, Tag } from 'antd'
import { UserOutlined, UploadOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons'
import useAuthStore from '../../../../store/authStore'
import { uploadService } from '../../../../services/upload.service'

const { TextArea } = Input
const { Option } = Select

const departments = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
]

const interests = [
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Web Development',
  'Mobile Development',
  'Cybersecurity',
  'Database Systems',
  'Cloud Computing',
  'IoT',
  'Blockchain',
]

export default function StudentProfile() {
  const [form] = Form.useForm()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, updateProfile } = useAuthStore()

  const initialValues = {
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    studentId: user?.studentId || '',
    batch: user?.batch || '',
    contactNumber: user?.contactNumber || '',
    bio: user?.bio || '',
    researchInterests: user?.researchInterests || [],
    linkedinProfile: user?.linkedinProfile || '',
    previousProjects: user?.previousProjects || '',
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      updateProfile(values)
      message.success('Profile updated successfully!')
      setEditing(false)
    } catch (error) {
      message.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    beforeUpload: async (file) => {
      // Check if it's an image first
      if (!file.type.startsWith('image/')) {
        message.error('Please upload an image file (JPG, PNG)')
        return false
      }

      try {
        setLoading(true)
        const uploadResult = await uploadService.uploadFile(file, true) // true for profile image
        
        // Update user profile with new image URL
        updateProfile({ profileImage: uploadResult.url })
        message.success('Profile photo updated successfully!')
        
      } catch (error) {
        message.error(error.message || 'Upload failed')
      } finally {
        setLoading(false)
      }
      
      return false // Prevent automatic upload
    },
    showUploadList: false,
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        {!editing && (
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card className="text-center">
            <div className="mb-4">
              <Avatar 
                size={120} 
                icon={<UserOutlined />}
                src={user?.profileImage}
              />
            </div>
            <h3 className="text-lg font-medium mb-2">{user?.name}</h3>
            <p className="text-gray-500 mb-2">{user?.department}</p>
            <Tag color="blue">{user?.role}</Tag>
            
            {editing && (
              <div className="mt-4">
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Update Photo</Button>
                </Upload>
                <p className="text-xs text-gray-500 mt-2">
                  Max file size: 2MB. Supported: JPG, PNG
                </p>
              </div>
            )}
          </Card>

          <Card title="Quick Stats" className="mt-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Proposals</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span>Approved</span>
                <span className="font-medium text-green-600">2</span>
              </div>
              <div className="flex justify-between">
                <span>Pending</span>
                <span className="font-medium text-orange-600">1</span>
              </div>
              <div className="flex justify-between">
                <span>Profile Completion</span>
                <span className="font-medium">85%</span>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Personal Information">
            <Form
              form={form}
              layout="vertical"
              initialValues={initialValues}
              onFinish={onFinish}
              disabled={!editing}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please input your full name!' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="studentId"
                    label="Student ID"
                    rules={[{ required: true, message: 'Please input your student ID!' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="contactNumber"
                    label="Contact Number"
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="department"
                    label="Department"
                    rules={[{ required: true, message: 'Please select your department!' }]}
                  >
                    <Select>
                      {departments.map(dept => (
                        <Option key={dept} value={dept}>{dept}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="batch"
                    label="Batch/Admission Year"
                    rules={[{ required: true, message: 'Please input your batch!' }]}
                  >
                    <Input placeholder="e.g., 2020" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="bio"
                label="Bio/About"
              >
                <TextArea rows={3} placeholder="Tell us about yourself..." />
              </Form.Item>

              <Form.Item
                name="researchInterests"
                label="Research Interests"
              >
                <Select
                  mode="multiple"
                  placeholder="Select your research interests"
                  options={interests.map(interest => ({
                    label: interest,
                    value: interest,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="linkedinProfile"
                label="LinkedIn Profile"
              >
                <Input placeholder="https://linkedin.com/in/yourprofile" />
              </Form.Item>

              <Form.Item
                name="previousProjects"
                label="Previous Projects"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Describe any previous projects or relevant experience..." 
                />
              </Form.Item>

              {editing && (
                <Form.Item>
                  <div className="flex gap-3">
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      Save Changes
                    </Button>
                    <Button onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </Form.Item>
              )}
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}