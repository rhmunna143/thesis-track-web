'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Form, Input, Button, Alert, Checkbox, Select, Divider } from 'antd'
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import useAuthStore from '../../../store/authStore'
import { authService } from '../../../services/auth.service'
import { config } from '../../../lib/config'

const { Option } = Select

const departments = config.academic.departments

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const onFinish = async (values) => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await authService.signup({
        name: values.name,
        email: values.email,
        password: values.password,
        department: values.department,
        role: 'STUDENT', // Default role
      })
      
      setSuccess('Account created successfully! Please check your email for verification.')
      
      // Auto login after successful signup
      setTimeout(() => {
        login(response.user, response.token)
        router.push('/student')
      }, 2000)
      
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-600">Join ThesisTrack to manage your proposals</p>
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          className="mb-4"
          showIcon
          closable
          onClose={() => setError('')}
        />
      )}

      {success && (
        <Alert
          message={success}
          type="success"
          className="mb-4"
          showIcon
        />
      )}

      <Form
        name="signup"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: 'Please input your full name!' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Enter your full name"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="University Email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
            {
              pattern: /.*\.edu$/,
              message: 'Please use your university email (.edu domain)',
            },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Enter your university email"
          />
        </Form.Item>

        <Form.Item
          name="department"
          label="Department"
          rules={[{ required: true, message: 'Please select your department!' }]}
        >
          <Select placeholder="Select your department">
            {departments.map((dept) => (
              <Option key={dept} value={dept}>
                {dept}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 6, message: 'Password must be at least 6 characters!' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Create a password"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Passwords do not match!'))
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm your password"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(new Error('Please accept the terms!')),
            },
          ]}
        >
          <Checkbox>
            I agree to the <Link href="/terms" className="text-primary">Terms of Service</Link> and{' '}
            <Link href="/privacy" className="text-primary">Privacy Policy</Link>
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            className="w-full" 
            loading={loading}
          >
            Create Account
          </Button>
        </Form.Item>
      </Form>

      <Divider>Already have an account?</Divider>

      <div className="text-center">
        <Link href="/login">
          <Button type="default" className="w-full">
            Sign In
          </Button>
        </Link>
      </div>
    </div>
  )
}