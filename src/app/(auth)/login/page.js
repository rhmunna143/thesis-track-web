'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Form, Input, Button, Alert, Checkbox, Divider } from 'antd'
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, MailOutlined } from '@ant-design/icons'
import useAuthStore from '../../../store/authStore'
import { authService } from '../../../services/auth.service'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const onFinish = async (values) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await authService.login({
        email: values.email,
        password: values.password,
      })
      
      login(response.user, response.token)
      
      // Redirect based on user role
      const role = response.user.role.toLowerCase()
      router.push(`/${role}`)
      
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your ThesisTrack account</p>
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

      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Enter your email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter your password"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item>
          <div className="flex justify-between items-center">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Link 
              href="/forgot-password" 
              className="text-primary hover:text-primary/80"
            >
              Forgot password?
            </Link>
          </div>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            className="w-full" 
            loading={loading}
          >
            Sign In
          </Button>
        </Form.Item>
      </Form>

      <Divider>Don't have an account?</Divider>

      <div className="text-center">
        <Link href="/signup">
          <Button type="default" className="w-full">
            Create Account
          </Button>
        </Link>
      </div>
    </div>
  )
}