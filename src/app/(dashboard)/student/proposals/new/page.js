'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Steps, Form, Input, Select, Upload, Button, Card, Row, Col, message, Divider } from 'antd'
import { UploadOutlined, SaveOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import useProposalStore from '../../../../../store/proposalStore'
import useAuthStore from '../../../../../store/authStore'
import { uploadService } from '../../../../../services/upload.service'
import { config } from '../../../../../lib/config'

const { TextArea } = Input
const { Option } = Select

const proposalTypes = config.academic.proposalTypes
const departments = config.academic.departments

const mockSupervisors = [
  { id: 1, name: 'Dr. Smith', department: 'Computer Science', expertise: ['AI', 'Machine Learning'] },
  { id: 2, name: 'Dr. Johnson', department: 'Computer Science', expertise: ['Blockchain', 'Security'] },
  { id: 3, name: 'Dr. Wilson', department: 'Computer Science', expertise: ['IoT', 'Systems'] },
  { id: 4, name: 'Dr. Brown', department: 'Electrical Engineering', expertise: ['Signal Processing', 'Electronics'] },
]

const steps = [
  { title: 'Basic Info', description: 'Project details' },
  { title: 'Abstract', description: 'Project description' },
  { title: 'Documentation', description: 'Upload files' },
  { title: 'Supervisor', description: 'Select supervisor' },
  { title: 'Review', description: 'Final review' },
]

export default function NewProposalPage() {
  const [current, setCurrent] = useState(0)
  const [form] = Form.useForm()
  const router = useRouter()
  const { createProposal, loading } = useProposalStore()
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({})

  const next = async () => {
    try {
      const values = await form.validateFields()
      setFormData({ ...formData, ...values })
      setCurrent(current + 1)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const prev = () => {
    setCurrent(current - 1)
  }

  const onFinish = async () => {
    try {
      const finalData = {
        ...formData,
        studentId: user?.id,
        studentName: user?.name,
        department: user?.department,
      }
      
      await createProposal(finalData)
      message.success('Proposal submitted successfully!')
      router.push('/student/proposals')
    } catch (error) {
      message.error('Failed to submit proposal')
    }
  }

  const uploadProps = {
    name: 'file',
    multiple: true,
    beforeUpload: async (file) => {
      try {
        const uploadResult = await uploadService.uploadFile(file)
        
        // Add uploaded file to form data
        const updatedFiles = [...(formData.uploadedFiles || []), {
          uid: file.uid,
          name: file.name,
          status: 'done',
          url: uploadResult.url,
          originalFile: file,
        }]
        
        setFormData({ ...formData, uploadedFiles: updatedFiles })
        message.success(`${file.name} uploaded successfully!`)
        
      } catch (error) {
        message.error(`Upload failed: ${error.message}`)
      }
      
      return false // Prevent auto upload
    },
    onRemove: (file) => {
      const updatedFiles = (formData.uploadedFiles || []).filter(f => f.uid !== file.uid)
      setFormData({ ...formData, uploadedFiles: updatedFiles })
    },
    fileList: formData.uploadedFiles || [],
  }

  const renderStep = () => {
    switch (current) {
      case 0:
        return (
          <div className="space-y-6">
            <Form.Item
              name="title"
              label="Project Title"
              rules={[{ required: true, message: 'Please input project title!' }]}
            >
              <Input 
                placeholder={`Enter your project title (max ${config.validation.proposal.titleMaxLength} characters)`} 
                maxLength={config.validation.proposal.titleMaxLength} 
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="type"
                  label="Project Type"
                  rules={[{ required: true, message: 'Please select project type!' }]}
                >
                  <Select placeholder="Select project type">
                    {proposalTypes.map(type => (
                      <Option key={type} value={type}>{type}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="teamMembers"
                  label="Team Members (Optional)"
                >
                  <Select
                    mode="tags"
                    placeholder="Add team member names"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <Form.Item
              name="abstract"
              label="Abstract"
              rules={[
                { required: true, message: 'Please input abstract!' },
                { min: config.validation.proposal.abstractMinLength, message: `Abstract must be at least ${config.validation.proposal.abstractMinLength} characters!` },
                { max: config.validation.proposal.abstractMaxLength, message: `Abstract must not exceed ${config.validation.proposal.abstractMaxLength} characters!` }
              ]}
            >
              <TextArea
                rows={8}
                placeholder={`Describe your project in detail (${config.validation.proposal.abstractMinLength}-${config.validation.proposal.abstractMaxLength} characters)`}
                showCount
                maxLength={config.validation.proposal.abstractMaxLength}
              />
            </Form.Item>

            <Form.Item
              name="keywords"
              label="Keywords"
              rules={[{ required: true, message: 'Please add keywords!' }]}
            >
              <Select
                mode="tags"
                placeholder="Add keywords (comma-separated)"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="methodology"
              label="Research Methodology"
              rules={[{ required: true, message: 'Please describe your methodology!' }]}
            >
              <TextArea
                rows={4}
                placeholder="Describe your research approach and methods"
              />
            </Form.Item>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <Form.Item
              name="proposalDocument"
              label="Proposal Document (PDF)"
              rules={[{ required: true, message: 'Please upload proposal document!' }]}
            >
              <Upload {...uploadProps} listType="text">
                <Button icon={<UploadOutlined />}>Upload Proposal PDF (Max 10MB)</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="supportingDocs"
              label="Supporting Documents (Optional)"
            >
              <Upload {...uploadProps} listType="text">
                <Button icon={<UploadOutlined />}>Upload Supporting Documents</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="references"
              label="References/Bibliography"
            >
              <TextArea
                rows={6}
                placeholder="List your key references and sources"
              />
            </Form.Item>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <Form.Item
              name="primarySupervisor"
              label="Primary Supervisor"
              rules={[{ required: true, message: 'Please select a supervisor!' }]}
            >
              <Select placeholder="Search and select your primary supervisor">
                {mockSupervisors.map(supervisor => (
                  <Option key={supervisor.id} value={supervisor.id}>
                    <div>
                      <div className="font-medium">{supervisor.name}</div>
                      <div className="text-sm text-gray-500">
                        {supervisor.department} • {supervisor.expertise.join(', ')}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="coSupervisor"
              label="Co-Supervisor (Optional)"
            >
              <Select placeholder="Select co-supervisor if needed">
                {mockSupervisors.map(supervisor => (
                  <Option key={supervisor.id} value={supervisor.id}>
                    <div>
                      <div className="font-medium">{supervisor.name}</div>
                      <div className="text-sm text-gray-500">
                        {supervisor.department} • {supervisor.expertise.join(', ')}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Supervisor Selection Tips:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Choose a supervisor whose expertise aligns with your project</li>
                <li>• Consider the supervisor's current workload</li>
                <li>• You can contact supervisors before selection if needed</li>
              </ul>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Review Your Proposal</h3>
              
              <div className="space-y-4">
                <div>
                  <strong>Title:</strong> {formData.title}
                </div>
                <div>
                  <strong>Type:</strong> {formData.type}
                </div>
                <div>
                  <strong>Abstract:</strong> 
                  <p className="mt-1 text-sm">{formData.abstract?.substring(0, 200)}...</p>
                </div>
                <div>
                  <strong>Keywords:</strong> {formData.keywords?.join(', ')}
                </div>
                <div>
                  <strong>Primary Supervisor:</strong> {
                    mockSupervisors.find(s => s.id === formData.primarySupervisor)?.name
                  }
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Before Submitting:</h4>
              <ul className="text-sm space-y-1">
                <li>✓ All required fields are completed</li>
                <li>✓ Proposal document is uploaded</li>
                <li>✓ Supervisor is selected</li>
                <li>✓ Information is accurate</li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.back()}
          className="mb-4"
        >
          Back to Proposals
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">New Proposal Submission</h1>
        <p className="text-gray-600">Complete all steps to submit your proposal for review</p>
      </div>

      <Card>
        <Steps current={current} items={steps} className="mb-8" />

        <Form
          form={form}
          layout="vertical"
          initialValues={formData}
          onValuesChange={(_, values) => setFormData({ ...formData, ...values })}
        >
          <div className="min-h-[400px]">
            {renderStep()}
          </div>

          <Divider />

          <div className="flex justify-between">
            <div>
              {current > 0 && (
                <Button onClick={prev}>
                  Previous
                </Button>
              )}
            </div>
            <div className="space-x-2">
              {current < steps.length - 1 && (
                <Button type="primary" onClick={next} icon={<ArrowRightOutlined />}>
                  Next
                </Button>
              )}
              {current === steps.length - 1 && (
                <Button 
                  type="primary" 
                  onClick={onFinish} 
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  Submit Proposal
                </Button>
              )}
            </div>
          </div>
        </Form>
      </Card>
    </div>
  )
}