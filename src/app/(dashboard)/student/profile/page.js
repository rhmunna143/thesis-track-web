'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Form, Input, Select, Upload, Button, Card, Avatar, Row, Col, message, Tag, Spin } from 'antd'
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

const StudentProfile = React.memo(() => {
  const [form] = Form.useForm()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const { user, updateProfile, getProfile } = useAuthStore()

  // Set initial profile data immediately if user exists
  useEffect(() => {
    if (user) {
      setProfileData(user)
      console.log('Setting initial profile data:', user)
    }
  }, [user])

  // Optionally fetch detailed profile data in background
  useEffect(() => {
    let isMounted = true;
    
    const fetchDetailedProfile = async () => {
      if (!user) return;
      
      try {
        console.log('Fetching detailed profile for user:', user?.name, user?.id)
        const profile = await getProfile()
        console.log('Detailed profile fetched:', profile)
        if (isMounted && profile) {
          setProfileData(profile)
        }
      } catch (error) {
        console.error('Failed to fetch detailed profile:', error)
        // Keep using the basic user data as fallback - no need to show error
      }
    }

    // Only fetch detailed profile if we have user data
    if (user) {
      fetchDetailedProfile()
    }

    return () => {
      isMounted = false;
    }
  }, [user]) // Remove getProfile from dependencies to prevent loops

  // Update form when profile data changes or when entering edit mode - but only once
  useEffect(() => {
    if (currentUser && editing && !form.isFieldsTouched()) {
      const formValues = {
        name: currentUser.name || '',
        email: currentUser.email || '',
        department: currentUser.department || '',
        studentId: currentUser.studentId || '',
        batch: currentUser.batch || '',
        contactNumber: currentUser.contactNumber || '',
        bio: currentUser.bio || '',
        researchInterests: currentUser.researchInterests || [],
        linkedinProfile: currentUser.linkedinProfile || '',
        previousProjects: currentUser.previousProjects || '',
      }
      console.log('Setting form values for editing:', formValues)
      
      // Use setTimeout to ensure the form is ready
      setTimeout(() => {
        form.setFieldsValue(formValues)
      }, 0)
    }
  }, [editing]) // Only trigger when editing mode changes

  const currentUser = profileData || user

  // Initialize profile loading state properly
  useEffect(() => {
    if (!user) {
      setProfileData(null)
    }
  }, [user])

  // Memoize initial values to prevent form re-initialization
  const initialValues = useMemo(() => ({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    department: currentUser?.department || '',
    studentId: currentUser?.studentId || '',
    batch: currentUser?.batch || '',
    contactNumber: currentUser?.contactNumber || '',
    bio: currentUser?.bio || '',
    researchInterests: currentUser?.researchInterests || [],
    linkedinProfile: currentUser?.linkedinProfile || '',
    previousProjects: currentUser?.previousProjects || '',
  }), [currentUser])

  const onFinish = useCallback(async (values) => {
    setLoading(true)
    try {
      const result = await updateProfile(values)
      if (result.success) {
        setProfileData({ ...currentUser, ...values })
        message.success('Profile updated successfully!')
        setEditing(false)
      } else {
        throw new Error(result.error || 'Update failed')
      }
    } catch (error) {
      message.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }, [updateProfile, currentUser])

  const uploadProps = useMemo(() => ({
    name: 'file',
    multiple: false,
    accept: 'image/*',
    beforeUpload: (file) => {
      // Prevent automatic upload and form validation
      return false;
    },
    onChange: async (info) => {
      const file = info.file;
      if (!file) return;
      
      try {
        console.log('Uploading profile picture:', file.name)
        setLoading(true)
        
        // Check if it's an image first
        if (!file.type?.startsWith('image/')) {
          message.error('Please upload an image file (JPG, PNG)')
          return
        }
        
        const uploadResult = await uploadService.uploadFile(file, true) // true for profile image
        console.log('Upload result:', uploadResult)
        
        // Update both local state and auth store with new image URL
        const imageUrl = uploadResult.url
        const updatedProfile = { ...currentUser, profilePicture: imageUrl }
        
        console.log('Updating profile with new image:', imageUrl)
        const result = await updateProfile({ profilePicture: imageUrl })
        console.log('Profile update result:', result)
        
        if (result.success) {
          setProfileData(updatedProfile)
          message.success('Profile photo updated successfully!')
        } else {
          message.error(result.error || 'Failed to update profile')
        }
        
      } catch (error) {
        console.error('Upload error:', error)
        message.error(error.message || 'Upload failed')
      } finally {
        setLoading(false)
      }
    },
    showUploadList: false,
  }), [currentUser, updateProfile])

  const handleCancel = useCallback(() => {
    setEditing(false)
    // Reset form to original values
    if (currentUser) {
      const formValues = {
        name: currentUser.name || '',
        email: currentUser.email || '',
        department: currentUser.department || '',
        studentId: currentUser.studentId || '',
        batch: currentUser.batch || '',
        contactNumber: currentUser.contactNumber || '',
        bio: currentUser.bio || '',
        researchInterests: currentUser.researchInterests || [],
        linkedinProfile: currentUser.linkedinProfile || '',
        previousProjects: currentUser.previousProjects || '',
      }
      form.setFieldsValue(formValues)
    }
  }, [currentUser, form])

  return (
    <div className="max-w-4xl mx-auto">
      {!currentUser ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg text-gray-600">No user data available</p>
            <p className="text-sm text-gray-500">Please try refreshing the page</p>
          </div>
        </div>
      ) : (
        <>
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
                src={currentUser?.profilePicture || currentUser?.profileImage}
              />
            </div>
            <h3 className="text-lg font-medium mb-2">{currentUser?.name}</h3>
            <p className="text-gray-500 mb-2">{currentUser?.department}</p>
            <Tag color="blue">{currentUser?.role}</Tag>
          </Card>
          
          {editing && (
            <Card className="mt-4" title="Update Profile Photo">
              <div className="text-center">
                <Upload {...uploadProps} loading={loading}>
                  <Button icon={<UploadOutlined />} loading={loading} size="large">
                    Update Photo
                  </Button>
                </Upload>
                <p className="text-xs text-gray-500 mt-2">
                  Max file size: 2MB. Supported: JPG, PNG
                </p>
              </div>
            </Card>
          )}

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
              onFinish={onFinish}
              disabled={!editing}
              preserve={false}
              validateTrigger={['onSubmit']} // Only validate on submit
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
                    <Button onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </Form.Item>
              )}
            </Form>
          </Card>
        </Col>
      </Row>
        </>
      )}
    </div>
  )
})

StudentProfile.displayName = 'StudentProfile'

export default StudentProfile