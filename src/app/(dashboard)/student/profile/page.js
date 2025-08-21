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
  const [uploadLoading, setUploadLoading] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const { user, updateProfile, getProfile } = useAuthStore()

  console.log('Current user data:', user)
  console.log('Profile data:', profileData)

  // Use profile data if available, otherwise fall back to user data
  const currentUser = profileData || user

  // Fetch detailed profile data when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id && !profileData) {
        try {
          console.log('Fetching detailed profile...')
          const profile = await getProfile()
          console.log('Fetched profile:', profile)
          setProfileData(profile)
        } catch (error) {
          console.error('Failed to fetch profile:', error)
          // Use basic user data as fallback
          setProfileData(user)
        }
      }
    }
    
    fetchProfile()
  }, [user?.id, getProfile]) // Only run when user ID changes

  // Update form when entering edit mode only
  useEffect(() => {
    if (currentUser && editing) {
      // Handle both camelCase and snake_case field names from database
      let researchInterestsArray = []
      
      // Process research interests/expertise
      if (currentUser.expertise) {
        if (typeof currentUser.expertise === 'string') {
          if (currentUser.expertise.startsWith('{') && currentUser.expertise.endsWith('}')) {
            // PostgreSQL array format
            researchInterestsArray = currentUser.expertise.slice(1, -1).split(',').map(item => item.trim())
          } else {
            // Regular comma-separated string
            researchInterestsArray = currentUser.expertise.split(', ').map(item => item.trim())
          }
        } else if (Array.isArray(currentUser.expertise)) {
          researchInterestsArray = currentUser.expertise
        }
      } else if (currentUser.research_interests) {
        if (typeof currentUser.research_interests === 'string') {
          if (currentUser.research_interests.startsWith('{') && currentUser.research_interests.endsWith('}')) {
            // PostgreSQL array format
            researchInterestsArray = currentUser.research_interests.slice(1, -1).split(',').map(item => item.trim())
          } else {
            // Regular comma-separated string
            researchInterestsArray = currentUser.research_interests.split(', ').map(item => item.trim())
          }
        } else if (Array.isArray(currentUser.research_interests)) {
          researchInterestsArray = currentUser.research_interests
        }
      } else if (currentUser.researchInterests && Array.isArray(currentUser.researchInterests)) {
        researchInterestsArray = currentUser.researchInterests
      }
      
      const formValues = {
        name: currentUser.name || '',
        email: currentUser.email || '',
        department: currentUser.department || '',
        studentId: currentUser.student_id || currentUser.studentId || '',
        batch: currentUser.batch || '',
        contactNumber: currentUser.contact_number || currentUser.contactNumber || '',
        bio: currentUser.bio || '',
        researchInterests: researchInterestsArray,
        linkedinProfile: currentUser.linkedin_profile || currentUser.linkedinProfile || '',
        previousProjects: currentUser.previous_projects || currentUser.previousProjects || '',
      }
      
      console.log('Setting form values for editing:', formValues)
      console.log('Current user full data:', currentUser)
      
      // Use setTimeout to ensure form is ready
      setTimeout(() => {
        form.setFieldsValue(formValues)
      }, 0)
    }
  }, [editing, currentUser, form])

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
    console.log('=== FORM SUBMIT ===')
    console.log('Form values:', values)
    
    setLoading(true)
    try {
      // Convert form values to match backend expectations
      const updateData = {
        name: values.name,
        department: values.department,
        bio: values.bio,
        // Format research interests as PostgreSQL array
        expertise: Array.isArray(values.researchInterests) 
          ? `{${values.researchInterests.join(',')}}` 
          : (values.researchInterests ? `{${values.researchInterests}}` : null),
        profilePicture: currentUser?.profilePicture || currentUser?.profile_picture, // Keep existing profile picture
        // Additional fields that might be expected by frontend but not necessarily by backend
        studentId: values.studentId,
        batch: values.batch,
        contactNumber: values.contactNumber,
        linkedinProfile: values.linkedinProfile,
        previousProjects: values.previousProjects
      }
      
      console.log('Sending update data:', updateData)
      const result = await updateProfile(updateData)
      console.log('Form update result:', result)
      
      if (result?.id || result?.success) {
        // Update local profile data - merge database response with current data
        const updatedProfile = { ...currentUser, ...result }
        setProfileData(updatedProfile)
        message.success('Profile updated successfully!')
        setEditing(false)
      } else {
        throw new Error(result?.message || result?.error || 'Update failed')
      }
    } catch (error) {
      console.error('Form submit error:', error)
      message.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }, [updateProfile, currentUser])

  const handleUpload = useCallback(async (file) => {
    console.log('=== UPLOAD STARTED ===')
    console.log('File:', file.name, file.type, file.size)
    console.log('Current user:', currentUser)
    
    try {
      setUploadLoading(true)
      
      // Validate file
      if (!file.type?.startsWith('image/')) {
        message.error('Please upload an image file')
        return
      }
      
      if (file.size > 2 * 1024 * 1024) {
        message.error('File size must be less than 2MB')
        return
      }
      
      // Upload to ImgBB
      console.log('Uploading to ImgBB...')
      const uploadResult = await uploadService.uploadToImgbb(file)
      console.log('ImgBB result:', uploadResult)
      
      if (!uploadResult?.url) {
        throw new Error('No URL from ImgBB')
      }
      
      // Update profile with current user data + new profile picture
      console.log('Updating profile with current data + new picture...')
      const updateData = {
        name: currentUser?.name || '', // Include current name to satisfy backend validation
        department: currentUser?.department || null,
        bio: currentUser?.bio || null,
        // Format expertise as PostgreSQL array if it exists
        expertise: currentUser?.expertise 
          ? (currentUser.expertise.includes('{') ? currentUser.expertise : `{${currentUser.expertise}}`)
          : null,
        profilePicture: uploadResult.url
      }
      
      const updateResult = await updateProfile(updateData)
      console.log('Database update result:', updateResult)
      
      if (updateResult?.success || updateResult?.id) {
        message.success('Profile photo updated!')
        // Force page refresh to show new image
        window.location.reload()
      } else {
        console.error('Database update failed:', updateResult)
        throw new Error(updateResult?.message || updateResult?.error || 'Database update failed')
      }
      
    } catch (error) {
      console.error('=== UPLOAD ERROR ===')
      console.error('Error details:', error)
      message.error(`Upload failed: ${error.message || error}`)
    } finally {
      setUploadLoading(false)
      console.log('=== UPLOAD FINISHED ===')
    }
  }, [updateProfile, currentUser])

  const uploadProps = useMemo(() => ({
    name: 'file',
    multiple: false,
    accept: 'image/*',
    beforeUpload: (file) => {
      handleUpload(file)
      return false // Prevent default upload
    },
    showUploadList: false,
  }), [handleUpload])

  const handleCancel = useCallback(() => {
    setEditing(false)
    // Reset form to original values when canceling
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
  }, [currentUser?.id, form])

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

            <h3 className="text-lg font-medium mb-2">{currentUser?.name || 'No name available'}</h3>

            <p className="text-gray-500 mb-2">{currentUser?.department || 'No department set'}</p>
            
            <Tag color="blue">{currentUser?.role || 'Student'}</Tag>
            
            {/* Bio section */}
            {(currentUser?.bio) && (
              <div className="mt-3 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">{currentUser.bio}</p>
              </div>
            )}
            
          </Card>
          
          {editing && (
            <Card className="mt-4" title="Update Profile Photo">
              <div className="text-center">
                <Upload {...uploadProps}>
                  <Button 
                    icon={<UploadOutlined />} 
                    loading={uploadLoading} 
                    size="large"
                    disabled={uploadLoading}
                  >
                    {uploadLoading ? 'Uploading...' : 'Update Photo'}
                  </Button>
                </Upload>
                <p className="text-xs text-gray-500 mt-2">
                  Max file size: 2MB. Supported: JPG, PNG, GIF
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
            {editing ? (
              // Edit mode - show form
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                preserve={false}
                validateTrigger={['onSubmit']}
                initialValues={{
                  name: currentUser?.name || '',
                  email: currentUser?.email || '',
                  department: currentUser?.department || '',
                  studentId: currentUser?.student_id || currentUser?.studentId || '',
                  batch: currentUser?.batch || '',
                  contactNumber: currentUser?.contact_number || currentUser?.contactNumber || '',
                  bio: currentUser?.bio || '',
                  researchInterests: (() => {
                    const expertiseData = currentUser?.expertise || currentUser?.research_interests
                    if (expertiseData && typeof expertiseData === 'string') {
                      if (expertiseData.startsWith('{') && expertiseData.endsWith('}')) {
                        return expertiseData.slice(1, -1).split(',').map(item => item.trim())
                      } else {
                        return expertiseData.split(', ').map(item => item.trim())
                      }
                    }
                    return []
                  })(),
                  linkedinProfile: currentUser?.linkedin_profile || currentUser?.linkedinProfile || '',
                  previousProjects: currentUser?.previous_projects || currentUser?.previousProjects || '',
                }}
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
                    <Button 
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            ) : (
              // View mode - show data in a readable format
              <div className="space-y-6">
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-base text-gray-900 mt-1">{currentUser?.name || 'Not provided'}</p>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-base text-gray-900 mt-1">{currentUser?.email || 'Not provided'}</p>
                    </div>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Student ID</label>
                      <p className="text-base text-gray-900 mt-1">{currentUser?.student_id || currentUser?.studentId || 'Not provided'}</p>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contact Number</label>
                      <p className="text-base text-gray-900 mt-1">{currentUser?.contact_number || currentUser?.contactNumber || 'Not provided'}</p>
                    </div>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Department</label>
                      <p className="text-base text-gray-900 mt-1">{currentUser?.department || 'Not provided'}</p>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Batch/Admission Year</label>
                      <p className="text-base text-gray-900 mt-1">{currentUser?.batch || 'Not provided'}</p>
                    </div>
                  </Col>
                </Row>

                <div>
                  <label className="text-sm font-medium text-gray-500">Bio/About</label>
                  <p className="text-base text-gray-900 mt-1">{currentUser?.bio || 'Not provided'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Research Interests/Expertise</label>
                  <div className="mt-1">
                    {(currentUser?.expertise || currentUser?.research_interests) ? (
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          let interests = []
                          
                          // Handle PostgreSQL array format {item1,item2} or comma-separated string
                          const expertiseData = currentUser.expertise || currentUser.research_interests
                          
                          if (typeof expertiseData === 'string') {
                            // Check if it's PostgreSQL array format
                            if (expertiseData.startsWith('{') && expertiseData.endsWith('}')) {
                              // Remove curly braces and split by comma
                              interests = expertiseData.slice(1, -1).split(',').map(item => item.trim())
                            } else {
                              // Regular comma-separated string
                              interests = expertiseData.split(', ').map(item => item.trim())
                            }
                          } else if (Array.isArray(expertiseData)) {
                            interests = expertiseData
                          }
                          
                          return interests.filter(interest => interest).map((interest, index) => (
                            <Tag key={index} color="blue">{interest}</Tag>
                          ))
                        })()}
                      </div>
                    ) : (
                      <p className="text-base text-gray-900">Not provided</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">LinkedIn Profile</label>
                  <p className="text-base text-gray-900 mt-1">
                    {(currentUser?.linkedin_profile || currentUser?.linkedinProfile) ? (
                      <a 
                        href={currentUser.linkedin_profile || currentUser.linkedinProfile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {currentUser.linkedin_profile || currentUser.linkedinProfile}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Previous Projects</label>
                  <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">{currentUser?.previous_projects || currentUser?.previousProjects || 'Not provided'}</p>
                </div>
              </div>
            )}
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